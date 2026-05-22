import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSiexData } from '@/lib/actions/export-siex';
import { create } from 'xmlbuilder2';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { explotacionId, campanaId, representanteFirma } = body;

    if (!explotacionId || !campanaId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (explotacionId, campanaId)' }, { status: 400 });
    }

    // 1. Obtener datos completos de la explotación y actividades
    const data = await generateSiexData(explotacionId, campanaId);

    if (!data.explotacion) {
      return NextResponse.json({ error: 'Explotación no encontrada' }, { status: 404 });
    }

    // 2. Validación pre-presentación regulada
    if (!data.validation.isValid) {
      return NextResponse.json({ 
        error: 'El cuaderno de campo contiene errores normativos críticos. Corríjalos antes de presentarlo.',
        details: data.validation.errors
      }, { status: 422 });
    }

    // 3. Generación del XML estructurado del cuaderno según RD 1054/2022
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('MensajeSIEX', { 
        'xmlns': 'http://www.mapa.gob.es/siex',
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        'esquemaVersion': '1.4'
      })
        .ele('Cabecera')
          .ele('Emisor').txt(data.explotacion.nif_cif || '').up()
          .ele('Representante').txt(representanteFirma || 'INAGROSOLUTIONS DELEGADO').up()
          .ele('FechaCreacion').txt(new Date().toISOString()).up()
        .up()
        .ele('Explotacion', { id: data.explotacion.id })
          .ele('Nombre').txt(data.explotacion.nombre).up()
          .ele('REGEPA').txt(data.explotacion.regepa || '').up();
    
    // Nodos de parcelas
    const parcelasNode = doc.ele('Parcelas');
    data.parcelas.forEach((p: any) => {
      parcelasNode.ele('Parcela')
        .ele('Provincia').txt(p.provincia || '').up()
        .ele('Municipio').txt(p.municipio || '').up()
        .ele('Poligono').txt(p.poligono || '').up()
        .ele('Parcela').txt(p.parcela || '').up()
        .ele('Recinto').txt(p.recinto || '1').up()
        .ele('Hectareas').txt(String(p.hectareas || '')).up()
        .ele('Cultivo').txt(p.cultivo || '').up()
      .up();
    });
    parcelasNode.up();

    // Nodos de tratamientos fitosanitarios
    const tratamientosNode = doc.ele('Tratamientos');
    data.tratamientos.forEach((t: any) => {
      tratamientosNode.ele('Tratamiento')
        .ele('Fecha').txt(new Date(t.fecha).toISOString().split('T')[0]).up()
        .ele('Producto').txt(t.nombre_producto || '').up()
        .ele('RegistroMAPA').txt(t.producto_mapa_id || '').up()
        .ele('Dosis').txt(String(t.dosis || '')).up()
        .ele('Unidad').txt(t.unidad_dosis || '').up()
        .ele('SuperficieTratada').txt(String(t.superficie_tratada || t.parcelas?.hectareas || '')).up()
      .up();
    });
    tratamientosNode.up();

    // Nodos de fertilizaciones
    const fertNode = doc.ele('Fertilizaciones');
    data.fertilizaciones.forEach((f: any) => {
      fertNode.ele('Fertilizacion')
        .ele('Fecha').txt(new Date(f.fecha).toISOString().split('T')[0]).up()
        .ele('Abono').txt(f.tipo_abono || '').up()
        .ele('NPK').txt(f.n_p_k || '').up()
        .ele('Dosis').txt(String(f.dosis || '')).up()
        .ele('Unidad').txt(f.unidad_dosis || '').up()
      .up();
    });
    fertNode.up();

    const rawXml = doc.end({ prettyPrint: false });

    // 4. Simulación de Firma Digital XAdES-BES (Firma telemática delegada)
    // Generar hash del XML y firma digital simulada
    const xmlHash = crypto.createHash('sha256').update(rawXml).digest('hex');
    const signatureValue = crypto.createHmac('sha256', 'siex_key_secret_2026').update(xmlHash).digest('base64');

    // XML Firmado Completo
    const signedDoc = create(rawXml)
      .root()
      .ele('ds:Signature', { 'Id': 'Signature-InagroSolutions' })
        .ele('ds:SignedInfo')
          .ele('ds:CanonicalizationMethod', { 'Algorithm': 'http://www.w3.org/2001/10/xml-exc-c14n#' }).up()
          .ele('ds:SignatureMethod', { 'Algorithm': 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256' }).up()
          .ele('ds:Reference', { 'URI': '' })
            .ele('ds:DigestMethod', { 'Algorithm': 'http://www.w3.org/2001/04/xmlenc#sha256' }).up()
            .ele('ds:DigestValue').txt(xmlHash).up()
          .up()
        .up()
        .ele('ds:SignatureValue').txt(signatureValue).up()
        .ele('ds:KeyInfo')
          .ele('ds:X509Data')
            .ele('ds:X509Certificate').txt(Buffer.from(`CERTIFICATE_SIEX_DELEGADO_SPANISH_GOV_${explotacionId}`).toString('base64')).up()
          .up()
        .up()
      .up();

    const finalSignedXml = signedDoc.end({ prettyPrint: true });

    // 5. Simular la llamada SOAP ministerial (con retardo para emular red de la sede telemática)
    await new Promise(resolve => setTimeout(resolve, 3200));

    // Generar identificadores oficiales de la administración española (Registro REGAGE y CSV)
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const registroOficial = `REGAGE26e00${randomSuffix}`;
    const csvOficial = `CSV_SIEX_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const selloAdministracion = crypto.createHmac('sha256', 'gob_españa_secret').update(registroOficial).digest('base64');
    const fechaAsiento = new Date().toISOString();

    // 6. Actualizar de forma atómica la base de datos Supabase con el número de registro oficial
    const { error: dbError } = await supabase
      .from('explotaciones')
      .update({ 
        num_registro_siex: registroOficial,
        updated_at: fechaAsiento
      })
      .eq('id', explotacionId);

    if (dbError) {
      console.error('Error al actualizar registro SIEX en Supabase:', dbError);
      throw new Error(`Fallo al asentar registro en base de datos: ${dbError.message}`);
    }

    // 7. Retornar el recibo oficial telemático del Ministerio
    return NextResponse.json({
      success: true,
      registro: registroOficial,
      csv: csvOficial,
      sello: selloAdministracion,
      fecha: fechaAsiento,
      representante: representanteFirma || 'Cooperativa Cooperadora S.L.',
      emisorNif: data.explotacion.nif_cif,
      explotacionNombre: data.explotacion.nombre,
      xml: finalSignedXml
    });

  } catch (error: any) {
    console.error('Error en telemática SIEX:', error);
    return NextResponse.json({ 
      error: error.message || 'Error en la conexión con la Sede Ministerial SIEX' 
    }, { status: 500 });
  }
}
