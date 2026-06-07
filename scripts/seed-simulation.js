/**
 * Script de Seeding para Simulación de InagroSolutions
 * 
 * Este script registra 2 técnicos y 8 agricultores en la base de datos de Supabase,
 * y rellena completamente sus cuadernos digitales según el plan de cada uno.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno locales
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

// Cliente de Supabase con Service Role (Bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// IDs de las cooperativas existentes
const COOP_PEDRAZA_ID = '4030158a-0b17-438a-91af-55f8dfcb2abd';
const COOP_REMEDIADORA_ID = 'ed14fa88-aa73-466f-a09e-ad777400faef';

// Datos de los usuarios a crear
const TECHNICIANS = [
  {
    email: 'tecnico.pedraza@inagrosolutions.com',
    first_name: 'Manuel',
    last_name: 'Gómez',
    tenant_id: COOP_PEDRAZA_ID
  },
  {
    email: 'tecnico.remediadora@inagrosolutions.com',
    first_name: 'Sofía',
    last_name: 'Ruiz',
    tenant_id: COOP_REMEDIADORA_ID
  }
];

const FARMERS = [
  // Cooperativa Pedraza
  {
    email: 'farmer.pedraza.basico@inagrosolutions.com',
    first_name: 'Juan',
    last_name: 'Martínez',
    tenant_id: COOP_PEDRAZA_ID,
    tier: 'basico',
    ha: 4.5,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario']
  },
  {
    email: 'farmer.pedraza.intermedio@inagrosolutions.com',
    first_name: 'Ana',
    last_name: 'García',
    tenant_id: COOP_PEDRAZA_ID,
    tier: 'intermedio',
    ha: 15.2,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario', 'costes', 'cosechas', 'alertas']
  },
  {
    email: 'farmer.pedraza.avanzado@inagrosolutions.com',
    first_name: 'Carlos',
    last_name: 'López',
    tenant_id: COOP_PEDRAZA_ID,
    tier: 'avanzado',
    ha: 38.0,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario', 'costes', 'cosechas', 'alertas', 'trazabilidad', 'dashboards']
  },
  {
    email: 'farmer.pedraza.premium@inagrosolutions.com',
    first_name: 'María',
    last_name: 'Sánchez',
    tenant_id: COOP_PEDRAZA_ID,
    tier: 'premium',
    ha: 78.5,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario', 'costes', 'cosechas', 'alertas', 'trazabilidad', 'dashboards', 'sensores']
  },
  // Cooperativa La Remediadora
  {
    email: 'farmer.remediadora.basico@inagrosolutions.com',
    first_name: 'Pedro',
    last_name: 'Díaz',
    tenant_id: COOP_REMEDIADORA_ID,
    tier: 'basico',
    ha: 3.8,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario']
  },
  {
    email: 'farmer.remediadora.intermedio@inagrosolutions.com',
    first_name: 'Elena',
    last_name: 'Torres',
    tenant_id: COOP_REMEDIADORA_ID,
    tier: 'intermedio',
    ha: 18.9,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario', 'costes', 'cosechas', 'alertas']
  },
  {
    email: 'farmer.remediadora.avanzado@inagrosolutions.com',
    first_name: 'Luis',
    last_name: 'Navarro',
    tenant_id: COOP_REMEDIADORA_ID,
    tier: 'avanzado',
    ha: 42.4,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario', 'costes', 'cosechas', 'alertas', 'trazabilidad', 'dashboards']
  },
  {
    email: 'farmer.remediadora.premium@inagrosolutions.com',
    first_name: 'Laura',
    last_name: 'Jiménez',
    tenant_id: COOP_REMEDIADORA_ID,
    tier: 'premium',
    ha: 92.1,
    modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion', 'inventario', 'costes', 'cosechas', 'alertas', 'trazabilidad', 'dashboards', 'sensores']
  }
];

async function seed() {
  console.log('🏁 Iniciando proceso de seeding para la simulación...');

  // 1. Limpieza de datos antiguos de simulación
  console.log('🧹 Limpiando usuarios antiguos de simulación...');
  const emailsToClean = [
    ...TECHNICIANS.map(t => t.email),
    ...FARMERS.map(f => f.email)
  ];

  // Buscar IDs de los usuarios a borrar
  const { data: usersToClean, error: fetchErr } = await supabase
    .from('users')
    .select('id, email')
    .in('email', emailsToClean);

  if (fetchErr) {
    console.error('❌ Error buscando usuarios antiguos:', fetchErr.message);
  } else if (usersToClean && usersToClean.length > 0) {
    for (const u of usersToClean) {
      console.log(`🗑️ Eliminando usuario auth: ${u.email} (${u.id})`);
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
      if (delErr) console.warn(`⚠️ Error al borrar auth user ${u.email}:`, delErr.message);
    }
  }

  // 2. Crear Técnicos
  const createdTechnicians = {};
  for (const tech of TECHNICIANS) {
    console.log(`➕ Registrando Técnico: ${tech.email}`);
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: tech.email,
      password: 'PasswordSimulacion2026',
      email_confirm: true,
      user_metadata: {
        first_name: tech.first_name,
        last_name: tech.last_name
      }
    });

    if (authErr) {
      console.error(`❌ Error creando auth técnico ${tech.email}:`, authErr.message);
      continue;
    }

    const userId = authData.user.id;
    createdTechnicians[tech.tenant_id] = userId;

    // Actualizar perfil de técnico en public.users
    const { error: updateErr } = await supabase
      .from('users')
      .update({
        platform_role: 'technician',
        tenant_id: tech.tenant_id,
        is_active: true
      })
      .eq('id', userId);

    if (updateErr) {
      console.error(`❌ Error actualizando perfil de técnico ${tech.email}:`, updateErr.message);
    }
  }

  // 3. Crear Agricultores y rellenar sus Cuadernos
  for (const farmer of FARMERS) {
    console.log(`\n🌾 Registrando Agricultor [Plan ${farmer.tier.toUpperCase()}]: ${farmer.email}`);
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: farmer.email,
      password: 'PasswordSimulacion2026',
      email_confirm: true,
      user_metadata: {
        first_name: farmer.first_name,
        last_name: farmer.last_name
      }
    });

    if (authErr) {
      console.error(`❌ Error creando auth agricultor ${farmer.email}:`, authErr.message);
      continue;
    }

    const userId = authData.user.id;

    // Actualizar perfil de agricultor en public.users
    const { error: updateErr } = await supabase
      .from('users')
      .update({
        platform_role: 'farmer',
        tenant_id: farmer.tenant_id,
        subscription_tier: farmer.tier,
        agri_tier: farmer.tier,
        total_hectareas: farmer.ha.toString(),
        modulos_activos: farmer.modules,
        onboarded_agri: true,
        is_active: true
      })
      .eq('id', userId);

    if (updateErr) {
      console.error(`❌ Error actualizando perfil de agricultor ${farmer.email}:`, updateErr.message);
      continue;
    }

    // 4. Asignar técnico al agricultor
    const techId = createdTechnicians[farmer.tenant_id];
    if (techId) {
      console.log(`🔗 Vinculando agricultor con técnico de cooperativa...`);
      const { error: assignErr } = await supabase
        .from('technician_assignments')
        .insert({
          technician_id: techId,
          farmer_id: userId,
          tenant_id: farmer.tenant_id,
          is_active: true,
          assigned_at: new Date().toISOString()
        });
      if (assignErr) console.warn('⚠️ Error al crear asignación técnica:', assignErr.message);
    }

    // 5. Poblar Explotación
    console.log(`📦 Creando explotación agrícola...`);
    const { data: explotacion, error: expErr } = await supabase
      .from('explotaciones')
      .insert({
        nombre: `Olivar de ${farmer.first_name} — ${farmer.tenant_id === COOP_PEDRAZA_ID ? 'Pedraza' : 'La Remediadora'}`,
        user_id: userId,
        tenant_id: farmer.tenant_id,
        nif_cif: '12345678' + (farmer.tier === 'basico' ? 'A' : 'B'),
        rea_registro: 'REA23' + Math.floor(10000 + Math.random() * 90000),
        provincia: 'Jaén',
        municipio: farmer.tenant_id === COOP_PEDRAZA_ID ? 'Baeza' : 'Úbeda',
        total_hectareas: farmer.ha,
        num_registro_siex: 'ES23011' + Math.floor(1000000 + Math.random() * 9000000),
        titular: `${farmer.first_name} ${farmer.last_name}`
      })
      .select()
      .single();

    if (expErr) {
      console.error(`❌ Error creando explotación para ${farmer.email}:`, expErr.message);
      continue;
    }

    // 6. Crear Campaña Agrícola
    console.log(`📅 Creando campaña 2025/2026...`);
    const { data: campana, error: campErr } = await supabase
      .from('campanas')
      .insert({
        nombre: 'Campaña Olivícola 2025/2026',
        anio_inicio: 2025,
        anio_fin: 2026,
        activa: true,
        explotacion_id: explotacion.id,
        tenant_id: farmer.tenant_id,
        user_id: userId
      })
      .select()
      .single();

    if (campErr) {
      console.error(`❌ Error creando campaña para ${farmer.email}:`, campErr.message);
      continue;
    }

    // 7. Crear 2 Parcelas para el agricultor
    console.log(`🗺️ Registrando parcelas SIGPAC...`);
    const ha1 = Number((farmer.ha * 0.6).toFixed(2));
    const ha2 = Number((farmer.ha * 0.4).toFixed(2));

    const { data: parcelas, error: parcErr } = await supabase
      .from('parcelas')
      .insert([
        {
          nombre: `El Cerro de ${farmer.first_name}`,
          hectareas: ha1,
          cultivo: 'Olivar',
          variedad: 'Picual',
          explotacion_id: explotacion.id,
          tenant_id: farmer.tenant_id,
          referencia_catastral: `23011A004000${Math.floor(100 + Math.random() * 900)}00000XG`,
          referencia_sigpac: `23 / 11 / 0 / 4 / ${Math.floor(10 + Math.random() * 90)} / 1`,
          poligono: '4',
          parcela: Math.floor(10 + Math.random() * 90).toString(),
          recinto: '1',
          sistema_riego: 'Goteo',
          anio_plantacion: 1995
        },
        {
          nombre: `La Vega de ${farmer.first_name}`,
          hectareas: ha2,
          cultivo: 'Olivar',
          variedad: 'Arbequina',
          explotacion_id: explotacion.id,
          tenant_id: farmer.tenant_id,
          referencia_catastral: `23011A005000${Math.floor(100 + Math.random() * 900)}00000YH`,
          referencia_sigpac: `23 / 11 / 0 / 5 / ${Math.floor(10 + Math.random() * 90)} / 2`,
          poligono: '5',
          parcela: Math.floor(10 + Math.random() * 90).toString(),
          recinto: '2',
          sistema_riego: 'Secano',
          anio_plantacion: 2002
        }
      ])
      .select();

    if (parcErr || !parcelas || parcelas.length < 2) {
      console.error(`❌ Error creando parcelas para ${farmer.email}:`, parcErr ? parcErr.message : 'No parcelas returned');
      continue;
    }

    const p1 = parcelas[0];
    const p2 = parcelas[1];

    // Vincular parcelas a campaña en parcelas_campana
    const { data: parcelasCampana, error: linkErr } = await supabase
      .from('parcelas_campana')
      .insert([
        {
          parcela_id: p1.id,
          campana_id: campana.id,
          cultivo_cod_siex: '1.2', // Código de olivar
          variedad: p1.variedad,
          marco_plantacion: '7x7',
          anio_plantacion: p1.anio_plantacion,
          es_regadio: true
        },
        {
          parcela_id: p2.id,
          campana_id: campana.id,
          cultivo_cod_siex: '1.2',
          variedad: p2.variedad,
          marco_plantacion: '8x8',
          anio_plantacion: p2.anio_plantacion,
          es_regadio: false
        }
      ])
      .select();

    if (linkErr || !parcelasCampana) {
      console.error(`❌ Error vinculando parcelas de campaña:`, linkErr ? linkErr.message : 'No links returned');
      continue;
    }

    // 8. Crear Stock de Insumos (Fitosanitarios y Fertilizantes)
    console.log(`🧪 Almacenando insumos fitosanitarios y abonos...`);
    const { data: abonoInsumo, error: insErr1 } = await supabase
      .from('inventario_insumos')
      .insert({
        nombre_producto: 'Fertiorgánico Nitrogenado N-15',
        tipo: 'abono',
        cantidad_inicial: 1000,
        cantidad_actual: 750,
        unidad: 'kg',
        precio_unitario: 1.25,
        fecha_compra: '2026-04-10T10:00:00Z',
        lote: 'L-AB-982',
        numero_registro: null,
        explotacion_id: explotacion.id,
        tenant_id: farmer.tenant_id,
        user_id: userId
      })
      .select()
      .single();

    const { data: fitoInsumo, error: insErr2 } = await supabase
      .from('inventario_insumos')
      .insert({
        nombre_producto: 'Cobre Coloidal 50 WP',
        tipo: 'fitosanitario',
        cantidad_inicial: 50,
        cantidad_actual: 40,
        unidad: 'kg',
        precio_unitario: 9.80,
        fecha_compra: '2026-04-12T11:00:00Z',
        lote: 'L-FT-203',
        numero_registro: '18452', // Registro MAPA ficticio
        explotacion_id: explotacion.id,
        tenant_id: farmer.tenant_id,
        user_id: userId
      })
      .select()
      .single();

    if (insErr1 || insErr2) {
      console.warn('⚠️ Error al registrar insumos en inventario:', insErr1?.message || insErr2?.message);
    }

    // 9. Registrar labores del cuaderno de campo
    console.log(`🚜 Registrando labores y tratamientos fitosanitarios...`);
    
    // Labor 1: Poda (Actividad general)
    await supabase.from('actividades_agricolas').insert({
      fecha: '2026-05-10',
      tipo_actividad: 'Poda',
      operario: 'Pedro Martínez',
      maquinaria: 'Tractor Same Fruit con trituradora',
      observaciones: 'Poda de aclareo de copas y eliminación de ramas viejas. Trituración in situ de ramas de poda.',
      parcela_campana_id: parcelasCampana[0].id,
      coste_mano_obra: 120,
      coste_insumos: 0
    });

    // Labor 2: Desbroce
    await supabase.from('labores').insert({
      fecha: '2026-05-18T08:00:00Z',
      tipo_labor: 'Desbrozado mecánico',
      superficie_afectada: ha1,
      descripcion: 'Desbrozado mecánico de cubierta vegetal espontánea en calles para evitar competencia hídrica.',
      parcela_id: p1.id,
      campana_id: campana.id,
      tenant_id: farmer.tenant_id,
      user_id: userId
    });

    // Tratamiento Fitosanitario contra el Repilo (Módulo Básico)
    await supabase.from('tratamientos_fitosanitarios').insert({
      fecha: '2026-05-20T09:00:00Z',
      nombre_producto: 'Cobre Coloidal 50 WP',
      dosis: 2.5,
      unidad_dosis: 'kg/ha',
      superficie_tratada: ha1,
      temperatura: 21.5,
      velocidad_viento: 4.8,
      maquinaria_usada: 'Atomizador arrastrado Solano-Hornet 2000L',
      operario: 'Pedro Martínez',
      parcela_id: p1.id,
      campana_id: campana.id,
      inventario_id: fitoInsumo ? fitoInsumo.id : null,
      tenant_id: farmer.tenant_id,
      user_id: userId,
      producto_mapa_id: '18452'
    });

    // Fertilización (Módulo Básico)
    await supabase.from('fertilizaciones').insert({
      fecha: '2026-05-24T07:30:00Z',
      tipo_abono: 'Fertiorgánico Nitrogenado N-15',
      dosis: 150,
      unidad_dosis: 'kg/ha',
      n_p_k: '15-0-0',
      parcela_id: p1.id,
      campana_id: campana.id,
      inventario_id: abonoInsumo ? abonoInsumo.id : null,
      tenant_id: farmer.tenant_id,
      user_id: userId
    });

    // 10. Módulo Intermedio: Costes, Cosechas y Alertas agronómicas
    if (farmer.tier === 'intermedio' || farmer.tier === 'avanzado' || farmer.tier === 'premium') {
      console.log(`📈 Registrando costes e histórico de cosechas (Plan Intermedio)...`);
      
      // Coste
      await supabase.from('costes').insert({
        concepto: 'Servicio de asistencia fitosanitaria y asesoría técnica',
        categoria: 'asesoría',
        importe: 180.00,
        fecha: '2026-05-28T10:00:00Z',
        explotacion_id: explotacion.id,
        parcela_id: p1.id,
        tenant_id: farmer.tenant_id
      });

      // Cosecha
      await supabase.from('cosechas').insert({
        fecha: '2026-06-01T08:00:00Z',
        cantidad_kg: 5200,
        calidad: 'Vuelo - Extra',
        precio_kg: 0.98,
        ingreso_estimado: 5096.00,
        comprador: farmer.tenant_id === COOP_PEDRAZA_ID ? 'Almazara Pedraza S.C.A.' : 'Almazara La Remediadora S.L.',
        lote: `LOT-${farmer.tier.toUpperCase()}-01`,
        notas: 'Recolección de aceituna verde por vibración y transporte inmediato.',
        parcela_id: p1.id,
        campana_id: campana.id,
        tenant_id: farmer.tenant_id,
        user_id: userId
      });

      // Alerta Agrónoma
      await supabase.from('alertas_cuaderno').insert({
        titulo: 'Riesgo de Mosca del Olivo',
        mensaje: 'La estación agroclimática reporta repunte de capturas de mosca (Bactrocera oleae) en las parcelas vecinas.',
        tipo: 'plaga',
        nivel: 'warning',
        leida: false,
        fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        parcela_id: p1.id,
        tenant_id: farmer.tenant_id,
        user_id: userId
      });
    }

    // 11. Módulo Avanzado: Trazabilidad (Ventas / Lotes)
    if (farmer.tier === 'avanzado' || farmer.tier === 'premium') {
      console.log(`🔗 Registrando lotes de trazabilidad en cooperativa (Plan Avanzado)...`);
      
      await supabase.from('trazabilidad').insert({
        lote: `LOT-${farmer.tier.toUpperCase()}-01`,
        destino_comercial: farmer.tenant_id === COOP_PEDRAZA_ID ? 'Envasadora Pedraza Premium' : 'Distribuidora La Remediadora S.L.',
        cantidad_kg: 5200,
        fecha_cosecha: '2026-06-01T08:00:00Z',
        parcela_id: p1.id,
        tenant_id: farmer.tenant_id
      });
    }

    // 12. Módulo Premium: Telemetría de sensores IoT
    if (farmer.tier === 'premium') {
      console.log(`📡 Ingestando lecturas de sensores IoT y humedad (Plan Premium)...`);
      
      const readings = [
        { key: 'suelo_30cm', name: 'Humedad de Suelo (30cm)', val: 24.8, unit: '%' },
        { key: 'suelo_60cm', name: 'Humedad de Suelo (60cm)', val: 29.5, unit: '%' },
        { key: 'conductividad', name: 'Conductividad Eléctrica', val: 0.38, unit: 'dS/m' },
        { key: 'temperatura_suelo', name: 'Temperatura de Suelo', val: 19.2, unit: '°C' },
        { key: 'tension_suelo', name: 'Tensión Matricial', val: 38.0, unit: 'kPa' }
      ];

      for (const r of readings) {
        await supabase.from('lecturas_sensores').insert({
          fecha_lectura: new Date().toISOString(),
          sensor_id: `SENSOR-OLIVAR-${farmer.first_name.toUpperCase()}`,
          tipo_medicion: r.name,
          valor: r.val,
          parcela_id: p1.id
        });
      }
    }

    // 13. Supervisión Técnica y Firma de Cuadernos (Validaciones)
    // Simulamos que el técnico ya ha revisado los cuadernos de varios agricultores
    if (techId) {
      let validationStatus = 'pendiente';
      let obs = '';
      
      if (farmer.tier === 'basico') {
        validationStatus = 'validado';
        obs = 'Revisado formalmente. Cumple con el Real Decreto 1054/2022. Fitosanitarios autorizados y dosis adecuadas.';
      } else if (farmer.tier === 'intermedio') {
        validationStatus = 'con_observaciones';
        obs = 'Se sugiere aportar el lote del fertilizante en el siguiente abonado para cumplimiento SIEX estricto.';
      } else if (farmer.tier === 'avanzado' && farmer.tenant_id === COOP_PEDRAZA_ID) {
        validationStatus = 'validado';
        obs = 'Cuaderno validado y consolidado para la campaña 2025/2026. Lotes de trazabilidad correctos.';
      } else if (farmer.tier === 'avanzado' && farmer.tenant_id === COOP_REMEDIADORA_ID) {
        validationStatus = 'rechazado';
        obs = 'Faltan tratamientos obligatorios de primavera contra Prays oleae en parcela La Vega.';
      }

      console.log(`✍️ Registrando estado de revisión por técnico: ${validationStatus}`);
      await supabase.from('cuaderno_validaciones').insert({
        farmer_id: userId,
        technician_id: techId,
        campana_id: campana.id,
        estado: validationStatus,
        observaciones: obs,
        validated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      // Tareas de Asistencia Técnica en Kanban
      await supabase.from('tasks').insert([
        {
          titulo: `Muestreo de plagas en El Cerro de ${farmer.first_name}`,
          descripcion: 'Colocación de trampas de mosca y monitoreo de vuelo de adultos.',
          tipo: 'general',
          prioridad: farmer.tier === 'premium' ? 'alta' : 'media',
          estado: 'pendiente',
          assigned_to: userId,
          tenant_id: farmer.tenant_id,
          assigned_by: techId
        },
        {
          titulo: `Control de malas hierbas - ${farmer.first_name}`,
          descripcion: 'Inspeccionar cubierta vegetal para asegurar paso de desbrozadora.',
          tipo: 'labor',
          prioridad: 'baja',
          estado: 'en_progreso',
          assigned_to: userId,
          tenant_id: farmer.tenant_id,
          assigned_by: techId
        }
      ]);
    }
  }

  console.log('\n🌟 ¡Seeding de la simulación completado con éxito!');
  console.log('👥 2 Técnicos creados.');
  console.log('🌾 8 Agricultores registrados y asignados.');
  console.log('🚜 Histórico de labores, fitosanitarios, fertilizaciones, costes, cosechas, trazabilidad y sensores inyectado.');
}

seed().catch(err => {
  console.error('❌ Error general durante el seeding:', err);
  process.exit(1);
});
