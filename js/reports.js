// ============================================================
// MÓDULO INFORMES (NUEVO)
// Flujo: configurar -> generar vista previa en pantalla -> exportar a Word o PDF
// ============================================================
let REPORT_CHARTS = {}; // instancias de Chart.js propias del informe (independientes del dashboard)
let REPORT_DATA = null; // último set de eventos usado para generar la vista previa
let REPORT_AI_ANALYSIS = null;

function ensureReportConfigurationControls(){
  const config = document.getElementById('report-config');
  if(!config || document.getElementById('rc-structure-suggestion')) return;
  const previewButton = config.querySelector('button[onclick="generateReportPreview()"]');
  if(!previewButton) return;
  const suggestions = document.createElement('div');
  suggestions.innerHTML = `
    <div class="rc-label">Sugerencias de informe</div>
    <div id="rc-structure-suggestion" class="rc-note">Estructura recomendada por administración.</div>
    <div id="rc-length-suggestion" class="rc-note">Longitudes sugeridas por sección.</div>`;
  const ai = document.createElement('div');
  ai.innerHTML = `
    <div class="rc-label">IA de análisis</div>
    <button class="s-btn ghost" onclick="generateAiAnalysis()">Generar análisis AI</button>
    <div class="rc-note">La clave de IA se administra desde Administración. Si no hay clave, se generará un análisis local automático.</div>`;
  previewButton.before(suggestions, ai);
}

function openReports(){
  ensureReportConfigurationControls();
  const defaults = ADMIN_CONFIG.reports || {};
  const now = new Date();
  const days = parseInt(defaults.dateRangeDays || '30', 10) || 30;
  const end = now.toISOString().substring(0,10);
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  const start = startDate.toISOString().substring(0,10);

  REPORT_AI_ANALYSIS = null;
  document.getElementById('rc-title').value = defaults.defaultTitle || 'Informe de Monitoreo';
  const site = CONFIG.regional || (CONFIG.url ? new URL(CONFIG.url).hostname : '');
  document.getElementById('rc-subtitle').value = defaults.defaultSubtitle ? defaults.defaultSubtitle : (site ? `SINAPH · ${site}` : 'SINAPH');

  if(ALL_EVENTS.length){
    const dates = ALL_EVENTS.map(e=>getDate(e)).filter(Boolean).sort();
    document.getElementById('rc-date-start').value = dates[0] ? dates[0].substring(0,10) : start;
    document.getElementById('rc-date-end').value = dates[dates.length-1] ? dates[dates.length-1].substring(0,10) : end;
  } else {
    document.getElementById('rc-date-start').value = start;
    document.getElementById('rc-date-end').value = end;
  }

  document.getElementById('rc-sec-stats').checked = defaults.showStats !== false;
  document.getElementById('rc-sec-charts').checked = defaults.showCharts !== false;

  document.getElementById('rc-structure-suggestion').textContent = defaults.structureOverview || 'Título, Resumen ejecutivo, Resultados, Gráficos, Conclusiones y Recomendaciones.';
  document.getElementById('rc-length-suggestion').innerHTML = 
    `<strong>Extensión recomendada:</strong> Estadísticas: ${esc(defaults.statsLength||'2-3 párrafos')}; Gráficos: ${esc(defaults.chartsLength||'1-2 párrafos')}; AI: ${esc(defaults.aiAnalysisLength||'1-2 párrafos')}.`;

  showScreen('reports');
}

function getReportData(){
  const ds = document.getElementById('rc-date-start')?.value;
  const de = document.getElementById('rc-date-end')?.value;
  let data = [...ALL_EVENTS];
  if(ds) data = data.filter(e=>{const d=getDate(e); return !d || d>=ds;});
  if(de) data = data.filter(e=>{const d=getDate(e); return !d || d<=de+'T23:59:59';});
  return data;
}

function buildAiAnalysisSection(analysis){
  if(!analysis || typeof analysis !== 'object') return '';
  const introParagraphs = Array.isArray(analysis.introParagraphs) ? analysis.introParagraphs : [];
  const findings = Array.isArray(analysis.findings) ? analysis.findings : [];
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  return `
    <div class="rp-section rp-ai-section">
      <h2>6. Análisis AI</h2>
      <div class="rp-subsection">
        <h3>Introducción</h3>
        ${introParagraphs.map(p => `<p>${esc(p)}</p>`).join('')}
      </div>
      <div class="rp-subsection">
        <h3>Resumen Ejecutivo</h3>
        <p>${esc(analysis.executiveSummary || '')}</p>
      </div>
      <div class="rp-subsection">
        <h3>Explicación de la fuente de datos</h3>
        <p>${esc(analysis.dataSourceExplanation || '')}</p>
      </div>
      <div class="rp-subsection">
        <h3>Hallazgos principales</h3>
        <ul>${findings.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      </div>
      <div class="rp-subsection">
        <h3>Recomendaciones</h3>
        <ul>${recommendations.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
      </div>
      <div class="rp-subsection">
        <h3>Conclusión</h3>
        <p>${esc(analysis.conclusion || '')}</p>
      </div>
    </div>`;
}

