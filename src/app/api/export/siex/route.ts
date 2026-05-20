import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSiexData } from '@/lib/actions/export-siex';
import * as XLSX from 'xlsx';
import { create } from 'xmlbuilder2';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const explotacionId = searchParams.get('explotacionId');
  const campanaId = searchParams.get('campanaId');
  const format = searchParams.get('format') || 'xlsx';

  if (!explotacionId || !campanaId) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await generateSiexData(explotacionId, campanaId);

    if (!data.explotacion) {
      return NextResponse.json({ error: 'Explotación no encontrada' }, { status: 404 });
    }

    const fileName = `SIEX_Export_${data.explotacion.nombre.replace(/\s+/g, '_')}_${new Date().getFullYear()}`;

    if (format === 'xlsx') {
      const tratamientosData = data.tratamientos.map((t: any) => ({
        "ID_EXPLOTACION": data.explotacion.nif_cif || '---',
        "FECHA_TRATAMIENTO": new Date(t.fecha).toLocaleDateString('es-ES'),
        "NUM_REGISTRO_MAPA": t.producto ? t.producto.match(/\d{5}/)?.[0] || 'N/A' : 'N/A',
        "NOMBRE_PRODUCTO": t.producto,
        "METODO_APLICACION": t.metodo_aplicacion || 'Pulverización',
        "DOSIS_CANTIDAD": t.dosis_cantidad || 0,
        "DOSIS_UNIDAD": t.dosis_unidad || 'L/ha',
        "MAQUINARIA": t.maquinaria_id || 'Manual',
        "OPERARIO": t.operario_id || 'Propio titular',
        "PLAZO_SEGURIDAD": t.plazo_seguridad_dias || 0
      }));

      const parcelasData = data.parcelas.map((p: any) => ({
        "ID_EXPLOTACION": data.explotacion.nif_cif || '---',
        "PROVINCIA": p.provincia || '00',
        "MUNICIPIO": p.municipio || '000',
        "POLIGONO": p.poligono || '0',
        "PARCELA": p.parcela || '0',
        "RECINTO": p.recinto || 1,
        "SUPERFICIE_HA": p.hectareas || 0,
        "CULTIVO_PRINCIPAL": p.cultivo || 'No especificado',
        "SISTEMA_EXPLOTACION": p.sistema_riego === 'Regadío' ? 'R' : 'S'
      }));

      const wb = XLSX.utils.book_new();
      const wsParcelas = XLSX.utils.json_to_sheet(parcelasData.length > 0 ? parcelasData : [{ "Mensaje": "Sin datos de parcelas" }]);
      const wsTratamientos = XLSX.utils.json_to_sheet(tratamientosData.length > 0 ? tratamientosData : [{ "Mensaje": "Sin tratamientos reportados" }]);

      XLSX.utils.book_append_sheet(wb, wsParcelas, "PARCELAS");
      XLSX.utils.book_append_sheet(wb, wsTratamientos, "TRATAMIENTOS");

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

    } else if (format === 'xml') {
      const doc = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('MensajeSIEX', { xmlns: 'http://www.mapa.gob.es/siex' })
          .ele('Cabecera')
            .ele('Emisor').txt(data.explotacion.nif_cif || '').up()
            .ele('FechaCreacion').txt(new Date().toISOString()).up()
          .up()
          .ele('Explotacion', { id: data.explotacion.id })
            .ele('Nombre').txt(data.explotacion.nombre).up()
            .ele('REGEPA').txt(data.explotacion.regepa || '').up();
      
      const parcelasNode = doc.ele('Parcelas');
      data.parcelas.forEach((p: any) => {
        parcelasNode.ele('Parcela')
          .ele('Provincia').txt(p.provincia || '').up()
          .ele('Municipio').txt(p.municipio || '').up()
          .ele('Poligono').txt(p.poligono || '').up()
          .ele('Parcela').txt(p.parcela || '').up()
          .ele('Cultivo').txt(p.cultivo || '').up()
        .up();
      });
      parcelasNode.up();

      const tratamientosNode = doc.ele('Tratamientos');
      data.tratamientos.forEach((t: any) => {
        tratamientosNode.ele('Tratamiento')
          .ele('Fecha').txt(t.fecha).up()
          .ele('Producto').txt(t.producto || '').up()
          .ele('Dosis').txt(String(t.dosis_cantidad || '')).up()
        .up();
      });
      tratamientosNode.up();

      doc.up().up();

      const xmlString = doc.end({ prettyPrint: true });

      return new NextResponse(xmlString, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}.xml"`,
          'Content-Type': 'application/xml',
        },
      });
    }

    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });

  } catch (error: any) {
    console.error('Error generando SIEX:', error);
    return NextResponse.json({ error: 'Error en la generación del archivo' }, { status: 500 });
  }
}
