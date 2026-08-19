// ============================================================
// MÓDULO BIENVENIDA — se muestra justo después de iniciar sesión
// Presenta el logo de ARIS, qué hace el sistema, y un resumen
// de lo que se acaba de cargar desde EarthRanger.
// ============================================================
function prepareWelcome(){
  const el=document.getElementById('wl-site-summary');
  const site=CONFIG.regional||(CONFIG.url?new URL(CONFIG.url).hostname:'—');
  el.innerHTML=`Conectado a <strong>${esc(site)}</strong> · <strong>${ALL_EVENTS.length}</strong> eventos y <strong>${ALL_PATROLS.length}</strong> patrullajes cargados de los últimos <strong>${CONFIG.days}</strong> días.`;

  const modal=document.getElementById('wl-tech-modal');
  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target===modal) closeTechEquipmentModal();
    });
  }

  const consultoriasModal=document.getElementById('wl-consultorias-modal');
  if(consultoriasModal){
    consultoriasModal.addEventListener('click', function(e){
      if(e.target===consultoriasModal) closeConsultoriasModal();
    });
  }

  const consultoriaHubModal=document.getElementById('wl-consultoria-hub-modal');
  if(consultoriaHubModal){
    consultoriaHubModal.addEventListener('click', function(e){
      if(e.target===consultoriaHubModal) closeConsultoriaHub();
    });
  }

  const comingSoonModal=document.getElementById('wl-coming-soon-modal');
  if(comingSoonModal){
    comingSoonModal.addEventListener('click', function(e){
      if(e.target===comingSoonModal) closeComingSoonModal();
    });
  }

  const environmentalHubModal=document.getElementById('wl-environmental-hub-modal');
  if(environmentalHubModal){
    environmentalHubModal.addEventListener('click', function(e){
      if(e.target===environmentalHubModal) closeEnvironmentalHub();
    });
  }

  const inventoryHubModal=document.getElementById('wl-inventory-hub-modal');
  if(inventoryHubModal){
    inventoryHubModal.addEventListener('click', function(e){
      if(e.target===inventoryHubModal) closeInventoryHub();
    });
  }

  renderConsultoriasList();
}

function showComingSoonModal(title='Módulo', message='Este módulo estará disponible próximamente.'){
  const modal=document.getElementById('wl-coming-soon-modal');
  const titleEl=document.getElementById('wl-coming-soon-title');
  const messageEl=document.getElementById('wl-coming-soon-message');

  if(!modal || !titleEl || !messageEl) return;

  titleEl.textContent=title;
  messageEl.textContent=message;
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden','false');
}

function showUnauthorizedAccess(message='Acceso no autorizado. No tienes permiso para acceder a este módulo.'){
  alert(message);
}

function userCanAccessSection(section){
  if(!section) return false;
  if(CURRENT_USER?.role === 'admin') return true;
  return Array.isArray(CURRENT_USER?.sections) && CURRENT_USER.sections.includes(section);
}

function closeComingSoonModal(){
  const modal=document.getElementById('wl-coming-soon-modal');
  if(modal){
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
  }
}

function showTechEquipmentModal(){
  const modal=document.getElementById('wl-tech-modal');
  if(modal){
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden','false');
  }
}

function closeTechEquipmentModal(){
  const modal=document.getElementById('wl-tech-modal');
  if(modal){
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
  }
}

function showConsultoriasModal(){
  const modal=document.getElementById('wl-consultorias-modal');
  if(modal){
    renderConsultoriasList();
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden','false');
  }
}

function closeConsultoriasModal(){
  const modal=document.getElementById('wl-consultorias-modal');
  if(modal){
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
  }
}

function openConsultoriaHub(){
  const modal=document.getElementById('wl-consultoria-hub-modal');
  if(modal){
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden','false');
    renderConsultoriaHubDetail('default');
  }
}

function closeConsultoriaHub(){
  const modal=document.getElementById('wl-consultoria-hub-modal');
  if(modal){
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
  }
}

function openEnvironmentalHub(){
  if(!userCanAccessSection('environmental')){
    showUnauthorizedAccess('Acceso no autorizado. No tienes permiso para abrir Gestión Ambiental.');
    return;
  }
  const modal=document.getElementById('wl-environmental-hub-modal');
  if(modal){
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden','false');
  }
}
function showEnvironmentalHub(){
  openEnvironmentalHub();
}

function closeEnvironmentalHub(){
  const modal=document.getElementById('wl-environmental-hub-modal');
  if(modal){
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
  }
}

function openInventoryHub(){
  if(!userCanAccessSection('inventory')){
    showUnauthorizedAccess('Acceso no autorizado. No tienes permiso para abrir Gestión de Inventario.');
    return;
  }
  const modal=document.getElementById('wl-inventory-hub-modal');
  if(modal){
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden','false');
  }
}
function showInventoryHub(){
  openInventoryHub();
}

function closeInventoryHub(){
  const modal=document.getElementById('wl-inventory-hub-modal');
  if(modal){
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
  }
}

function openEnvironmentalSection(target='map'){
  closeEnvironmentalHub();
  if(!userCanAccessSection('environmental')){
    showUnauthorizedAccess('Acceso no autorizado. No tienes permiso para abrir Gestión Ambiental.');
    return;
  }
  switch(target){
    case 'map':
      goToMap();
      return;
    case 'dashboard':
      goToDashboard();
      return;
    case 'table':
      toggleTable();
      goToDashboard();
      return;
    case 'reports':
      openReports();
      return;
    default:
      goToWelcome();
      return;
  }
}

function openInventoryModule(section='equipment'){
  closeInventoryHub();
  if(!userCanAccessSection('inventory')){
    showUnauthorizedAccess('Acceso no autorizado. No tienes permiso para abrir Gestión de Inventario.');
    return;
  }
  if(section==='equipment'){
    return showTechEquipmentModal();
  }
  // Placeholder: no módulo de activos definido, se muestra mensaje.
  showComingSoonModal('Inventario', 'El módulo de activos estará disponible pronto.');
}

function renderConsultoriaHubDetail(type='default'){
  const target=document.getElementById('consultoria-hub-details');
  if(!target) return;

  const content={
    default: {
      title:'Centro de operación',
      text:'Selecciona una opción para entrar al módulo correspondiente.',
      list:[]
    },
    tdr: {
      title:'Registro de proyecto o consultoría',
      text:'Registra proyectos o consultorías, sus responsables y los documentos de soporte.',
      list:['Tipo de registro','Código generado automáticamente','Responsable','Estado y observaciones']
    },
    planificacion: {
      title:'Planificación',
      text:'Administra cronogramas, entregables y seguimiento de tareas del proyecto.',
      list:['Cronograma del consultor','Entregables por semana','Seguimiento de riesgos','Fecha de cierre']
    },
    reportes: {
      title:'Generación de reportes',
      text:'Prepara informes ejecutivos y datos clave para clientes y dirección.',
      list:['Resumen ejecutivo','Gráficos y hallazgos','Exportación a PDF/Word','Revisión final']
    },
    contabilidad: {
      title:'Contabilidad',
      text:'Controla costos, pagos y rendimientos de cada consultoría.',
      list:['Presupuesto asignado','Gastos reales','Facturación','Cobranza y pagos']
    }
  };

  const item=content[type]||content.default;
  const listHtml=item.list.length ? `<ul>${item.list.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>` : '';
  target.innerHTML=`<div class="hub-detail-card"><h4>${esc(item.title)}</h4><p>${esc(item.text)}</p>${listHtml}</div>`;

  if(['tdr','planificacion','reportes','contabilidad'].includes(type)){
    setTimeout(()=>{
      openConsultoriasSubsystem(type);
      closeConsultoriaHub();
    },150);
  }
}

function selectConsultoriaHubCard(type){
  renderConsultoriaHubDetail(type);
}

function openConsultoriasSubsystem(section='tdr'){
  const screen=document.getElementById('consultorias-screen');
  if(screen){
    screen.classList.add('visible');
    screen.setAttribute('aria-hidden','false');
  }
  if(!userCanAccessSection('projects')){
    openConsultoriasSection(section);
    return;
  }
  openConsultoriasSection(section);
}

function openConsultoriasSubsystemFromAdmin(section='tdr'){
  if(!userCanAccessSection('projects')){
    showUnauthorizedAccess('Acceso no autorizado. No tienes permiso para abrir Consultorías.');
    return;
  }
  const screen=document.getElementById('consultorias-screen');
  if(screen){
    screen.classList.add('visible');
    screen.setAttribute('aria-hidden','false');
  }
  if(typeof openConsultoriasSection === 'function'){
    openConsultoriasSection(section);
  }
}

function closeConsultoriasSubsystem(){
  const screen=document.getElementById('consultorias-screen');
  if(screen){
    screen.classList.remove('visible');
    screen.setAttribute('aria-hidden','true');
  }
}

function openConsultoriasSection(section='tdr'){
  const tabs=[...document.querySelectorAll('.consultorias-tab')];
  tabs.forEach(btn=>btn.classList.toggle('active', btn.dataset.section===section));
  const content=document.getElementById('consultorias-content');
  if(!content) return;
  try{ localStorage.setItem('aris_last_view', JSON.stringify({ module: 'consultoria', section })); }catch(e){}

  switch(section){
    case 'tdr':
      content.innerHTML=`
        <div class="consultorias-grid-2">
          <div class="consultorias-panel">
            <h3>Nuevo registro de proyecto o consultoría</h3>
            <form class="consultorias-form" onsubmit="event.preventDefault(); saveConsultoriaTdr();">
              <label class="consultorias-field"><span>Tipo de registro</span><select id="tdr-type" onchange="refreshConsultoriaGeneratedCode()"><option value="Consultoria">Consultoría</option><option value="Proyecto">Proyecto</option></select></label>
              <label class="consultorias-field"><span>Código generado</span><input id="tdr-code" type="text" placeholder="Se genera automáticamente" readonly required></label>
              <label class="consultorias-field"><span>Nombre de proyecto o consultoría</span><input id="tdr-title" type="text" placeholder="Diagnóstico de campo" required></label>
              <label class="consultorias-field"><span>Contratante</span><input id="tdr-contratante" type="text" placeholder="Nombre del contratante"></label>
              <label class="consultorias-field"><span>Responsable</span><input id="tdr-responsable" type="text" placeholder="Consultor responsable"></label>
              <label class="consultorias-field"><span>Estado</span><select id="tdr-status"><option value="En revisión">En revisión</option><option value="Aprobada">Aprobada</option><option value="Pendiente">Pendiente</option></select></label>
              <label class="consultorias-field"><span>Archivo PDF</span><input id="tdr-file" type="file" accept=".pdf"></label>
              <label class="consultorias-field full"><span>Observaciones</span><textarea id="tdr-notes" rows="4" placeholder="Observaciones, comentarios y hallazgos..."></textarea></label>
              <div class="consultorias-actions">
                <button class="consultorias-cta" type="submit">Guardar registro</button>
                <button class="consultorias-secondary" type="button" onclick="clearConsultoriaTdrForm()">Limpiar</button>
              </div>
            </form>
          </div>
          <div class="consultorias-panel">
            <h3>Listado de proyectos y consultorías</h3>
            <div class="consultorias-list-stack">
              <div id="tdr-list" class="consultorias-card-list"></div>
              <div id="tdr-detail" class="consultorias-detail-card">
                <div class="consultorias-detail-empty">Selecciona un registro para ver su información completa.</div>
              </div>
            </div>
          </div>
        </div>`;
      renderConsultoriaTdrList();
      refreshConsultoriaGeneratedCode();
      break;
    case 'planificacion':
      content.innerHTML=`
        <div class="consultorias-grid-2">
          <div class="consultorias-panel">
            <h3>Información general de la consultoría</h3>
            <div class="consultorias-actions" style="margin-bottom:10px;">
              <button class="consultorias-cta" type="button" onclick="toggleConsultoriaGeneralInfoForm()">Agregar Informacion General de consultoria</button>
            </div>
            <div id="general-info-form-wrapper" style="display:none;">
              <form class="consultorias-form" onsubmit="event.preventDefault(); saveConsultoriaSchedule();">
                <label class="consultorias-field"><span>Código de consultoría</span><input id="plan-code" list="plan-code-options" type="text" placeholder="CONS-001" required onchange="loadConsultoriaGeneralInfo()"><datalist id="plan-code-options"></datalist></label>
                <label class="consultorias-field"><span>Nombre de consultoría</span><input id="plan-title" type="text" placeholder="Nombre del proyecto" required></label>
                <label class="consultorias-field"><span>Contratante</span><input id="plan-client" type="text" placeholder="Cliente o institución"></label>
                <label class="consultorias-field"><span>Responsable</span><input id="plan-responsable" type="text" placeholder="Consultor responsable"></label>
                <label class="consultorias-field"><span>Estado</span><select id="plan-status"><option value="Planificada">Planificada</option><option value="En curso">En curso</option><option value="Cerrada">Cerrada</option><option value="Vencida">Vencida</option></select></label>
                <label class="consultorias-field"><span>Fecha de inicio</span><input id="plan-start" type="date"></label>
                <label class="consultorias-field"><span>Fecha final</span><input id="plan-end" type="date"></label>
                <label class="consultorias-field"><span>Notas generales</span><textarea id="plan-notes" rows="3" placeholder="Resumen de la consultoría, alcance y comentarios..."></textarea></label>
                <div class="consultorias-import">
                  <h4>Importar Cronograma</h4>
                  <input id="plan-excel-file" type="file" accept=".xlsx,.xls,.csv">
                  <div class="consultorias-actions">
                    <button class="consultorias-secondary" type="button" onclick="importConsultoriaScheduleExcel()">Importar Excel</button>
                  </div>
                  <div id="plan-import-message" class="consultorias-meta"></div>
                </div>
                <div class="consultorias-actions">
                  <button class="consultorias-cta" type="submit">Guardar información</button>
                  <button class="consultorias-secondary" type="button" onclick="clearConsultoriaScheduleForm()">Limpiar</button>
                </div>
              </form>
            </div>
          </div>
          <div class="consultorias-panel">
            <h3>Entregables</h3>
            <div id="deliverable-editor" class="consultorias-card-item" style="display:none;">
              <div class="consultorias-actions" style="flex-direction:column;align-items:flex-start;">
                <label class="consultorias-field full"><span>Nombre del entregable</span><input id="deliverable-name" type="text" placeholder="Entregable 1"></label>
                <label class="consultorias-field"><span>Fecha de inicio</span><input id="deliverable-start" type="date"></label>
                <label class="consultorias-field"><span>Fecha final</span><input id="deliverable-end" type="date"></label>
                <button class="consultorias-secondary" type="button" onclick="addConsultoriaDeliverable()">Agregar entregable</button>
              </div>
            </div>
            <div id="deliverable-list" class="consultorias-card-list" style="margin-top:12px;"></div>
            <div id="calendar-panel" class="consultorias-calendar-panel" style="display:block; margin-top:12px;"></div>
          </div>
        </div>
        <div class="consultorias-panel" style="margin-top:16px;">
          <h3>Consultorías guardadas</h3>
          <div id="plan-list" class="consultorias-card-list"></div>
        </div>
        <div class="consultorias-panel" style="margin-top:16px;">
          <h3>Calendario y Gantt de entregables</h3>
          <div id="plan-calendar" class="consultorias-calendar consultorias-calendar-full"></div>
        </div>
        <div class="consultorias-panel" style="margin-top:16px;">
          <h3>Diagrama Gantt de entregables</h3>
          <div id="plan-gantt" class="consultorias-calendar consultorias-gantt"></div>
        </div>`;
      renderConsultoriaCodeOptions();
      loadConsultoriaGeneralInfo();
      renderConsultoriaScheduleList();
      renderConsultoriaScheduleCalendar();
      renderConsultoriaScheduleGantt();
      renderConsultableDeliverableSelector();
      break;
    case 'reportes':
      content.innerHTML=`
        <div class="consultorias-grid-2">
          <div class="consultorias-panel">
            <h3>Generación de reportes</h3>
            <form class="consultorias-form" onsubmit="event.preventDefault(); saveConsultoriaReport();">
              <label class="consultorias-field"><span>Título</span><input id="report-title" type="text" placeholder="Reporte ejecutivo" required></label>
              <label class="consultorias-field"><span>Tipo</span><select id="report-type"><option value="Ejecutivo">Ejecutivo</option><option value="Técnico">Técnico</option><option value="Financiero">Financiero</option></select></label>
              <label class="consultorias-field"><span>Periodo</span><input id="report-period" type="text" placeholder="Junio 2026"></label>
              <label class="consultorias-field"><span>Estado</span><select id="report-status"><option value="Listo">Listo</option><option value="Borrador">Borrador</option><option value="Pendiente">Pendiente</option></select></label>
              <div class="consultorias-actions">
                <button class="consultorias-cta" type="submit">Guardar reporte</button>
              </div>
            </form>
            <div class="consultorias-card-item" style="margin-top:18px;">
              <div class="consultorias-card-head"><div class="consultorias-card-title">Filtros del informe</div></div>
              <div class="consultorias-actions" style="flex-wrap:wrap; gap:12px; align-items:flex-end;">
                <label class="consultorias-field"><span>Consultoría</span><input id="report-filter-project" list="report-filter-project-options" type="text" placeholder="Código o nombre"></label>
                <datalist id="report-filter-project-options"></datalist>
                <label class="consultorias-field"><span>Desde</span><input id="report-filter-from-date" type="date" onchange="renderConsultoriaReportPreview()"></label>
                <label class="consultorias-field"><span>Hasta</span><input id="report-filter-to-date" type="date" onchange="renderConsultoriaReportPreview()"></label>
                <button class="consultorias-secondary" type="button" onclick="renderConsultoriaReportPreview()">Actualizar informe</button>
                <button class="consultorias-secondary" type="button" onclick="exportConsultoriaReportToWord()">Exportar a Word</button>
              </div>
            </div>
          </div>
          <div class="consultorias-panel">
            <h3>Vista previa del informe</h3>
            <div id="consultoria-report-preview" class="consultorias-card-list"><div class="consultorias-card-item"><div class="consultorias-card-title">Selecciona un rango y una consultoría para ver las actividades y la ejecución financiera.</div></div></div>
          </div>
        </div>
        <div class="consultorias-panel" style="margin-top:16px;">
          <h3>Reportes del sistema</h3>
          <div id="report-list" class="consultorias-card-list"></div>
        </div>`;
      renderConsultoriaReportList();
      renderConsultoriaReportFilters();
      renderConsultoriaReportPreview();
      break;
    case 'contabilidad':
      content.innerHTML=`
          <div class="consultorias-panel">
            <h3>Contabilidad</h3>
            <div id="cost-card-actions" class="hub-grid" style="grid-template-columns:repeat(2,minmax(160px,1fr)); gap:14px; margin-bottom:16px;">
              <button type="button" class="hub-card" data-section="nuevos-registros" onclick="openConsultoriaCostCard(event,'nuevos-registros')">
                <span class="hub-card-icon">N</span>
                <strong>Nuevos Registros</strong>
                <small>Mira los últimos movimientos contables agregados.</small>
              </button>
              <button type="button" class="hub-card" data-section="registro" onclick="openConsultoriaCostCard(event,'registro')">
                <span class="hub-card-icon">R</span>
                <strong>Registro contable</strong>
                <small>Abre el formulario para guardar un nuevo movimiento.</small>
              </button>
              <button type="button" class="hub-card" data-section="detalle" onclick="openConsultoriaCostCard(event,'detalle')">
                <span class="hub-card-icon">D</span>
                <strong>Detalle de partidas</strong>
                <small>Revisa concepto, proveedor, categoría y monto.</small>
              </button>
              <button type="button" class="hub-card" data-section="estado" onclick="openConsultoriaCostCard(event,'estado')">
                <span class="hub-card-icon">E</span>
                <strong>Estado y seguimiento</strong>
                <small>Consulta vencimientos, pagos y estados.</small>
              </button>
              <button type="button" class="hub-card" data-section="adjuntos" onclick="openConsultoriaCostCard(event,'adjuntos')">
                <span class="hub-card-icon">A</span>
                <strong>Adjuntos de comprobantes</strong>
                <small>Visualiza facturas, recibos y soportes.</small>
              </button>
              <button type="button" class="hub-card" data-section="resumen" onclick="openConsultoriaCostCard(event,'resumen')">
                <span class="hub-card-icon">S</span>
                <strong>Resumen presupuestario</strong>
                <small>Ve totales por categoría y proyecto.</small>
              </button>
              <button type="button" class="hub-card" data-section="reportes" onclick="openConsultoriaCostCard(event,'reportes')">
                <span class="hub-card-icon">P</span>
                <strong>Reportes rápidos</strong>
                <small>Gastos por mes, rubro y cuentas por pagar.</small>
              </button>
            </div>
            <div id="cost-card-content" style="margin-top:12px;"><div class="consultorias-card-item"><div class="consultorias-card-title">Haz click en una opción para ver su contenido.</div></div></div>
          </div>`;
      bindConsultoriaCostCardInteractions();
      renderConsultoriaCostList();
      break;
    default:
      content.innerHTML='<div class="consultorias-panel"><h3>Selecciona una sección</h3></div>';
  }
}