function generateReportPreview(){
  const title = document.getElementById('rc-title').value.trim() || 'Informe de Monitoreo';
  const subtitle = document.getElementById('rc-subtitle').value.trim();
  const ds = document.getElementById('rc-date-start').value;
  const de = document.getElementById('rc-date-end').value;

  let data = [...ALL_EVENTS];
  if(ds) data = data.filter(e=>{const d=getDate(e); return !d || d>=ds;});
  if(de) data = data.filter(e=>{const d=getDate(e); return !d || d<=de+'T23:59:59';});
  REPORT_DATA = data;

  const secStats = document.getElementById('rc-sec-stats').checked;
  const secCharts = document.getElementById('rc-sec-charts').checked;

  const wrap = document.getElementById('report-preview');
  document.getElementById('report-empty').style.display='none';
  wrap.classList.add('visible');
  wrap.innerHTML = buildReportHeader(title, subtitle, ds, de, data);
  wrap.innerHTML += buildReportExecutiveSection(data);
  wrap.innerHTML += buildReportIntroductionSection(data);
  if(secStats) wrap.innerHTML += buildReportStatisticsSection(data);
  if(secCharts) wrap.innerHTML += buildGraphsAnalysisSection(data);
  wrap.innerHTML += buildGeneralAnalysisSection(data);
  wrap.innerHTML += buildConclusionsSection(data);
  if(REPORT_AI_ANALYSIS) wrap.innerHTML += buildAiAnalysisSection(REPORT_AI_ANALYSIS);
  wrap.innerHTML += `<div class="rp-footer">Generado por ARIS el ${fmtDateTime(new Date().toISOString())} · ICF · SINAPH · Datos provenientes de EarthRanger</div>`;

  document.getElementById('report-actions').style.display='flex';

  if(secCharts) setTimeout(()=>renderReportCharts(data),50);
}

function buildReportHeader(title,subtitle,ds,de,data){
  const site = CONFIG.regional || (CONFIG.url ? new URL(CONFIG.url).hostname : 'Sin región');
  const periodText = ds && de ? `${fmtDateTime(ds)} — ${fmtDateTime(de)}` : 'Inicio de datos — Hoy';
  return `
    <div class="rp-titlepage">
      <div class="rp-titlepage-left">
        <img src="../ARIS.png" alt="ARIS">
      </div>
      <div class="rp-titlepage-right">
        <h1>${esc(title)}</h1>
        <h2>${esc(subtitle||'SINAPH — Sistema Nacional de Áreas Protegidas de Honduras')}</h2>
        <p class="rp-note">Reporte de Patrullajes, Monitoreo y Actividades</p>
        <p class="rp-note">Generado con EcoScope / EarthRanger</p>
      </div>
    </div>
    <div class="rp-meta rp-meta-grid">
      <div><strong>Región:</strong> ${esc(site)}</div>
      <div><strong>Período:</strong> ${periodText}</div>
      <div><strong>Fecha de generación:</strong> ${fmtDateTime(new Date().toISOString())}</div>
      <div><strong>Zona horaria:</strong> Honduras (GMT-6)</div>
      <div><strong>Sistema de coordenadas:</strong> Grados decimales (latitud/longitud, WGS84)</div>
      <div><strong>Total de eventos incluidos:</strong> ${data.length}</div>
    </div>`;
}

function buildReportExecutiveSection(data){
  const summary = buildReportSummary(data);
  const topCategories = summary.topCategories.map(c=>`${c.name} (${c.count})`).join(', ') || 'sin eventos';
  return `
    <div class="rp-section">
      <h2>1. Resumen Ejecutivo</h2>
      <div class="rp-text">
        <p>Durante el período ${summary.dateStart || 'seleccionado'} se registraron ${summary.total} eventos en ${summary.reportSubtitle}, con ${summary.threatCount} incidentes relacionados con monitoreo de amenazas. Esta sección sintetiza los hallazgos clave para una lectura rápida por parte de la dirección.</p>
        <p>Las categorías más frecuentes fueron ${topCategories}. El ${Math.round((summary.geoCount / Math.max(summary.total,1)) * 100)}% de los eventos incluyen información geográfica, lo que fortalece la capacidad de respuesta en campo.</p>
        <p>El informe resalta las tendencias principales y las áreas de atención prioritaria, orientando los siguientes pasos operativos y de coordinación para el equipo de gestión.</p>
      </div>
    </div>`;
}

