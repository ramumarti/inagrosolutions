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
        "PARCELA_NOMBRE": t.parcelas?.nombre || 'Desconocida',
        "NUM_REGISTRO_MAPA": t.producto_mapa_id || 'N/A',
        "NOMBRE_PRODUCTO": t.nombre_producto || 'N/A',
        "DOSIS_CANTIDAD": t.dosis || 0,
        "DOSIS_UNIDAD": t.unidad_dosis || 'L/ha',
        "SUPERFICIE_TRATADA_HA": t.superficie_tratada || t.parcelas?.hectareas || 0,
        "MAQUINARIA": t.maquinaria_usada || 'Manual',
        "OPERARIO": t.operario || 'Propio titular',
        "TEMPERATURA_C": t.temperatura || '',
        "VELOCIDAD_VIENTO": t.velocidad_viento || ''
      }));

      const laboresData = data.labores.map((l: any) => ({
        "ID_EXPLOTACION": data.explotacion.nif_cif || '---',
        "FECHA_LABOR": new Date(l.fecha).toLocaleDateString('es-ES'),
        "PARCELA_NOMBRE": l.parcelas?.nombre || 'Desconocida',
        "TIPO_LABOR": l.tipo_labor || 'N/A',
        "DESCRIPCION": l.descripcion || '',
        "SUPERFICIE_AFECTADA_HA": l.superficie_afectada || l.parcelas?.hectareas || 0
      }));

      const fertData = data.fertilizaciones.map((f: any) => ({
        "ID_EXPLOTACION": data.explotacion.nif_cif || '---',
        "FECHA_FERTILIZACION": new Date(f.fecha).toLocaleDateString('es-ES'),
        "PARCELA_NOMBRE": f.parcelas?.nombre || 'Desconocida',
        "TIPO_ABONO": f.tipo_abono || 'N/A',
        "NPK": f.n_p_k || 'N/A',
        "DOSIS_CANTIDAD": f.dosis || 0,
        "DOSIS_UNIDAD": f.unidad_dosis || 'kg/ha'
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
      const wsLabores = XLSX.utils.json_to_sheet(laboresData.length > 0 ? laboresData : [{ "Mensaje": "Sin labores reportadas" }]);
      const wsFertilizacion = XLSX.utils.json_to_sheet(fertData.length > 0 ? fertData : [{ "Mensaje": "Sin fertilizaciones reportadas" }]);

      XLSX.utils.book_append_sheet(wb, wsParcelas, "PARCELAS");
      XLSX.utils.book_append_sheet(wb, wsTratamientos, "TRATAMIENTOS");
      XLSX.utils.book_append_sheet(wb, wsLabores, "LABORES");
      XLSX.utils.book_append_sheet(wb, wsFertilizacion, "FERTILIZACION");

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
          .ele('ParcelaNombre').txt(t.parcelas?.nombre || '').up()
          .ele('Producto').txt(t.nombre_producto || '').up()
          .ele('RegistroMAPA').txt(t.producto_mapa_id || '').up()
          .ele('Dosis').txt(String(t.dosis || '')).up()
          .ele('Unidad').txt(t.unidad_dosis || '').up()
        .up();
      });
      tratamientosNode.up();

      const laboresNode = doc.ele('Labores');
      data.labores.forEach((l: any) => {
        laboresNode.ele('Labor')
          .ele('Fecha').txt(l.fecha).up()
          .ele('ParcelaNombre').txt(l.parcelas?.nombre || '').up()
          .ele('Tipo').txt(l.tipo_labor || '').up()
          .ele('Descripcion').txt(l.descripcion || '').up()
        .up();
      });
      laboresNode.up();

      const fertNode = doc.ele('Fertilizaciones');
      data.fertilizaciones.forEach((f: any) => {
        fertNode.ele('Fertilizacion')
          .ele('Fecha').txt(f.fecha).up()
          .ele('ParcelaNombre').txt(f.parcelas?.nombre || '').up()
          .ele('Abono').txt(f.tipo_abono || '').up()
          .ele('NPK').txt(f.n_p_k || '').up()
          .ele('Dosis').txt(String(f.dosis || '')).up()
          .ele('Unidad').txt(f.unidad_dosis || '').up()
        .up();
      });
      fertNode.up();

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