let LAST_TDR_ANALYSIS = null;
let SELECTED_CONSULTORIA_TDR_INDEX = null;

function normalizeTdrEndpoint(value){
  const raw = (value || '').trim();
  if(!raw) return 'http://127.0.0.1:5001/api/analyze-tdr';
  const normalized = raw.replace(/\/+$/, '');
  if(/\/api\/analyze-tdr(?:\/)?$/i.test(normalized)) return normalized;
  if(/\/api\//i.test(normalized)) return normalized.replace(/\/api\/.*$/i, '/api/analyze-tdr');
  if(/:\d+$/i.test(normalized)) return `${normalized.replace(/\/+$/, '')}/api/analyze-tdr`;
  return `${normalized.replace(/\/+$/, '')}/api/analyze-tdr`;
}

function getConsultoriaTdrs(){
  try{ return JSON.parse(localStorage.getItem('aris_tdrs')||'[]'); }catch(e){ return []; }
}
function saveConsultoriaTdrs(items){ localStorage.setItem('aris_tdrs', JSON.stringify(items)); }

function analyzeTdrWithGemini(){
  const fileInput=document.getElementById('tdr-file');
  const file=fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  const url=(document.getElementById('tdr-url')?.value || '').trim();
  const statusEl=document.getElementById('tdr-analysis-status');
  const tdrConfig = ADMIN_CONFIG?.tdr || {};
  const apiKey = (tdrConfig.apiKey || '').trim();

  if(!file && !url){
    alert('Carga un PDF o pega la URL del TDR para analizarlo con Gemini.');
    return;
  }

  if(!tdrConfig.enabled || !apiKey){
    alert('La integración Gemini para TDR no está configurada. Configúralo desde Administración > Gestión de Proyectos o Consultorías.');
    if(statusEl) statusEl.textContent='Gemini no configurado. Revisar Administración.';
    return;
  }

  if(statusEl) statusEl.textContent='Analizando documento con Gemini...';

  const endpoint = normalizeTdrEndpoint(tdrConfig.endpoint || 'http://127.0.0.1:5001/api/analyze-tdr');

  const handleResponse=async (res)=>{
    if(!res.ok){
      const text = await res.text();
      throw new Error(text || 'No se pudo analizar el TDR.');
    }
    return res.json();
  };

  const doRequest=(body, headers={})=>fetch(endpoint,{method:'POST', headers, body}).then(handleResponse);

  if(file){
    const formData=new FormData();
    formData.append('file', file, file.name);
    formData.append('apiKey', apiKey);
    doRequest(formData)
      .then((data)=>{
        LAST_TDR_ANALYSIS = data.result || null;
        applyExtractedTdrResult(LAST_TDR_ANALYSIS);
        if(statusEl) statusEl.textContent = data.message || 'TDR analizado correctamente.';
      })
      .catch((err)=>{
        console.error(err);
        if(statusEl) statusEl.textContent='Error al analizar el TDR.';
        alert(err.message || 'Error al analizar el TDR.');
      });
    return;
  }

  doRequest(JSON.stringify({ url, apiKey }), {'Content-Type':'application/json'})
    .then((data)=>{
      LAST_TDR_ANALYSIS = data.result || null;
      applyExtractedTdrResult(LAST_TDR_ANALYSIS);
      if(statusEl) statusEl.textContent = data.message || 'TDR analizado correctamente.';
    })
    .catch((err)=>{
      console.error(err);
      if(statusEl) statusEl.textContent='Error al analizar el TDR.';
      alert(err.message || 'Error al analizar el TDR.');
    });
}

function applyExtractedTdrResult(result){
  if(!result) return;
  if(result.nombre_consultoria){ document.getElementById('tdr-title').value = result.nombre_consultoria; }
  if(result.contratante){ document.getElementById('tdr-contratante').value = result.contratante; }
  if(result.responsable){ document.getElementById('tdr-responsable').value = result.responsable; }
  if(result.entregables && Array.isArray(result.entregables) && result.entregables.length){
    document.getElementById('tdr-entregables').value = result.entregables.join('\n');
  }
  if(result.notas){ document.getElementById('tdr-notes').value = result.notas; }
}

function getConsultoriaRegistrationTypeLabel(value){
  const raw=(value||'').toString().trim().toLowerCase();
  return raw === 'proyecto' ? 'Proyecto' : 'Consultoria';
}

function generateConsultoriaRegistrationCode(type='Consultoria', items=null){
  const normalizedType = getConsultoriaRegistrationTypeLabel(type);
  const prefix = normalizedType === 'Proyecto' ? 'PROY' : 'CONS';
  const year = new Date().getFullYear();
  const currentItems = Array.isArray(items) ? items : getConsultoriaTdrs();
  const existingNumbers = currentItems
    .filter(item => item && item.code)
    .map(item => item.code.toString().trim())
    .map(code => {
      const match = code.match(new RegExp(`^${prefix}-0*(\\d+)-${year}$`, 'i'));
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(number => Number.isFinite(number));
  const nextNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(3, '0')}-${year}`;
}

function refreshConsultoriaGeneratedCode(){
  const codeInput=document.getElementById('tdr-code');
  if(!codeInput) return;
  const typeSelect=document.getElementById('tdr-type');
  const type = typeSelect?.value || 'Consultoria';
  codeInput.value = generateConsultoriaRegistrationCode(type, getConsultoriaTdrs());
}

function saveConsultoriaTdr(){
  const typeValue = document.getElementById('tdr-type')?.value || 'Consultoria';
  const code=document.getElementById('tdr-code')?.value.trim() || generateConsultoriaRegistrationCode(typeValue, getConsultoriaTdrs());
  const title=document.getElementById('tdr-title')?.value.trim();
  if(!code || !title){ alert('Completa el código y el nombre del registro.'); return; }
  const items=getConsultoriaTdrs();
  items.unshift({
    id:Date.now(),
    code,
    type:getConsultoriaRegistrationTypeLabel(typeValue),
    title,
    contratante:document.getElementById('tdr-contratante')?.value.trim()||'',
    responsable:document.getElementById('tdr-responsable')?.value.trim()||'',
    status:document.getElementById('tdr-status')?.value||'En revisión',
    notes:document.getElementById('tdr-notes')?.value.trim()||'',
    analysis: LAST_TDR_ANALYSIS || null,
    sourceFile:(document.getElementById('tdr-file')?.files && document.getElementById('tdr-file').files[0]?.name) || ''
  });
  saveConsultoriaTdrs(items);
  SELECTED_CONSULTORIA_TDR_INDEX = 0;
  renderConsultoriaTdrList();
  renderConsultoriaCodeOptions();
  clearConsultoriaTdrForm();
}
function clearConsultoriaTdrForm(){
  const form=document.querySelector('.consultorias-form');
  if(form) form.reset();
  const typeSelect=document.getElementById('tdr-type');
  if(typeSelect) typeSelect.value='Consultoria';
  refreshConsultoriaGeneratedCode();
  LAST_TDR_ANALYSIS = null;
  const statusEl=document.getElementById('tdr-analysis-status');
  if(statusEl) statusEl.textContent='Sin análisis aún.';
  const fileInput=document.getElementById('tdr-file');
  if(fileInput) fileInput.value='';
  document.getElementById('tdr-code')?.focus();
}
function showConsultoriaRegistrationDetail(index){
  const items=getConsultoriaTdrs();
  if(!items.length) return;
  SELECTED_CONSULTORIA_TDR_INDEX = index;
  renderConsultoriaTdrList();
}

function renderConsultoriaTdrDetail(index){
  const detail=document.getElementById('tdr-detail');
  if(!detail) return;
  const items=getConsultoriaTdrs();
  if(!items.length || index===null || index===undefined || index < 0 || index >= items.length){
    detail.innerHTML='<div class="consultorias-detail-empty">Selecciona un registro para ver su información completa.</div>';
    return;
  }
  const item=items[index];
  const fileLine = item.sourceFile ? `<div class="consultorias-meta"><span>Archivo: ${esc(item.sourceFile)}</span></div>` : '';
  const notesLine = item.notes ? `<div class="consultorias-meta"><span>${esc(item.notes)}</span></div>` : '';
  detail.innerHTML=`<div class="consultorias-detail-head"><strong>${esc(item.code||'Registro')}</strong><span class="consultorias-chip ${item.status==='Aprobada'?'success':item.status==='Pendiente'?'warn':'alert'}">${esc(item.status||'En revisión')}</span></div><div class="consultorias-detail-body"><div class="consultorias-meta"><span>${esc(item.type || 'Consultoria')}</span><span>${esc(item.title||'Sin nombre')}</span></div>${item.responsable?`<div class="consultorias-meta"><span>Responsable: ${esc(item.responsable)}</span></div>`:''}${item.contratante?`<div class="consultorias-meta"><span>Contratante: ${esc(item.contratante)}</span></div>`:''}${fileLine}${notesLine}</div>`;
}

function renderConsultoriaTdrList(){
  const list=document.getElementById('tdr-list');
  if(!list) return;
  const items=getConsultoriaTdrs();
  if(!items.length){
    list.innerHTML='<div class="consultorias-card-item"><div class="consultorias-card-title">No hay registros de proyecto o consultoría</div></div>';
    renderConsultoriaTdrDetail(null);
    renderConsultoriaCodeOptions();
    return;
  }
  const selectionIndex = SELECTED_CONSULTORIA_TDR_INDEX !== null && SELECTED_CONSULTORIA_TDR_INDEX >= 0 && SELECTED_CONSULTORIA_TDR_INDEX < items.length ? SELECTED_CONSULTORIA_TDR_INDEX : 0;
  SELECTED_CONSULTORIA_TDR_INDEX = selectionIndex;
  list.innerHTML=items.map((item,index)=>`<button type="button" class="consultorias-card-item consultorias-card-selectable ${index===selectionIndex?'active':''}" onclick="showConsultoriaRegistrationDetail(${index})"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.code||'Registro')}</div><span class="consultorias-chip ${item.status==='Aprobada'?'success':item.status==='Pendiente'?'warn':'alert'}">${esc(item.status||'En revisión')}</span></div><div class="consultorias-meta"><span>${esc(item.type || 'Consultoria')}</span><span>${esc(item.title||'Sin nombre')}</span></div>${item.responsable?`<div class="consultorias-meta"><span>Resp.: ${esc(item.responsable)}</span></div>`:''}${item.contratante?`<div class="consultorias-meta"><span>Cliente: ${esc(item.contratante)}</span></div>`:''}</button>`).join('');
  renderConsultoriaTdrDetail(selectionIndex);
  renderConsultoriaCodeOptions();
}

function getConsultoriaSchedule(){ try{ return JSON.parse(localStorage.getItem('aris_consultorias_plan')||'[]'); }catch(e){ return []; } }
function saveConsultoriaScheduleList(items){ localStorage.setItem('aris_consultorias_plan', JSON.stringify(items)); }

function getConsultoriaDeliverableCode(deliverable, index){
  if(deliverable && typeof deliverable === 'object' && deliverable.code){
    return String(deliverable.code);
  }
  return `E${index+1}`;
}

function getConsultoriaNextDeliverableCode(deliverables){
  if(!Array.isArray(deliverables)) return 'E1';
  const numbers = deliverables.map((deliverable, index) => {
    if(deliverable && typeof deliverable === 'object' && deliverable.code){
      const match = String(deliverable.code).match(/^E(\d+)$/);
      if(match) return Number(match[1]);
    }
    return index + 1;
  });
  const max = numbers.reduce((acc, value) => Number.isFinite(value) ? Math.max(acc, value) : acc, 0);
  return `E${max + 1}`;
}

function getConsultoriaSubactivityCode(subactivity, deliverableCode, index){
  if(subactivity && typeof subactivity === 'object' && subactivity.code){
    return String(subactivity.code);
  }
  return `${deliverableCode}.${index+1}`;
}

function getConsultoriaNextSubactivityCode(deliverableCode, subactivities){
  if(!Array.isArray(subactivities)) return `${deliverableCode}.1`;
  const numbers = subactivities.map((subactivity, index) => {
    if(subactivity && typeof subactivity === 'object' && subactivity.code){
      const escapedCode = String(subactivity.code).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = String(subactivity.code).match(new RegExp(`^${escapedCode}\.(\\d+)$`));
      if(match) return Number(match[1]);
    }
    return index + 1;
  });
  const max = numbers.reduce((acc, value) => Number.isFinite(value) ? Math.max(acc, value) : acc, 0);
  return `${deliverableCode}.${max + 1}`;
}

function saveConsultoriaSchedule(){
  const code=normalizeConsultoriaCode(document.getElementById('plan-code')?.value.trim());
  const title=document.getElementById('plan-title')?.value.trim();
  if(!code || !title){ alert('Ingresa el código y el nombre de la consultoría.'); return; }
  const items=getConsultoriaSchedule();
  const existingIndex = items.findIndex(item=>item.code===code);
  const record = {
    id: existingIndex >= 0 ? items[existingIndex].id : Date.now(),
    code,
    title,
    client:document.getElementById('plan-client')?.value.trim()||'',
    responsable:document.getElementById('plan-responsable')?.value.trim()||'',
    start:document.getElementById('plan-start')?.value||'',
    end:document.getElementById('plan-end')?.value||'',
    status:document.getElementById('plan-status')?.value||'Planificada',
    notes:document.getElementById('plan-notes')?.value.trim()||'',
    deliverables: existingIndex >= 0 ? items[existingIndex].deliverables || [] : [],
    deliverables: existingIndex >= 0 ? items[existingIndex].deliverables || [] : [],
  };
  if(existingIndex >= 0){
    items[existingIndex] = record;
  } else {
    items.unshift(record);
  }
  saveConsultoriaScheduleList(items);
  renderConsultoriaScheduleList();
  loadConsultoriaGeneralInfo();
  renderConsultoriaScheduleCalendar();
  renderConsultableDeliverableSelector();
  renderConsultoriaDeliverableList();
}
function clearConsultoriaScheduleForm(){ document.getElementById('plan-title')?.focus(); }
function getVisibleConsultoriaScheduleEntries(){
  const items=getConsultoriaSchedule();
  const currentCode=document.getElementById('plan-code')?.value.trim();
  const withCode = items.filter(item => item && String(item.code || '').trim());
  if(!withCode.length) return [];
  if(currentCode){
    const byCode = withCode.filter(item => String(item.code || '').trim() === currentCode);
    return byCode.length ? byCode : withCode;
  }
  return withCode.sort((a,b) => (Number(b.id)||0) - (Number(a.id)||0)).slice(0,1);
}

function selectConsultoriaScheduleEntry(code){
  const planCode=document.getElementById('plan-code');
  if(planCode) planCode.value=code;
  loadConsultoriaGeneralInfo();
  renderConsultoriaScheduleList();
  const editor=document.getElementById('deliverable-editor');
  if(editor) editor.style.display='none';
  const input=document.getElementById('deliverable-name');
  if(input) input.value='';
}

function openConsultoriaDeliverableEditor(code){
  const planCode=document.getElementById('plan-code');
  if(planCode) planCode.value=code;
  loadConsultoriaGeneralInfo();
  const editor=document.getElementById('deliverable-editor');
  if(editor) editor.style.display='block';
  renderConsultoriaWorkflowModal(code);
  renderConsultoriaDeliverableList();
  renderConsultoriaScheduleList();
}

function toggleConsultoriaGeneralInfoForm(){
  const wrapper=document.getElementById('general-info-form-wrapper');
  if(!wrapper) return;
  wrapper.style.display = wrapper.style.display === 'block' ? 'none' : 'block';
}

function closeConsultoriaWorkflowModal(){
  const modal=document.getElementById('consultoria-workflow-modal');
  if(modal) modal.remove();
}

function renderConsultoriaWorkflowModal(code){
  const schedule=getConsultoriaScheduleItem(code);
  const deliverables=Array.isArray(schedule?.deliverables) ? schedule.deliverables : [];
  const planCode=document.getElementById('plan-code');
  if(planCode) planCode.value=code || '';
  loadConsultoriaGeneralInfo();
  let modal=document.getElementById('consultoria-workflow-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='consultoria-workflow-modal';
    modal.className='consultorias-modal-overlay';
    modal.addEventListener('click', function(event){ if(event.target===modal) closeConsultoriaWorkflowModal(); });
    document.body.appendChild(modal);
  }
  const deliverableOptions = deliverables.map((deliverable,index)=>{
    const title = typeof deliverable === 'string' ? deliverable : deliverable.title || `Entregable ${index+1}`;
    const code = getConsultoriaDeliverableCode(deliverable, index);
    return `<option value="${esc(code)}">${esc(code)} - ${esc(title)}</option>`;
  }).join('');
  const deliverableRows = deliverables.map((deliverable,index)=>{
    const title=typeof deliverable==='string' ? deliverable : deliverable.title || `Entregable ${index+1}`;
    const deliverableCode = getConsultoriaDeliverableCode(deliverable, index);
    const start=typeof deliverable==='object' ? deliverable.start || '' : '';
    const end=typeof deliverable==='object' ? deliverable.end || '' : '';
    const subactivities=Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
    const subRows=subactivities.map((sub, subIndex)=>{
      const subCode = getConsultoriaSubactivityCode(sub, deliverableCode, subIndex);
      return `<div class="consultorias-subactivity-item"><div><strong>${esc(subCode)} - ${esc(sub.title || `Subactividad ${subIndex+1}`)}</strong></div><div class="consultorias-meta"><span>${sub.start ? `Fecha: ${esc(sub.start)}` : ''}</span></div></div>`;
    }).join('');
    return `<div class="consultorias-card-item"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(deliverableCode)} - ${esc(title)}</div></div><div class="consultorias-meta"><span>${start ? `Inicio: ${esc(start)}` : 'Sin inicio'}</span><span>${end ? `Fin: ${esc(end)}` : 'Sin fin'}</span></div>${subRows ? `<div class="consultorias-subactivity-box"><div class="consultorias-subactivity-title">Subactividades</div>${subRows}</div>` : '<div class="consultorias-detail-empty">Sin subactividades</div>'}</div>`;
  }).join('');
  modal.innerHTML=`<div class="consultorias-modal-card"><div class="consultorias-modal-header"><div><strong>${esc(schedule?.title || 'Consultoría')}</strong><div class="consultorias-meta"><span>${esc(code || 'Sin código')}</span></div></div><button type="button" class="consultorias-secondary" onclick="closeConsultoriaWorkflowModal()">Cerrar</button></div><div class="consultorias-modal-body"><div class="consultorias-card-item"><div class="consultorias-card-title">Agregar entregable</div><div class="consultorias-actions" style="flex-direction:column;align-items:flex-start;">
        <label class="consultorias-field full"><span>Nombre del entregable</span><input id="modal-deliverable-name" type="text" placeholder="Entregable 1"></label>
        <label class="consultorias-field"><span>Fecha de inicio</span><input id="modal-deliverable-start" type="date"></label>
        <label class="consultorias-field"><span>Fecha final</span><input id="modal-deliverable-end" type="date"></label>
        <button class="consultorias-cta" type="button" onclick="addConsultoriaDeliverableFromModal()">Agregar entregable</button>
      </div></div><div class="consultorias-card-item"><div class="consultorias-card-title">Subactividades</div><div class="consultorias-actions"><button class="consultorias-secondary" type="button" onclick="toggleConsultoriaSubactivityForm()">Agregar subactividad</button></div><div id="subactivity-form-wrapper" style="display:none; margin-top:10px;"><div class="consultorias-actions" style="flex-direction:column;align-items:flex-start;">
        <label class="consultorias-field full"><span>Nombre de subactividad</span><input id="modal-subactivity-name" type="text" placeholder="Subactividad"></label>
        <label class="consultorias-field full"><span>Fecha de entrega</span><input id="modal-subactivity-date" type="date"></label>
        <label class="consultorias-field full"><span>Evidencia</span><input id="modal-subactivity-file" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"></label>
        <label class="consultorias-field full"><span>Entregable al que pertenece</span><select id="modal-subactivity-deliverable">${deliverableOptions || '<option value="">No hay entregables registrados</option>'}</select></label>
        <button class="consultorias-secondary" type="button" onclick="addConsultoriaSubactivityFromModal()">Guardar subactividad</button>
      </div></div></div></div>`;
}

function toggleConsultoriaSubactivityForm(){
  const wrapper=document.getElementById('subactivity-form-wrapper');
  if(!wrapper) return;
  wrapper.style.display = wrapper.style.display === 'block' ? 'none' : 'block';
}

function addConsultoriaDeliverableFromModal(){
  const code=document.getElementById('plan-code')?.value.trim();
  const name=document.getElementById('modal-deliverable-name')?.value.trim();
  const start=document.getElementById('modal-deliverable-start')?.value || '';
  const end=document.getElementById('modal-deliverable-end')?.value || '';
  if(!code || !name){ alert('Selecciona una consultoría y escribe el nombre del entregable.'); return; }
  const items=getConsultoriaSchedule();
  const index=items.findIndex(item=>item.code===code);
  const payload = index >= 0 ? items[index] : {
    id: Date.now(),
    code,
    title: document.getElementById('plan-title')?.value.trim()||`Consultoría ${code}`,
    client: document.getElementById('plan-client')?.value.trim()||'',
    responsable: document.getElementById('plan-responsable')?.value.trim()||'',
    start: document.getElementById('plan-start')?.value||'',
    end: document.getElementById('plan-end')?.value||'',
    status: document.getElementById('plan-status')?.value||'Planificada',
    notes: document.getElementById('plan-notes')?.value.trim()||'',
    deliverables: []
  };
  payload.deliverables = Array.isArray(payload.deliverables) ? payload.deliverables : [];
  const nextDeliverableCode = getConsultoriaNextDeliverableCode(payload.deliverables);
  payload.deliverables.push({title:name, start, end, code: nextDeliverableCode, subactivities: []});
  if(index >= 0){ items[index]=payload; } else { items.unshift(payload); }
  saveConsultoriaScheduleList(items);
  renderConsultoriaWorkflowModal(code);
  renderConsultoriaScheduleList();
  renderConsultoriaScheduleCalendar();
  renderConsultoriaScheduleGantt();
}

function addConsultoriaSubactivityFromModal(){
  const code=document.getElementById('plan-code')?.value.trim();
  const title=document.getElementById('modal-subactivity-name')?.value.trim();
  const date=document.getElementById('modal-subactivity-date')?.value || '';
  const evidenceInput=document.getElementById('modal-subactivity-file');
  const evidenceName=evidenceInput?.files?.[0]?.name || '';
  const deliverableCode=document.getElementById('modal-subactivity-deliverable')?.value || '';
  if(!code || !title || !deliverableCode){ alert('Completa el nombre, la fecha y el entregable de la subactividad.'); return; }
  const items=getConsultoriaSchedule();
  const index=items.findIndex(item=>item.code===code);
  if(index < 0){ alert('Guarda primero la información general de la consultoría.'); return; }
  const deliverables=Array.isArray(items[index].deliverables) ? items[index].deliverables : [];
  const targetIndex=deliverables.findIndex((deliverable, deliverableIndex) => {
    return getConsultoriaDeliverableCode(deliverable, deliverableIndex) === deliverableCode;
  });
  if(targetIndex < 0){ alert('Selecciona un entregable registrado para asociar la subactividad.'); return; }
  const target=deliverables[targetIndex];
  if(typeof target === 'string'){ deliverables[targetIndex] = { title: target, code: deliverableCode, subactivities: [] }; }
  const currentTarget = typeof target === 'string' ? deliverables[targetIndex] : target;
  const subactivities=Array.isArray(currentTarget.subactivities) ? currentTarget.subactivities : [];
  const nextSubCode = getConsultoriaNextSubactivityCode(deliverableCode, subactivities);
  subactivities.push({ title, start: date, end: '', code: nextSubCode, evidenceName, completed: !!evidenceName });
  currentTarget.subactivities=subactivities;
  deliverables[targetIndex]=currentTarget;
  items[index].deliverables=deliverables;
  saveConsultoriaScheduleList(items);
  renderConsultoriaWorkflowModal(code);
  renderConsultableDeliverableSelector();
  renderConsultoriaScheduleList();
  renderConsultoriaScheduleCalendar();
  renderConsultoriaScheduleGantt();
}

function renderConsultoriaScheduleList(){
  const list=document.getElementById('plan-list');
  if(!list) return;
  const items=getVisibleConsultoriaScheduleEntries();
  if(!items.length){ list.innerHTML='<div class="consultorias-card-item"><div class="consultorias-card-title">No hay planificación registrada</div></div>'; return; }
  list.innerHTML=items.map(item=>`<div class="consultorias-card-item" onclick="openConsultoriaDeliverableEditor('${esc(item.code||'')}')" style="cursor:pointer;"><div class="consultorias-card-head"><button type="button" class="consultorias-card-title" style="background:none;border:none;padding:0;color:inherit;text-align:left;" onclick="event.stopPropagation(); openConsultoriaDeliverableEditor('${esc(item.code||'')}')">${esc(item.code||'Sin código')}</button><span class="consultorias-chip ${item.status==='Cerrada'?'success':item.status==='En curso'?'alert':'warn'}">${esc(item.status||'Planificada')}</span></div><div class="consultorias-meta"><span>${esc(item.client||'Sin cliente')}</span>${item.responsable?`<span>Resp.: ${esc(item.responsable)}</span>`:''}${item.start?`<span>Inicio: ${esc(item.start)}</span>`:''}${item.end?`<span>Cierre: ${esc(item.end)}</span>`:''}</div>${item.notes?`<div class="consultorias-meta"><span>${esc(item.notes)}</span></div>`:''}</div>`).join('');
  renderConsultoriaScheduleCalendar();
  renderConsultoriaScheduleGantt();
}
function toggleConsultoriaCalendarPanel(){
  const panel=document.getElementById('calendar-panel');
  if(!panel) return;
  if(panel.style.display === 'none' || panel.style.display === ''){
    panel.style.display='block';
    renderConsultoriaCalendarPanel();
  } else {
    panel.style.display='none';
  }
}

function renderConsultoriaCalendarPanel(viewDate = new Date()){
  const panel=document.getElementById('calendar-panel');
  if(!panel) return;
  const currentDate = viewDate instanceof Date ? new Date(viewDate.getFullYear(), viewDate.getMonth(), 1) : new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const weeks = [];
  let dayCounter = 1;
  for(let week=0; week<6; week++){
    const cells=[];
    for(let day=0; day<7; day++){
      const index = week*7 + day;
      if(index < startOffset || dayCounter > totalDays){
        cells.push('<div class="consultorias-calendar-cell consultorias-calendar-cell-empty"></div>');
      } else {
        const currentCellDate = new Date(year, month, dayCounter);
        const iso = currentCellDate.toISOString().slice(0,10);
        const isToday = currentCellDate.toDateString() === new Date().toDateString();
        const dateLabel = currentCellDate.getDate();
        cells.push(`<button type="button" class="consultorias-calendar-cell ${isToday?'active':''}" onclick="openConsultoriaDateDeliverable('${iso}')">${dateLabel}</button>`);
      }
      if(index >= startOffset && dayCounter <= totalDays){
        dayCounter++;
      }
    }
    weeks.push(`<div class="consultorias-calendar-week">${cells.join('')}</div>`);
  }
  panel.innerHTML = `
    <div class="consultorias-calendar-month-header">
      <div class="consultorias-actions" style="justify-content:space-between;">
        <button class="consultorias-secondary" type="button" onclick="renderConsultoriaCalendarPanel(new Date(${year}, ${month - 1}))">← Mes anterior</button>
        <strong>${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</strong>
        <button class="consultorias-secondary" type="button" onclick="renderConsultoriaCalendarPanel(new Date(${year}, ${month + 1}))">Mes siguiente →</button>
      </div>
    </div>
    <div class="consultorias-calendar-weekdays"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
    ${weeks.join('')}
    <div id="consultoria-date-action" class="consultorias-calendar-action"></div>
  `;
}

function openConsultoriaDateDeliverable(dateValue){
  const actionEl=document.getElementById('consultoria-date-action');
  if(!actionEl) return;
  const startInput=document.getElementById('deliverable-start');
  if(startInput) startInput.value=dateValue;
  const endInput=document.getElementById('deliverable-end');
  if(endInput) endInput.value='';
  actionEl.innerHTML=`<div class="consultorias-calendar-action-box"><strong>${esc(dateValue)}</strong><div class="consultorias-actions"><input id="calendar-deliverable-name" type="text" placeholder="Nombre del entregable" /><button class="consultorias-cta" type="button" onclick="addConsultoriaDeliverableFromCalendar('${dateValue}')">Agregar entregable</button></div></div>`;
}

function addConsultoriaDeliverableFromCalendar(dateValue){
  const code=document.getElementById('plan-code')?.value.trim();
  const name=document.getElementById('calendar-deliverable-name')?.value.trim();
  if(!code || !name){ alert('Ingresa el código de consultoría y el nombre del entregable.'); return; }
  const startInput=document.getElementById('deliverable-start');
  const endInput=document.getElementById('deliverable-end');
  if(startInput) startInput.value = dateValue;
  if(endInput) endInput.value = dateValue;
  const deliverableNameInput=document.getElementById('deliverable-name');
  if(deliverableNameInput) deliverableNameInput.value = name;
  addConsultoriaDeliverable();
}

function parseDateValue(value){
  if(!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateValue(value){
  const parsed = parseDateValue(value);
  if(!parsed) return value || 'Sin fecha';
  return parsed.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isDateBeforeToday(value){
  const date = parseDateValue(value);
  if(!date) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  return date < today;
}

function getSubactivityTitle(subactivity){
  if(!subactivity) return '';
  return typeof subactivity === 'string' ? subactivity : String(subactivity.title || '').trim();
}

function getSubactivityProgressInfo(subactivity){
  if(!subactivity || typeof subactivity !== 'object'){
    return { state: 'pending', hasEvidence: false, isOverdue: false };
  }
  const hasEvidence = Boolean(subactivity.evidenceName || subactivity.completed);
  const dueDate = parseDateValue(subactivity.end || subactivity.start);
  const isOverdue = !hasEvidence && dueDate && isDateBeforeToday(dueDate);
  return {
    state: hasEvidence ? 'complete' : isOverdue ? 'overdue' : 'pending',
    hasEvidence,
    isOverdue
  };
}

function getSubactivityStatus(schedule, deliverableTitle, subactivity){
  const title = getSubactivityTitle(subactivity);
  if(!title) return '';
  const progressInfo = getSubactivityProgressInfo(subactivity);
  if(progressInfo.state === 'complete') return 'complete';
  if(progressInfo.state === 'overdue') return 'overdue';
  return '';
}

function getDeliverableProgressMetrics(deliverable){
  const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
  if(!subactivities.length){
    return { total: 0, completed: 0, overdue: 0, progressPercent: 0, state: 'pending' };
  }
  let completed = 0;
  let overdue = 0;
  subactivities.forEach((subactivity) => {
    const progressInfo = getSubactivityProgressInfo(subactivity);
    if(progressInfo.state === 'complete') completed += 1;
    if(progressInfo.state === 'overdue') overdue += 1;
  });
  const progressPercent = Math.round((completed / subactivities.length) * 100);
  return {
    total: subactivities.length,
    completed,
    overdue,
    progressPercent,
    state: overdue ? 'overdue' : progressPercent === 100 ? 'complete' : 'pending'
  };
}

function toggleDeliverableProgress(index){
  const panel=document.getElementById(`deliverable-progress-${index}`);
  const card=document.getElementById(`deliverable-card-${index}`);
  if(!panel) return;
  const isVisible = panel.style.display === 'block';
  panel.style.display = isVisible ? 'none' : 'block';
  card?.classList.toggle('is-expanded', !isVisible);
}

function getCalendarEntryStatus(item){
  if(!item || typeof item !== 'object') return '';
  if(item.type === 'subactivity'){
    if(item.completed) return 'complete';
    const dueDate = parseDateValue(item.end || item.start);
    if(dueDate && isDateBeforeToday(dueDate)) return 'overdue';
    return '';
  }
  if(Array.isArray(item.subactivities) && item.subactivities.length){
    const statuses = item.subactivities.map(sub => getSubactivityStatus(item, item.title || '', sub));
    if(statuses.includes('overdue')) return 'overdue';
    if(statuses.length && statuses.every(status => status === 'complete')) return 'complete';
    if(statuses.includes('complete')) return 'complete';
  }
  return '';
}

function closeConsultoriaDeliverableDetailsModal(){
  const modal=document.getElementById('consultoria-deliverable-details-modal');
  if(modal) modal.remove();
}

function showConsultoriaDeliverableDetails(dateValue){
  const targetDate = dateValue ? new Date(dateValue) : null;
  if(!targetDate || Number.isNaN(targetDate.getTime())) return;
  const entries = getConsultoriaCalendarEntries().filter(item => {
    const start = parseDateValue(item.start);
    const end = parseDateValue(item.end) || start;
    if(!start && !end) return false;
    const rangeStart = start || end;
    const rangeEnd = end || start;
    return rangeStart && rangeEnd && targetDate >= rangeStart && targetDate <= rangeEnd;
  });
  if(!entries.length) return;
  let modal=document.getElementById('consultoria-deliverable-details-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='consultoria-deliverable-details-modal';
    modal.className='consultorias-modal-overlay';
    modal.addEventListener('click', function(event){ if(event.target===modal) closeConsultoriaDeliverableDetailsModal(); });
    document.body.appendChild(modal);
  }
  const detailsDate = dateValue || targetDate.toISOString().slice(0,10);
  modal.dataset.detailsDate = detailsDate;
  const rows = entries.map(entry => {
    const deliverableProgress = entry.type === 'deliverable' ? getDeliverableProgressMetrics(entry) : null;
    const title = entry.type === 'subactivity'
      ? `${esc(entry.parentTitle || 'Entregable')} · ${esc(entry.subactivityTitle || entry.title || 'Subactividad')}`
      : esc(entry.title || 'Entregable');
    const typeLabel = entry.type === 'subactivity' ? 'Subactividad' : 'Entregable';
    const projectInfo = entry.projectTitle ? `<span>${esc(entry.projectTitle)}</span>` : '';
    const rowClass = entry.type === 'subactivity' ? 'consultorias-card-item' : 'consultorias-card-item consultoria-detail-selectable';
    const rowOnClick = '';
    const schedule = getConsultoriaScheduleItem(entry.projectCode || entry.projectTitle || '');
    const progressLabel = deliverableProgress ? `<span>${deliverableProgress.progressPercent}% avance</span>` : '';
    const subactivitiesHTML = entry.type === 'deliverable' && Array.isArray(entry.subactivities) && entry.subactivities.length
      ? `<div class="consultorias-subactivity-box" style="margin-top:12px;"><div class="consultorias-subactivity-title">Subactividades</div>${entry.subactivities.map(sub => {
          const subStatus = getSubactivityStatus(schedule, entry.title || '', sub);
          const statusLabel = subStatus === 'overdue'
            ? '<span class="consultorias-chip alert">Vencida</span>'
            : subStatus === 'complete'
              ? '<span class="consultorias-chip success">Completada</span>'
              : '';
          const evidenceInfo = sub.evidenceName ? `<div class="consultorias-meta"><span>Evidencia: ${esc(sub.evidenceName)}</span></div>` : '';
          return `<div class="consultorias-subactivity-item${subStatus==='overdue' ? ' overdue' : subStatus==='complete' ? ' success' : ''}"><div><strong>${esc(sub.title || 'Subactividad')}</strong></div><div class="consultorias-meta"><span>${sub.start ? `Inicio: ${esc(sub.start)}` : ''}</span><span>${sub.end ? `Fin: ${esc(sub.end)}` : ''}</span>${statusLabel}</div>${evidenceInfo}</div>`;
        }).join('')}</div>`
      : '';
    return `<div class="${rowClass}" ${rowOnClick}><div class="consultorias-card-head"><div><div class="consultorias-card-title">${title}</div><div class="consultorias-meta"><span>${esc(typeLabel)}</span>${projectInfo}${progressLabel}</div></div><span class="consultorias-chip ${entry.status==='Cerrada'?'success':entry.status==='En curso'?'alert':'warn'}">${esc(entry.status || 'Planificada')}</span></div><div class="consultorias-meta"><span>${entry.start ? `Inicio: ${esc(entry.start)}` : 'Sin inicio'}</span><span>${entry.end ? `Fin: ${esc(entry.end)}` : 'Sin fin'}</span></div>${subactivitiesHTML}</div>`;
  }).join('');
  modal.innerHTML=`<div class="consultorias-modal-card"><div class="consultorias-modal-header"><div><strong>${esc(targetDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }))}</strong><div class="consultorias-meta"><span>Eventos programados</span></div></div><button type="button" class="consultorias-secondary" onclick="closeConsultoriaDeliverableDetailsModal()">Cerrar</button></div><div class="consultorias-modal-body">${rows}</div></div>`;
}

function getDeliverableRangeInfo(startValue, endValue){
  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue) || start;
  if(!start || !end) return null;
  const normalizedEnd = end >= start ? end : start;
  const dayCount = Math.max(1, Math.round((normalizedEnd - start) / (1000*60*60*24)) + 1);
  return { start, end: normalizedEnd, dayCount };
}

function getConsultoriaDeliverablesForView(){
  const items = getConsultoriaSchedule();
  const deliverables = [];
  items.forEach(item => {
    const list = Array.isArray(item.deliverables) ? item.deliverables : [];
    list.forEach((deliverable, index) => {
      const title = typeof deliverable === 'string' ? deliverable : deliverable.title || `Entregable ${index + 1}`;
      const start = typeof deliverable === 'object' ? deliverable.start || '' : '';
      const end = typeof deliverable === 'object' ? deliverable.end || '' : '';
      const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
      deliverables.push({
        title,
        start,
        end,
        subactivities,
        projectCode: item.code || '',
        projectTitle: item.title || '',
        status: item.status || 'Planificada'
      });
    });
  });
  return deliverables;
}

function getSelectedDeliverableTitle(){
  const selector=document.getElementById('deliverable-selector');
  return String(selector?.value || '').trim();
}

function getConsultoriaCalendarEntries(){
  const deliverables = getConsultoriaDeliverablesForView();
  const selectedDeliverable = getSelectedDeliverableTitle();
  if(!selectedDeliverable){
    return deliverables.map(item => ({ ...item, type: 'deliverable' }));
  }
  return deliverables
    .filter(item => (item.title || '') === selectedDeliverable)
    .flatMap(item => {
      const subactivities = Array.isArray(item.subactivities) ? item.subactivities : [];
      if(!subactivities.length){
        return [{ ...item, type: 'deliverable' }];
      }
      return subactivities.map(sub => ({
        ...item,
        title: sub.title || item.title,
        start: sub.start || item.start,
        end: sub.end || item.end || sub.start || item.end,
        type: 'subactivity',
        subactivityTitle: sub.title || '',
        parentTitle: item.title || ''
      }));
    });
}

function renderConsultoriaScheduleCalendar(viewDate = new Date()){
  const calendarEl=document.getElementById('plan-calendar');
  if(!calendarEl) return;
  const currentDate = viewDate instanceof Date ? new Date(viewDate.getFullYear(), viewDate.getMonth(), 1) : new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const calendarEntries=getConsultoriaCalendarEntries();
  const weeks=[];
  let dayCounter=1;
  for(let week=0; week<6; week++){
    const cells=[];
    for(let day=0; day<7; day++){
      const index = week*7 + day;
      if(index < startOffset || dayCounter > totalDays){
        cells.push('<div class="consultorias-calendar-cell consultorias-calendar-cell-empty"></div>');
      } else {
        const currentCellDate = new Date(year, month, dayCounter);
        const iso = currentCellDate.toISOString().slice(0,10);
        const isToday = currentCellDate.toDateString() === new Date().toDateString();
        const dayEntries = calendarEntries.filter(item => {
          const start = parseDateValue(item.start);
          const end = parseDateValue(item.end) || start;
          if(!start && !end) return false;
          const rangeStart = start || end;
          const rangeEnd = end || start;
          return rangeStart && rangeEnd && currentCellDate >= rangeStart && currentCellDate <= rangeEnd;
        });
        const dateLabel = currentCellDate.getDate();
        const dots = dayEntries.length ? `<div class="consultorias-calendar-day-events">${dayEntries.slice(0,3).map(item => {
          const title = item.type === 'subactivity' ? `${item.parentTitle || item.title} · ${item.subactivityTitle || item.title}` : item.title || 'Entregable';
          const dotClass = getCalendarEntryStatus(item) === 'overdue' ? 'overdue' : getCalendarEntryStatus(item) === 'complete' ? 'complete' : '';
          return `<button type="button" class="consultorias-calendar-dot ${dotClass}" title="${esc(title)}" onclick="showConsultoriaDeliverableDetails('${iso}')"></button>`;
        }).join('')}</div>` : '';
        const cellClick = dayEntries.length ? `onclick="showConsultoriaDeliverableDetails('${iso}')"` : '';
        cells.push(`<div class="consultorias-calendar-cell ${isToday ? 'active' : ''}" ${cellClick}><div class="consultorias-calendar-day-label">${dateLabel}</div>${dots}</div>`);
      }
      if(index >= startOffset && dayCounter <= totalDays){
        dayCounter++;
      }
    }
    weeks.push(`<div class="consultorias-calendar-week">${cells.join('')}</div>`);
  }
  const eventList = '';
  calendarEl.innerHTML = `
    <div class="consultorias-calendar-month-header">
      <div class="consultorias-actions" style="justify-content:space-between;align-items:center;">
        <div>
          <button class="consultorias-secondary" type="button" onclick="renderConsultoriaScheduleCalendar(new Date(${year}, ${month - 1}))">← Mes anterior</button>
          <button class="consultorias-secondary" type="button" onclick="renderConsultoriaScheduleCalendar(new Date(${year}, ${month + 1}))">Mes siguiente →</button>
        </div>
        <strong>${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</strong>
      </div>
    </div>
    <div class="consultorias-calendar-weekdays"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
    ${weeks.join('')}
  `;
}

function renderConsultoriaScheduleGantt(){
  const ganttEl = document.getElementById('plan-gantt');
  if(!ganttEl) return;
  const deliverables = getConsultoriaDeliverablesForView();
  if(!deliverables.length){
    ganttEl.innerHTML = '<div class="consultorias-calendar-empty">No hay datos para mostrar en el Gantt.</div>';
    return;
  }
  const parsedDeliverables = deliverables.map(deliverable => ({ ...deliverable, range: getDeliverableRangeInfo(deliverable.start, deliverable.end) })).filter(item => item.range);
  const rows = parsedDeliverables.map(deliverable => {
    const range = deliverable.range;
    const rangeLabel = `${formatDateValue(deliverable.start)} → ${formatDateValue(deliverable.end || deliverable.start)}`;
    let leftPercent = 0;
    let widthPercent = 20;
    if(parsedDeliverables.length > 1){
      const allDates = parsedDeliverables.map(item => [item.range.start, item.range.end]).flat();
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...allDates));
      const totalDays = Math.max(1, Math.round((maxDate - minDate) / (1000*60*60*24)) + 1);
      const startOffset = Math.max(0, Math.round(((range.start - minDate) / (1000*60*60*24)) / totalDays * 100));
      const spanDays = Math.max(1, range.dayCount);
      widthPercent = Math.max(12, Math.min(100 - startOffset, Math.round(spanDays / totalDays * 100)));
      leftPercent = Math.min(100 - widthPercent, startOffset);
    }
    return `<div class="consultorias-gantt-row"><div class="consultorias-gantt-head"><strong>${esc(deliverable.title||'Sin nombre')}</strong><span class="consultorias-chip ${deliverable.status==='Cerrada'?'success':deliverable.status==='En curso'?'alert':'warn'}">${esc(deliverable.status||'Planificada')}</span></div><div class="consultorias-gantt-track"><div class="consultorias-gantt-bar" style="margin-left:${leftPercent}%;width:${widthPercent}%;"></div></div><div class="consultorias-meta"><span>${esc(rangeLabel)}</span><span>${range.dayCount} día${range.dayCount === 1 ? '' : 's'}</span></div></div>`;
  }).join('');
  ganttEl.innerHTML = `<div class="consultorias-gantt-grid">${rows}</div>`;
}

function normalizeConsultoriaCode(code){
  return String(code || '').trim().toUpperCase();
}

function findConsultoriaScheduleItem(identifier){
  const normalized = normalizeConsultoriaCode(identifier);
  if(!normalized) return null;
  const items = getConsultoriaSchedule();
  return items.find(item => {
    return normalizeConsultoriaCode(item.code) === normalized || normalizeConsultoriaCode(item.title) === normalized;
  }) || null;
}

function getConsultoriaScheduleItem(code){
  return findConsultoriaScheduleItem(code);
}

function loadConsultoriaGeneralInfo(){
  const planCode = document.getElementById('plan-code')?.value.trim();
  const identifier = planCode;
  const editor=document.getElementById('deliverable-editor');
  if(editor && planCode){ editor.style.display='block'; } else if(editor){ editor.style.display='none'; }
  const schedule = getConsultoriaScheduleItem(identifier);
  const fields = {
    title: document.getElementById('plan-title'),
    client: document.getElementById('plan-client'),
    responsable: document.getElementById('plan-responsable'),
    start: document.getElementById('plan-start'),
    end: document.getElementById('plan-end'),
    notes: document.getElementById('plan-notes'),
    status: document.getElementById('plan-status')
  };
  if(schedule){
    if(fields.title) fields.title.value = schedule.title || '';
    if(fields.client) fields.client.value = schedule.client || '';
    if(fields.responsable) fields.responsable.value = schedule.responsable || '';
    if(fields.start) fields.start.value = schedule.start || '';
    if(fields.end) fields.end.value = schedule.end || '';
    if(fields.notes) fields.notes.value = schedule.notes || '';
    if(fields.status) fields.status.value = schedule.status || 'Planificada';
  } else if(identifier){
    const tdr = getConsultoriaTdrs().find(item=>item.code===identifier || normalizeConsultoriaCode(item.title)===normalizeConsultoriaCode(identifier));
    if(tdr){
      if(fields.title && !fields.title.value) fields.title.value = tdr.title || '';
      if(fields.client && !fields.client.value) fields.client.value = tdr.contratante || '';
      if(fields.responsable && !fields.responsable.value) fields.responsable.value = tdr.responsable || '';
    }
  } else {
    Object.values(fields).forEach(field=>{ if(field) field.value = ''; });
  }
  renderConsultableDeliverableSelector();
  renderConsultoriaDeliverableList();
}

function getSelectedConsultoriaCode(){
  const planCode=document.getElementById('plan-code')?.value.trim();
  return normalizeConsultoriaCode(planCode || '');
}

function setSelectedConsultoriaCode(identifier){
  const normalizedIdentifier = String(identifier || '').trim();
  const resolved = findConsultoriaScheduleItem(normalizedIdentifier);
  const planCode=document.getElementById('plan-code');
  if(planCode){
    if(resolved && resolved.code){
      planCode.value = normalizeConsultoriaCode(resolved.code);
    } else {
      planCode.value = normalizedIdentifier;
    }
  }
}

function onConsultoriaCodeChange(){
  const code = getSelectedConsultoriaCode();
  setSelectedConsultoriaCode(code);
  loadConsultoriaGeneralInfo();
}

function renderConsultoriaCodeOptions(){
  const scheduleValues = getConsultoriaSchedule().flatMap(item => [item.code, item.title]).filter(Boolean);
  const tdrValues = getConsultoriaTdrs().flatMap(item => [item.code, item.title]).filter(Boolean);
  const values = Array.from(new Set([...scheduleValues, ...tdrValues]));
  const markup = values.map(value => `<option value="${esc(value)}">`).join('');
  const listIds = ['plan-code-options'];
  listIds.forEach(id => {
    const list = document.getElementById(id);
    if(list) list.innerHTML = markup;
  });
}

function renderConsultableDeliverableSelector(){
  const selector=document.getElementById('deliverable-selector');
  if(!selector) return;
  const previousValue = selector.value || '';
  selector.innerHTML = '<option value="">Selecciona un entregable</option>';
  const code = getSelectedConsultoriaCode();
  const schedule = getConsultoriaScheduleItem(code);
  if(!schedule || !Array.isArray(schedule.deliverables) || !schedule.deliverables.length){
    selector.innerHTML = '<option value="">No hay entregables registrados</option>';
    renderConsultoriaSubactivitySelector();
    return;
  }
  const availableTitles = [];
  schedule.deliverables.forEach((deliverable, index)=>{
    const title = typeof deliverable === 'string' ? deliverable : deliverable.title || `Entregable ${index+1}`;
    availableTitles.push(title);
    const label = typeof deliverable === 'string' ? title : `${title}${deliverable.date ? ` — ${deliverable.date}` : ''}`;
    selector.innerHTML += `<option value="${esc(title)}">${esc(label)}</option>`;
  });
  if(previousValue && availableTitles.includes(previousValue)){
    selector.value = previousValue;
  } else {
    selector.value = '';
  }
  renderConsultoriaSubactivitySelector();
}

function renderConsultoriaSubactivitySelector(){
  const selector=document.getElementById('subactivity-selector');
  if(!selector) return;
  const deliverableSelector=document.getElementById('deliverable-selector');
  const previousValue = selector.value || '';
  const selectedDeliverable = deliverableSelector?.value || '';
  selector.innerHTML = '<option value="">Selecciona un entregable primero</option>';
  if(!selectedDeliverable){
    return;
  }
  const code = getSelectedConsultoriaCode();
  const schedule = getConsultoriaScheduleItem(code);
  if(!schedule || !Array.isArray(schedule.deliverables) || !schedule.deliverables.length){
    selector.innerHTML = '<option value="">No hay entregables registrados</option>';
    return;
  }
  const deliverable = schedule.deliverables.find(item => {
    const title = typeof item === 'string' ? item : item.title || '';
    return normalizeConsultoriaCode(title) === normalizeConsultoriaCode(selectedDeliverable);
  });
  const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
  if(!subactivities.length){
    selector.innerHTML = '<option value="">No hay subactividades registradas</option>';
    return;
  }
  selector.innerHTML = '<option value="">Selecciona una subactividad</option>' + subactivities.map((sub, index) => {
    const title = sub?.title || `Subactividad ${index+1}`;
    return `<option value="${esc(title)}">${esc(title)}</option>`;
  }).join('');
  if(previousValue){
    const hasPreviousValue = subactivities.some((sub, index) => (sub?.title || `Subactividad ${index+1}`) === previousValue);
    selector.value = hasPreviousValue ? previousValue : '';
  }
}

function renderConsultoriaDeliverableList(){
  const list=document.getElementById('deliverable-list');
  if(!list) return;
  const code = getSelectedConsultoriaCode();
  const schedule = getConsultoriaScheduleItem(code);
  const deliverables = Array.isArray(schedule?.deliverables) ? schedule.deliverables : [];
  const subactivities = Array.isArray(schedule?.deliverables) ? [] : [];
  if(!deliverables.length){
    list.innerHTML = '<div class="consultorias-card-item"><div class="consultorias-card-title">No hay entregables registrados</div></div>';
    return;
  }
  const rows = deliverables.map((deliverable, index)=>{
    const deliverableCode = getConsultoriaDeliverableCode(deliverable, index);
    const title = typeof deliverable === 'string' ? deliverable : deliverable.title || `Entregable ${index+1}`;
    const startDate = typeof deliverable === 'object' && deliverable.start ? deliverable.start : '';
    const endDate = typeof deliverable === 'object' && deliverable.end ? deliverable.end : '';
    const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
    const progressMetrics = getDeliverableProgressMetrics(deliverable);
    const subactivityRows = subactivities.map((sub, subIndex)=>{
      const subCode = getConsultoriaSubactivityCode(sub, deliverableCode, subIndex);
      const status = getSubactivityStatus(schedule, title, sub);
      const statusLabel = status === 'overdue'
        ? '<span class="consultorias-chip alert">Vencida</span>'
        : status === 'complete'
          ? '<span class="consultorias-chip success">Completada</span>'
          : '';
      const evidenceInfo = sub.evidenceName ? `<div class="consultorias-meta"><span>Evidencia: ${esc(sub.evidenceName)}</span></div>` : '';
      return `<div class="consultorias-subactivity-item${status==='overdue' ? ' overdue' : status==='complete' ? ' success' : ''}"><div><strong>${esc(subCode)} - ${esc(sub.title || `Subactividad ${subIndex+1}`)}</strong></div><div class="consultorias-meta"><span>${sub.start ? `Inicio: ${esc(sub.start)}` : ''}</span><span>${sub.end ? `Fin: ${esc(sub.end)}` : ''}</span>${statusLabel}</div>${evidenceInfo}<div class="consultorias-actions"><button class="consultorias-secondary" type="button" onclick="event.stopPropagation(); triggerSubactivityEvidenceUpload(${index},${subIndex})">Cargar evidencia</button><input id="subactivity-evidence-input-${index}-${subIndex}" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style="display:none;" onchange="handleSubactivityEvidenceUpload(${index},${subIndex}, event)" /></div></div>`;
    }).join('');
    return `<div id="deliverable-card-${index}" class="consultorias-card-item${subactivities.some(sub => getSubactivityStatus(schedule, title, sub) === 'overdue') ? ' overdue' : subactivities.length && subactivities.every(sub => getSubactivityStatus(schedule, title, sub) === 'complete') ? ' success' : ''}" onclick="toggleDeliverableProgress(${index})" style="cursor:pointer;"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(deliverableCode)} - ${esc(title)}</div></div><div class="consultorias-meta"><span>${startDate ? `Inicio: ${esc(startDate)}` : 'Sin inicio'}</span><span>${endDate ? `Fin: ${esc(endDate)}` : 'Sin fin'}</span></div><div id="deliverable-progress-${index}" class="consultorias-progress-panel" style="display:none;"><div class="consultorias-progress-summary"><div class="consultorias-progress-head"><span>Avance del entregable</span><strong>${progressMetrics.progressPercent}%</strong></div><div class="consultorias-progress-bar"><div class="consultorias-progress-fill ${progressMetrics.state === 'overdue' ? 'overdue' : progressMetrics.state === 'complete' ? 'success' : ''}" style="width:${progressMetrics.progressPercent}%"></div></div><div class="consultorias-progress-meta"><span>${progressMetrics.completed}/${progressMetrics.total} subactividades con evidencia</span>${progressMetrics.overdue ? `<span>${progressMetrics.overdue} vencida${progressMetrics.overdue === 1 ? '' : 's'}</span>` : ''}</div></div></div><div class="consultorias-subactivity-box"><div class="consultorias-subactivity-title">Subactividades</div>${subactivityRows || '<div class="consultorias-detail-empty">Aún no hay subactividades</div>'}<div class="consultorias-subactivity-form"><input id="subactivity-title-${index}" type="text" placeholder="Nombre de subactividad" /><div class="consultorias-actions"><input id="subactivity-start-${index}" type="date" /><input id="subactivity-end-${index}" type="date" /><input id="subactivity-evidence-${index}" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" /><button class="consultorias-secondary" type="button" onclick="event.stopPropagation(); addConsultoriaSubactivity(${index})">Agregar subactividad</button></div></div></div></div>`;
  });
  list.innerHTML = rows.join('');
}