function buildReportIntroductionSection(data){
  const summary = buildReportSummary(data);
  const topCategories = summary.topCategories.slice(0,3).map(c=>`${c.name} (${c.count})`).join(', ') || 'sin datos relevantes';
  return `
    <div class="rp-section">
      <h2>2. Introducción</h2>
      <div class="rp-text">
        <p>Este informe presenta el análisis de los datos de monitoreo recopilados en la plataforma EarthRanger para el período ${summary.dateStart} a ${summary.dateEnd}. Los datos incluyen registros de patrullajes, eventos de monitoreo biológico, actividades en campo y amenazas detectadas en la región.</p>
        <p>El propósito de este documento es ofrecer una visión contextualizada de la operación de monitoreo, identificar patrones de incidencia y aportar recomendaciones que apoyen la gestión de conservación y la respuesta temprana. Se enfoca en la interpretación de los datos más relevantes para el equipo técnico y estratégico.</p>
        <p>En esta etapa de la revisión se considera la cobertura de eventos, la calidad de la información geográfica y la clasificación de las categorías de monitoreo. Las principales categorías observadas durante el período son ${topCategories}.</p>
        <p>El análisis busca facilitar la toma de decisiones mediante una estructura clara de reportes, permitiendo a los responsables priorizar recursos y determinar acciones de seguimiento basadas en evidencias operativas.</p>
      </div>
    </div>`;
}