function addConsultoriaSubactivity(index){
  const code=document.getElementById('plan-code')?.value.trim();
  if(!code){ alert('Selecciona o escribe el código de la consultoría antes de agregar subactividades.'); return; }
  const titleInput=document.getElementById(`subactivity-title-${index}`);
  const startInput=document.getElementById(`subactivity-start-${index}`);
  const endInput=document.getElementById(`subactivity-end-${index}`);
  const title=titleInput?.value.trim();
  const start=startInput?.value || '';
  const end=endInput?.value || '';
  const evidenceInput=document.getElementById(`subactivity-evidence-${index}`);
  const evidenceName=evidenceInput?.files?.[0]?.name || '';
  if(!title){ alert('Ingresa el nombre de la subactividad.'); return; }
  const items=getConsultoriaSchedule();
  const itemIndex=items.findIndex(item=>item.code===code);
  if(itemIndex < 0){ alert('Guarda primero la información general de la consultoría.'); return; }
  const deliverables=Array.isArray(items[itemIndex].deliverables) ? items[itemIndex].deliverables : [];
  const target=deliverables[index];
  if(!target){ return; }
  if(typeof target === 'string'){ deliverables[index] = { title: target, code: `E${index+1}`, subactivities: [] }; }
  const currentTarget = typeof target === 'string' ? deliverables[index] : target;
  const subactivities=Array.isArray(currentTarget.subactivities) ? currentTarget.subactivities : [];
  const parentCode = getConsultoriaDeliverableCode(currentTarget, index);
  const nextSubCode = getConsultoriaNextSubactivityCode(parentCode, subactivities);
  subactivities.push({ title, start, end, code: nextSubCode, evidenceName, completed: !!evidenceName });
  currentTarget.subactivities = subactivities;
  deliverables[index] = currentTarget;
  items[itemIndex].deliverables = deliverables;
  saveConsultoriaScheduleList(items);
  renderConsultableDeliverableSelector();
  renderConsultoriaDeliverableList();
  renderConsultoriaScheduleList();
  renderConsultoriaScheduleCalendar();
  renderConsultoriaScheduleGantt();
}

function triggerSubactivityEvidenceUpload(deliverableIndex, subactivityIndex){
  const input = document.getElementById(`subactivity-evidence-input-${deliverableIndex}-${subactivityIndex}`);
  if(input) input.click();
}

function handleSubactivityEvidenceUpload(deliverableIndex, subactivityIndex, event){
  const files = event?.target?.files;
  const evidenceName = files && files[0] ? files[0].name : '';
  const code=document.getElementById('plan-code')?.value.trim();
  if(!code){ return; }
  const items=getConsultoriaSchedule();
  const itemIndex=items.findIndex(item=>item.code===code);
  if(itemIndex < 0){ return; }
  const deliverables=Array.isArray(items[itemIndex].deliverables) ? items[itemIndex].deliverables : [];
  const target=deliverables[deliverableIndex];
  if(!target || typeof target === 'string'){ return; }
  const currentTarget = target;
  const subactivities=Array.isArray(currentTarget.subactivities) ? currentTarget.subactivities : [];
  if(subactivities[subactivityIndex]){
    subactivities[subactivityIndex] = {
      ...subactivities[subactivityIndex],
      evidenceName,
      completed: !!evidenceName
    };
    currentTarget.subactivities = subactivities;
    deliverables[deliverableIndex] = currentTarget;
    items[itemIndex].deliverables = deliverables;
    saveConsultoriaScheduleList(items);
    renderConsultoriaDeliverableList();
    renderConsultoriaScheduleList();
    renderConsultoriaScheduleCalendar();
    renderConsultoriaScheduleGantt();
  }
}