function buildPatrolsSection(){
  const summary = getPatrolMetrics();
  const rows = Object.entries(summary.typeMetrics).map(([type, metrics]) => {
    return `<tr><td>${esc(type)}</td><td>${metrics.count}</td><td>${metrics.distance>0?metrics.distance.toFixed(1):'N/A'}</td><td>${metrics.hours>0?metrics.hours.toFixed(1):'N/A'}</td></tr>`;
  }).join('');
  return `
    <div class="rp-section">
      <h2>2. Patrullajes</h2>
      <div class="rp-stats rp-summary-grid">
        <div class="rp-stat"><div class="v">${summary.total}</div><div class="l">Patrullajes totales</div></div>
        <div class="rp-stat"><div class="v">${summary.distance>0?summary.distance.toFixed(1):'N/A'}</div><div class="l">Distancia recorrida (km)</div></div>
        <div class="rp-stat"><div class="v">${summary.hours>0?summary.hours.toFixed(1):'N/A'}</div><div class="l">Horas de patrullaje</div></div>
      </div>
      <div class="rp-table-wrap">
        <table class="rp-table">
          <thead><tr><th>Tipo</th><th>Número Total</th><th>Distancia Total (km)</th><th>Horas Totales (hr)</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No hay datos de patrullajes disponibles.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function getPatrolMetrics(){
  const summary = {total: ALL_PATROLS.length, distance: 0, hours: 0, typeMetrics: {}};
  ALL_PATROLS.forEach(p=>{
    const type = p.patrol_type?.name || p.patrol_type?.value || p.patrol_type?.label || 'Sin tipo';
    const distance = parseFloat(p.distance_traveled ?? p.distance ?? p.total_distance ?? 0) || 0;
    const hours = parseFloat(p.duration_hours ?? p.duration ?? p.hours ?? 0) || 0;
    if(!summary.typeMetrics[type]) summary.typeMetrics[type] = {count:0,distance:0,hours:0};
    summary.typeMetrics[type].count += 1;
    summary.typeMetrics[type].distance += distance;
    summary.typeMetrics[type].hours += hours;
    summary.distance += distance;
    summary.hours += hours;
  });
  return summary;
}

function buildGraphsAnalysisSection(data){
  const categoryCounts = {};
  const dateCounts = {};
  const typeCounts = {};
  const patrolCounts = {};

  data.forEach(e => {
    const cat = mapCat(e);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    const d = getDate(e);
    if (d) {
      const day = d.substring(0,10);
      dateCounts[day] = (dateCounts[day] || 0) + 1;
    }
    const type = e.event_type || 'Sin tipo';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  ALL_PATROLS.forEach(p => {
    const t = p.patrol_type?.name || 'Sin tipo';
    patrolCounts[t] = (patrolCounts[t] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1])[0] || ['No disponible', 0];
  const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0] || ['No disponible', 0];
  const topPatrol = Object.entries(patrolCounts).sort((a,b)=>b[1]-a[1])[0] || ['No disponible', 0];
  const totalDays = Object.keys(dateCounts).length;

  return `
    <div class="rp-section">
      <h2>4. Análisis de Gráficos</h2>
      <div class="rp-chart-analysis">
        <div class="rp-chart-box"><canvas id="rp-canvas-cat" width="360" height="220"></canvas><span>Eventos por categoría</span></div>
        <div class="rp-chart-interpretation"><h3>Análisis</h3><p>El gráfico de categorías muestra las áreas de mayor incidencia. La categoría más destacada es ${esc(topCategory[0])} con ${topCategory[1]} registros.</p></div>
      </div>
      <div class="rp-chart-analysis">
        <div class="rp-chart-box"><canvas id="rp-canvas-date" width="360" height="220"></canvas><span>Eventos por fecha</span></div>
        <div class="rp-chart-interpretation"><h3>Análisis</h3><p>El gráfico temporal muestra los días con mayor carga de reporte. Se identificaron ${totalDays} fechas con eventos registrados.</p></div>
      </div>
      <div class="rp-chart-analysis">
        <div class="rp-chart-box"><canvas id="rp-canvas-type" width="360" height="220"></canvas><span>Eventos por tipo</span></div>
        <div class="rp-chart-interpretation"><h3>Análisis</h3><p>El gráfico por tipo muestra los incidentes más comunes. El tipo dominante es ${esc(topType[0])} con ${topType[1]} registros.</p></div>
      </div>
      <div class="rp-chart-analysis">
        <div class="rp-chart-box"><canvas id="rp-canvas-pat" width="360" height="220"></canvas><span>Patrullajes por tipo</span></div>
        <div class="rp-chart-interpretation"><h3>Análisis</h3><p>El gráfico de patrullajes resalta la distribución de actividades de campo. El tipo de patrullaje más frecuente es ${esc(topPatrol[0])} con ${topPatrol[1]} registros.</p></div>
      </div>
    </div>`;
}

function buildGeneralAnalysisSection(data){
  const summary = buildReportSummary(data);
  return `
    <div class="rp-section">
      <h2>5. Análisis General</h2>
      <div class="rp-text">
        <p>En términos generales, los datos evidencian una concentración de actividad en categorías clave y un sólido uso de la geolocalización. Esto sugiere que el monitoreo está orientado hacia áreas prioritarias, facilitando la priorización de recursos y la respuesta en campo.</p>
        <p>La relación entre patrullajes y eventos registrados indica una cobertura operativa consistente, aunque se recomienda revisar los picos de reporte para ajustar la distribución de patrullajes y maximizar el efecto de vigilancia.</p>
      </div>
    </div>`;
}

function buildConclusionsSection(data){
  const summary = buildReportSummary(data);
  return `
    <div class="rp-section">
      <h2>6. Conclusiones y observaciones</h2>
      <div class="rp-text">
        <p>El informe confirma que el monitoreo del período proporciona información relevante para la gestión de amenazas y patrullajes. La categoría dominante mantiene el foco operativo y el uso de datos geoespaciales apoya la planeación de acciones.</p>
        <p>Se recomienda priorizar el seguimiento de eventos críticos, mantener la calidad de los reportes geográficos y fortalecer la coordinación entre equipos de campo y analistas.</p>
      </div>
      <div class="rp-text">
        <p>Observaciones: revisar los picos temporales de actividad para ajustar turnos y patrullajes. También conviene mejorar la integridad de los reportes en categorías con alta incidencia para afinar los análisis en ciclos futuros.</p>
      </div>
    </div>`;
}

function buildThreatPrioritySection(data){
  const priorities = {Alta:0, Media:0, Baja:0};
  data.forEach(e=>{
    const label = (e.priority_label || '').toString().trim();
    if(/alto|rojo/i.test(label)) priorities.Alta += 1;
    else if(/medio|amarillo/i.test(label)) priorities.Media += 1;
    else priorities.Baja += 1;
  });
  return `
    <div class="rp-section">
      <h2>4. Prioridad de Amenazas Detectadas</h2>
      <div class="rp-stats rp-summary-grid">
        <div class="rp-stat"><div class="v">${priorities.Alta}</div><div class="l">Alta prioridad (Rojo)</div></div>
        <div class="rp-stat"><div class="v">${priorities.Media}</div><div class="l">Media prioridad (Amarillo)</div></div>
        <div class="rp-stat"><div class="v">${priorities.Baja}</div><div class="l">Sin prioridad / Verde</div></div>
      </div>
    </div>`;
}

function getEventRowsForCategory(data, category, limit=8){
  const events = data.filter(e=>mapCat(e)===category).slice(0,limit);
  return events.map(e => {
    const id = e.id||e.pk||e.event_id||'—';
    const date = fmtDateTime(getDate(e));
    const title = esc(e.title||e.event_type||'—');
    const note = esc(e.notes||e.description||e.summary||'—');
    const status = esc(e.status||e.state||'—');
    return `<tr><td>${id}</td><td>${date}</td><td>${title}</td><td>${status}</td><td>${note}</td></tr>`;
  }).join('');
}

function buildValidatedEventsSection(data){
  const categories = ['Monitoreo Biológico', 'Monitoreo de Actividades', 'Monitoreo de Amenazas'];
  const sections = categories.map(cat => {
    const rows = getEventRowsForCategory(data, cat, 8);
    return `
      <div class="rp-subsection">
        <h3>5.${cat === 'Monitoreo Biológico' ? '1' : cat === 'Monitoreo de Actividades' ? '2' : '3'}. ${esc(cat)}</h3>
        <div class="rp-table-wrap">
          <table class="rp-table">
            <thead><tr><th>ID Evento</th><th>Fecha</th><th>Especie / Tipo</th><th>Estado</th><th>Nota de validación</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="5">No se encontraron eventos para ${esc(cat)}.</td></tr>`}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');
  return `
    <div class="rp-section">
      <h2>5. Detalles de Eventos Validados</h2>
      <p>Las tablas siguientes presentan una muestra de eventos catalogados como prioridad alta, monitoreo biológico y actividades.</p>
      ${sections}
    </div>`;
}

function buildStatsSection(data){
  const thr=data.filter(e=>mapCat(e)==='Monitoreo de Amenazas').length;
  const cats=new Set(data.map(e=>mapCat(e))).size;
  const geo=data.filter(e=>getCoords(e)).length;
  return `
    <div class="rp-section">
      <h2>Resumen Estadístico</h2>
      <div class="rp-stats">
        <div class="rp-stat"><div class="v">${data.length}</div><div class="l">Total Eventos</div></div>
        <div class="rp-stat"><div class="v">${ALL_PATROLS.length}</div><div class="l">Patrullajes</div></div>
        <div class="rp-stat"><div class="v">${cats}</div><div class="l">Categorías</div></div>
        <div class="rp-stat"><div class="v">${thr}</div><div class="l">Amenazas</div></div>
        <div class="rp-stat"><div class="v">${geo}</div><div class="l">Con ubicación</div></div>
      </div>
    </div>`;
}

function buildChartsSection(){
  return `
    <div class="rp-section">
      <h2>Gráficos</h2>
      <div class="rp-charts">
        <div class="rp-chart-box"><canvas id="rp-canvas-cat" width="360" height="220"></canvas><span>Eventos por categoría</span></div>
        <div class="rp-chart-box"><canvas id="rp-canvas-date" width="360" height="220"></canvas><span>Eventos por fecha</span></div>
        <div class="rp-chart-box"><canvas id="rp-canvas-type" width="360" height="220"></canvas><span>Eventos por tipo</span></div>
        <div class="rp-chart-box"><canvas id="rp-canvas-pat" width="360" height="220"></canvas><span>Patrullajes por tipo</span></div>
      </div>
    </div>`;
}


// Dibuja gráficos propios del informe (independientes del dashboard, para no
// interferir con los que se ven en el módulo Dashboard)
function renderReportCharts(data){
  Object.values(REPORT_CHARTS).forEach(c=>c && c.destroy());
  REPORT_CHARTS = {};

  const catCounts={}; data.forEach(e=>{const c=mapCat(e); catCounts[c]=(catCounts[c]||0)+1;});
  const catSorted=Object.entries(catCounts).sort((a,b)=>b[1]-a[1]);
  REPORT_CHARTS.cat = new Chart(document.getElementById('rp-canvas-cat'), {
    type:'doughnut',
    data:{labels:catSorted.map(x=>x[0]),datasets:[{data:catSorted.map(x=>x[1]),backgroundColor:catSorted.map(x=>getCatColor(x[0]))}]},
    options:{responsive:false,plugins:{legend:{position:'bottom',labels:{font:{size:8}}}}}
  });

  const dateCounts={}; data.forEach(e=>{const d=getDate(e); if(!d)return; const day=d.substring(0,10); dateCounts[day]=(dateCounts[day]||0)+1;});
  const dateSorted=Object.keys(dateCounts).sort();
  REPORT_CHARTS.date = new Chart(document.getElementById('rp-canvas-date'), {
    type:'bar',
    data:{labels:dateSorted.map(d=>new Date(d+'T12:00:00').toLocaleDateString('es-HN',{day:'2-digit',month:'short'})),
      datasets:[{label:'Eventos',data:dateSorted.map(d=>dateCounts[d]),backgroundColor:'#2a9d8f'}]},
    options:{responsive:false,plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:7}}},y:{ticks:{font:{size:7}}}}}
  });

  const typeCounts={}; data.forEach(e=>{const t=e.event_type||'Sin tipo'; typeCounts[t]=(typeCounts[t]||0)+1;});
  const typeSorted=Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  REPORT_CHARTS.type = new Chart(document.getElementById('rp-canvas-type'), {
    type:'bar',
    data:{labels:typeSorted.map(x=>x[0]),datasets:[{label:'Eventos',data:typeSorted.map(x=>x[1]),backgroundColor:'#4895ef'}]},
    options:{responsive:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:7}}},y:{ticks:{font:{size:7}}}}}
  });

  const patCounts={}; ALL_PATROLS.forEach(p=>{const t=p.patrol_type?.name||'Sin tipo'; patCounts[t]=(patCounts[t]||0)+1;});
  REPORT_CHARTS.pat = new Chart(document.getElementById('rp-canvas-pat'), {
    type:'bar',
    data:{labels:Object.keys(patCounts),datasets:[{label:'Patrullajes',data:Object.values(patCounts),backgroundColor:'#e9c46a'}]},
    options:{responsive:false,plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:7}}},y:{ticks:{font:{size:7}}}}}
  });
}

function printReport(){
  if(!REPORT_DATA){ alert('Primero genera la vista previa del informe.'); return; }
  window.print();
}

function buildReportSummary(data){
  const total = data.length;
  const threatCount = data.filter(e => mapCat(e) === 'Monitoreo de Amenazas').length;
  const geoCount = data.filter(e => getCoords(e)).length;
  const patrolCount = ALL_PATROLS.length;
  
  const categoryCounts = {};
  data.forEach(e => {
    const cat = mapCat(e) || 'Sin categoría';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  const typeCounts = {};
  data.forEach(e => {
    const type = e.event_type || 'Sin tipo';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => ({ name: k, count: v }));
  
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => ({ name: k, count: v }));
  
  return {
    total,
    threatCount,
    geoCount,
    patrolCount,
    topCategories,
    topTypes,
    reportTitle: document.getElementById('rc-title')?.value.trim() || 'Informe de Monitoreo',
    reportSubtitle: document.getElementById('rc-subtitle')?.value.trim() || 'SINAPH',
    dateStart: document.getElementById('rc-date-start')?.value,
    dateEnd: document.getElementById('rc-date-end')?.value
  };
}

async function getReportAnalysisAsync(summary){
  const enabled = ADMIN_CONFIG.reports?.enableAiAnalysis !== false;
  const apiKey = enabled ? (ADMIN_CONFIG.reports?.aiApiKey || '') : '';
  const aiProvider = ADMIN_CONFIG.reports?.aiProvider || 'gemini';

  if(!apiKey){
    return getReportAnalysis(summary);
  }
   
  const prompt = `Eres un analista ambiental experto. Analiza los siguientes datos de monitoreo de eventos y genera un análisis estructurado en JSON con formato específico.

Datos del informe:
- Título: ${summary.reportTitle}
- Subtítulo: ${summary.reportSubtitle}
- Período: ${summary.dateStart} a ${summary.dateEnd}
- Total de eventos: ${summary.total}
- Eventos con amenazas: ${summary.threatCount}
- Eventos con ubicación geográfica: ${summary.geoCount}
- Patrullajes realizados: ${summary.patrolCount}

Categorías principales:
${summary.topCategories.map(c => `- ${c.name}: ${c.count} eventos`).join('\n')}

Tipos de evento principales:
${summary.topTypes.map(t => `- ${t.name}: ${t.count} eventos`).join('\n')}

Genera un análisis JSON con los siguientes campos:
- "introParagraphs": lista de al menos 3 párrafos de introducción sobre el período analizado y el contexto de los datos.
- "executiveSummary": un resumen ejecutivo de media página sobre los datos, su significado y las tendencias más importantes.
- "dataSourceExplanation": un párrafo o sección que explique claramente de dónde provienen los datos, cómo se capturan y qué sistemas los aportan.
- "findings": array de 3-4 hallazgos principales encontrados.
- "recommendations": array de 3-4 recomendaciones de seguimiento.
- "conclusion": conclusión general del análisis.

Responde ÚNICAMENTE con el JSON válido, sin explicaciones adicionales.`;

  try {
    let response;
    if(aiProvider === 'openai'){
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{role:'system',content:'Eres un asistente experto en análisis ambiental.'},{role:'user',content:prompt}],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
    } else {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`Error API ${aiProvider}: ${response.status} ${errText}`);
    }

    const body = await response.json();
    const generatedText = aiProvider === 'openai'
      ? body?.choices?.[0]?.message?.content?.trim()
      : body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!generatedText) {
      throw new Error('No se recibió contenido de la API');
    }

    let analysisJson;
    try {
      analysisJson = JSON.parse(generatedText);
    } catch (parseError) {
      // Si la respuesta no es JSON válido, intenta extraer JSON del texto
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Respuesta no es JSON válido');
      }
    }

    // Validar estructura
    const hasIntro = Array.isArray(analysisJson.introParagraphs) || typeof analysisJson.intro === 'string';
    const hasExecutive = typeof analysisJson.executiveSummary === 'string';
    const hasSource = typeof analysisJson.dataSourceExplanation === 'string';
    const hasFindings = Array.isArray(analysisJson.findings);
    const hasRecommendations = Array.isArray(analysisJson.recommendations);
    const hasConclusion = typeof analysisJson.conclusion === 'string';

    if (!hasIntro || !hasExecutive || !hasSource || !hasFindings || !hasRecommendations || !hasConclusion) {
      throw new Error('Estructura JSON incompleta');
    }

    if (!Array.isArray(analysisJson.introParagraphs) && typeof analysisJson.intro === 'string') {
      analysisJson.introParagraphs = analysisJson.intro.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    }

    if (!Array.isArray(analysisJson.introParagraphs)) {
      analysisJson.introParagraphs = [];
    }
    analysisJson.findings = Array.isArray(analysisJson.findings) ? analysisJson.findings : [];
    analysisJson.recommendations = Array.isArray(analysisJson.recommendations) ? analysisJson.recommendations : [];
    analysisJson.executiveSummary = analysisJson.executiveSummary || '';
    analysisJson.dataSourceExplanation = analysisJson.dataSourceExplanation || '';
    analysisJson.conclusion = analysisJson.conclusion || '';

    return analysisJson;
  } catch (error) {
    console.error('Error en getReportAnalysisAsync:', error);
    return getReportAnalysis(summary);
  }
}

function getReportAnalysis(summary){
  const findings = [
    `Se registraron ${summary.total} eventos durante el período de análisis.`,
    `Las categorías más frecuentes fueron: ${summary.topCategories.slice(0, 2).map(c => c.name).join(' y ')}.`,
    `Se identificaron ${summary.threatCount} eventos relacionados con monitoreo de amenazas.`,
    `El ${Math.round((summary.geoCount / summary.total) * 100)}% de los eventos poseen información geográfica.`
  ];

  const recommendations = [
    `Priorizar el seguimiento en los eventos de amenaza identificados (${summary.threatCount} eventos).`,
    `Realizar inspecciones de campo en los ${summary.geoCount} eventos con ubicación geográfica confirmada.`,
    `Fortalecer el monitoreo de categorías de alto volumen: ${summary.topCategories[0]?.name}.`,
    `Consolidar datos de patrullajes (${summary.patrolCount} realizados) con los eventos reportados para análisis integrado.`
  ];

  return {
    introParagraphs: [
      `Análisis del período ${summary.dateStart} a ${summary.dateEnd} que incluye ${summary.total} eventos de monitoreo en ${summary.reportSubtitle}.`,
      `Los datos recogidos permiten identificar tendencias en el desempeño de patrullajes y la distribución de incidentes según tipo y categoría. Este informe busca ofrecer una visión clara de los aspectos más relevantes del monitoreo ambiental.`,
      `Se destacan los eventos registrados con ubicación geográfica, la cantidad de incidentes clasificados como amenazas y las categorías con mayor frecuencia en el período seleccionado.`,
    ],
    executiveSummary: `En el período analizado, se registraron ${summary.total} eventos, con ${summary.threatCount} casos relacionados con monitoreo de amenazas y ${summary.geoCount} eventos con información de ubicación geográfica. Las categorías más relevantes incluyen ${summary.topCategories.slice(0,2).map(c => c.name).join(' y ')}. El análisis revela patrones de concentración de eventos en estas categorías y una alta proporción de datos con localización espacial, lo que facilita la toma de decisiones para respuesta en campo. Se recomienda priorizar las acciones en las áreas con mayor incidencia, reforzar la coordinación de patrullajes y dar seguimiento cercano a los incidentes de mayor gravedad o riesgo.`,
    dataSourceExplanation: `Los datos provienen de la plataforma EarthRanger y son capturados a través de los reportes de campo generados por patrullas y observadores. Cada evento incluye la categoría, tipo, título y estado, y cuando está disponible, la ubicación geográfica que permite su mapeo. El sistema sincroniza esta información en tiempo real desde los dispositivos móviles o estaciones de control, integrando también el registro de patrullajes y actividades de monitoreo para ofrecer una fuente de datos confiable y actualizada.`,
    findings,
    recommendations,
    conclusion: `El análisis indica que el monitoreo mantiene un registro consistente de eventos, con un enfoque claro en las categorías más críticas y un uso relevante de la geolocalización para priorizar acciones. Se sugiere reforzar el seguimiento en los puntos de mayor concentración de incidentes y consolidar la integración de patrullajes con los datos registrados.`
  };
}

async function generateAiAnalysis(){
  if(!ALL_EVENTS.length){
    alert('No hay datos disponibles para analizar.');
    return;
  }
  
  const data = getReportData();
  const summary = buildReportSummary(data);
  
  try {
    const analysis = await getReportAnalysisAsync(summary);
    REPORT_AI_ANALYSIS = analysis;
    generateReportPreview();
  } catch (error) {
    console.error('Error en generateAiAnalysis:', error);
    const analysis = getReportAnalysis(summary);
    REPORT_AI_ANALYSIS = analysis;
    alert('Se utilizó análisis local. Error: ' + error.message);
    generateReportPreview();
  }
}

function buildLocalAiAnalysis(data){
  const total = data.length;
  const categoryCounts = {};
  const typeCounts = {};
  let threatCount = 0;
  let geoCount = 0;
  data.forEach(e=>{
    const cat = mapCat(e) || 'Sin categoría';
    categoryCounts[cat] = (categoryCounts[cat]||0)+1;
    const type = e.event_type || 'Sin tipo';
    typeCounts[type] = (typeCounts[type]||0)+1;
    if(mapCat(e)==='Monitoreo de Amenazas') threatCount += 1;
    if(getCoords(e)) geoCount += 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k} (${v})`).join(', ') || 'sin datos';
  const topTypes = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k} (${v})`).join(', ') || 'sin datos';
  return `El informe incluye ${total} eventos registrados. Las categorías más frecuentes son: ${topCategories}. Los tipos de evento más comunes son: ${topTypes}.` +
    ` Se identificaron ${threatCount} eventos relacionados con amenazas y ${geoCount} con ubicación geográfica.` +
    ` Sugerimos enfocar el seguimiento en las categorías con mayor volumen y revisar los incidentes con ubicación para priorizar respuestas en campo.`;
}

function exportReportPDF(){
  if(!REPORT_DATA){ alert('Primero genera la vista previa del informe.'); return; }
  const el=document.getElementById('report-preview');
  const filename=(document.getElementById('rc-title').value.trim()||'informe-aris').toLowerCase().replace(/\s+/g,'-')+'.pdf';
  html2pdf().set({
    margin:10,
    filename,
    image:{type:'jpeg',quality:0.95},
    html2canvas:{scale:2,backgroundColor:'#ffffff'},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
  }).from(el).save();
}

function exportReportWord(){
  if(!REPORT_DATA){ alert('Primero genera la vista previa del informe.'); return; }
  // Los <canvas> no conservan su dibujo al leer innerHTML, así que se
  // clona el nodo y cada canvas se reemplaza por una imagen (dataURL)
  // antes de exportar.
  const clone = document.getElementById('report-preview').cloneNode(true);
  const liveCanvases = document.getElementById('report-preview').querySelectorAll('canvas');
  const cloneCanvases = clone.querySelectorAll('canvas');
  liveCanvases.forEach((c,i)=>{
    const img=document.createElement('img');
    img.src=c.toDataURL('image/png');
    img.style.maxWidth='100%';
    cloneCanvases[i].replaceWith(img);
  });
  const content = clone.innerHTML;
  const filename=(document.getElementById('rc-title').value.trim()||'informe-aris').toLowerCase().replace(/\s+/g,'-')+'.doc';
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>${esc(document.getElementById('rc-title').value)}</title>
    <style>body{font-family:Calibri,Arial,sans-serif;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:4px 8px;font-size:11px;}</style>
    </head><body>${content}</body></html>`;
  const blob = new Blob(['\ufeff', html], {type:'application/msword'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