function addConsultoriaDeliverable(){
  const code=document.getElementById('plan-code')?.value.trim();
  const name=document.getElementById('deliverable-name')?.value.trim();
  const start=document.getElementById('deliverable-start')?.value || '';
  const end=document.getElementById('deliverable-end')?.value || '';
  if(!code || !name){ alert('Ingresa el código de consultoría y el nombre del entregable.'); return; }
  const items=getConsultoriaSchedule();
  const index=items.findIndex(item=>item.code===code);
  const payload = index >= 0 ? items[index] : {
    id: Date.now(),
    code,
    title: document.getElementById('plan-title')?.value.trim()||`Consultoría ${code}`,
    client: document.getElementById('plan-client')?.value.trim()||'',
    responsable: document.getElementById('plan-responsable')?.value.trim()||'',
    start: document.getElementById('plan-start')?.value||'',
    end: document.getElementById('plan-end')?.value||'',
    status: document.getElementById('plan-status')?.value||'Planificada',
    notes: document.getElementById('plan-notes')?.value.trim()||'',
    deliverables: []
  };
  payload.deliverables = Array.isArray(payload.deliverables) ? payload.deliverables : [];
  const nextDeliverableCode = getConsultoriaNextDeliverableCode(payload.deliverables);
  payload.deliverables.push({title:name, start, end, code: nextDeliverableCode, subactivities: []});
  if(index >= 0){ items[index] = payload; } else { items.unshift(payload); }
  saveConsultoriaScheduleList(items);
  renderConsultableDeliverableSelector();
  renderConsultoriaDeliverableList();
  renderConsultoriaScheduleList();
  renderConsultoriaScheduleCalendar();
  document.getElementById('deliverable-name').value = '';
  document.getElementById('deliverable-start').value = '';
  document.getElementById('deliverable-end').value = '';
}

function clearConsultoriaScheduleForm(){
  const fields=['plan-code','plan-title','plan-client','plan-responsable','plan-status','plan-start','plan-end','plan-notes'];
  fields.forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const importMessage=document.getElementById('plan-import-message');
  if(importMessage) importMessage.textContent='';
  renderConsultableDeliverableSelector();
  renderConsultoriaDeliverableList();
}

function importConsultoriaScheduleExcel(){
  const fileInput=document.getElementById('plan-excel-file');
  const messageEl=document.getElementById('plan-import-message');
  if(!fileInput || !fileInput.files.length){
    messageEl.textContent='Selecciona un archivo Excel o CSV primero.';
    return;
  }
  const file=fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const data = e.target.result;
      const workbook = XLSX.read(data, {type:'binary'});
      const items = parseConsultoriaScheduleWorkbook(workbook);
      if(!items.length){
        messageEl.textContent='No se encontraron planificaciones válidas en el archivo. Asegúrate de que la hoja se llame "Resumen Entregables" o "Cronograma".';
        return;
      }
      const existing = getConsultoriaSchedule();
      const code=document.getElementById('plan-code')?.value.trim();
      const title=document.getElementById('plan-title')?.value.trim();
      const targetIndex = code ? existing.findIndex(item=>item.code===code) : -1;
      const baseRecord = targetIndex >= 0 ? existing[targetIndex] : {
        id: Date.now(),
        code: code || `CONS-IMP-${Date.now()}`,
        title: title || 'Consultoría importada',
        client: document.getElementById('plan-client')?.value.trim() || '',
        responsable: document.getElementById('plan-responsable')?.value.trim() || '',
        start: document.getElementById('plan-start')?.value || '',
        end: document.getElementById('plan-end')?.value || '',
        status: document.getElementById('plan-status')?.value || 'Planificada',
        notes: document.getElementById('plan-notes')?.value.trim() || '',
        deliverables: []
      };
      const normalizedDeliverables = items
        .filter(item => item && (item.title || item.notes || item.start || item.end))
        .map(item => ({
          title: item.title || item.notes || 'Entregable',
          date: item.start || item.end || '',
          source: 'excel'
        }));
      const currentDeliverables = Array.isArray(baseRecord.deliverables) ? baseRecord.deliverables : [];
      const mergedDeliverables = [...currentDeliverables];
      normalizedDeliverables.forEach(deliverable => {
        const duplicate = mergedDeliverables.some(existingDeliverable => {
          const existingTitle = typeof existingDeliverable === 'string' ? existingDeliverable : existingDeliverable.title || '';
          const existingDate = typeof existingDeliverable === 'object' && existingDeliverable.date ? existingDeliverable.date : '';
          return existingTitle === deliverable.title && existingDate === deliverable.date;
        });
        if(!duplicate){
          mergedDeliverables.push(deliverable);
        }
      });
      const updatedRecord = { ...baseRecord, deliverables: mergedDeliverables };
      if(targetIndex >= 0){
        existing[targetIndex] = updatedRecord;
      } else {
        existing.unshift(updatedRecord);
      }
      saveConsultoriaScheduleList(existing);
      renderConsultoriaScheduleList();
      renderConsultoriaScheduleCalendar();
      renderConsultableDeliverableSelector();
      renderConsultoriaDeliverableList();
      messageEl.textContent=`Importadas ${items.length} entradas como entregables de ${updatedRecord.code || 'la consultoría seleccionada'}.`;
      fileInput.value='';
    } catch(err){
      console.error(err);
      messageEl.textContent='Error al procesar el archivo. Verifica el formato Excel/CSV.';
    }
  };
  if(file.name.toLowerCase().endsWith('.csv')){
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }
}

function parseConsultoriaScheduleWorkbook(workbook){
  const names = workbook.SheetNames.map(name=>String(name||'').trim());
  const lowerNames = names.map(name=>name.toLowerCase());
  const resumenIndex = lowerNames.indexOf('resumen entregables');
  if(resumenIndex >= 0){
    return parseResumenEntregablesSheet(workbook.Sheets[names[resumenIndex]]);
  }
  const cronogramaIndex = lowerNames.indexOf('cronograma');
  if(cronogramaIndex >= 0){
    return parseCronogramaSheet(workbook.Sheets[names[cronogramaIndex]]);
  }
  return parseResumenEntregablesSheet(workbook.Sheets[names[0]]) || [];
}

function parseResumenEntregablesSheet(worksheet){
  const rows = XLSX.utils.sheet_to_json(worksheet, {header:1, defval:''});
  if(!rows || rows.length < 2) return [];
  const header = rows[1].map(val=>String(val||'').trim().toLowerCase());
  const findHeader = keys => header.findIndex(h=>keys.some(key=>h.includes(key)));
  const idxPago = findHeader(['pago']);
  const idxEntregable = findHeader(['entregable']);
  const idxDesc = findHeader(['descripción','descripcion','tdr','descripci']);
  const idxFechas = findHeader(['fecha','fechas']);
  const idxPlazo = findHeader(['plazo','sem.','semana']);
  const items = [];
  for(let i=2;i<rows.length;i++){
    const row = rows[i];
    if(!row || !row.some(cell=>cell !== '')) continue;
    const title = String((row[idxEntregable]||row[idxPago]||'')).trim();
    const notes = String((row[idxDesc]||row[idxEntregable]||'')).trim();
    const fechas = String(row[idxFechas]||'').trim();
    const plazo = String(row[idxPlazo]||'').trim();
    if(!title && !notes && !fechas) continue;
    const range = parseScheduleDateRange(fechas);
    const item = {
      id:Date.now() + Math.random(),
      title: title || notes.substring(0,80),
      client:'',
      start: range?.start || '',
      end: range?.end || '',
      status: plazo.toLowerCase().includes('sem. 11') || plazo.toLowerCase().includes('sem 11') ? 'En curso' : 'Planificada',
      notes: notes || `${row[idxPago]||''}`.trim()
    };
    items.push(item);
  }
  return items;
}

function parseCronogramaSheet(worksheet){
  const rows = XLSX.utils.sheet_to_json(worksheet, {header:1, defval:''});
  if(!rows || rows.length < 5) return [];
  const headerRow = rows[3].map(val=>String(val||'').trim());
  const weekIndexes = headerRow.slice(3).map((label,index)=>({label, index: index+3}));
  const items = [];
  for(let i=4;i<rows.length;i++){
    const row = rows[i];
    if(!row || !row.some(cell=>cell !== '')) continue;
    const title = String((row[1]||row[2]||'')).trim();
    const notes = String(row[2]||'').trim();
    if(!title) continue;
    const marks = weekIndexes.filter(w=>String(row[w.index]||'').trim() !== '');
    let start='';
    let end='';
    if(marks.length){
      const firstWeek = marks[0].index - 3 + 1;
      const lastWeek = marks[marks.length-1].index - 3 + 1;
      start = `Semana ${firstWeek}`;
      end = `Semana ${lastWeek}`;
    }
    items.push({
      id:Date.now() + Math.random(),
      title,
      client:'',
      start,
      end,
      status:'Planificada',
      notes
    });
  }
  return items;
}

function parseScheduleDateRange(value){
  if(!value) return null;
  const raw = String(value)
    .replace(/[\x00-\x1F]/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/–|—/g, '-')
    .trim();
  const parts = raw.split(/\s*-\s*/).filter(Boolean);
  if(parts.length < 2) return null;
  const left = parts[0].trim();
  const right = parts.slice(1).join(' - ').trim();
  const yearMatch = right.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : null;
  const parsePart = (text, yearHint) => {
    let candidate = text.trim();
    if(!/\d{4}/.test(candidate) && yearHint) candidate = `${candidate} ${yearHint}`;
    let date = new Date(candidate);
    if(!isNaN(date)) return date;
    const spanishMonths = {ene:'Jan',feb:'Feb',mar:'Mar',abr:'Apr',may:'May',jun:'Jun',jul:'Jul',ago:'Aug',sep:'Sep',oct:'Oct',nov:'Nov',dic:'Dec'};
    candidate = candidate.replace(/([0-9]{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i,(_,d,m)=>`${d} ${spanishMonths[m.toLowerCase()]}`);
    if(!/\d{4}/.test(candidate) && yearHint) candidate = `${candidate} ${yearHint}`;
    date = new Date(candidate);
    if(!isNaN(date)) return date;
    return null;
  };
  const startDate = parsePart(left, year);
  const endDate = parsePart(right, year || (startDate ? startDate.getFullYear() : null));
  if(!startDate || !endDate) return null;
  return {start: startDate.toISOString().slice(0,10), end: endDate.toISOString().slice(0,10)};
}

function getConsultoriaReports(){ try{ return JSON.parse(localStorage.getItem('aris_consultorias_reports')||'[]'); }catch(e){ return []; } }
function saveConsultoriaReports(items){ localStorage.setItem('aris_consultorias_reports', JSON.stringify(items)); }
function saveConsultoriaReport(){
  const title=document.getElementById('report-title')?.value.trim();
  if(!title){ alert('Ingresa el título del reporte.'); return; }
  const items=getConsultoriaReports();
  items.unshift({id:Date.now(),title,type:document.getElementById('report-type')?.value||'Ejecutivo',period:document.getElementById('report-period')?.value.trim()||'',status:document.getElementById('report-status')?.value||'Listo'});
  saveConsultoriaReports(items);
  renderConsultoriaReportList();
}
function renderConsultoriaReportList(){
  const list=document.getElementById('report-list');
  if(!list) return;
  const items=getConsultoriaReports();
  if(!items.length){ list.innerHTML='<div class="consultorias-card-item"><div class="consultorias-card-title">No hay reportes generados</div></div>'; return; }
  list.innerHTML=items.map(item=>`<div class="consultorias-card-item"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.title||'Reporte')}</div><span class="consultorias-chip ${item.status==='Listo'?'success':item.status==='Pendiente'?'alert':'warn'}">${esc(item.status||'Listo')}</span></div><div class="consultorias-meta"><span>${esc(item.type||'Ejecutivo')}</span>${item.period?`<span>${esc(item.period)}</span>`:''}</div></div>`).join('');
}

function getConsultoriaReportFilterValues(){
  const items = Array.isArray(getConsultoriaSchedule()) ? getConsultoriaSchedule() : [];
  const values = [];
  items.forEach(item => {
    const code = String(item.code||'').trim();
    const title = String(item.title||'').trim();
    if(code) values.push(code);
    if(title) values.push(`${code ? code + ' - ' : ''}${title}`);
  });
  return Array.from(new Set(values));
}

function renderConsultoriaReportFilters(){
  const datalist = document.getElementById('report-filter-project-options');
  if(!datalist) return;
  const values = getConsultoriaReportFilterValues();
  datalist.innerHTML = values.map(value=>`<option value="${esc(value)}">`).join('');
}

function getConsultoriaReportFilterProject(){
  const projectValue = String(document.getElementById('report-filter-project')?.value || '').trim();
  if(!projectValue) return '';
  return projectValue.toLowerCase();
}

function getConsultoriaReportDateRange(){
  const from = String(document.getElementById('report-filter-from-date')?.value || '').trim();
  const to = String(document.getElementById('report-filter-to-date')?.value || '').trim();
  return { from: from || '', to: to || '' };
}

function parseDateOrNull(value){
  if(!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function rangesOverlap(startValue, endValue, fromDate, toDate){
  const start = parseDateOrNull(startValue);
  const end = parseDateOrNull(endValue || startValue);
  if(!start && !end) return false;
  const rangeStart = start || end;
  const rangeEnd = end || start;
  const from = parseDateOrNull(fromDate);
  const to = parseDateOrNull(toDate);
  if(from && rangeEnd < from) return false;
  if(to && rangeStart > to) return false;
  return true;
}

function parseConsultoriaReportPeriodRange(period){
  const raw = String(period || '').trim();
  if(!raw) return null;
  const months = {
    enero: 1, february: 2, febrero: 2, mar: 3, marzo: 3, abr: 4, abril: 4,
    may: 5, mayo: 5, jun: 6, junio: 6, jul: 7, julio: 7, ago: 8, agosto: 8,
    sep: 9, septiembre: 9, oct: 10, octubre: 10, nov: 11, noviembre: 11, dic: 12, diciembre: 12
  };
  const normalized = raw.toLowerCase().replace(/–|—/g, '-').replace(/\s+/g, ' ').trim();
  const parts = normalized.split('-').map(part => part.trim()).filter(Boolean);
  const parsePart = text => {
    const match = text.match(/(\d{1,2})\s*([a-zñ]+)\s*(\d{4})?/i);
    if(!match) return null;
    const monthName = match[2].toLowerCase();
    const month = months[monthName];
    const year = match[3] ? Number(match[3]) : new Date().getFullYear();
    if(!month) return null;
    return new Date(year, month - 1, 1);
  };
  if(parts.length === 1){
    const monthStart = parsePart(parts[0]);
    if(!monthStart) return null;
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return { from: `${year}-${String(month + 1).padStart(2,'0')}-01`, to: `${year}-${String(month + 1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}` };
  }
  const start = parsePart(parts[0]);
  const end = parsePart(parts[1]);
  if(start && end){
    const endDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    return { from: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`, to: `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(endDay).padStart(2,'0')}` };
  }
  return null;
}

function filterConsultoriaScheduleByReport(projectFilter, fromDate, toDate){
  const items = Array.isArray(getConsultoriaSchedule()) ? getConsultoriaSchedule() : [];
  return items
    .filter(item => {
      if(!projectFilter) return true;
      const normalizedFilter = projectFilter.toLowerCase();
      const code = String(item.code||'').toLowerCase();
      const title = String(item.title||'').toLowerCase();
      return code.includes(normalizedFilter) || title.includes(normalizedFilter);
    })
    .map(item => ({
      ...item,
      deliverables: Array.isArray(item.deliverables) ? item.deliverables : []
    }));
}

function getConsultoriaReportActivities(projectFilter, fromDate, toDate){
  const scheduleItems = filterConsultoriaScheduleByReport(projectFilter, fromDate, toDate);
  const activities = [];
  scheduleItems.forEach(project => {
    project.deliverables.forEach((deliverable, index) => {
      const title = typeof deliverable === 'string' ? deliverable : String(deliverable.title||`Entregable ${index+1}`);
      const start = typeof deliverable === 'object' ? String(deliverable.start||'') : '';
      const end = typeof deliverable === 'object' ? String(deliverable.end||'') : '';
      const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
      const matchesDeliverable = rangesOverlap(start, end, fromDate, toDate);
      const matchesSubactivity = subactivities.some(sub => rangesOverlap(String(sub.start||''), String(sub.end||sub.start||''), fromDate, toDate));
      if(matchesDeliverable || matchesSubactivity){
        const completed = subactivities.filter(sub => Boolean(sub.evidenceName || sub.completed)).length;
        const overdue = subactivities.filter(sub => {
          const due = parseDateValue(sub.end || sub.start);
          return due && isDateBeforeToday(sub.end || sub.start) && !Boolean(sub.evidenceName || sub.completed);
        }).length;
        activities.push({
          projectCode: project.code||'',
          projectTitle: project.title||'',
          projectStatus: project.status||'Planificada',
          deliverableCode: getConsultoriaDeliverableCode(deliverable, index),
          deliverableTitle: title,
          start,
          end,
          subactivities,
          completed,
          overdue,
          totalSubactivities: subactivities.length,
          status: deliverable.status || 'Planificada'
        });
      }
    });
  });
  return activities;
}

function getConsultoriaReportCosts(projectFilter, fromDate, toDate){
  const items = Array.isArray(getConsultoriaCosts()) ? getConsultoriaCosts() : [];
  return items.filter(item => {
    if(!item) return false;
    if(projectFilter){
      const normalizedFilter = projectFilter.toLowerCase();
      const project = String(item.project||'').toLowerCase();
      const concept = String(item.concept||'').toLowerCase();
      if(!project.includes(normalizedFilter) && !concept.includes(normalizedFilter)) return false;
    }
    if(fromDate && item.date && item.date < fromDate) return false;
    if(toDate && item.date && item.date > toDate) return false;
    return true;
  });
}

function renderConsultoriaReportPreview(){
  const preview = document.getElementById('consultoria-report-preview');
  if(!preview) return;
  const reportTitle = String(document.getElementById('report-title')?.value.trim() || 'Informe de consultoría');
  const reportType = String(document.getElementById('report-type')?.value || 'Ejecutivo');
  const reportPeriod = String(document.getElementById('report-period')?.value.trim() || 'Período no especificado');
  const reportStatus = String(document.getElementById('report-status')?.value || 'Listo');
  const projectFilter = getConsultoriaReportFilterProject();
  const { from, to } = getConsultoriaReportDateRange();
  const reportPeriodRange = (!from && !to) ? parseConsultoriaReportPeriodRange(reportPeriod) : null;
  const activeFrom = from || (reportPeriodRange?.from || '');
  const activeTo = to || (reportPeriodRange?.to || '');
  const activities = getConsultoriaReportActivities(projectFilter, activeFrom, activeTo);
  const costs = getConsultoriaReportCosts(projectFilter, activeFrom, activeTo);
  const totalFinancial = costs.reduce((sum, item) => sum + Number(item.amount||0), 0);
  const expensesByStatus = costs.reduce((acc, item) => {
    const status = String(item.status||'Pendiente');
    acc[status] = (acc[status] || 0) + Number(item.amount||0);
    return acc;
  }, {});
  const expensesByCategory = costs.reduce((acc, item) => {
    const category = String(item.category||'Otros');
    acc[category] = (acc[category] || 0) + Number(item.amount||0);
    return acc;
  }, {});
  const overdueActivities = activities.filter(activity => activity.overdue).length;
  const completedActivities = activities.filter(activity => activity.totalSubactivities && activity.completed === activity.totalSubactivities).length;
  const technicalItems = activities.map(activity => {
    const progressLabel = activity.totalSubactivities ? `${activity.completed}/${activity.totalSubactivities} subactividades con evidencia` : 'Sin subactividades registradas';
    return `<div class="consultorias-card-item"><div class="consultorias-card-head"><div><div class="consultorias-card-title">${esc(activity.deliverableCode)} - ${esc(activity.deliverableTitle)}</div><div class="consultorias-meta"><span>Proyecto: ${esc(activity.projectCode || activity.projectTitle || 'Sin código')}</span><span>${esc(activity.projectStatus)}</span></div></div><span class="consultorias-chip ${activity.overdue ? 'alert' : activity.completed === activity.totalSubactivities && activity.totalSubactivities ? 'success' : 'warn'}">${esc(progressLabel)}</span></div><div class="consultorias-meta"><span>${activity.start ? `Inicio: ${esc(activity.start)}` : 'Sin inicio'}</span><span>${activity.end ? `Fin: ${esc(activity.end)}` : 'Sin fin'}</span></div></div>`;
  }).join('') || '<div class="consultorias-card-item"><div class="consultorias-card-title">No se registraron actividades técnicas para el rango seleccionado.</div></div>';
  const costItems = costs.map(item => `<div class="consultorias-card-item"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.concept||'Movimiento financiero')}</div><span class="consultorias-chip ${item.status==='Pagado'?'success':item.status==='Aprobado'?'alert':'warn'}">${esc(item.status||'Pendiente')}</span></div><div class="consultorias-meta"><span>L ${Number(item.amount||0).toFixed(2)}</span><span>${esc(item.category||'Otros')}</span><span>${esc(item.project||'Sin proyecto')}</span></div><div class="consultorias-meta"><span>${item.date?`Fecha: ${esc(item.date)}`:'Sin fecha'}</span>${item.invoiceNumber?`<span>Factura: ${esc(item.invoiceNumber)}</span>`:''}</div>${item.notes?`<div class="consultorias-meta">${esc(item.notes)}</div>`:''}</div>`).join('') || '<div class="consultorias-card-item"><div class="consultorias-card-title">No hay datos financieros para el rango seleccionado.</div></div>';
  const introProject = projectFilter ? `El análisis se concentra en la consultoría/proyecto "${esc(projectFilter)}"` : 'El análisis cubre todas las consultorías registradas.';
  const dateRange = (activeFrom || activeTo) ? `Desde ${esc(activeFrom || 'inicio')} hasta ${esc(activeTo || 'final')}` : `Período: ${esc(reportPeriod)}`;
  const conclusionLines = [];
  if(totalFinancial > 0){ conclusionLines.push(`La ejecución financiera reporta un total de L ${totalFinancial.toFixed(2)} dentro del período seleccionado.`); }
  if(overdueActivities){ conclusionLines.push(`Se identificaron ${overdueActivities} entregable(s) con subactividades vencidas que requieren atención prioritaria.`); }
  if(!overdueActivities && activities.length){ conclusionLines.push('La ejecución técnica no presenta subactividades vencidas en el rango seleccionado, lo que indica un avance estable de las entregas.'); }
  if(!costs.length){ conclusionLines.push('No se encontraron movimientos financieros registrados en el periodo seleccionado.'); }
  if(!activities.length){ conclusionLines.push('No hay actividades técnicas registradas para este filtro, por lo que la evaluación técnica es limitada.'); }
  const recommendations = [];
  if(overdueActivities){ recommendations.push('Revisar y priorizar la entrega de subactividades vencidas, asignando responsables claros y plazos de corrección.'); }
  if(totalFinancial > 0 && expensesByStatus['Pendiente']){ recommendations.push('Validar las partidas pendientes y acelerar la aprobación de facturas para evitar retrasos en la ejecución financiera.'); }
  if(!recommendations.length){ recommendations.push('Continuar con el plan actual y mantener la trazabilidad de entregables y costos.'); }
  preview.innerHTML = `
    <div class="consultorias-card-item"><div class="consultorias-card-head"><div><div class="consultorias-card-title">${esc(reportTitle)}</div><div class="consultorias-meta"><span>Tipo: ${esc(reportType)}</span><span>Período: ${esc(reportPeriod)}</span><span>Estado: ${esc(reportStatus)}</span></div></div></div></div>
    <div class="consultorias-card-item"><div class="consultorias-card-title">Resumen ejecutivo</div><div class="consultorias-meta">${esc(introProject)} ${esc(dateRange)}</div><div class="consultorias-meta">Este resumen ofrece una visión condensada del desempeño del periodo, destacando los resultados técnicos y financieros más relevantes, así como los riesgos actuales y los puntos de mejora inmediata.</div></div>
    <div class="consultorias-card-item"><div class="consultorias-card-title">Introducción</div><div class="consultorias-meta">A continuación se describe el contexto de la consultoría, los criterios de análisis y la metodología aplicada para consolidar la información. El informe se basa en los registros del cronograma de entregables y los movimientos contables, alineando el seguimiento técnico con la ejecución financiera.</div><div class="consultorias-meta">Se identifican los entregables clave, las subactividades asociadas y los montos registrados en el sistema, con el objetivo de evaluar el progreso real frente al periodo reportado.</div></div>
    <div class="consultorias-card-item"><div class="consultorias-card-title">Objetivo</div><div class="consultorias-meta">El objetivo es ofrecer una visión consolidada de la ejecución técnica y financiera para apoyar la toma de decisiones, identificar riesgos de cumplimiento y proponer acciones correctivas.</div></div>
    <div class="consultorias-card-item"><div class="consultorias-card-title">Análisis de la ejecución técnica</div><div class="consultorias-meta"><strong>Entregables analizados:</strong> ${activities.length}</div><div class="consultorias-meta"><strong>Entregables completos:</strong> ${completedActivities}</div><div class="consultorias-meta"><strong>Entregables con subactividades vencidas:</strong> ${overdueActivities}</div>${technicalItems}</div>
    <div class="consultorias-card-item"><div class="consultorias-card-title">Análisis financiero</div><div class="consultorias-meta"><strong>Total ejecutado:</strong> L ${totalFinancial.toFixed(2)}</div>${Object.entries(expensesByStatus).map(([status, amount]) => `<div class="consultorias-meta">${esc(status)}: L ${Number(amount).toFixed(2)}</div>`).join('')}<div class="consultorias-meta"><strong>Gastos por categoría</strong></div>${Object.entries(expensesByCategory).map(([category, amount]) => `<div class="consultorias-meta">${esc(category)}: L ${Number(amount).toFixed(2)}</div>`).join('')}</div>
    <div class="consultorias-card-item"><div class="consultorias-card-title">Conclusiones y recomendaciones</div>${conclusionLines.map(line=>`<div class="consultorias-meta">${esc(line)}</div>`).join('')}<div class="consultorias-meta"><strong>Recomendaciones:</strong></div>${recommendations.map(line=>`<div class="consultorias-meta">• ${esc(line)}</div>`).join('')}</div>`;
}

function exportConsultoriaReportToWord(){
  const preview = document.getElementById('consultoria-report-preview');
  if(!preview) return;
  const contentHtml = preview.innerHTML.trim();
  if(!contentHtml){
    alert('Genera primero la vista previa del informe antes de exportar.');
    return;
  }
  const title = String(document.getElementById('report-title')?.value.trim() || 'Informe de consultoría');
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(title)}</title></head><body>${contentHtml}</body></html>`;
  const blob = new Blob([fullHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9ñÑáéíóúÁÉÍÓÚ\s_-]/gi,'').replace(/\s+/g,'_').slice(0,120)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getConsultoriaCosts(){ try{ return JSON.parse(localStorage.getItem('aris_consultorias_costs')||'[]'); }catch(e){ return []; } }
function saveConsultoriaCosts(items){ localStorage.setItem('aris_consultorias_costs', JSON.stringify(items)); }
function getConsultoriaCostFormRoot(){
  const modalBody=document.querySelector('#consultoria-cost-modal .consultorias-modal-body');
  return modalBody || document;
}

function clearConsultoriaCostForm(){
  const root=getConsultoriaCostFormRoot();
  const fields=['cost-concept','cost-amount','cost-project','cost-date','cost-invoice-number','cost-receipt','cost-notes'];
  fields.forEach(id=>{ const el=root.querySelector(`#${id}`); if(!el) return; if(el.type==='file'){ el.value=''; } else if(el.tagName==='SELECT'){ el.selectedIndex = 0; } else { el.value=''; }});
  const status=root.querySelector('#cost-status'); if(status) status.value='Pendiente';
  const category=root.querySelector('#cost-category'); if(category) category.value='Honorarios';
}

function saveConsultoriaCost(){
  const root=getConsultoriaCostFormRoot();
  const concept=root.querySelector('#cost-concept')?.value.trim();
  const amount=root.querySelector('#cost-amount')?.value;
  if(!concept || !amount){ alert('Completa el concepto y el monto.'); return; }
  const items=getConsultoriaCosts();
  const receiptInput=root.querySelector('#cost-receipt');
  const receiptName=(receiptInput && receiptInput.files && receiptInput.files[0]) ? receiptInput.files[0].name : '';
  items.unshift({
    id:Date.now(),
    concept,
    category:root.querySelector('#cost-category')?.value||'Otros',
    amount:parseFloat(amount)||0,
    project:root.querySelector('#cost-project')?.value.trim()||'',
    date:root.querySelector('#cost-date')?.value||'',
    invoiceNumber:root.querySelector('#cost-invoice-number')?.value.trim()||'',
    status:root.querySelector('#cost-status')?.value||'Pendiente',
    receipt:receiptName,
    notes:root.querySelector('#cost-notes')?.value.trim()||''
  });
  saveConsultoriaCosts(items);
  clearConsultoriaCostForm();
  const modal=document.getElementById('consultoria-cost-modal');
  if(modal && modal.dataset.section === 'registro'){
    openConsultoriaCostModal('registro');
  } else {
    renderConsultoriaCostList();
  }
}

function updateConsultoriaCostStatus(index, value){
  const items=getConsultoriaCosts();
  if(!items[index]) return;
  items[index].status = value;
  saveConsultoriaCosts(items);
  renderConsultoriaCostList();
}
function renderConsultoriaCostList(){
  renderConsultoriaCostCardContent('detalle');
}

function getConsultoriaTotalRegistrations(){
  try{ return JSON.parse(localStorage.getItem('aris_consultoria_totals')||'[]'); }catch(e){ return []; }
}
function saveConsultoriaTotalRegistrations(items){ localStorage.setItem('aris_consultoria_totals', JSON.stringify(items)); }
function getConsultoriaSelectionRecords(){
  const legacyItems = Array.isArray(getConsultorias()) ? getConsultorias() : [];
  const tdrItems = Array.isArray(getConsultoriaTdrs()) ? getConsultoriaTdrs() : [];
  const scheduleItems = Array.isArray(getConsultoriaSchedule()) ? getConsultoriaSchedule() : [];
  const merged = [];
  const seen = new Set();
  const pushItem = item => {
    if(!item) return;
    const code = String(item.code || '').trim();
    const key = code || String(item.id || '').trim();
    if(!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  };
  tdrItems.forEach(pushItem);
  legacyItems.forEach(pushItem);
  scheduleItems.forEach(pushItem);
  return merged;
}
function formatConsultoriaDuration(startValue, endValue){
  const start = (startValue || '').toString().trim();
  const end = (endValue || '').toString().trim();
  if(!start && !end) return 'Sin duración';
  if(start && end){
    const startDate = new Date(start);
    const endDate = new Date(end);
    if(!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())){
      const diffDays = Math.max(0, Math.round((endDate - startDate) / 86400000) + 1);
      return `${diffDays} día${diffDays === 1 ? '' : 's'} (${start} → ${end})`;
    }
  }
  return start ? `Inicio: ${start}` : `Fin: ${end}`;
}
function getConsultoriaTotalSelectionMeta(code){
  const searchCode = String(code||'').trim();
  if(!searchCode) return null;
  const normalizedSearch = searchCode.toLowerCase();
  const items = Array.isArray(getConsultoriaSelectionRecords()) ? getConsultoriaSelectionRecords() : [];
  let target = items.find(item => String(item.code||'').trim().toLowerCase() === normalizedSearch);
  if(!target){
    const tdrItems = Array.isArray(getConsultoriaTdrs()) ? getConsultoriaTdrs() : [];
    target = tdrItems.find(item => String(item.code||'').trim().toLowerCase() === normalizedSearch);
  }
  if(!target){
    target = items.find(item => String(item.code||'').trim().toLowerCase().startsWith(normalizedSearch));
  }
  if(!target) return null;
  return {
    name: target.title || target.name || '',
    contratante: target.contratante || target.client || '',
    rtn: target.rtn || target.rtnConatante || target.rtnContratante || '',
    duration: formatConsultoriaDuration(target.start, target.end)
  };
}
function parseConsultoriaDisbursementPercentages(raw){
  return String(raw||'').split(/[,;\n]+/).map(entry=>entry.trim()).filter(Boolean).map(value=>parseFloat(value)).filter(value=>!Number.isNaN(value) && value>0);
}
function calculateConsultoriaTotalPreview(grossAmount, installments, percentages){
  const amount = Number(grossAmount||0);
  const netAmount = amount * 0.875;
  const count = Math.max(1, Number(installments)||1);
  const parsed = parseConsultoriaDisbursementPercentages(percentages);
  const baseValues = parsed.length ? parsed : [100];
  const plan = [];
  baseValues.slice(0, count).forEach((percent, index)=>plan.push({ percent, amount: netAmount * (percent / 100), label: `Desembolso ${index + 1}` }));
  while(plan.length < count){
    const lastPercent = plan.length ? plan[plan.length - 1].percent : 100;
    plan.push({ percent: lastPercent, amount: netAmount * (lastPercent / 100), label: `Desembolso ${plan.length + 1}` });
  }
  return { netAmount, retentionAmount: amount * 0.125, plan };
}
function collectConsultoriaTotalFormValues(){
  const code=document.getElementById('consultoria-total-code')?.value.trim()||'';
  const name=document.getElementById('consultoria-total-name')?.value.trim()||'';
  const contratante=document.getElementById('consultoria-total-contratante')?.value.trim()||'';
  const rtn=document.getElementById('consultoria-total-rtn')?.value.trim()||'';
  const duration=document.getElementById('consultoria-total-duration')?.value.trim()||'';
  const grossAmount=Number(document.getElementById('consultoria-total-gross')?.value||0);
  const installments=Math.max(1, parseInt(document.getElementById('consultoria-total-installments')?.value||'1',10)||1);
  const percentages=document.getElementById('consultoria-total-percentages')?.value||'';
  const preview=calculateConsultoriaTotalPreview(grossAmount, installments, percentages);
  return {
    code,
    name,
    contratante,
    rtn,
    duration,
    grossAmount,
    retentionAmount: preview.retentionAmount,
    netAmount: preview.netAmount,
    installments,
    percentages,
    disbursements: preview.plan.slice(0, installments)
  };
}
function syncConsultoriaTotalSelection(){
  const code=document.getElementById('consultoria-total-code')?.value||'';
  const meta=getConsultoriaTotalSelectionMeta(code);
  const nameInput=document.getElementById('consultoria-total-name');
  const contratanteInput=document.getElementById('consultoria-total-contratante');
  const rtnInput=document.getElementById('consultoria-total-rtn');
  const durationInput=document.getElementById('consultoria-total-duration');
  if(meta){
    if(nameInput) nameInput.value = meta.name || nameInput.value || '';
    if(contratanteInput) contratanteInput.value = meta.contratante || contratanteInput.value || '';
    if(rtnInput) rtnInput.value = meta.rtn || rtnInput.value || '';
    if(durationInput) durationInput.value = meta.duration || durationInput.value || '';
  } else if(!code){
    if(nameInput) nameInput.value = '';
    if(contratanteInput) contratanteInput.value = '';
    if(rtnInput) rtnInput.value = '';
    if(durationInput) durationInput.value = '';
  }
  updateConsultoriaTotalPreview();
}
function updateConsultoriaTotalPreview(){
  const grossInput=document.getElementById('consultoria-total-gross');
  const installmentsInput=document.getElementById('consultoria-total-installments');
  const percentagesInput=document.getElementById('consultoria-total-percentages');
  const preview=document.getElementById('consultoria-total-preview');
  const netInput=document.getElementById('consultoria-total-net');
  const retentionInput=document.getElementById('consultoria-total-retention');
  if(!preview) return;
  const gross = Number(grossInput?.value||0);
  const installments = Math.max(1, parseInt(installmentsInput?.value||'1',10)||1);
  const previewInfo = calculateConsultoriaTotalPreview(gross, installments, percentagesInput?.value||'');
  if(netInput) netInput.value = previewInfo.netAmount.toFixed(2);
  if(retentionInput) retentionInput.value = previewInfo.retentionAmount.toFixed(2);
  preview.innerHTML = `<div class="consultorias-meta"><strong>Monto neto a recibir:</strong> L ${previewInfo.netAmount.toFixed(2)}</div>${previewInfo.plan.slice(0, installments).map((item,index)=>`<div class="consultorias-meta">${index + 1}. ${item.label}: ${item.percent.toFixed(1)}% → L ${item.amount.toFixed(2)}</div>`).join('')}`;
}
function clearConsultoriaTotalForm(){
  const elements=['consultoria-total-code','consultoria-total-name','consultoria-total-contratante','consultoria-total-rtn','consultoria-total-duration','consultoria-total-gross','consultoria-total-net','consultoria-total-retention','consultoria-total-installments','consultoria-total-percentages'];
  elements.forEach(id=>{ const el=document.getElementById(id); if(!el) return; if(el.tagName==='SELECT'){ el.selectedIndex=0; } else { el.value=''; } });
  const preview=document.getElementById('consultoria-total-preview'); if(preview) preview.innerHTML='';
}
function toggleConsultoriaCostForm(event){
  if(event && event.target){
    const modalBody = event.target.closest('.consultorias-modal-body');
    const wrapper = modalBody ? modalBody.querySelector('[data-modal-form]') : document.getElementById('consultoria-cost-form-wrapper');
    if(!wrapper) return;
    wrapper.style.display = wrapper.style.display === 'block' ? 'none' : 'block';
  }
}
function saveConsultoriaTotalRegistration(){
  const values=collectConsultoriaTotalFormValues();
  const selection=getConsultoriaTotalSelectionMeta(values.code);
  if(!values.code || !values.grossAmount){ alert('Ingresa el código de la consultoría y define un monto total.'); return; }
  const items=getConsultoriaTotalRegistrations();
  items.unshift({
    id:Date.now(),
    code: values.code,
    name: values.name || selection.name,
    contratante: values.contratante || selection.contratante,
    rtn: values.rtn,
    duration: values.duration,
    grossAmount: values.grossAmount,
    retentionAmount: values.retentionAmount,
    netAmount: values.netAmount,
    installments: values.installments,
    percentages: values.percentages,
    disbursements: values.disbursements
  });
  saveConsultoriaTotalRegistrations(items);
  clearConsultoriaTotalForm();
  const returnSection = window.__consultoriaCostModalOrigin === 'nuevos-registros' ? 'nuevos-registros' : 'monto-total';
  window.__consultoriaCostModalOrigin = null;
  renderConsultoriaCostCardContent(returnSection);
  openConsultoriaCostModal(returnSection);
}

function bindConsultoriaCostCardInteractions(){
  if(window.__consultoriaCostCardBound) return;
  document.addEventListener('click', function(event){
    const button = event.target.closest('#cost-card-actions .hub-card[data-section]');
    if(!button) return;
    const section = button.dataset.section;
    if(!section) return;
    event.preventDefault();
    event.stopPropagation();
    openConsultoriaCostCard(event, section);
  });
  window.__consultoriaCostCardBound = true;
}

window.forceOpenConsultoriaCostModal = function(section='monto-total'){
  const button = document.querySelector(`#cost-card-actions .hub-card[data-section="${section}"]`);
  if(button){
    openConsultoriaCostCard(null, section);
    return true;
  }
  return false;
};

function openConsultoriaCostCard(event, section='detalle', origin=null){
  if(event && typeof event.preventDefault === 'function'){
    event.preventDefault();
    event.stopPropagation();
  }
  window.__consultoriaCostModalOrigin = origin || null;
  const buttons=[...document.querySelectorAll('#cost-card-actions button')];
  buttons.forEach(btn=>btn.classList.toggle('active', btn.dataset.section===section));
  const content=document.getElementById('cost-card-content');
  if(content){
    content.dataset.currentSection = section;
  }
  renderConsultoriaCostCardContent(section);
  try{ localStorage.setItem('aris_last_consultoria_cost_section', section); }catch(e){}
  openConsultoriaCostModal(section);
}

function openConsultoriaCostModal(section='detalle'){
  let modal=document.getElementById('consultoria-cost-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='consultoria-cost-modal';
    modal.className='consultorias-modal-overlay';
    modal.addEventListener('click', function(event){ if(event.target===modal) closeConsultoriaCostModal(); });
    document.body.appendChild(modal);
  }
  modal.dataset.section = section;
  const sectionTitle = {
    registro:'Registro contable',
    'monto-total':'Monto total consultoría',
    detalle:'Detalle de partidas',
    estado:'Estado y seguimiento',
    adjuntos:'Adjuntos de comprobantes',
    resumen:'Resumen presupuestario',
    'nuevos-registros':'Nuevos Registros',
    reportes:'Reportes rápidos',
    filtros:'Filtros y búsqueda'
  }[section] || 'Contabilidad';
  modal.innerHTML = `<div class="consultorias-modal-card"><div class="consultorias-modal-header"><div><strong>${esc(sectionTitle)}</strong><div class="consultorias-meta">${section==='resumen' ? 'Total de la consultoría y desglose por proyecto.' : section==='registro' ? 'Captura nuevos movimientos contables.' : ''}</div></div><button type="button" class="consultorias-secondary" onclick="closeConsultoriaCostModal()">Cerrar</button></div><div class="consultorias-modal-body">${renderConsultoriaCostCardContent(section, true)}</div></div>`;
  const toggleButton = document.getElementById('consultoria-cost-toggle-button');
  if(toggleButton){
    toggleButton.addEventListener('click', toggleConsultoriaCostForm);
  }
}

function closeConsultoriaCostModal(){
  const modal=document.getElementById('consultoria-cost-modal');
  if(modal) modal.remove();
}

function getFilteredCostItems(){
  const items=getConsultoriaCosts();
  const project=document.getElementById('filter-project')?.value.trim().toLowerCase();
  const category=document.getElementById('filter-category')?.value;
  const status=document.getElementById('filter-status')?.value;
  const fromDate=document.getElementById('filter-from-date')?.value;
  const toDate=document.getElementById('filter-to-date')?.value;
  const query=document.getElementById('filter-query')?.value.trim().toLowerCase();
  return items.filter(item=>{
    if(project && !(item.project||'').toLowerCase().includes(project)) return false;
    if(category && category !== 'Todos' && item.category !== category) return false;
    if(status && status !== 'Todos' && item.status !== status) return false;
    if(fromDate && item.date && item.date < fromDate) return false;
    if(toDate && item.date && item.date > toDate) return false;
    if(query){
      const text = `${item.concept||''} ${item.project||''} ${item.notes||''} ${item.receipt||''}`.toLowerCase();
      if(!text.includes(query)) return false;
    }
    return true;
  });
}

function renderConsultoriaCostCardContent(section, returnHtml=false){
  const container=document.getElementById('cost-card-content');
  const items=getConsultoriaCosts();
  const filteredItems = getFilteredCostItems();
  const consultoriaSelectionRecords = Array.isArray(getConsultoriaSelectionRecords()) ? getConsultoriaSelectionRecords().filter(item => String(item.code||'').trim()) : [];
  const consultoriaOptions = consultoriaSelectionRecords.map(item=>`<option value="${esc(String(item.code||''))}">${esc(String(item.code||''))} - ${esc(item.title||item.name||'Consultoría')} ${item.contratante ? `· ${esc(item.contratante)}` : ''}</option>`).join('');
  const formatRow = (item,index) => `<div class="consultorias-card-item">
      <div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.concept||'Movimiento')}</div></div>
      <div class="consultorias-meta"><span>L ${Number(item.amount||0).toFixed(2)}</span><span>${esc(item.category||'Otros')}</span>${item.project?`<span>${esc(item.project)}</span>`:''}</div>
      <div class="consultorias-meta"><span>${item.date?`Factura: ${esc(item.date)}`:'Sin fecha'}</span>${item.invoiceNumber?`<span>Número: ${esc(item.invoiceNumber)}</span>`:''}</div>
      <div class="consultorias-meta"><label><span>Estado</span><select onchange="updateConsultoriaCostStatus(${index}, this.value)"><option value="Pendiente" ${item.status==='Pendiente'?'selected':''}>Pendiente</option><option value="Aprobado" ${item.status==='Aprobado'?'selected':''}>Aprobado</option><option value="Pagado" ${item.status==='Pagado'?'selected':''}>Pagado</option></select></label></div>
      ${item.receipt?`<div class="consultorias-meta">Comprobante: ${esc(item.receipt)}</div>`:''}
      ${item.notes?`<div class="consultorias-meta">${esc(item.notes)}</div>`:''}
    </div>`;
  const emptyState = '<div class="consultorias-card-item"><div class="consultorias-card-title">No hay registros contables que mostrar</div></div>';
  let html = '';
  switch(section){
    case 'registro':
      html = `
        <div class="consultorias-card-item">
          <div class="consultorias-card-head"><div class="consultorias-card-title">Registro contable</div></div>
          <div class="consultorias-meta">Captura nuevos movimientos contables desde el botón y revisa la lista de partidas registradas.</div>
          <div class="consultorias-actions" style="margin-top:16px;">
            <button id="consultoria-cost-toggle-button" class="consultorias-cta" type="button" onclick="toggleConsultoriaCostForm(event)">Nuevo registro contable</button>
          </div>
          <div id="consultoria-cost-form-wrapper" style="display:none; margin-top:16px;" data-modal-form>
            <form class="consultorias-form" onsubmit="event.preventDefault(); saveConsultoriaCost();">
              <label class="consultorias-field"><span>Concepto</span><input id="cost-concept" type="text" placeholder="Factura / gasto / anticipo" required></label>
              <label class="consultorias-field"><span>Categoría</span><select id="cost-category"><option value="Honorarios">Honorarios</option><option value="Viajes">Viajes</option><option value="Materiales">Materiales</option><option value="Consultoría">Consultoría</option><option value="Administrativo">Administrativo</option><option value="Otros">Otros</option></select></label>
              <label class="consultorias-field"><span>Monto</span><input id="cost-amount" type="number" step="0.01" placeholder="0.00" required></label>
              <label class="consultorias-field"><span>Proyecto / consultoría</span><input id="cost-project" list="consultoria-project-options" type="text" placeholder="Código o nombre del proyecto"><datalist id="consultoria-project-options">${consultoriaOptions}</datalist></label>
              <label class="consultorias-field"><span>Fecha de factura</span><input id="cost-date" type="date"></label>
              <label class="consultorias-field"><span>Número de factura</span><input id="cost-invoice-number" type="text" placeholder="Número de factura"></label>
              <label class="consultorias-field"><span>Estado</span><select id="cost-status"><option value="Pendiente">Pendiente</option><option value="Aprobado">Aprobado</option><option value="Pagado">Pagado</option><option value="Cobrado">Cobrado</option></select></label>
              <label class="consultorias-field full"><span>Adjuntar comprobante</span><input id="cost-receipt" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"></label>
              <label class="consultorias-field full"><span>Notas</span><textarea id="cost-notes" rows="3" placeholder="Descripción o detalle de la partida..."></textarea></label>
              <div class="consultorias-actions">
                <button class="consultorias-cta" type="submit">Guardar movimiento</button>
                <button class="consultorias-secondary" type="button" onclick="clearConsultoriaCostForm()">Limpiar</button>
              </div>
            </form>
          </div>
        </div>
        <div class="consultorias-card-item" style="margin-top:20px;">
          <div class="consultorias-card-head"><div class="consultorias-card-title">Registros contables realizados</div></div>
          <div class="consultorias-card-list" style="margin-top:12px;">
            ${items.length ? items.map(formatRow).join('') : '<div class="consultorias-card-item"><div class="consultorias-card-title">No hay registros contables realizados aún.</div></div>'}
          </div>
        </div>`;
      break;
    case 'monto-total':
      const savedTotals = getConsultoriaTotalRegistrations();
      if(returnHtml){
        html = `
          <div class="consultorias-card-item">
            <div class="consultorias-card-head"><div class="consultorias-card-title">Registro de monto total de consultoría</div></div>
            <form class="consultorias-form" onsubmit="event.preventDefault(); saveConsultoriaTotalRegistration();">
              <label class="consultorias-field"><span>Código de consultoría / proyecto</span><input id="consultoria-total-code" list="consultoria-total-code-options" type="text" onchange="syncConsultoriaTotalSelection()" placeholder="CONS-001"><datalist id="consultoria-total-code-options">${consultoriaOptions}</datalist></label>
              <label class="consultorias-field"><span>Nombre</span><input id="consultoria-total-name" type="text"></label>
              <label class="consultorias-field"><span>Contratante</span><input id="consultoria-total-contratante" type="text"></label>
              <label class="consultorias-field"><span>RTN</span><input id="consultoria-total-rtn" type="text" placeholder="Escribe el RTN" ></label>
              <label class="consultorias-field"><span>Duración</span><input id="consultoria-total-duration" type="text" placeholder="Ej. 6 meses o 30 días"></label>
              <label class="consultorias-field"><span>Monto bruto</span><input id="consultoria-total-gross" type="number" step="0.01" placeholder="0.00" oninput="updateConsultoriaTotalPreview()" required></label>
              <label class="consultorias-field"><span>Cantidad de desembolsos</span><input id="consultoria-total-installments" type="number" min="1" step="1" value="1" placeholder="1" oninput="updateConsultoriaTotalPreview()"></label>
              <label class="consultorias-field"><span>Retención 12.5%</span><input id="consultoria-total-retention" type="text" readonly></label>
              <label class="consultorias-field"><span>Monto neto</span><input id="consultoria-total-net" type="text" readonly></label>
              <label class="consultorias-field full"><span>Desembolsos y porcentajes</span><input id="consultoria-total-percentages" type="text" placeholder="50,30,20" oninput="updateConsultoriaTotalPreview()"></label>
              <div class="consultorias-card-item">
                <div class="consultorias-card-title">Vista previa de desembolsos</div>
                <div id="consultoria-total-preview" class="consultorias-meta"></div>
              </div>
              <div class="consultorias-actions">
                <button class="consultorias-cta" type="submit">Guardar registro</button>
                <button class="consultorias-secondary" type="button" onclick="clearConsultoriaTotalForm()">Limpiar</button>
              </div>
            </form>
          </div>
          <div class="consultorias-card-list" style="margin-top:12px;">${savedTotals.length ? savedTotals.map(item=>`<div class="consultorias-card-item"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.name||item.code||'Consultoría')}</div><span class="consultorias-chip success">${esc(item.code||'Sin código')}</span></div><div class="consultorias-meta"><span>Bruto: L ${Number(item.grossAmount||0).toFixed(2)}</span><span>Retención: L ${Number(item.retentionAmount||0).toFixed(2)}</span><span>Neto: L ${Number(item.netAmount||0).toFixed(2)}</span></div><div class="consultorias-meta"><span>${esc(item.contratante||'Sin contratante')}</span><span>${esc(item.duration||'Sin duración')}</span>${item.rtn ? `<span>RTN: ${esc(item.rtn)}</span>` : ''}</div><div class="consultorias-meta">${item.disbursements ? item.disbursements.map((entry,index)=>`${index+1}. ${entry.percent.toFixed(1)}% → L ${Number(entry.amount||0).toFixed(2)}`).join(' · ') : 'Sin desembolsos'}</div></div>`).join('') : '<div class="consultorias-card-item"><div class="consultorias-card-title">No hay registros de montos totales</div></div>'}</div>`;
      } else {
        html = `
          <div class="consultorias-card-item">
            <div class="consultorias-card-head"><div class="consultorias-card-title">Registro de monto total de consultoría</div></div>
            <div class="consultorias-meta">Abre el registro en la ventana para completar los datos de monto total.</div>
          </div>
          <div class="consultorias-card-list" style="margin-top:12px;">${savedTotals.length ? savedTotals.map(item=>`<div class="consultorias-card-item"><div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.name||item.code||'Consultoría')}</div><span class="consultorias-chip success">${esc(item.code||'Sin código')}</span></div><div class="consultorias-meta"><span>Bruto: L ${Number(item.grossAmount||0).toFixed(2)}</span><span>Retención: L ${Number(item.retentionAmount||0).toFixed(2)}</span><span>Neto: L ${Number(item.netAmount||0).toFixed(2)}</span></div></div>`).join('') : '<div class="consultorias-card-item"><div class="consultorias-card-title">No hay registros de montos totales</div></div>'}</div>`;
      }
      break;
    case 'detalle':
      html = items.length ? items.map(formatRow).join('') : emptyState;
      break;
    case 'estado':
      if(!items.length){ html = emptyState; break; }
      html = `
        <div class="consultorias-card-item"><div class="consultorias-card-title">Seguimiento por estado</div>${['Pendiente','Aprobado','Pagado','Cobrado'].map(statusName=>{
          const list = items.filter(item=>item.status===statusName).map(item=>`<div class="consultorias-meta">${esc(item.concept)} · L ${Number(item.amount||0).toFixed(2)} · ${item.project?esc(item.project):'Sin proyecto'}</div>`).join('');
          return `<div class="consultorias-card-item"><div class="consultorias-card-title">${statusName}</div>${list || '<div class="consultorias-meta">Sin movimientos</div>'}</div>`;
        }).join('')}</div>`;
      break;
    case 'adjuntos':
      html = items.length ? items.map(item=>`
        <div class="consultorias-card-item">
          <div class="consultorias-card-head"><div class="consultorias-card-title">${esc(item.concept||'Movimiento')}</div><span class="consultorias-chip ${item.receipt ? 'success' : 'warn'}">${item.receipt ? 'Con comprobante' : 'Sin comprobante'}</span></div>
          <div class="consultorias-meta"><span>${item.receipt ? `Archivo: ${esc(item.receipt)}` : 'No se adjuntó comprobante'}</span>${item.project?`<span>${esc(item.project)}</span>`:''}</div>
          ${item.notes?`<div class="consultorias-meta">${esc(item.notes)}</div>`:''}
        </div>`).join('') : emptyState;
      break;
    case 'resumen':
      if(!items.length){ html = emptyState; break; }
      const totals = items.reduce((acc,item)=>{
        acc.total += Number(item.amount||0);
        acc.category[item.category] = (acc.category[item.category] || 0) + Number(item.amount||0);
        acc.project[item.project] = (acc.project[item.project] || 0) + Number(item.amount||0);
        return acc;
      }, { total:0, category:{}, project:{} });
      html = `
        <div class="consultorias-card-item">
          <div class="consultorias-card-title">Resumen presupuestario</div>
          <div class="consultorias-meta"><strong>Total de la consultoría:</strong> L ${totals.total.toFixed(2)}</div>
          <div class="consultorias-meta"><strong>Gastos por categoría:</strong></div>${Object.entries(totals.category).map(([cat,amt])=>`<div class="consultorias-meta">${esc(cat)}: L ${Number(amt).toFixed(2)}</div>`).join('')}
          <div class="consultorias-meta"><strong>Totales por proyecto / consultoría:</strong></div>${Object.entries(totals.project).map(([project,amt])=>`<div class="consultorias-meta">${project?esc(project):'Sin proyecto'}: L ${Number(amt).toFixed(2)}</div>`).join('')}
          <div class="consultorias-meta">Saldo proyectado no definido. Usa un presupuesto externo para comparar con los gastos reales.</div>
        </div>`;
      break;
    case 'nuevos-registros':
      const savedTotalRecords = getConsultoriaTotalRegistrations();
      html = `
        <div class="consultorias-card-item">
          <div class="consultorias-card-head"><div class="consultorias-card-title">Nuevos registros</div></div>
          <div class="consultorias-actions">
            <button class="consultorias-cta" type="button" onclick="openConsultoriaCostCard(null,'monto-total','nuevos-registros')">Registro de monto total de consultoría o proyecto</button>
          </div>
        </div>
        <div class="consultorias-card-item">
          <div class="consultorias-card-title">Panel general de registros</div>
          ${savedTotalRecords.length ? `
            <div class="consultorias-card-table-wrapper">
              <table class="consultorias-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Contratante</th>
                    <th>RTN</th>
                    <th>Duración</th>
                    <th>Bruto</th>
                    <th>Retención</th>
                    <th>Neto</th>
                  </tr>
                </thead>
                <tbody>
                  ${savedTotalRecords.map(item=>`
                    <tr>
                      <td>${esc(item.code||'--')}</td>
                      <td>${esc(item.name||'--')}</td>
                      <td>${esc(item.contratante||'--')}</td>
                      <td>${esc(item.rtn||'--')}</td>
                      <td>${esc(item.duration||'--')}</td>
                      <td>L ${Number(item.grossAmount||0).toFixed(2)}</td>
                      <td>L ${Number(item.retentionAmount||0).toFixed(2)}</td>
                      <td>L ${Number(item.netAmount||0).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="consultorias-meta">Aún no hay registros de montos totales. Completa el formulario para verlos aquí.</div>'}
        </div>`;
      break;
    case 'filtros':
      html = `
        <div class="consultorias-card-item">
          <div class="consultorias-card-title">Filtros y búsqueda</div>
          <div class="consultorias-form" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <label class="consultorias-field"><span>Consultoría / proyecto</span><input id="filter-project" type="text" placeholder="Buscar por proyecto" oninput="renderConsultoriaCostCardContent('filtros')"></label>
            <label class="consultorias-field"><span>Categoría</span><select id="filter-category" onchange="renderConsultoriaCostCardContent('filtros')"><option>Todos</option><option>Honorarios</option><option>Viajes</option><option>Materiales</option><option>Consultoría</option><option>Administrativo</option><option>Otros</option></select></label>
            <label class="consultorias-field"><span>Estado</span><select id="filter-status" onchange="renderConsultoriaCostCardContent('filtros')"><option>Todos</option><option>Pendiente</option><option>Aprobado</option><option>Pagado</option><option>Cobrado</option></select></label>
            <label class="consultorias-field"><span>Desde</span><input id="filter-from-date" type="date" onchange="renderConsultoriaCostCardContent('filtros')"></label>
            <label class="consultorias-field"><span>Hasta</span><input id="filter-to-date" type="date" onchange="renderConsultoriaCostCardContent('filtros')"></label>
            <label class="consultorias-field full" style="grid-column:1 / -1;"><span>Búsqueda libre</span><input id="filter-query" type="text" placeholder="Buscar por concepto, notas o comprobante" oninput="renderConsultoriaCostCardContent('filtros')"></label>
          </div>
        </div>
        <div id="filter-results" class="consultorias-card-list" style="margin-top:12px;">${filteredItems.length ? filteredItems.map(formatRow).join('') : emptyState}</div>`;
      break;
    case 'reportes':
      if(!items.length){ html = emptyState; break; }
      const monthly = items.reduce((acc,item)=>{
        const key = item.date ? item.date.slice(0,7) : 'Sin fecha';
        acc[key] = (acc[key] || 0) + Number(item.amount||0);
        return acc;
      }, {});
      const byCategory = items.reduce((acc,item)=>{ acc[item.category] = (acc[item.category] || 0) + Number(item.amount||0); return acc; }, {});
      html = `
        <div class="consultorias-card-item">
          <div class="consultorias-card-title">Reportes rápidos</div>
          <div class="consultorias-meta"><strong>Gastos por mes</strong></div>${Object.entries(monthly).map(([month,amt])=>`<div class="consultorias-meta">${esc(month)}: L ${Number(amt).toFixed(2)}</div>`).join('')}
          <div class="consultorias-meta"><strong>Gastos por rubro</strong></div>${Object.entries(byCategory).map(([cat,amt])=>`<div class="consultorias-meta">${esc(cat)}: L ${Number(amt).toFixed(2)}</div>`).join('')}
          <div class="consultorias-meta"><strong>Cuentas por pagar / cobrar</strong></div>
          ${['Pendiente','Aprobado','Cobrado','Pagado'].map(statusName=>`<div class="consultorias-meta">${statusName}: L ${Number(items.filter(item=>item.status===statusName).reduce((sum,item)=>sum+Number(item.amount||0),0)).toFixed(2)}</div>`).join('')}
        </div>`;
      break;
    default:
      html = emptyState;
  }
  if(returnHtml){
    return html;
  }
  if(container){
    container.innerHTML = html;
  }
}

function getConsultorias(){
  try{
    const raw=localStorage.getItem('aris_consultorias');
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}

function saveConsultorias(items){
  localStorage.setItem('aris_consultorias', JSON.stringify(items));
}

function setConsultoriaFilter(filter='all'){
  const buttons=[...document.querySelectorAll('.consultoria-filter')];
  buttons.forEach(btn=>btn.classList.toggle('active', btn.dataset.filter===filter));
  renderConsultoriasList(filter);
}

function clearConsultoriaForm(){
  document.getElementById('consultorias-form')?.reset();
  document.getElementById('consultoria-id').value='';
  const status=document.getElementById('consultoria-status');
  if(status) status.value='Planificada';
  const priority=document.getElementById('consultoria-priority');
  if(priority) priority.value='Media';
}

function populateConsultoriaForm(item){
  document.getElementById('consultoria-id').value=item.id || '';
  document.getElementById('consultoria-title').value=item.title || '';
  document.getElementById('consultoria-client').value=item.client || '';
  document.getElementById('consultoria-consultant').value=item.consultant || '';
  document.getElementById('consultoria-date').value=item.date || '';
  document.getElementById('consultoria-status').value=item.status || 'Planificada';
  document.getElementById('consultoria-priority').value=item.priority || 'Media';
  document.getElementById('consultoria-notes').value=item.notes || '';
  document.getElementById('consultoria-title')?.focus();
}

function saveConsultoria(){
  const title=document.getElementById('consultoria-title')?.value.trim();
  if(!title){
    alert('Ingresa el tema o nombre de la consultoría.');
    return;
  }
  const items=getConsultorias();
  const idValue=document.getElementById('consultoria-id')?.value;
  const payload={
    id:idValue ? Number(idValue) : Date.now(),
    title,
    client:document.getElementById('consultoria-client')?.value.trim()||'',
    consultant:document.getElementById('consultoria-consultant')?.value.trim()||'',
    date:document.getElementById('consultoria-date')?.value||'',
    status:document.getElementById('consultoria-status')?.value||'Planificada',
    priority:document.getElementById('consultoria-priority')?.value||'Media',
    notes:document.getElementById('consultoria-notes')?.value.trim()||''
  };
  if(idValue){
    const idx=items.findIndex(item=>item.id===Number(idValue));
    if(idx>=0) items[idx]=payload;
  }else{
    items.unshift(payload);
  }
  saveConsultorias(items);
  renderConsultoriasList();
  clearConsultoriaForm();
}

function editConsultoria(id){
  const item=getConsultorias().find(row=>row.id===id);
  if(item) populateConsultoriaForm(item);
}

function deleteConsultoria(id){
  const items=getConsultorias().filter(item=>item.id!==id);
  saveConsultorias(items);
  renderConsultoriasList();
}

function renderConsultoriasList(filter='all'){
  const list=document.getElementById('consultorias-list');
  const summary=document.getElementById('consultorias-summary');
  let items=getConsultorias();
  if(filter!=='all') items=items.filter(item=>item.status===filter);
  if(summary){
    const total=getConsultorias().length;
    summary.textContent=`${items.length} de ${total} consultor${total===1?'ía':'ías'} registrad${total===1?'a':'as'}`;
  }
  if(!list) return;
  if(!items.length){
    list.innerHTML='<div class="consultoria-empty">No hay consultorías en este filtro.</div>';
    return;
  }
  list.innerHTML=items.map(item=>{
    const statusClass=(item.status||'Planificada').toLowerCase().replace(/\s+/g,'-');
    const priorityClass=(item.priority||'Media').toLowerCase();
    return `
      <div class="consultoria-item">
        <div class="consultoria-top">
          <div>
            <div class="consultoria-title">${esc(item.title||'Sin título')}</div>
            <div class="consultoria-meta">
              <span class="consultoria-badge ${statusClass}">${esc(item.status||'Planificada')}</span>
              <span class="consultoria-badge ${priorityClass}">${esc(item.priority||'Media')}</span>
              ${item.date?`<span>${esc(item.date)}</span>`:''}
            </div>
          </div>
          <div class="consultoria-actions">
            <button type="button" class="edit-btn" onclick="editConsultoria(${item.id})">Editar</button>
            <button type="button" class="delete-btn" onclick="deleteConsultoria(${item.id})">Eliminar</button>
          </div>
        </div>
        <div class="consultoria-meta">
          ${item.client?`<span>Cliente: ${esc(item.client)}</span>`:''}
          ${item.consultant?`<span>Consultor: ${esc(item.consultant)}</span>`:''}
        </div>
        ${item.notes?`<div class="consultoria-meta"><span>${esc(item.notes)}</span></div>`:''}
      </div>`;
  }).join('');
}
