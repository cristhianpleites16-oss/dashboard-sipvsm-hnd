// ============================================================
// MÓDULO ADMIN — control de acceso y configuración administrativa
// ============================================================

const ADMIN_DATA_KEY = 'er_admin_conf';
const ADMIN_TOKEN_KEY = 'er_admin_token';
const ADMIN_CODE = 'Pleites1402';
let IS_ADMIN = false;
let ACTIVE_ADMIN_SECTION = '';
let ADMIN_UI_STATE = { showNewSiteForm: false, showNewUserForm: false, showNewGeoportalLayerForm: false, showGeoportalConfigForm: false, editSiteIndex: null, editUserIndex: null, editTdrIndex: null, editPlanningIndex: null, editConsultoriaTotalIndex: null, showTdrList: false, showPlanningList: false, showReportsList: false, showAccountingList: false };
const USER_SECTION_OPTIONS = [
  { key:'environmental', label:'Gestión y Análisis Ambiental' },
  { key:'settings', label:'Ajustes Generales' }
];

let ADMIN_CONFIG = {
  url:'',
  token:'',
  regional:'',
  days:30,
  geoportal: {
    name:'Geoportal ICF Honduras',
    url:'',
    layerType:'wms',
    layerName:'',
    attribution:'© ICF Honduras',
    username:'',
    password:'',
    proxy:'',
    layers: []
  },
  kobo: {
    enabled: false,
    url: 'https://kf.kobotoolbox.org',
    apiToken: '',
    formId: '',
    dateField: '_submission_time',
    syncInterval: 30
  },
  sites: [],
  users: [
    {name:'cpleites', firstName:'Admin', lastName:'Usuario', email:'admin@aris.local', username:'cpleites', role:'admin', site:'todas', sections:['environmental','settings'], password:'130320202-'}
  ],
  reports: {
    defaultTitle:'Informe de Monitoreo',
    defaultSubtitle:'SINAPH',
    dateRangeDays:30,
    showStats:true,
    showCharts:true,
    allowPdf:true,
    allowWord:true,
    aiProvider:'openai',
    aiApiKey:'',
    enableAiAnalysis:true,
    structureOverview:'Título, Resumen ejecutivo, Resultados, Gráficos, Conclusiones y Recomendaciones.',
    statsLength:'2-3 párrafos',
    chartsLength:'1-2 párrafos',
    aiAnalysisLength:'1-2 párrafos'
  },
  tdr: {
    aiProvider:'gemini',
    apiKey:'',
    enabled:true,
    endpoint:'http://127.0.0.1:5001/api/analyze-tdr'
  }
};

async function verifyEarthRangerConnection(url, token){
  const normalizedUrl = normalizeUrl(url || ADMIN_CONFIG.url || '');
  const normalizedToken = (token || ADMIN_CONFIG.token || '').trim();
  if(!normalizedUrl) throw new Error('Ingresa la URL de EarthRanger.');
  if(!normalizedToken) throw new Error('Ingresa el token de EarthRanger.');

  const endpoint = `${normalizedUrl}/api/v1.0/activity/events/count/`;
  const attempts = [
    { authHeader: `Token ${normalizedToken}` },
    { authHeader: `Bearer ${normalizedToken}` }
  ];

  let lastError = null;
  for(const attempt of attempts){
    try{
      const response = await fetch(pUrl(endpoint), { headers: { Authorization: attempt.authHeader, Accept: 'application/json' } });
      if(response.ok){
        return { url: normalizedUrl, token: normalizedToken, authHeader: attempt.authHeader };
      }
      const body = await response.text().catch(()=> '');
      lastError = new Error(`HTTP ${response.status}${body ? `: ${body}` : ''}`);
    }catch(error){
      lastError = error;
    }
  }
  throw lastError || new Error('No se pudo validar la conexión con EarthRanger.');
}

function initAdmin(){
  const saved = localStorage.getItem(ADMIN_DATA_KEY);
  if(saved){
    try{ const stored = JSON.parse(saved); if(stored) ADMIN_CONFIG = {...ADMIN_CONFIG, ...stored}; }catch(e){ console.warn('Admin config inválida',e); }
  }
  ADMIN_CONFIG.reports = {...ADMIN_CONFIG.reports};
  ADMIN_CONFIG.geoportal = {...ADMIN_CONFIG.geoportal};
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  if(token){ ADMIN_CONFIG.token = token; }
  const savedIsAdmin = sessionStorage.getItem('er_is_admin') === 'true';
  const savedUser = sessionStorage.getItem('er_user');
  if(savedIsAdmin && savedUser){
    const user = getUserByName(savedUser);
    if(user?.role==='admin'){
      IS_ADMIN = true;
    } else {
      localStorage.removeItem('er_is_admin');
      IS_ADMIN = false;
    }
  }
  renderLoginUsers();
  populateLoginDefaults();
  updateAdminNav();
}

function populateLoginDefaults(){
  const urlEl = document.getElementById('cfg-url');
  const daysEl = document.getElementById('cfg-days');
  const regionalEl = document.getElementById('cfg-regional');
  if(urlEl && ADMIN_CONFIG.url){ urlEl.value = ADMIN_CONFIG.url; }
  if(daysEl && ADMIN_CONFIG.days){ daysEl.value = ADMIN_CONFIG.days; }
  if(regionalEl && ADMIN_CONFIG.regional){ regionalEl.value = ADMIN_CONFIG.regional; }
}

function renderLoginUsers(){
  const select = document.getElementById('cfg-user');
  const input = document.getElementById('cfg-username');
  if(!select){
    if(input && !input.value && ADMIN_CONFIG.users?.length){
      const firstUser = ADMIN_CONFIG.users[0];
      input.value = firstUser.name || firstUser.username || `${firstUser.firstName||''} ${firstUser.lastName||''}`.trim();
    }
    return;
  }
  if(!ADMIN_CONFIG.users?.length){
    select.innerHTML = '<option value="">Sin usuarios definidos</option>';
    return;
  }
  select.innerHTML = ADMIN_CONFIG.users.map(u=>{
    const loginName = u.name || u.username || `${u.firstName||''} ${u.lastName||''}`.trim();
    return `<option value="${esc(loginName)}">${esc(loginName)} (${esc(u.role)})</option>`;
  }).join('');
  const savedUser = localStorage.getItem('er_user');
  if(savedUser && [...select.options].some(o=>o.value===savedUser)){
    select.value = savedUser;
  } else if(select.options.length){
    select.selectedIndex = 0;
  }
}

function updateAdminNav(){
  const btn=document.getElementById('nav-admin');
  if(!btn) return;
  btn.style.display = IS_ADMIN ? 'inline-flex' : 'none';
}

function validateAdminAccess(code){
  const username = CURRENT_USER?.username || document.getElementById('cfg-username')?.value?.trim() || '';
  const user = getUserByName(username);
  if(!user || user.role !== 'admin'){
    alert('Usuario no autorizado: Debes iniciar sesión con el usuario administrativo correcto.');
    return false;
  }
  if(!code || code.trim() !== ADMIN_CODE){
    alert('Usuario no autorizado: acceso denegado.');
    return false;
  }
  return true;
}

function activateAdminAccess(){
  IS_ADMIN = true;
  sessionStorage.setItem('er_is_admin','true');
  localStorage.setItem('er_is_admin','true');
  updateAdminNav();
}

function requestAdminAccess(){
  const code = window.prompt('Ingrese la clave de seguridad administrativa:');
  if(code === null) return false;
  if(!validateAdminAccess(code)) return false;
  activateAdminAccess();
  return true;
}

function goToAdmin(){
  if(!IS_ADMIN){
    if(!requestAdminAccess()) return;
  }
  ADMIN_UI_STATE.showNewSiteForm = false;
  ADMIN_UI_STATE.showNewUserForm = false;
  showScreen('admin');
  showAdminSection('environmental');
}

function showAdminSection(section){
  ACTIVE_ADMIN_SECTION = section;
  ADMIN_UI_STATE.showNewSiteForm = false;
  ADMIN_UI_STATE.showNewUserForm = false;
  ADMIN_UI_STATE.showNewGeoportalLayerForm = false;
  ADMIN_UI_STATE.showGeoportalConfigForm = false;
  ADMIN_UI_STATE.editSiteIndex = null;
  ADMIN_UI_STATE.editUserIndex = null;
  ADMIN_UI_STATE.editTdrIndex = null;
  ADMIN_UI_STATE.editPlanningIndex = null;
  ADMIN_UI_STATE.showTdrList = false;
  ADMIN_UI_STATE.showPlanningList = false;
  ADMIN_UI_STATE.showReportsList = false;
  ADMIN_UI_STATE.showAccountingList = false;
  const environmentalTab = document.getElementById('admin-tab-environmental');
  const projectsTab = document.getElementById('admin-tab-projects');
  const inventoryTab = document.getElementById('admin-tab-inventory');
  const usersTab = document.getElementById('admin-tab-users');
  const settingsTab = document.getElementById('admin-tab-settings');
  if(environmentalTab) environmentalTab.classList.toggle('active', section==='environmental');
  if(projectsTab) projectsTab.classList.toggle('active', section==='projects');
  if(inventoryTab) inventoryTab.classList.toggle('active', section==='inventory');
  if(usersTab) usersTab.classList.toggle('active', section==='users');
  if(settingsTab) settingsTab.classList.toggle('active', section==='settings');
  const environmentalPanel = document.getElementById('admin-environmental-panel');
  const integrationPanel = document.getElementById('admin-integration-panel');
  const reportsPanel = document.getElementById('admin-reports-panel');
  const chartsPanel = document.getElementById('admin-charts-panel');
  const mapsPanel = document.getElementById('admin-maps-panel');
  const projectsPanel = document.getElementById('admin-projects-panel');
  const inventoryPanel = document.getElementById('admin-inventory-panel');
  const usersPanel = document.getElementById('admin-users-panel');
  const settingsPanel = document.getElementById('admin-settings-panel');
  if(environmentalPanel) environmentalPanel.style.display = section==='environmental' ? 'block' : 'none';
  if(integrationPanel) integrationPanel.style.display = section==='integration' ? 'block' : 'none';
  if(reportsPanel) reportsPanel.style.display = section==='reports' ? 'block' : 'none';
  if(chartsPanel) chartsPanel.style.display = section==='charts' ? 'block' : 'none';
  if(mapsPanel) mapsPanel.style.display = section==='maps' ? 'block' : 'none';
  if(projectsPanel) projectsPanel.style.display = section==='projects' ? 'block' : 'none';
  if(inventoryPanel) inventoryPanel.style.display = section==='inventory' ? 'block' : 'none';
  if(usersPanel) usersPanel.style.display = section==='users' ? 'block' : 'none';
  if(settingsPanel) settingsPanel.style.display = section==='settings' ? 'block' : 'none';
  renderAdminPanel();
}

function goToAdminMenu(){
  showAdminSection('environmental');
}

function renderAdminPanel(){
  const badge = document.getElementById('user-role-badge');
  if(badge) badge.textContent = IS_ADMIN ? 'Administrador' : 'Usuario';
  if(ACTIVE_ADMIN_SECTION==='environmental') renderEnvironmentalSection();
  else if(ACTIVE_ADMIN_SECTION==='integration') renderIntegrationSection();
  else if(ACTIVE_ADMIN_SECTION==='users') renderUsersSection();
  else if(ACTIVE_ADMIN_SECTION==='projects') renderProjectsSection();
  else if(ACTIVE_ADMIN_SECTION==='inventory') renderInventorySection();
  else if(ACTIVE_ADMIN_SECTION==='reports') renderReportsSection();
  else if(ACTIVE_ADMIN_SECTION==='charts') renderChartsSection();
  else if(ACTIVE_ADMIN_SECTION==='maps') renderMapsSection();
  else if(ACTIVE_ADMIN_SECTION==='settings') renderGeneralSettingsSection();
  else renderAdminPlaceholder();
  renderAdminActionPanel();
  updateAdminFooterButton();
}

function updateAdminFooterButton(){
  const btn = document.getElementById('admin-save-btn');
  if(!btn) return;
  const enabled = ['integration','projects','reports','maps','settings'].includes(ACTIVE_ADMIN_SECTION);
  btn.disabled = !enabled;
  btn.title = enabled ? 'Guardar cambios de la sección activa' : 'Selecciona una sección que permita guardar cambios';
}

function renderAdminPlaceholder(){
  const environmentalPanel = document.getElementById('admin-environmental-panel');
  const integrationPanel = document.getElementById('admin-integration-panel');
  const reportsPanel = document.getElementById('admin-reports-panel');
  const chartsPanel = document.getElementById('admin-charts-panel');
  const mapsPanel = document.getElementById('admin-maps-panel');
  const usersPanel = document.getElementById('admin-users-panel');
  const projectsPanel = document.getElementById('admin-projects-panel');
  const inventoryPanel = document.getElementById('admin-inventory-panel');
  const settingsPanel = document.getElementById('admin-settings-panel');
  if(environmentalPanel){ environmentalPanel.innerHTML = ''; environmentalPanel.style.display = 'none'; }
  if(integrationPanel){ integrationPanel.innerHTML = ''; integrationPanel.style.display = 'none'; }
  if(reportsPanel){ reportsPanel.innerHTML = ''; reportsPanel.style.display = 'none'; }
  if(chartsPanel){ chartsPanel.innerHTML = ''; chartsPanel.style.display = 'none'; }
  if(mapsPanel){ mapsPanel.innerHTML = ''; mapsPanel.style.display = 'none'; }
  if(usersPanel){ usersPanel.innerHTML = ''; usersPanel.style.display = 'none'; }
  if(projectsPanel){ projectsPanel.innerHTML = ''; projectsPanel.style.display = 'none'; }
  if(inventoryPanel){ inventoryPanel.innerHTML = ''; inventoryPanel.style.display = 'none'; }
  if(settingsPanel){ settingsPanel.innerHTML = ''; settingsPanel.style.display = 'none'; }
}

function renderAdminActionPanel(){
  const panel = document.getElementById('admin-action-panel');
  if(!panel) return;
  const tokenStatus = ADMIN_CONFIG.token ? 'Listo' : 'Faltante';
  const tokenClass = ADMIN_CONFIG.token ? 'status-ok' : 'status-missing';
  const actionsHtml = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Resumen rápido</h3></div>
      <div class="admin-action-item"><div class="value">${ADMIN_CONFIG.sites.length}</div><div class="label">Sitios sincronizados</div></div>
      <div class="admin-action-item"><div class="value">${ADMIN_CONFIG.users.length}</div><div class="label">Usuarios configurados</div></div>
      <div class="admin-action-item"><div class="value ${tokenClass}">${tokenStatus}</div><div class="label">Token de EarthRanger</div></div>
      <div class="admin-actions" style="flex-wrap:wrap; gap:10px; margin-top:12px;">
        <button class="s-btn ghost small" onclick="showNewAdminUserForm()">Agregar usuario</button>
        <button class="s-btn ghost small" onclick="saveAdminSettings()">Guardar cambios</button>
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-card-header"><h3>Acciones rápidas</h3></div>
      <div class="admin-action-item"><div class="value">Conectar</div><div class="label">Guarda URL y token para probar la conexión con EarthRanger.</div></div>
      <div class="admin-action-item"><div class="value">Usuarios</div><div class="label">Administra usuarios y su sitio asignado.</div></div>
    </div>`;
  panel.innerHTML = actionsHtml;
}

function renderIntegrationSection(){
  const panel = document.getElementById('admin-integration-panel');
  if(!panel) return;

  const sitesHtml = ADMIN_CONFIG.sites.length ? ADMIN_CONFIG.sites.map((site,index)=>{
    if(ADMIN_UI_STATE.editSiteIndex===index){
      return `
        <div class="admin-table-row admin-edit-row">
          <div class="admin-field"><label>URL de EarthRanger</label><input id="edit-site-url-${index}" type="text" class="admin-input-row" value="${esc(site.url||'')}"/></div>
          <div class="admin-field"><label>Token de EarthRanger</label><input id="edit-site-token-${index}" type="password" class="admin-input-row" value="${esc(site.token||'')}"/></div>
          <div class="admin-field"><label>Nombre del sitio (local)</label><input id="edit-site-name-${index}" type="text" class="admin-input-row" value="${esc(site.name)}"/></div>
          <div class="admin-field"><label>ID del sitio EarthRanger</label><input id="edit-site-external-${index}" type="text" class="admin-input-row" value="${esc(site.externalId||'')}"/></div>
          <div class="admin-field"><label>Días por defecto</label><input id="edit-site-days-${index}" type="number" class="admin-input-row" min="1" max="365" value="${esc(site.days||ADMIN_CONFIG.days)}"/></div>
          <div class="admin-actions" style="gap:8px; justify-content:flex-start; margin-top:8px;">
            <button class="s-btn primary small" onclick="saveIntegrationSite(${index})">Guardar</button>
            <button class="s-btn ghost small" onclick="cancelEditIntegrationSite()">Cancelar</button>
          </div>
        </div>`;
    }
    return `
      <div class="admin-table-row">
        <div>${esc(site.name)}</div>
        <div>${esc(site.externalId||'')}</div>
        <div style="display:flex; gap:8px;">
          <button class="s-btn ghost small" onclick="editIntegrationSite(${index})">Editar</button>
          <button class="s-btn ghost small" onclick="removeIntegrationSite(${index})">Eliminar</button>
        </div>
      </div>`;
  }).join('') : '<div class="admin-empty">No hay sitios sincronizados.</div>';

  const newSiteForm = ADMIN_UI_STATE.showNewSiteForm ? `
      <div class="admin-card admin-modal">
        <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Integrar sitio EarthRanger</h3><button class="s-btn ghost small" onclick="cancelNewIntegrationSite()">Cerrar</button></div>
        <div class="admin-field"><label>URL de EarthRanger</label><input id="new-site-url" type="text" placeholder="https://sitio.pamdas.org" value="${esc(ADMIN_CONFIG.url)}"/></div>
        <div class="admin-field"><label>Token de EarthRanger</label><input id="new-site-token" type="password" placeholder="Token de EarthRanger..." value="${esc(ADMIN_CONFIG.token)}"/></div>
        <div class="admin-field"><label>Nombre del sitio (local)</label><input id="new-site-name" type="text" placeholder="Nombre del sitio EarthRanger"/></div>
        <div class="admin-field"><label>ID del sitio EarthRanger</label><input id="new-site-external" type="text" placeholder="ID del sitio EarthRanger (opcional)"/></div>
        <div class="admin-field"><label>Días por defecto</label><input id="new-site-days" type="number" min="1" max="365" value="${esc(ADMIN_CONFIG.days)}"/></div>
        <div style="display:flex;gap:8px;margin-top:10px;align-items:center;">
          <button class="s-btn primary" onclick="saveNewIntegrationSite()">Guardar integración</button>
          <button class="s-btn ghost" onclick="testIntegrationConnection()">Probar conexión</button>
        </div>
        <div class="admin-note" style="margin-top:8px;">El token se usa para autenticar hacia EarthRanger. Se guardará en sesión cuando corresponda.</div>
      </div>
    ` : '';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3>Sitios integrados</h3>
      <div><button class="s-btn primary" onclick="showNewIntegrationSiteForm()">Agregar sitio</button></div>
    </div>
    <div class="admin-card">
      <div class="admin-table">
        <div class="admin-table-row admin-table-header"><div>Nombre</div><div>ID externo</div><div>Acciones</div></div>
        ${sitesHtml}
      </div>
    </div>
    ${newSiteForm ? `<div class="admin-modal-backdrop" onclick="cancelNewIntegrationSite()">` : ''}
      ${newSiteForm ? `<div class="admin-modal-card" onclick="event.stopPropagation()">${newSiteForm}</div>` : ''}
    ${newSiteForm ? `</div>` : ''}
    ${renderKoboConfiguration()}`;
}

function renderKoboConfiguration(){
  const kobo = ADMIN_CONFIG.kobo || {};
  return `
    <div class="admin-card" style="margin-top:18px;">
      <div class="admin-card-header"><h3>Integración KoboToolbox</h3></div>
      <div class="admin-note">Conecta un formulario KoboToolbox para preparar sus envíos como registros ambientales del Dashboard.</div>
      <div class="admin-field"><label><input id="admin-kobo-enabled" type="checkbox" ${kobo.enabled ? 'checked' : ''}/> Activar integración KoboToolbox</label></div>
      <div class="admin-field"><label>Servidor KoboToolbox</label><input id="admin-kobo-url" type="url" value="${esc(kobo.url || 'https://kf.kobotoolbox.org')}" placeholder="https://kf.kobotoolbox.org"/></div>
      <div class="admin-field"><label>Token API</label><input id="admin-kobo-token" type="password" value="${esc(kobo.apiToken || '')}" placeholder="Token personal de KoboToolbox"/></div>
      <div class="admin-field"><label>UID del formulario</label><input id="admin-kobo-form-id" type="text" value="${esc(kobo.formId || '')}" placeholder="UID del asset/formulario"/></div>
      <div class="admin-field"><label>Campo de fecha</label><input id="admin-kobo-date-field" type="text" value="${esc(kobo.dateField || '_submission_time')}" placeholder="_submission_time"/></div>
      <div class="admin-field"><label>Intervalo de sincronización (minutos)</label><input id="admin-kobo-sync-interval" type="number" min="5" max="1440" value="${esc(kobo.syncInterval || 30)}"/></div>
      <div class="admin-actions" style="margin-top:12px;justify-content:flex-start;gap:10px;">
        <button class="s-btn primary" onclick="saveKoboSettings()">Guardar KoboToolbox</button>
        <button class="s-btn ghost" onclick="testKoboConnection()">Probar conexión</button>
      </div>
      <div id="admin-kobo-status" class="admin-note" style="margin-top:10px;">${kobo.formId ? `Formulario configurado: ${esc(kobo.formId)}` : 'Formulario aún no configurado.'}</div>
    </div>`;
}

async function testKoboConnection(){
  const url = normalizeUrl(document.getElementById('admin-kobo-url')?.value || ADMIN_CONFIG.kobo?.url || '');
  const token = (document.getElementById('admin-kobo-token')?.value || ADMIN_CONFIG.kobo?.apiToken || '').trim();
  const formId = (document.getElementById('admin-kobo-form-id')?.value || ADMIN_CONFIG.kobo?.formId || '').trim();
  const status = document.getElementById('admin-kobo-status');
  if(!url || !token){ if(status) status.textContent='Ingresa el servidor y el token de KoboToolbox.'; return; }
  try{
    const endpoint = formId ? `${url}/api/v2/assets/${encodeURIComponent(formId)}/` : `${url}/api/v2/assets/`;
    const response = await fetch(pUrl(endpoint), { headers:{ Authorization:`Token ${token}`, Accept:'application/json' } });
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if(status) status.textContent = formId ? 'Conexión verificada y formulario encontrado.' : `Conexión verificada. Formularios disponibles: ${data.count ?? 'consulta realizada'}.`;
  }catch(error){
    if(status) status.textContent = `No se pudo conectar con KoboToolbox: ${error.message}`;
  }
}

function saveKoboSettings(){
  const url = normalizeUrl(document.getElementById('admin-kobo-url')?.value || 'https://kf.kobotoolbox.org');
  const apiToken = (document.getElementById('admin-kobo-token')?.value || '').trim();
  const formId = (document.getElementById('admin-kobo-form-id')?.value || '').trim();
  const dateField = (document.getElementById('admin-kobo-date-field')?.value || '_submission_time').trim();
  const syncInterval = Math.max(5, parseInt(document.getElementById('admin-kobo-sync-interval')?.value || '30', 10) || 30);

  ADMIN_CONFIG.kobo = { ...(ADMIN_CONFIG.kobo || {}), enabled: Boolean(document.getElementById('admin-kobo-enabled')?.checked), url, apiToken, formId, dateField, syncInterval };
  persistAdminData();
  const status = document.getElementById('admin-kobo-status');
  if(status) status.textContent = 'Configuración de KoboToolbox guardada.';
}

// Prueba la conexión usando los valores del formulario (si están) o los del ADMIN_CONFIG
async function testIntegrationConnection(){
  const url = normalizeUrl(document.getElementById('new-site-url')?.value || ADMIN_CONFIG.url || '');
  const token = (document.getElementById('new-site-token')?.value || ADMIN_CONFIG.token || '').trim();
  try{
    await verifyEarthRangerConnection(url, token);
    alert('Conexión verificada con éxito.');
  }catch(e){
    alert('Fallo al verificar la conexión: ' + e.message);
  }
}

function renderUsersSection(){
  const panel = document.getElementById('admin-users-panel');
  if(!panel) return;
  const userRows = ADMIN_CONFIG.users.length ? ADMIN_CONFIG.users.map((user,index)=>{
    if(ADMIN_UI_STATE.editUserIndex===index){
      return `
      <div class="admin-table-row admin-edit-row">
        <div class="admin-field"><label>Nombre</label><input id="edit-user-firstname-${index}" type="text" class="admin-input-row" value="${esc(user.firstName||'')}"/></div>
        <div class="admin-field"><label>Usuario</label><input id="edit-user-username-${index}" type="text" class="admin-input-row" value="${esc(user.username)}"/></div>
        <div class="admin-field"><label>Correo</label><input id="edit-user-email-${index}" type="email" class="admin-input-row" value="${esc(user.email||'')}"/></div>
        <div class="admin-field"><label>Rol</label><select id="edit-user-role-${index}">${renderRoleOptions(user.role)}</select></div>
        <div class="admin-field"><label>Secciones permitidas</label><div class="admin-section-checkboxes">${renderSectionCheckboxes(user.sections || [], `edit-user-${index}`)}</div></div>
        <div class="admin-field"><label>Sitio asignado (solo para Ambiental)</label><select id="edit-user-${index}-site" ${!(Array.isArray(user.sections) && user.sections.includes('environmental')) ? 'disabled' : ''}>${renderSiteSelectionOptions(user.site)}</select></div>
        <div class="admin-actions" style="grid-column:1 / -1; gap:8px; justify-content:flex-start; margin-top:8px;">
          <button class="s-btn primary small" onclick="saveAdminUser(${index})">Guardar</button>
          <button class="s-btn ghost small" onclick="cancelEditAdminUser()">Cancelar</button>
        </div>
      </div>`;
    }
    return `
      <div class="admin-table-row">
        <div>${esc(`${user.firstName||''} ${user.lastName||''}`.trim() || user.username)}</div>
        <div>${esc(user.username)}</div>
        <div>${esc(user.email||'')}</div>
        <div>${esc(user.role)}</div>
        <div>${esc(formatUserSections(user.sections))}</div>
        <div>${esc(user.sections?.includes('environmental') ? (user.site || 'General') : 'General')}</div>
        <div style="display:flex; gap:8px;">
          <button class="s-btn ghost small" onclick="editAdminUser(${index})">Editar</button>
          <button class="s-btn ghost small" onclick="removeAdminUser(${index})">Eliminar</button>
        </div>
      </div>`;
  }).join('') : '<div class="admin-empty">No hay usuarios definidos.</div>';

  const newUserForm = ADMIN_UI_STATE.showNewUserForm ? `
      <div class="admin-card">
        <div class="admin-card-header"><h3>Nuevo usuario</h3></div>
        <div class="admin-field"><label>Nombre</label><input id="new-user-firstname" type="text" placeholder="Nombre"/></div>
        <div class="admin-field"><label>Apellido</label><input id="new-user-lastname" type="text" placeholder="Apellido"/></div>
        <div class="admin-field"><label>Correo Electrónico</label><input id="new-user-email" type="email" placeholder="Correo electrónico"/></div>
        <div class="admin-field"><label>Nombre de usuario</label><input id="new-user-username" type="text" placeholder="Nombre de usuario"/></div>
        <div class="admin-field"><label>Rol</label><select id="new-user-role"><option value="cliente">Cliente</option><option value="admin">Administrador</option></select></div>
        <div class="admin-field"><label>Secciones permitidas</label>${renderSectionCheckboxes(['environmental','settings'], 'new-user')}</div>
        <div class="admin-field"><label>Sitio asignado (solo para Ambiental)</label><select id="new-user-site">${renderSiteSelectionOptions('todas')}</select></div>
        <div class="admin-field"><label>Contraseña</label><input id="new-user-password" type="password" placeholder="Contraseña"/></div>
        <div class="admin-actions"><button class="s-btn primary" onclick="saveNewAdminUser()">Guardar usuario</button><button class="s-btn ghost" onclick="cancelNewAdminUser()">Cancelar</button></div>
      </div>
    ` : '';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3>Usuarios y asignaciones</h3>
      <div><button class="s-btn primary" onclick="showNewAdminUserForm()">Agregar usuario</button></div>
    </div>
    <div class="admin-card">
      <div class="admin-table">
        <div class="admin-table-row admin-table-header"><div>Nombre</div><div>Usuario</div><div>Correo</div><div>Rol</div><div>Secciones</div><div>Sitio ER</div><div>Acciones</div></div>
        ${userRows}
      </div>
    </div>
    ${newUserForm ? `<div class="admin-modal-backdrop" onclick="cancelNewAdminUser()">` : ''}
      ${newUserForm ? `<div class="admin-modal-card" onclick="event.stopPropagation()">${newUserForm}</div>` : ''}
    ${newUserForm ? `</div>` : ''}`;
  if(ADMIN_UI_STATE.showNewUserForm) toggleUserSectionSiteField('new-user');
  if(ADMIN_UI_STATE.editUserIndex !== null) toggleUserSectionSiteField(`edit-user-${ADMIN_UI_STATE.editUserIndex}`);
}

function getAdminTdrItems(){
  try{ return JSON.parse(localStorage.getItem('aris_tdrs') || '[]'); }catch(e){ return []; }
}

function saveAdminTdrItems(items){
  localStorage.setItem('aris_tdrs', JSON.stringify(items));
}

function openAdminTdrManager(){
  ADMIN_UI_STATE.editTdrIndex = null;
  ADMIN_UI_STATE.showTdrList = true;
  renderProjectsSection();
}

function closeAdminTdrManager(){
  ADMIN_UI_STATE.showTdrList = false;
  ADMIN_UI_STATE.editTdrIndex = null;
  renderProjectsSection();
}

function openAdminPlanningManager(){
  ADMIN_UI_STATE.showPlanningList = true;
  renderProjectsSection();
}

function closeAdminPlanningManager(){
  ADMIN_UI_STATE.showPlanningList = false;
  ADMIN_UI_STATE.editPlanningIndex = null;
  renderProjectsSection();
}

function getAdminPlanningItems(){
  try{ return JSON.parse(localStorage.getItem('aris_consultorias_plan') || '[]'); }catch(e){ return []; }
}

function saveAdminPlanningItems(items){
  saveConsultoriaScheduleList(Array.isArray(items) ? items : []);
}

function openAdminPlanningEdit(index){
  ADMIN_UI_STATE.editPlanningIndex = index;
  ADMIN_UI_STATE.showPlanningList = true;
  renderProjectsSection();
}

function cancelAdminPlanningEdit(){
  ADMIN_UI_STATE.editPlanningIndex = null;
  renderProjectsSection();
}

function removeAdminPlanningItem(index){
  const items = getAdminPlanningItems();
  if(!items[index]) return;
  if(!confirm('¿Deseas eliminar este registro de planificación?')) return;
  items.splice(index, 1);
  saveAdminPlanningItems(items);
  ADMIN_UI_STATE.editPlanningIndex = null;
  renderProjectsSection();
}

function removeAdminPlanningDeliverable(itemIndex, deliverableIndex){
  const items = getAdminPlanningItems();
  if(!items[itemIndex]) return;
  const deliverables = Array.isArray(items[itemIndex].deliverables) ? items[itemIndex].deliverables : [];
  if(!deliverables[deliverableIndex]) return;
  if(!confirm('¿Deseas eliminar este entregable?')) return;
  deliverables.splice(deliverableIndex, 1);
  items[itemIndex].deliverables = deliverables;
  saveAdminPlanningItems(items);
  renderProjectsSection();
}

function removeAdminPlanningSubactivity(itemIndex, deliverableIndex, subIndex){
  const items = getAdminPlanningItems();
  if(!items[itemIndex]) return;
  const deliverables = Array.isArray(items[itemIndex].deliverables) ? items[itemIndex].deliverables : [];
  const deliverable = deliverables[deliverableIndex];
  if(!deliverable) return;
  const subactivities = Array.isArray(deliverable.subactivities) ? deliverable.subactivities : [];
  if(!subactivities[subIndex]) return;
  if(!confirm('¿Deseas eliminar esta subactividad?')) return;
  subactivities.splice(subIndex, 1);
  deliverable.subactivities = subactivities;
  deliverables[deliverableIndex] = deliverable;
  items[itemIndex].deliverables = deliverables;
  saveAdminPlanningItems(items);
  renderProjectsSection();
}

function saveAdminPlanningEdit(index){
  const items = getAdminPlanningItems();
  if(!items[index]) return;
  const code = document.getElementById('admin-plan-code')?.value.trim() || '';
  const title = document.getElementById('admin-plan-title')?.value.trim() || '';
  if(!code || !title){ alert('Completa el código y el nombre de la consultoría.'); return; }
  const deliverables = [];
  let dIndex = 0;
  while(true){
    const titleInput = document.getElementById(`admin-deliverable-title-${index}-${dIndex}`);
    if(!titleInput) break;
    const startInput = document.getElementById(`admin-deliverable-start-${index}-${dIndex}`);
    const endInput = document.getElementById(`admin-deliverable-end-${index}-${dIndex}`);
    const titleValue = titleInput.value.trim();
    const startValue = startInput?.value || '';
    const endValue = endInput?.value || '';
    const subactivities = [];
    let sIndex = 0;
    while(true){
      const subTitleInput = document.getElementById(`admin-subactivity-title-${index}-${dIndex}-${sIndex}`);
      if(!subTitleInput) break;
      const subStartInput = document.getElementById(`admin-subactivity-start-${index}-${dIndex}-${sIndex}`);
      const subEndInput = document.getElementById(`admin-subactivity-end-${index}-${dIndex}-${sIndex}`);
      const subTitle = subTitleInput.value.trim();
      if(subTitle){
        subactivities.push({ title: subTitle, start: subStartInput?.value || '', end: subEndInput?.value || '' });
      }
      sIndex += 1;
    }
    if(titleValue){
      deliverables.push({ title: titleValue, start: startValue, end: endValue, subactivities });
    }
    dIndex += 1;
  }
  items[index] = {
    ...items[index],
    code,
    title,
    client: document.getElementById('admin-plan-client')?.value.trim() || '',
    responsable: document.getElementById('admin-plan-responsable')?.value.trim() || '',
    status: document.getElementById('admin-plan-status')?.value || 'Planificada',
    start: document.getElementById('admin-plan-start')?.value || '',
    end: document.getElementById('admin-plan-end')?.value || '',
    notes: document.getElementById('admin-plan-notes')?.value.trim() || '',
    deliverables
  };
  saveAdminPlanningItems(items);
  ADMIN_UI_STATE.editPlanningIndex = null;
  renderProjectsSection();
}

function normalizeAdminPlanningCode(value){
  return String(value || '').trim();
}

function renderAdminPlanningEditor(item, index){
  if(!item) return '<div class="admin-empty">Registro no encontrado.</div>';
  const deliverables = Array.isArray(item.deliverables) ? item.deliverables : [];
  const deliverableRows = deliverables.length ? deliverables.map((deliverable, dIndex) => {
    const title = typeof deliverable === 'string' ? deliverable : deliverable.title || `Entregable ${dIndex+1}`;
    const start = typeof deliverable === 'object' ? deliverable.start || '' : '';
    const end = typeof deliverable === 'object' ? deliverable.end || '' : '';
    const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
    const subRows = subactivities.length ? subactivities.map((sub, sIndex) => {
      const subTitle = esc(sub.title || `Subactividad ${sIndex+1}`);
      const subStart = esc(sub.start || '');
      const subEnd = esc(sub.end || '');
      return `
          <div class="admin-card" style="margin-bottom:8px; padding:10px; display:grid; gap:10px;">
            <div class="admin-field"><label>Subactividad</label><input id="admin-subactivity-title-${index}-${dIndex}-${sIndex}" type="text" value="${subTitle}" /></div>
            <div class="admin-field"><label>Fecha inicio</label><input id="admin-subactivity-start-${index}-${dIndex}-${sIndex}" type="date" value="${subStart}" /></div>
            <div class="admin-field"><label>Fecha fin</label><input id="admin-subactivity-end-${index}-${dIndex}-${sIndex}" type="date" value="${subEnd}" /></div>
            <div class="admin-actions" style="justify-content:flex-end; gap:10px; margin-top:8px;"><button class="s-btn ghost small" onclick="removeAdminPlanningSubactivity(${index},${dIndex},${sIndex})">Eliminar</button></div>
          </div>`;
    }).join('') : '<div class="admin-empty">No hay subactividades registradas.</div>';
    return `
        <div class="admin-card" style="margin-bottom:16px; padding:14px;">
          <div class="admin-field"><label>Entregable</label><input id="admin-deliverable-title-${index}-${dIndex}" type="text" value="${esc(title)}"/></div>
          <div class="admin-field"><label>Fecha inicio</label><input id="admin-deliverable-start-${index}-${dIndex}" type="date" value="${esc(start)}"/></div>
          <div class="admin-field"><label>Fecha fin</label><input id="admin-deliverable-end-${index}-${dIndex}" type="date" value="${esc(end)}"/></div>
          <div class="admin-actions" style="justify-content:flex-end; gap:10px; margin-bottom:12px;"><button class="s-btn ghost small" onclick="removeAdminPlanningDeliverable(${index},${dIndex})">Eliminar entregable</button></div>
          <div><strong>Subactividades</strong></div>
          ${subRows}
          <div class="admin-card" style="margin-top:12px; padding:12px; border:1px solid #e2e8f0; background:#f8fafc;">
            <div class="admin-card-header" style="margin-bottom:10px;"><strong>Agregar subactividad</strong></div>
            <div class="admin-field"><label>Subactividad</label><input id="admin-new-subactivity-title-${index}-${dIndex}" type="text" placeholder="Nombre de subactividad" /></div>
            <div class="admin-field"><label>Fecha inicio</label><input id="admin-new-subactivity-start-${index}-${dIndex}" type="date" /></div>
            <div class="admin-field"><label>Fecha fin</label><input id="admin-new-subactivity-end-${index}-${dIndex}" type="date" /></div>
            <div class="admin-actions" style="justify-content:flex-end; gap:10px; margin-top:12px;"><button class="s-btn primary" onclick="addAdminPlanningSubactivity(${index},${dIndex})">Agregar subactividad</button></div>
          </div>
        </div>`;
  }).join('') : '<div class="admin-empty">No hay entregables registrados.</div>';
  return `
      <div class="admin-card" style="margin-top:12px;">
        <div class="admin-field"><label>Código</label><input id="admin-plan-code" type="text" value="${esc(item.code||'')}"/></div>
        <div class="admin-field"><label>Nombre</label><input id="admin-plan-title" type="text" value="${esc(item.title||'')}"/></div>
        <div class="admin-field"><label>Cliente</label><input id="admin-plan-client" type="text" value="${esc(item.client||'')}"/></div>
        <div class="admin-field"><label>Responsable</label><input id="admin-plan-responsable" type="text" value="${esc(item.responsable||'')}"/></div>
        <div class="admin-field"><label>Estado</label><select id="admin-plan-status"><option value="Planificada" ${item.status==='Planificada'?'selected':''}>Planificada</option><option value="En curso" ${item.status==='En curso'?'selected':''}>En curso</option><option value="Cerrada" ${item.status==='Cerrada'?'selected':''}>Cerrada</option><option value="Vencida" ${item.status==='Vencida'?'selected':''}>Vencida</option></select></div>
        <div class="admin-field"><label>Fecha inicio</label><input id="admin-plan-start" type="date" value="${esc(item.start||'')}"/></div>
        <div class="admin-field"><label>Fecha fin</label><input id="admin-plan-end" type="date" value="${esc(item.end||'')}"/></div>
        <div class="admin-field"><label>Notas</label><textarea id="admin-plan-notes" rows="3">${esc(item.notes||'')}</textarea></div>
        <div class="admin-card-header" style="margin-top:14px;"><h4>Entregables</h4></div>
        ${deliverableRows}
        <div class="admin-card" style="margin-top:16px; padding:14px; border:1px solid #e2e8f0; background:#f8fafc;">
          <div class="admin-card-header" style="margin-bottom:10px;"><strong>Agregar entregable</strong></div>
          <div class="admin-field"><label>Entregable</label><input id="admin-new-deliverable-title-${index}" type="text" placeholder="Nombre del entregable"/></div>
          <div class="admin-field"><label>Fecha inicio</label><input id="admin-new-deliverable-start-${index}" type="date"/></div>
          <div class="admin-field"><label>Fecha fin</label><input id="admin-new-deliverable-end-${index}" type="date"/></div>
          <div class="admin-actions" style="justify-content:flex-end; gap:10px; margin-top:12px;"><button class="s-btn primary" onclick="addAdminPlanningDeliverable(${index})">Agregar entregable</button></div>
        </div>
        <div class="admin-actions" style="justify-content:flex-end; gap:10px; margin-top:12px;">
          <button class="s-btn ghost" onclick="cancelAdminPlanningEdit()">Cancelar</button>
          <button class="s-btn primary" onclick="saveAdminPlanningEdit(${index})">Guardar cambios</button>
        </div>
      </div>`;
}

function addAdminPlanningDeliverable(index){
  const items = getAdminPlanningItems();
  if(!items[index]) return;
  const title = document.getElementById(`admin-new-deliverable-title-${index}`)?.value.trim();
  const start = document.getElementById(`admin-new-deliverable-start-${index}`)?.value || '';
  const end = document.getElementById(`admin-new-deliverable-end-${index}`)?.value || '';
  if(!title){ alert('Ingresa el nombre del entregable.'); return; }
  const deliverables = Array.isArray(items[index].deliverables) ? items[index].deliverables : [];
  deliverables.push({ title, start, end, subactivities: [] });
  items[index].deliverables = deliverables;
  saveAdminPlanningItems(items);
  renderProjectsSection();
}

function addAdminPlanningSubactivity(itemIndex, deliverableIndex){
  const items = getAdminPlanningItems();
  if(!items[itemIndex]) return;
  const deliverables = Array.isArray(items[itemIndex].deliverables) ? items[itemIndex].deliverables : [];
  const deliverable = deliverables[deliverableIndex];
  if(!deliverable || typeof deliverable === 'string') return;
  const title = document.getElementById(`admin-new-subactivity-title-${itemIndex}-${deliverableIndex}`)?.value.trim();
  const start = document.getElementById(`admin-new-subactivity-start-${itemIndex}-${deliverableIndex}`)?.value || '';
  const end = document.getElementById(`admin-new-subactivity-end-${itemIndex}-${deliverableIndex}`)?.value || '';
  if(!title){ alert('Ingresa el nombre de la subactividad.'); return; }
  const subactivities = Array.isArray(deliverable.subactivities) ? deliverable.subactivities : [];
  subactivities.push({ title, start, end });
  deliverable.subactivities = subactivities;
  deliverables[deliverableIndex] = deliverable;
  items[itemIndex].deliverables = deliverables;
  saveAdminPlanningItems(items);
  renderProjectsSection();
}

function renderAdminPlanningSummary(item){
  if(!item) return '<div class="admin-empty">Registro no encontrado.</div>';
  const deliverables = Array.isArray(item.deliverables) ? item.deliverables : [];
  return `
      <div class="admin-card" style="margin-top:12px;">
        <div class="admin-table-row admin-table-header"><div>Entregable</div><div>Inicio</div><div>Fin</div><div>Subactividades</div></div>
        ${deliverables.map((deliverable,index)=>{
          const title = typeof deliverable==='string' ? deliverable : deliverable.title || `Entregable ${index+1}`;
          const start = typeof deliverable==='object' ? deliverable.start || '' : '';
          const end = typeof deliverable==='object' ? deliverable.end || '' : '';
          const subactivities = Array.isArray(deliverable?.subactivities) ? deliverable.subactivities : [];
          const subs = subactivities.length ? subactivities.map(sub=>`<div class="consultorias-subactivity-item"><strong>${esc(sub.title||'Subactividad')}</strong><div class="consultorias-meta"><span>${sub.start?`Inicio: ${esc(sub.start)}`:''}</span><span>${sub.end?`Fin: ${esc(sub.end)}`:''}</span></div></div>`).join('') : '<div class="admin-empty">Sin subactividades</div>';
          return `<div class="admin-card" style="margin-bottom:12px; padding:12px;"><div class="admin-table-row"><div>${esc(title)}</div><div>${esc(start)}</div><div>${esc(end)}</div><div>${subs}</div></div></div>`;
        }).join('')}
      </div>`;
}

function renderAdminPlanningList(items){
  if(!items.length){ return '<div class="admin-empty">No hay planificación registrada aún.</div>'; }
  return `
      <div class="admin-table" style="margin-top:12px;">
        <div class="admin-table-row admin-table-header"><div>Código</div><div>Nombre</div><div>Cliente</div><div>Responsable</div><div>Estado</div><div>Acciones</div></div>
        ${items.map((item,index)=>`
          <div class="admin-table-row">
            <div>${esc(item.code||'Sin código')}</div>
            <div>${esc(item.title||'Sin nombre')}</div>
            <div>${esc(item.client||'Sin cliente')}</div>
            <div>${esc(item.responsable||'Sin responsable')}</div>
            <div>${esc(item.status||'Planificada')}</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;"><button class="s-btn ghost small" onclick="openAdminPlanningEdit(${index})">Editar</button><button class="s-btn ghost small" onclick="removeAdminPlanningItem(${index})">Eliminar</button></div>
          </div>`).join('')}
      </div>`;
}

function renderAdminPlanningModal(){
  const items = getAdminPlanningItems();
  const editing = ADMIN_UI_STATE.editPlanningIndex !== null && items[ADMIN_UI_STATE.editPlanningIndex];
  const content = editing ? renderAdminPlanningEditor(items[ADMIN_UI_STATE.editPlanningIndex], ADMIN_UI_STATE.editPlanningIndex) : renderAdminPlanningList(items);
  return `
      <div class="admin-modal-backdrop" onclick="closeAdminPlanningManager()">
        <div class="admin-modal-card" onclick="event.stopPropagation()">
          <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Gestión de planificación</h3><button class="s-btn ghost small" onclick="closeAdminPlanningManager()">Cerrar</button></div>
          <div class="admin-note">Aquí puedes revisar los datos de planificación registrados desde la interfaz de usuario, junto con los entregables y subactividades asociados.</div>
          ${content}
        </div>
      </div>`;
}

function openAdminReportsManager(){
  ADMIN_UI_STATE.showReportsList = true;
  renderProjectsSection();
}

function closeAdminReportsManager(){
  ADMIN_UI_STATE.showReportsList = false;
  renderProjectsSection();
}

function openAdminAccountingManager(){
  ADMIN_UI_STATE.showAccountingList = true;
  renderProjectsSection();
}

function closeAdminAccountingManager(){
  ADMIN_UI_STATE.showAccountingList = false;
  renderProjectsSection();
}

function openAdminTdrEdit(index){
  ADMIN_UI_STATE.editTdrIndex = index;
  ADMIN_UI_STATE.showTdrList = true;
  renderProjectsSection();
}

function cancelAdminTdrEdit(){
  ADMIN_UI_STATE.editTdrIndex = null;
  renderProjectsSection();
}

function saveAdminTdrEdit(index){
  const items = getAdminTdrItems();
  if(!items[index]) return;
  const code = document.getElementById('edit-tdr-code')?.value.trim() || '';
  const title = document.getElementById('edit-tdr-title')?.value.trim() || '';
  if(!code || !title){ alert('Completa el código y el nombre de la consultoría.'); return; }
  items[index] = {
    ...items[index],
    code,
    title,
    contratante: document.getElementById('edit-tdr-contratante')?.value.trim() || '',
    responsable: document.getElementById('edit-tdr-responsable')?.value.trim() || '',
    status: document.getElementById('edit-tdr-status')?.value || 'En revisión',
    notes: document.getElementById('edit-tdr-notes')?.value.trim() || ''
  };
  saveAdminTdrItems(items);
  ADMIN_UI_STATE.editTdrIndex = null;
  ADMIN_UI_STATE.showTdrList = true;
  renderProjectsSection();
}

function removeAdminTdr(index){
  const items = getAdminTdrItems();
  if(!items[index]) return;
  if(!confirm('¿Deseas eliminar este TDR del sistema?')) return;
  items.splice(index, 1);
  saveAdminTdrItems(items);
  ADMIN_UI_STATE.showTdrList = true;
  renderProjectsSection();
}

function getAdminConsultoriaTotals(){
  if(typeof getConsultoriaTotalRegistrations === 'function'){
    return getConsultoriaTotalRegistrations();
  }
  try{ return JSON.parse(localStorage.getItem('aris_consultoria_totals')||'[]'); }catch(e){ return []; }
}

function saveAdminConsultoriaTotals(items){
  if(typeof saveConsultoriaTotalRegistrations === 'function'){
    saveConsultoriaTotalRegistrations(items);
    return;
  }
  localStorage.setItem('aris_consultoria_totals', JSON.stringify(items));
}

function openAdminConsultoriaTotalEdit(index){
  ADMIN_UI_STATE.editConsultoriaTotalIndex = index;
  ADMIN_UI_STATE.showAccountingList = true;
  renderProjectsSection();
}

function cancelAdminConsultoriaTotalEdit(){
  ADMIN_UI_STATE.editConsultoriaTotalIndex = null;
  renderProjectsSection();
}

function saveAdminConsultoriaTotalEdit(index){
  const items = getAdminConsultoriaTotals();
  if(!items[index]) return;
  const code = document.getElementById('admin-edit-total-code')?.value.trim() || '';
  const name = document.getElementById('admin-edit-total-name')?.value.trim() || '';
  const contratante = document.getElementById('admin-edit-total-contratante')?.value.trim() || '';
  const rtn = document.getElementById('admin-edit-total-rtn')?.value.trim() || '';
  const duration = document.getElementById('admin-edit-total-duration')?.value.trim() || '';
  const gross = parseFloat(document.getElementById('admin-edit-total-gross')?.value || '0') || 0;
  const retention = parseFloat(document.getElementById('admin-edit-total-retention')?.value || '0') || 0;
  const net = parseFloat(document.getElementById('admin-edit-total-net')?.value || '0') || 0;
  if(!code || gross <= 0){ alert('Completa el código y el monto bruto.'); return; }
  items[index] = {
    ...items[index],
    code,
    name,
    contratante,
    rtn,
    duration,
    grossAmount: gross,
    retentionAmount: retention,
    netAmount: net,
    percentages: document.getElementById('admin-edit-total-percentages')?.value.trim() || items[index].percentages,
    installments: parseInt(document.getElementById('admin-edit-total-installments')?.value || items[index].installments || '1', 10) || 1
  };
  saveAdminConsultoriaTotals(items);
  ADMIN_UI_STATE.editConsultoriaTotalIndex = null;
  ADMIN_UI_STATE.showAccountingList = true;
  renderProjectsSection();
}

function removeAdminConsultoriaTotal(index){
  const items = getAdminConsultoriaTotals();
  if(!items[index]) return;
  if(!confirm('¿Deseas eliminar este registro de monto total?')) return;
  items.splice(index, 1);
  saveAdminConsultoriaTotals(items);
  ADMIN_UI_STATE.editConsultoriaTotalIndex = null;
  ADMIN_UI_STATE.showAccountingList = true;
  renderProjectsSection();
}

function renderProjectsSection(){
  const panel = document.getElementById('admin-projects-panel');
  if(!panel) return;

  const cards = [
    { key:'tdr', label:'TDR', description:'Carga, gestión y análisis de solicitudes de trabajo.', action:'openAdminTdrManager()' },
    { key:'planificacion', label:'PLANIFICACION', description:'Cronogramas, tareas y seguimiento de entregables.', action:'openAdminPlanningManager()' },
    { key:'reportes', label:'INFORMES', description:'Generación y revisión de reportes ejecutivos y técnicos.', action:'openAdminReportsManager()' },
    { key:'contabilidad', label:'CONTABILIDAD / Nuevos Registros', description:'Registros de montos totales, presupuestos y movimientos contables.', action:'openAdminAccountingManager()' }
  ];
  const tdrCfg = ADMIN_CONFIG.tdr || { aiProvider:'gemini', apiKey:'', enabled:true, endpoint:'http://127.0.0.1:5001/api/analyze-tdr' };
  const tdrItems = getAdminTdrItems();
  const showTdrModal = ADMIN_UI_STATE.showTdrList || ADMIN_UI_STATE.editTdrIndex !== null;
  const tdrRows = tdrItems.length ? tdrItems.map((item,index)=>`
      <div class="admin-table-row">
        <div>${esc(item.code || 'Sin código')}</div>
        <div>${esc(item.title || 'Sin nombre')}</div>
        <div>${esc(item.contratante || 'Sin contratante')}</div>
        <div>${esc(item.responsable || 'Sin responsable')}</div>
        <div>${esc(item.status || 'En revisión')}</div>
        <div style="display:flex; gap:8px;">
          <button class="s-btn ghost small" onclick="openAdminTdrEdit(${index})">Editar</button>
          <button class="s-btn ghost small" onclick="removeAdminTdr(${index})">Eliminar</button>
        </div>
      </div>`).join('') : '<div class="admin-empty">No hay TDR registrados aún.</div>';
  const editTdrForm = ADMIN_UI_STATE.editTdrIndex !== null && tdrItems[ADMIN_UI_STATE.editTdrIndex] ? `
      <div class="admin-field"><label>Código</label><input id="edit-tdr-code" type="text" value="${esc(tdrItems[ADMIN_UI_STATE.editTdrIndex].code || '')}"/></div>
      <div class="admin-field"><label>Nombre</label><input id="edit-tdr-title" type="text" value="${esc(tdrItems[ADMIN_UI_STATE.editTdrIndex].title || '')}"/></div>
      <div class="admin-field"><label>Contratante</label><input id="edit-tdr-contratante" type="text" value="${esc(tdrItems[ADMIN_UI_STATE.editTdrIndex].contratante || '')}"/></div>
      <div class="admin-field"><label>Responsable</label><input id="edit-tdr-responsable" type="text" value="${esc(tdrItems[ADMIN_UI_STATE.editTdrIndex].responsable || '')}"/></div>
      <div class="admin-field"><label>Estado</label><select id="edit-tdr-status"><option value="En revisión" ${tdrItems[ADMIN_UI_STATE.editTdrIndex].status === 'En revisión' ? 'selected' : ''}>En revisión</option><option value="Aprobada" ${tdrItems[ADMIN_UI_STATE.editTdrIndex].status === 'Aprobada' ? 'selected' : ''}>Aprobada</option><option value="Pendiente" ${tdrItems[ADMIN_UI_STATE.editTdrIndex].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option></select></div>
      <div class="admin-field"><label>Observaciones</label><textarea id="edit-tdr-notes" rows="4">${esc(tdrItems[ADMIN_UI_STATE.editTdrIndex].notes || '')}</textarea></div>` : '';
  const tdrManagerModal = showTdrModal ? `
      <div class="admin-modal-backdrop" onclick="closeAdminTdrManager()">
        <div class="admin-modal-card" onclick="event.stopPropagation()">
          <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Registro de TDR y consultorías</h3><button class="s-btn ghost small" onclick="closeAdminTdrManager()">Cerrar</button></div>
          <div class="admin-note">Lista de registros guardados desde la interfaz de usuario con opciones para editar o eliminar.</div>
          ${ADMIN_UI_STATE.editTdrIndex !== null && tdrItems[ADMIN_UI_STATE.editTdrIndex] ? `
            <div class="admin-card" style="margin-top:12px;">
              ${editTdrForm}
              <div class="admin-actions" style="gap:10px; margin-top:12px;">
                <button class="s-btn primary" onclick="saveAdminTdrEdit(${ADMIN_UI_STATE.editTdrIndex})">Guardar cambios</button>
                <button class="s-btn ghost" onclick="cancelAdminTdrEdit()">Cancelar</button>
              </div>
            </div>` : `
            <div class="admin-card" style="margin-top:12px;">
              <div class="admin-table">
                <div class="admin-table-row admin-table-header"><div>Código</div><div>Nombre</div><div>Contratante</div><div>Responsable</div><div>Estado</div><div>Acciones</div></div>
                ${tdrRows}
              </div>
            </div>`}
        </div>
      </div>` : '';
  const planningManagerModal = ADMIN_UI_STATE.showPlanningList ? renderAdminPlanningModal() : '';
  const reportsManagerModal = ADMIN_UI_STATE.showReportsList ? `
      <div class="admin-modal-backdrop" onclick="closeAdminReportsManager()">
        <div class="admin-modal-card" onclick="event.stopPropagation()">
          <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Gestión de reportes</h3><button class="s-btn ghost small" onclick="closeAdminReportsManager()">Cerrar</button></div>
          <div class="admin-note">Aquí se podrán administrar los reportes generados para cada consultoría.</div>
          <div class="admin-card" style="margin-top:12px;">
            <div class="admin-empty">Próximamente podrás ver, editar y eliminar reportes desde esta vista.</div>
          </div>
        </div>
      </div>` : '';
  const consultoriaTotalItems = getAdminConsultoriaTotals();
  const totalRowItems = consultoriaTotalItems.length ? consultoriaTotalItems.map((item, index) => `
            <div class="admin-table-row">
              <div>${esc(item.code || 'Sin código')}</div>
              <div>${esc(item.name || 'Sin nombre')}</div>
              <div>${esc(item.contratante || 'Sin contratante')}</div>
              <div>${esc(item.rtn || 'Sin RTN')}</div>
              <div>${item.grossAmount != null ? esc(item.grossAmount.toString()) : '0'}</div>
              <div>${item.netAmount != null ? esc(item.netAmount.toString()) : '0'}</div>
              <div style="display:flex; gap:8px;">
                <button class="s-btn ghost small" onclick="openAdminConsultoriaTotalEdit(${index})">Editar</button>
                <button class="s-btn ghost small" onclick="removeAdminConsultoriaTotal(${index})">Eliminar</button>
              </div>
            </div>`).join('') : '';
  const consultoriaTotalEditForm = ADMIN_UI_STATE.editConsultoriaTotalIndex !== null && consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex] ? `
      <div class="admin-card" style="margin-top:12px;">
        <div class="admin-field"><label>Código</label><input id="admin-edit-total-code" type="text" value="${esc(consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].code || '')}"/></div>
        <div class="admin-field"><label>Nombre</label><input id="admin-edit-total-name" type="text" value="${esc(consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].name || '')}"/></div>
        <div class="admin-field"><label>Contratante</label><input id="admin-edit-total-contratante" type="text" value="${esc(consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].contratante || '')}"/></div>
        <div class="admin-field"><label>RTN</label><input id="admin-edit-total-rtn" type="text" value="${esc(consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].rtn || '')}"/></div>
        <div class="admin-field"><label>Duración</label><input id="admin-edit-total-duration" type="text" value="${esc(consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].duration || '')}"/></div>
        <div class="admin-field"><label>Monto bruto</label><input id="admin-edit-total-gross" type="number" step="0.01" value="${esc((consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].grossAmount || 0).toString())}"/></div>
        <div class="admin-field"><label>Retención 12.5%</label><input id="admin-edit-total-retention" type="number" step="0.01" value="${esc((consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].retentionAmount || 0).toString())}"/></div>
        <div class="admin-field"><label>Monto neto</label><input id="admin-edit-total-net" type="number" step="0.01" value="${esc((consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].netAmount || 0).toString())}"/></div>
        <div class="admin-field"><label>Desembolsos y porcentajes</label><input id="admin-edit-total-percentages" type="text" value="${esc(consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].percentages || '')}"/></div>
        <div class="admin-field"><label>Cuotas / Número</label><input id="admin-edit-total-installments" type="number" min="1" value="${esc((consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex].installments || 1).toString())}"/></div>
      </div>` : '';
  const accountingManagerModal = ADMIN_UI_STATE.showAccountingList ? `
      <div class="admin-modal-backdrop" onclick="closeAdminAccountingManager()">
        <div class="admin-modal-card" onclick="event.stopPropagation()">
          <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Gestión contable — Nuevos registros</h3><button class="s-btn ghost small" onclick="closeAdminAccountingManager()">Cerrar</button></div>
          <div class="admin-note">Aquí se listan los registros de monto total creados desde la interfaz de usuario. Puedes editar o eliminar cada registro.</div>
          ${ADMIN_UI_STATE.editConsultoriaTotalIndex !== null && consultoriaTotalItems[ADMIN_UI_STATE.editConsultoriaTotalIndex] ? `
            ${consultoriaTotalEditForm}
            <div class="admin-actions" style="gap:10px; margin-top:12px;">
              <button class="s-btn primary" onclick="saveAdminConsultoriaTotalEdit(${ADMIN_UI_STATE.editConsultoriaTotalIndex})">Guardar cambios</button>
              <button class="s-btn ghost" onclick="cancelAdminConsultoriaTotalEdit()">Cancelar</button>
            </div>` : `
            <div class="admin-card" style="margin-top:12px;">
              ${consultoriaTotalItems.length ? `
                <div class="admin-table">
                  <div class="admin-table-row admin-table-header"><div>Código</div><div>Nombre</div><div>Contratante</div><div>RTN</div><div>Monto bruto</div><div>Monto neto</div><div>Acciones</div></div>
                  ${totalRowItems}
                </div>` : `<div class="admin-empty">No hay registros de monto total aún.</div>`}
            </div>`}
        </div>
      </div>` : '';

  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Gestión de Proyectos o Consultorías</h3></div>
      <div class="admin-note">Accede a las subáreas del subsistema de consultorías desde administración.</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top:16px;">
        ${cards.map(item => `
          <div class="admin-card" style="padding:18px; border:1px solid rgba(148,163,184,0.25); border-radius:12px; background:rgba(15,23,42,0.35);">
            <div style="font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:#93c5fd; margin-bottom:8px;">${esc(item.label)}</div>
            <div style="color:var(--text-mid); margin-bottom:16px; min-height:52px;">${esc(item.description)}</div>
            <button class="s-btn primary" onclick="${item.action}">Abrir</button>
          </div>
        `).join('')}
      </div>
    </div>

    ${tdrManagerModal}
    ${planningManagerModal}
    ${reportsManagerModal}
    ${accountingManagerModal}

    <div class="admin-card" style="margin-top:18px;">
      <div class="admin-card-header" style="cursor:pointer;" onclick="toggleConsultoriaAiCard()" tabindex="0" role="button" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleConsultoriaAiCard(); }">
        <h3>Integración IA</h3>
        <span id="consultoria-ia-toggle" style="font-size:14px; color:var(--text-mid);">+</span>
      </div>
      <div id="consultoria-ia-body" style="display:none;">
        <div class="admin-field">
          <label>Proveedor</label>
          <select id="admin-ia-provider">
            <option value="gemini" ${tdrCfg.aiProvider === 'gemini' ? 'selected' : ''}>Gemini</option>
          </select>
        </div>
        <div class="admin-field">
          <label>Endpoint</label>
          <input id="admin-ia-endpoint" type="text" value="${esc(tdrCfg.endpoint || 'http://127.0.0.1:5001/api/analyze-tdr')}" placeholder="http://127.0.0.1:5001/api/analyze-tdr"/>
        </div>
        <div class="admin-field">
          <label>API Key Gemini</label>
          <input id="admin-ia-api-key" type="password" value="${esc(tdrCfg.apiKey || '')}" placeholder="Clave de Google AI Studio"/>
        </div>
        <div class="admin-field">
          <label>Habilitar análisis automático</label>
          <label class="admin-section-checkbox"><input id="admin-ia-enabled" type="checkbox" ${tdrCfg.enabled !== false ? 'checked' : ''}/> Activar integración de IA en TDR</label>
        </div>
        <div class="admin-note">La integración de Gemini se ejecuta desde el backend y no se expone en la interfaz del usuario final.</div>
        <div class="admin-actions" style="justify-content:flex-start; margin-top:12px;">
          <button class="s-btn primary" onclick="saveConsultoriaAiConfig()">Guardar configuración</button>
        </div>
      </div>
    </div>`;
}

function toggleConsultoriaAiCard(){
  const body = document.getElementById('consultoria-ia-body');
  const toggle = document.getElementById('consultoria-ia-toggle');
  if(!body || !toggle) return;
  const isVisible = body.style.display !== 'none';
  body.style.display = isVisible ? 'none' : 'block';
  toggle.textContent = isVisible ? '+' : '−';
}

function renderReportsSection(){
  const panel = document.getElementById('admin-reports-panel');
  if(!panel) return;
  const r = ADMIN_CONFIG.reports || {};
  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Informe</h3></div>
      <div class="admin-field"><label>Título predeterminado</label><input id="admin-report-title" type="text" value="${esc(r.defaultTitle||'Informe de Monitoreo')}"/></div>
      <div class="admin-field"><label>Subtítulo predeterminado</label><input id="admin-report-subtitle" type="text" value="${esc(r.defaultSubtitle||'SINAPH')}"/></div>
      <div class="admin-field"><label>Días de rango por defecto</label><input id="admin-report-days" type="number" min="1" max="365" value="${esc(r.dateRangeDays||30)}"/></div>
      <div class="admin-field"><label>Secciones incluidas</label>
        <label class="admin-section-checkbox"><input id="admin-report-secs-stats" type="checkbox" ${r.showStats ? 'checked' : ''}/> Resumen estadístico</label>
        <label class="admin-section-checkbox"><input id="admin-report-secs-charts" type="checkbox" ${r.showCharts ? 'checked' : ''}/> Gráficos</label>
      </div>
      <div class="admin-field"><label>Opciones de exportación</label>
        <label class="admin-section-checkbox"><input id="admin-report-export-pdf" type="checkbox" ${r.allowPdf ? 'checked' : ''}/> PDF</label>
        <label class="admin-section-checkbox"><input id="admin-report-export-word" type="checkbox" ${r.allowWord ? 'checked' : ''}/> Word</label>
      </div>
      <div class="admin-field"><label>Proveedor de IA</label>
        <select id="admin-report-ai-provider">
          <option value="openai" ${r.aiProvider === 'openai' ? 'selected' : ''}>OpenAI</option>
          <option value="gemini" ${r.aiProvider === 'gemini' ? 'selected' : ''}>Gemini</option>
        </select>
      </div>
      <div class="admin-field"><label>Clave de API</label><input id="admin-report-ai-key" type="password" placeholder="Clave de OpenAI o Google AI Studio" value="${esc(r.aiApiKey||'')}"/></div>
      <div class="admin-field"><label>IA habilitada</label><label class="admin-section-checkbox"><input id="admin-report-ai-enabled" type="checkbox" ${r.enableAiAnalysis ? 'checked' : ''}/> Usar IA para análisis</label></div>
      <div class="admin-note">Ingresa la clave correspondiente a tu proveedor seleccionado: OpenAI para OpenAI, o Google AI Studio para Gemini.</div>
      <div class="admin-actions" style="margin-top:16px; justify-content:flex-start;">
        <button class="s-btn primary" onclick="openReports()">Abrir módulo de informes</button>
      </div>
    </div>`;
}

function renderEnvironmentalSection(){
  const panel = document.getElementById('admin-environmental-panel');
  if(!panel) return;
  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Gestión y Análisis Ambiental</h3></div>
      <div class="admin-note">Configura integraciones, informes, gráficos y mapas ambientales desde un solo lugar.</div>
      <div class="admin-actions" style="flex-wrap:wrap; gap:10px; margin-top:16px;">
        <button class="s-btn primary" onclick="showAdminSection('integration')">Integración EarthRanger</button>
        <button class="s-btn ghost" onclick="showKoboIntegrationOption()">Integración KoboToolbox</button>
        <button class="s-btn ghost" onclick="showAdminSection('reports')">Informe</button>
        <button class="s-btn ghost" onclick="showAdminSection('charts')">Gráficos</button>
        <button class="s-btn ghost" onclick="showAdminSection('maps')">Mapas</button>
      </div>
    </div>`;
}

function showKoboIntegrationOption(){
  const panel = document.getElementById('admin-environmental-panel');
  if(!panel) return;
  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Integración KoboToolbox</h3></div>
      <div class="admin-note">Conecta un formulario de KoboToolbox para preparar sus envíos como registros ambientales.</div>
      <div class="admin-actions" style="margin-top:16px;justify-content:flex-start;gap:10px;">
        <button class="s-btn primary" onclick="showKoboIntegrationForm()">Configurar KoboToolbox</button>
        <button class="s-btn ghost" onclick="showAdminSection('environmental')">Volver al resumen</button>
      </div>
    </div>`;
}

function showKoboIntegrationForm(){
  const panel = document.getElementById('admin-environmental-panel');
  if(!panel) return;
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <button class="s-btn ghost small" onclick="showKoboIntegrationOption()">Volver</button>
      <h3 style="margin:0;">Configurar KoboToolbox</h3>
    </div>
    ${renderKoboConfiguration()}`;
}

function renderInventorySection(){
  const panel = document.getElementById('admin-inventory-panel');
  if(!panel) return;
  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Gestión de Equipo o Inventarios</h3></div>
      <div class="admin-note">Sección reservada para el futuro. Por ahora no tiene opciones internas definidas.</div>
      <div class="admin-field"><label>Estado actual</label><p class="admin-note">No hay configuraciones disponibles todavía.</p></div>
    </div>`;
}

function renderChartsSection(){
  const panel = document.getElementById('admin-charts-panel');
  if(!panel) return;
  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Gráficos</h3></div>
      <div class="admin-note">Configuraciones de visualización de gráficos y paneles. Aquí se agregarán opciones para personalizar dashboards y plantillas de informes.</div>
    </div>`;
}

function renderMapsSection(){
  const panel = document.getElementById('admin-maps-panel');
  if(!panel) return;
  const geo = ADMIN_CONFIG.geoportal || {};
  const layerType = geo.layerType || 'wms';
  const layers = Array.isArray(geo.layers) ? geo.layers : [];
  const layersHtml = layers.length ? layers.map((layer,index)=>{
    return `
      <div class="admin-table-row">
        <div>${esc(layer.name||`Capa ${index+1}`)}</div>
        <div>${esc(layer.layerType.toUpperCase())}</div>
        <div>${esc(layer.layerName || layer.url)}</div>
        <div style="display:flex; gap:8px;">
          <button class="s-btn ghost small" onclick="showGeoportalConfigForm()">Editar conexión</button>
          <button class="s-btn ghost small" onclick="removeGeoportalLayer(${index})">Eliminar</button>
        </div>
      </div>`;
  }).join('') : '<div class="admin-empty">No hay capas registradas.</div>';

  const newLayerForm = ADMIN_UI_STATE.showNewGeoportalLayerForm ? `
      <div class="admin-modal-backdrop" onclick="cancelNewGeoportalLayerForm()">
        <div class="admin-modal-card" onclick="event.stopPropagation()">
          <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Conectar nueva capa</h3><button class="s-btn ghost small" onclick="cancelNewGeoportalLayerForm()">Cerrar</button></div>
          <div class="admin-field"><label>Nombre de la capa</label><input id="new-geo-layer-name" type="text" placeholder="Nombre descriptivo de la capa"/></div>
          <div class="admin-field"><label>Tipo de capa</label><select id="new-geo-layer-type"><option value="wms">WMS</option><option value="xyz">XYZ</option></select></div>
          <div class="admin-field"><label>Nombre de capa WMS</label><input id="new-geo-layer-wms-name" type="text" placeholder="Nombre de la capa WMS (solo WMS)"/></div>
          <div class="admin-field"><label>URL de la capa</label><input id="new-geo-layer-url" type="text" placeholder="URL de servicio WMS o XYZ" value="${esc(geo.url||'')}"/></div>
          <div class="admin-field"><label>Atribución</label><input id="new-geo-layer-attribution" type="text" placeholder="Texto de atribución" value="${esc(geo.attribution||'© ICF Honduras')}"/></div>
          <div class="admin-field"><label>Usuario (opcional)</label><input id="new-geo-layer-username" type="text" placeholder="Usuario para autenticación" value="${esc(geo.username||'')}"/></div>
          <div class="admin-field"><label>Contraseña (opcional)</label><input id="new-geo-layer-password" type="password" placeholder="Contraseña para autenticación" value="${esc(geo.password||'')}"/></div>
          <div class="admin-field"><label>Proxy CORS (opcional)</label><input id="new-geo-layer-proxy" type="text" placeholder="https://mi-proxy.com/?url=" value="${esc(geo.proxy||getDefaultLocalGeoportalProxy())}"/></div>
          <div class="admin-actions" style="gap:10px; margin-top:10px;">
            <button class="s-btn primary" onclick="saveNewGeoportalLayer()">Guardar capa</button>
            <button class="s-btn ghost" onclick="cancelNewGeoportalLayerForm()">Cancelar</button>
          </div>
        </div>
      </div>
      ` : '';

  const geoportalConfigForm = ADMIN_UI_STATE.showGeoportalConfigForm ? `
      <div class="admin-modal-backdrop" onclick="cancelGeoportalConfigForm()">
        <div class="admin-modal-card" onclick="event.stopPropagation()">
          <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:center;"><h3>Editar conexión al geoportal</h3><button class="s-btn ghost small" onclick="cancelGeoportalConfigForm()">Cerrar</button></div>
          <div class="admin-field"><label>Nombre del geoportal</label><input id="admin-geo-name" type="text" value="${esc(geo.name||'Geoportal ICF Honduras')}" placeholder="Nombre para mostrar en el sistema"/></div>
          <div class="admin-field"><label>URL del geoportal</label><input id="admin-geo-url" type="text" value="${esc(geo.url||'')}" placeholder="https://geoportal.icf.gob.hn/ogc/wms"/></div>
          <div class="admin-field"><label>Tipo de capa</label><select id="admin-geo-layer-type"><option value="wms" ${layerType==='wms'?'selected':''}>WMS</option><option value="xyz" ${layerType==='xyz'?'selected':''}>XYZ</option></select></div>
          <div class="admin-field"><label>Nombre de capa WMS</label><input id="admin-geo-layer-name" type="text" value="${esc(geo.layerName||'')}" placeholder="Nombre de la capa para WMS (por ejemplo: capa_id)"/></div>
          <div class="admin-field"><label>Atribución</label><input id="admin-geo-attribution" type="text" value="${esc(geo.attribution||'© ICF Honduras')}" placeholder="Texto de atribución para el mapa"/></div>
          <div class="admin-field"><label>Usuario (opcional)</label><input id="admin-geo-username" type="text" value="${esc(geo.username||'')}" placeholder="Usuario para autenticación si aplica"/></div>
          <div class="admin-field"><label>Contraseña (opcional)</label><input id="admin-geo-password" type="password" value="${esc(geo.password||'')}" placeholder="Contraseña para autenticación si aplica"/></div>
          <div class="admin-field"><label>Proxy CORS (opcional)</label><div style="display:flex;gap:8px;"><input id="admin-geo-proxy" type="text" value="${esc(geo.proxy||getDefaultLocalGeoportalProxy())}" placeholder="https://mi-proxy.com/?url=" style="flex:1;"/><button class="s-btn ghost small" onclick="fillLocalGeoportalProxy()">Usar proxy local</button></div></div>
          <div class="admin-actions" style="gap:10px; margin-top:10px;">
            <button class="s-btn primary" onclick="saveGeoportalSettings()">Guardar geoportal</button>
            <button class="s-btn ghost" onclick="testGeoportalConnection()">Probar conexión</button>
          </div>
          <div class="admin-note" style="margin-top:10px;">Ejecuta <strong>node proxy.js</strong> en la carpeta <code>aris-test</code> si el geoportal bloquea CORS. Si el campo de proxy está vacío, el botón de prueba rellena automáticamente la URL local <code>http://127.0.0.1:5000/?url=</code> y ejecuta la prueba.</div>
        </div>
      </div>
    ` : '';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3>Geoportal de mapas</h3>
      <div><button class="s-btn primary" onclick="showNewGeoportalLayerForm()">Conectar nueva capa</button></div>
    </div>
    <div class="admin-card">
      ${geo.url ? `<div class="admin-note">${esc(geo.name || 'Geoportal ICF Honduras')} · ${esc(geo.layerType?.toUpperCase() || 'WMS')} · ${esc(geo.layerName || geo.url)}</div>` : '<div class="admin-empty">No hay configuración de geoportal. Presiona editar para conectar uno.</div>'}
      <div class="admin-table" style="margin-top:16px;">
        <div class="admin-table-row admin-table-header"><div>Nombre</div><div>Tipo</div><div>Identificador</div><div>Acciones</div></div>
        ${layersHtml}
      </div>
    </div>
    ${newLayerForm}
    ${geoportalConfigForm}`;
}

function renderGeneralSettingsSection(){
  const panel = document.getElementById('admin-settings-panel');
  if(!panel) return;
  const users = ADMIN_CONFIG.users || [];
  const userRows = users.length ? users.map((user,index)=>{
    return `
      <div class="admin-table-row">
        <div>${esc(`${user.firstName||''} ${user.lastName||''}`.trim() || user.username)}</div>
        <div>${esc(user.username)}</div>
        <div>${esc(user.email||'')}</div>
        <div>${esc(user.role)}</div>
        <div>${esc(formatUserSections(user.sections))}</div>
        <div>${esc(user.sections?.includes('environmental') ? (user.site || 'General') : 'General')}</div>
        <div style="display:flex; gap:8px;">
          <button class="s-btn ghost small" onclick="editAdminUser(${index})">Editar</button>
          <button class="s-btn ghost small" onclick="removeAdminUser(${index})">Eliminar</button>
        </div>
      </div>`;
  }).join('') : '<div class="admin-empty">No hay usuarios definidos.</div>';

  const newUserForm = ADMIN_UI_STATE.showNewUserForm ? `
      <div class="admin-card" style="margin-top:16px;">
        <div class="admin-card-header"><h4>Agregar usuario</h4></div>
        <div class="admin-field"><label>Nombre</label><input id="new-user-firstname" type="text" placeholder="Nombre"/></div>
        <div class="admin-field"><label>Apellido</label><input id="new-user-lastname" type="text" placeholder="Apellido"/></div>
        <div class="admin-field"><label>Correo Electrónico</label><input id="new-user-email" type="email" placeholder="Correo electrónico"/></div>
        <div class="admin-field"><label>Nombre de usuario</label><input id="new-user-username" type="text" placeholder="Nombre de usuario"/></div>
        <div class="admin-field"><label>Rol</label><select id="new-user-role"><option value="cliente">Cliente</option><option value="admin">Administrador</option></select></div>
        <div class="admin-field"><label>Secciones permitidas</label>${renderSectionCheckboxes(['environmental','projects','inventory','settings'], 'new-user')}</div>
        <div class="admin-field"><label>Sitio asignado (solo para Ambiental)</label><select id="new-user-site">${renderSiteSelectionOptions('todas')}</select></div>
        <div class="admin-field"><label>Contraseña</label><input id="new-user-password" type="password" placeholder="Contraseña"/></div>
        <div class="admin-actions" style="margin-top:10px; gap:10px;">
          <button class="s-btn primary" onclick="saveNewAdminUser()">Guardar usuario</button>
          <button class="s-btn ghost" onclick="cancelNewAdminUser()">Cancelar</button>
        </div>
      </div>
    ` : '';

  panel.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header"><h3>Usuarios</h3></div>
      <div class="admin-note">Administra usuarios, roles, secciones y asignaciones de sitio EarthRanger.</div>
      <div class="admin-actions" style="justify-content:flex-start; gap:10px; margin-top:12px;">
        <button class="s-btn primary" onclick="showNewAdminUserForm()">Agregar usuario</button>
        <button class="s-btn ghost" onclick="showAdminSection('users')">Ir a Usuarios</button>
      </div>
      ${newUserForm}
      <div class="admin-table" style="margin-top:16px;">
        <div class="admin-table-row admin-table-header"><div>Nombre</div><div>Usuario</div><div>Correo</div><div>Rol</div><div>Secciones</div><div>Sitio ER</div><div>Acciones</div></div>
        ${userRows}
      </div>
    </div>
    <div class="admin-card" style="margin-top:18px;">
      <div class="admin-card-header"><h3>Pantalla de bienvenida</h3></div>
      <div class="admin-field"><label>Texto de bienvenida</label><textarea id="admin-welcome-text" rows="4" style="min-height:100px; width:100%;">Bienvenido a ARIS. Plataforma de analítica ambiental e inteligencia operativa.</textarea></div>
      <div class="admin-actions" style="margin-top:14px; justify-content:flex-start;">
        <button class="s-btn primary" onclick="saveWelcomeScreenConfig()">Guardar bienvenida</button>
      </div>
    </div>`;

  if(ADMIN_UI_STATE.showNewUserForm) toggleUserSectionSiteField('new-user');
}

function formatUserSections(sections){
  if(!Array.isArray(sections) || sections.length===0) return 'Ninguna';
  return sections.map(key=>{
    const option = USER_SECTION_OPTIONS.find(o=>o.key===key);
    return option ? option.label : key;
  }).join(', ');
}

function renderSectionCheckboxes(sections, prefix){
  const selected = Array.isArray(sections) ? sections : [];
  return USER_SECTION_OPTIONS.map(option => {
    const checked = selected.includes(option.key) ? 'checked' : '';
    return `<label class="admin-section-checkbox"><input type="checkbox" id="${prefix}-section-${option.key}" value="${option.key}" ${checked} onchange="toggleUserSectionSiteField('${prefix}')"/> ${esc(option.label)}</label>`;
  }).join('');
}

function toggleUserSectionSiteField(prefix){
  const envCheckbox = document.getElementById(`${prefix}-section-environmental`);
  const siteSelect = document.getElementById(`${prefix}-site`);
  if(!siteSelect) return;
  if(envCheckbox && envCheckbox.checked){
    siteSelect.disabled = false;
  } else {
    siteSelect.disabled = true;
  }
}

function renderSiteSelectionOptions(selected){
  const options = [`<option value="todas" ${selected==='todas'?'selected':''}>General</option>`];
  if(ADMIN_CONFIG.sites.length){
    ADMIN_CONFIG.sites.forEach(site=>{
      options.push(`<option value="${esc(site.name)}" ${site.name===selected?'selected':''}>${esc(site.name)}</option>`);
    });
  } else {
    options.push('<option value="" disabled>No hay sitios sincronizados</option>');
  }
  return options.join('');
}

function renderRoleOptions(selected){
  const roles = ['cliente','admin'];
  return roles.map(role=>`<option value="${role}" ${selected===role?'selected':''}>${role==='admin'?'Administrador':'Cliente'}</option>`).join('');
}

function editIntegrationSite(index){
  ADMIN_UI_STATE.editSiteIndex = index;
  ADMIN_UI_STATE.showNewSiteForm = false;
  ADMIN_UI_STATE.editUserIndex = null;
  renderAdminPanel();
}

function saveIntegrationSite(index){
  const url = normalizeUrl(document.getElementById(`edit-site-url-${index}`)?.value);
  const token = document.getElementById(`edit-site-token-${index}`)?.value.trim();
  const name = document.getElementById(`edit-site-name-${index}`)?.value.trim();
  const externalId = document.getElementById(`edit-site-external-${index}`)?.value.trim();
  const daysValue = document.getElementById(`edit-site-days-${index}`)?.value;
  const days = daysValue ? parseInt(daysValue,10) : ADMIN_CONFIG.days;
  if(!name){
    alert('Ingrese el nombre del sitio.');
    return;
  }
  if(!url && !ADMIN_CONFIG.url){
    alert('Ingrese la URL de EarthRanger.');
    return;
  }
  if(!token && !ADMIN_CONFIG.token){
    alert('Ingrese el token de EarthRanger.');
    return;
  }
  if(!ADMIN_CONFIG.sites[index]) return;
  if(url) ADMIN_CONFIG.sites[index].url = url;
  if(token) ADMIN_CONFIG.sites[index].token = token;
  ADMIN_CONFIG.sites[index].name = name;
  ADMIN_CONFIG.sites[index].externalId = externalId;
  ADMIN_CONFIG.sites[index].days = days;
  persistAdminData();
  ADMIN_UI_STATE.editSiteIndex = null;
  renderAdminPanel();
}

function cancelEditIntegrationSite(){
  ADMIN_UI_STATE.editSiteIndex = null;
  renderAdminPanel();
}

function editAdminUser(index){
  ADMIN_UI_STATE.editUserIndex = index;
  ADMIN_UI_STATE.showNewUserForm = false;
  ADMIN_UI_STATE.editSiteIndex = null;
  renderAdminPanel();
}

function saveAdminUser(index){
  const firstName = document.getElementById(`edit-user-firstname-${index}`)?.value.trim();
  const username = document.getElementById(`edit-user-username-${index}`)?.value.trim();
  const email = document.getElementById(`edit-user-email-${index}`)?.value.trim();
  const role = document.getElementById(`edit-user-role-${index}`)?.value;
  const sections = USER_SECTION_OPTIONS.filter(option => document.getElementById(`edit-user-${index}-section-${option.key}`)?.checked).map(option=>option.key);
  let site = document.getElementById(`edit-user-${index}-site`)?.value;
  if(!firstName){
    alert('Ingrese el nombre del usuario.');
    return;
  }
  if(!username){
    alert('Ingrese el nombre de usuario.');
    return;
  }
  if(!ADMIN_CONFIG.users[index]) return;
  if(!sections.includes('environmental')){
    site = 'todas';
  }
  ADMIN_CONFIG.users[index].firstName = firstName;
  ADMIN_CONFIG.users[index].username = username;
  ADMIN_CONFIG.users[index].name = username;
  ADMIN_CONFIG.users[index].email = email;
  ADMIN_CONFIG.users[index].role = role || 'cliente';
  ADMIN_CONFIG.users[index].sections = sections;
  ADMIN_CONFIG.users[index].site = site || 'todas';
  persistAdminData();
  ADMIN_UI_STATE.editUserIndex = null;
  renderLoginUsers();
  renderAdminPanel();
}

function cancelEditAdminUser(){
  ADMIN_UI_STATE.editUserIndex = null;
  renderAdminPanel();
}

function updateAdminUser(index, field, value){
  if(!ADMIN_CONFIG.users[index]) return;
  ADMIN_CONFIG.users[index][field] = value;
}

function removeAdminUser(index){
  ADMIN_CONFIG.users.splice(index,1);
  persistAdminData();
  renderAdminPanel();
}

function addAdminUser(){
  const defaultSite = ADMIN_CONFIG.sites?.[0]?.name || 'todas';
  ADMIN_CONFIG.users.push({name:'nuevo',role:'cliente',site:defaultSite,password:''});
  renderAdminPanel();
}

function addIntegrationSite(){
  ADMIN_CONFIG.sites.push({name:'Nuevo sitio', externalId:'', id:`site-${Date.now()}`});
  renderAdminPanel();
}

function updateIntegrationSite(index, field, value){
  if(!ADMIN_CONFIG.sites[index]) return;
  ADMIN_CONFIG.sites[index][field] = value;
}

function removeIntegrationSite(index){
  ADMIN_CONFIG.sites.splice(index,1);
  persistAdminData();
  renderAdminPanel();
}

function showNewIntegrationSiteForm(){
  ADMIN_UI_STATE.showNewSiteForm = true;
  ADMIN_UI_STATE.showNewUserForm = false;
  renderAdminPanel();
}

async function saveNewIntegrationSite(){
  const url = normalizeUrl(document.getElementById('new-site-url')?.value);
  const token = document.getElementById('new-site-token')?.value.trim();
  const name = document.getElementById('new-site-name')?.value.trim();
  const externalId = document.getElementById('new-site-external')?.value.trim();
  if(!name){
    alert('Ingrese el nombre del sitio.');
    return;
  }
  if(!url && !ADMIN_CONFIG.url){
    alert('Ingrese la URL de EarthRanger.');
    return;
  }
  if(!token && !ADMIN_CONFIG.token){
    alert('Ingrese el token de EarthRanger.');
    return;
  }
  if(url) ADMIN_CONFIG.url = url;
  if(token) ADMIN_CONFIG.token = token;
  try{
    await verifyEarthRangerConnection(url, token);
    ADMIN_CONFIG.sites.push({name, externalId, url: url || ADMIN_CONFIG.url, token: token || ADMIN_CONFIG.token, id:`site-${Date.now()}`});
    persistAdminData();
    sessionStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_CONFIG.token);
    populateLoginDefaults();
    ADMIN_UI_STATE.showNewSiteForm = false;
    renderAdminPanel();
    alert('Conexión verificada y sitio agregado.');
  }catch(error){
    alert('No se pudo verificar la conexión con EarthRanger: ' + error.message);
  }
}

function cancelNewIntegrationSite(){
  ADMIN_UI_STATE.showNewSiteForm = false;
  renderAdminPanel();
}

function showNewAdminUserForm(){
  ADMIN_UI_STATE.showNewUserForm = true;
  ADMIN_UI_STATE.showNewSiteForm = false;
  ADMIN_UI_STATE.showNewGeoportalLayerForm = false;
  renderAdminPanel();
}

function showNewGeoportalLayerForm(){
  ADMIN_UI_STATE.showNewGeoportalLayerForm = true;
  ADMIN_UI_STATE.showGeoportalConfigForm = false;
  ADMIN_UI_STATE.showNewUserForm = false;
  ADMIN_UI_STATE.showNewSiteForm = false;
  renderAdminPanel();
}

function showGeoportalConfigForm(){
  ADMIN_UI_STATE.showGeoportalConfigForm = true;
  ADMIN_UI_STATE.showNewGeoportalLayerForm = false;
  ADMIN_UI_STATE.showNewUserForm = false;
  ADMIN_UI_STATE.showNewSiteForm = false;
  renderAdminPanel();
}

function cancelNewGeoportalLayerForm(){
  ADMIN_UI_STATE.showNewGeoportalLayerForm = false;
  renderAdminPanel();
}

function cancelGeoportalConfigForm(){
  ADMIN_UI_STATE.showGeoportalConfigForm = false;
  renderAdminPanel();
}

function saveNewGeoportalLayer(){
  const name = document.getElementById('new-geo-layer-name')?.value.trim();
  const type = document.getElementById('new-geo-layer-type')?.value || 'wms';
  const url = document.getElementById('new-geo-layer-url')?.value.trim();
  const layerName = document.getElementById('new-geo-layer-wms-name')?.value.trim();
  const attribution = document.getElementById('new-geo-layer-attribution')?.value.trim() || '© ICF Honduras';
  const username = document.getElementById('new-geo-layer-username')?.value.trim() || '';
  const password = document.getElementById('new-geo-layer-password')?.value || '';
  const proxy = document.getElementById('new-geo-layer-proxy')?.value.trim() || '';
  if(!name){
    alert('Ingrese el nombre de la capa.');
    return;
  }
  if(!url){
    alert('Ingrese la URL de la capa.');
    return;
  }
  if(type === 'wms' && !layerName){
    alert('Ingrese el nombre de la capa WMS.');
    return;
  }
  if(!ADMIN_CONFIG.geoportal) ADMIN_CONFIG.geoportal = {};
  if(!Array.isArray(ADMIN_CONFIG.geoportal.layers)) ADMIN_CONFIG.geoportal.layers = [];
  ADMIN_CONFIG.geoportal.layers.push({
    name,
    layerType: type,
    url,
    layerName: type === 'wms' ? layerName : url,
    attribution,
    username,
    password,
    proxy
  });
  persistAdminData();
  ADMIN_UI_STATE.showNewGeoportalLayerForm = false;
  renderAdminPanel();
}

function removeGeoportalLayer(index){
  if(!Array.isArray(ADMIN_CONFIG.geoportal.layers) || !ADMIN_CONFIG.geoportal.layers[index]) return;
  ADMIN_CONFIG.geoportal.layers.splice(index,1);
  persistAdminData();
  renderAdminPanel();
}

function saveNewAdminUser(){
  const firstName = document.getElementById('new-user-firstname')?.value.trim();
  const lastName = document.getElementById('new-user-lastname')?.value.trim();
  const email = document.getElementById('new-user-email')?.value.trim();
  const username = document.getElementById('new-user-username')?.value.trim();
  const role = document.getElementById('new-user-role')?.value;
  const sections = USER_SECTION_OPTIONS.filter(option => document.getElementById(`new-user-section-${option.key}`)?.checked).map(option=>option.key);
  let site = document.getElementById('new-user-site')?.value;
  const password = document.getElementById('new-user-password')?.value.trim();
  if(!firstName){
    alert('Ingrese el nombre.');
    return;
  }
  if(!lastName){
    alert('Ingrese el apellido.');
    return;
  }
  if(!email){
    alert('Ingrese el correo electrónico.');
    return;
  }
  if(!username){
    alert('Ingrese el nombre de usuario.');
    return;
  }
  if(!password){
    alert('Ingrese la contraseña.');
    return;
  }
  if(!sections.length){
    alert('Selecciona al menos una sección para el usuario.');
    return;
  }
  if(!sections.includes('environmental')){
    site = 'todas';
  }
  ADMIN_CONFIG.users.push({name: username, firstName, lastName, email, username, role: role||'cliente', sections, site: site||'todas', password});
  persistAdminData();
  ADMIN_UI_STATE.showNewUserForm = false;
  renderAdminPanel();
}

function cancelNewAdminUser(){
  ADMIN_UI_STATE.showNewUserForm = false;
  renderAdminPanel();
}


function persistAdminData(){
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify({
    url: ADMIN_CONFIG.url,
    regional: ADMIN_CONFIG.regional,
    days: ADMIN_CONFIG.days,
    geoportal: ADMIN_CONFIG.geoportal,
    sites: ADMIN_CONFIG.sites,
    users: ADMIN_CONFIG.users,
    reports: ADMIN_CONFIG.reports,
    tdr: ADMIN_CONFIG.tdr
  }));
  if(ADMIN_CONFIG.token){
    localStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_CONFIG.token);
  }
}

function normalizeTdrEndpoint(value){
  const raw = (value || '').trim();
  if(!raw) return 'http://127.0.0.1:5001/api/analyze-tdr';
  const normalized = raw.replace(/\/+$/, '');
  if(/\/api\/analyze-tdr(?:\/)?$/i.test(normalized)) return normalized;
  if(/\/api\//i.test(normalized)) return normalized.replace(/\/api\/.*$/i, '/api/analyze-tdr');
  if(/:\d+$/i.test(normalized)) return `${normalized}/api/analyze-tdr`;
  return `${normalized}/api/analyze-tdr`;
}

function saveConsultoriaAiConfig(){
  const provider = document.getElementById('admin-ia-provider')?.value || document.getElementById('admin-tdr-ai-provider')?.value || 'gemini';
  const apiKey = (document.getElementById('admin-ia-api-key')?.value || document.getElementById('admin-tdr-ai-key')?.value || '').trim();
  const enabled = document.getElementById('admin-ia-enabled')?.checked ?? document.getElementById('admin-tdr-ai-enabled')?.checked ?? true;
  const endpoint = normalizeTdrEndpoint(document.getElementById('admin-ia-endpoint')?.value || document.getElementById('admin-tdr-ai-endpoint')?.value || 'http://127.0.0.1:5001/api/analyze-tdr');

  ADMIN_CONFIG.tdr = {
    ...(ADMIN_CONFIG.tdr || {}),
    aiProvider: provider,
    apiKey,
    enabled,
    endpoint
  };

  persistAdminData();
  alert('Configuración de integración IA guardada.');
}

function saveTdrGeminiConfig(){
  saveConsultoriaAiConfig();
}

async function saveAdminSettings(){
  if(ACTIVE_ADMIN_SECTION==='reports'){
    const title = document.getElementById('admin-report-title')?.value.trim() || 'Informe de Monitoreo';
    const subtitle = document.getElementById('admin-report-subtitle')?.value.trim() || 'SINAPH';
    const days = parseInt(document.getElementById('admin-report-days')?.value || '30', 10) || 30;
    const showStats = document.getElementById('admin-report-secs-stats')?.checked !== false;
    const showCharts = document.getElementById('admin-report-secs-charts')?.checked !== false;
    const allowPdf = document.getElementById('admin-report-export-pdf')?.checked !== false;
    const allowWord = document.getElementById('admin-report-export-word')?.checked !== false;
    const aiProvider = document.getElementById('admin-report-ai-provider')?.value || 'openai';
    const aiApiKey = document.getElementById('admin-report-ai-key')?.value.trim() || '';
    const enableAiAnalysis = document.getElementById('admin-report-ai-enabled')?.checked !== false;

    ADMIN_CONFIG.reports = {
      ...ADMIN_CONFIG.reports,
      defaultTitle: title,
      defaultSubtitle: subtitle,
      dateRangeDays: days,
      showStats,
      showCharts,
      allowPdf,
      allowWord,
      aiProvider,
      aiApiKey,
      enableAiAnalysis
    };
    persistAdminData();
    alert('Configuración de informes guardada.');
    return;
  }

  if(ACTIVE_ADMIN_SECTION==='maps'){
    saveGeoportalSettings();
    return;
  }

  if(ACTIVE_ADMIN_SECTION==='projects'){
    saveTdrGeminiConfig();
    return;
  }

  const urlEl = document.getElementById('admin-url');
  const tokenEl = document.getElementById('admin-token');
  const regionalEl = document.getElementById('admin-regional');
  const daysEl = document.getElementById('admin-days');

  const nextUrl = normalizeUrl(urlEl?.value || ADMIN_CONFIG.url || '');
  const nextToken = (tokenEl?.value || ADMIN_CONFIG.token || '').trim();
  const nextRegional = (regionalEl?.value || ADMIN_CONFIG.regional || '').trim();
  const nextDays = parseInt(daysEl?.value || ADMIN_CONFIG.days || 30) || 30;

  ADMIN_CONFIG.url = nextUrl;
  ADMIN_CONFIG.token = nextToken;
  ADMIN_CONFIG.regional = nextRegional;
  ADMIN_CONFIG.days = nextDays;

  try{
    await verifyEarthRangerConnection(ADMIN_CONFIG.url, ADMIN_CONFIG.token);
    persistAdminData();
    sessionStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_CONFIG.token);
    populateLoginDefaults();
    renderLoginUsers();
    alert('Configuración guardada y conexión verificada con EarthRanger.');
  }catch(error){
    persistAdminData();
    sessionStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_CONFIG.token);
    populateLoginDefaults();
    renderLoginUsers();
    alert('La configuración se guardó, pero la conexión con EarthRanger falló: ' + error.message);
  }
}

function saveGeoportalSettings(){
  const name = document.getElementById('admin-geo-name')?.value.trim() || 'Geoportal ICF Honduras';
  const url = normalizeUrl(document.getElementById('admin-geo-url')?.value.trim() || '');
  const layerType = document.getElementById('admin-geo-layer-type')?.value || 'wms';
  const layerName = document.getElementById('admin-geo-layer-name')?.value.trim() || '';
  const attribution = document.getElementById('admin-geo-attribution')?.value.trim() || '© ICF Honduras';
  const username = document.getElementById('admin-geo-username')?.value.trim() || '';
  const password = document.getElementById('admin-geo-password')?.value || '';
  const proxy = document.getElementById('admin-geo-proxy')?.value.trim() || '';

  if(!url){
    alert('Ingrese la URL del geoportal.');
    return;
  }
  if(layerType === 'wms' && !layerName){
    alert('Ingrese el nombre de la capa WMS.');
    return;
  }

  ADMIN_CONFIG.geoportal = {
    ...ADMIN_CONFIG.geoportal,
    name,
    url,
    layerType,
    layerName,
    attribution,
    username,
    password,
    proxy
  };
  persistAdminData();
  alert('Configuración del geoportal guardada.');
  // If map module is open, refresh its geoportal layer list and reload the layer
  if(typeof populateGeoportalLayerList === 'function'){
    try{ populateGeoportalLayerList(true); }catch(e){}
  }
  if(CURRENT_SCREEN === 'map' && typeof refreshCurrentMapLayer === 'function'){
    try{ refreshCurrentMapLayer(); }catch(e){}
  }
}

async function isGeoportalProxyReachable(proxy){
  if(!proxy) return false;
  try{
    const response = await fetch(proxy, { method:'GET', mode:'cors' });
    return response.ok || response.status === 400 || response.status === 404;
  }catch(error){
    console.debug('Geoportal proxy reachable check failed:', error.message || error);
    return false;
  }
}

async function testGeoportalConnection(){
  const url = normalizeUrl(document.getElementById('admin-geo-url')?.value.trim() || ADMIN_CONFIG.geoportal?.url || '');
  const layerType = document.getElementById('admin-geo-layer-type')?.value || ADMIN_CONFIG.geoportal?.layerType || 'wms';
  const layerName = document.getElementById('admin-geo-layer-name')?.value.trim() || ADMIN_CONFIG.geoportal?.layerName || '';
  const username = document.getElementById('admin-geo-username')?.value.trim() || ADMIN_CONFIG.geoportal?.username || '';
  const password = document.getElementById('admin-geo-password')?.value || ADMIN_CONFIG.geoportal?.password || '';
  const proxyInput = document.getElementById('admin-geo-proxy');
  let proxy = proxyInput?.value.trim() || ADMIN_CONFIG.geoportal?.proxy || '';
  if(!proxy){
    proxy = getDefaultLocalGeoportalProxy();
    if(proxyInput) proxyInput.value = proxy;
  }

  if(!url){
    alert('Ingrese la URL del geoportal para probar la conexión.');
    return;
  }
  if(layerType === 'wms' && !layerName){
    alert('Ingrese el nombre de la capa WMS para probar la conexión.');
    return;
  }

  const testUrl = buildGeoportalTestUrl({url, layerType, layerName});
  const authUrl = (username && password && typeof addBasicAuthToUrl === 'function') ? addBasicAuthToUrl(testUrl, username, password) : testUrl;
  const proxiedUrl = wrapProxyUrl(authUrl, proxy);
  console.debug('Geoportal test URL:', proxiedUrl);

  try{
    const response = await fetch(proxiedUrl, { method:'GET', mode:'cors' });
    if(!response.ok){
      const bodyText = await response.text().catch(()=> '');
      throw new Error(`HTTP ${response.status} ${response.statusText}${bodyText ? `: ${bodyText.slice(0,300)}` : ''}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if(layerType === 'wms'){
      if(!contentType.includes('xml') && !contentType.includes('png') && !contentType.includes('image')){
        const bodyText = await response.text().catch(()=> '');
        throw new Error(`Contenido inesperado (${contentType}): ${bodyText.slice(0,300)}`);
      }
    }

    alert('Conexión al geoportal verificada con éxito.');
  }catch(error){
    let detailedMessage = error.message || String(error);
    let proxyDetail = '';
    if(proxy){
      const proxyReachable = await isGeoportalProxyReachable(proxy);
      if(!proxyReachable){
        proxyDetail = `
El proxy local no responde en ${proxy}. Inicia el proxy con: node proxy.js en la carpeta aris-test.`;
      }
    }
    alert('Fallo al conectar con el geoportal: ' + detailedMessage + '\n' +
      'Esto puede ocurrir si el geoportal no permite solicitudes CORS directas desde el navegador, si el proxy local no está ejecutándose, o si la URL del geoportal es incorrecta.' + proxyDetail +
      (proxy && !proxyDetail ? '\nURL de prueba: ' + proxiedUrl : ''));
  }
}

function getDefaultLocalGeoportalProxy(){
  return isLocalApp() ? 'http://127.0.0.1:5000/?url=' : '';
}

function isLocalApp(){
  return location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
}

function isLocalGeoportalProxy(proxy){
  try{
    return ['localhost','127.0.0.1'].includes(new URL(proxy).hostname);
  }catch(e){
    return false;
  }
}

function fillLocalGeoportalProxy(){
  const input = document.getElementById('admin-geo-proxy');
  if(input){
    input.value = getDefaultLocalGeoportalProxy();
  }
}

function buildGeoportalTestUrl({url, layerType, layerName}){
  let testUrl = url;
  if(layerType === 'wms'){
    const params = new URLSearchParams({ service:'WMS', request:'GetMap', version:'1.3.0', layers:layerName, styles:'', bbox:'-90,-10,90,10', width:'1', height:'1', crs:'EPSG:4326', format:'image/png', transparent:'true' });
    testUrl += (testUrl.includes('?') ? '&' : '?') + params.toString();
  } else {
    if(testUrl.includes('{z}') || testUrl.includes('{x}') || testUrl.includes('{y}')){
      testUrl = testUrl.replace('{z}','0').replace('{x}','0').replace('{y}','0');
    } else if(!testUrl.endsWith('.png') && !testUrl.endsWith('.jpg') && !testUrl.endsWith('.jpeg')){
      testUrl = testUrl.replace(/\/+$/,'') + '/0/0/0.png';
    }
  }
  return testUrl;
}

function wrapProxyUrl(url, proxy){
  if(!proxy) return url;
  if(proxy.includes('{url}')){
    return proxy.replace('{url}', encodeURIComponent(url));
  }
  if(/url=$/i.test(proxy)){
    return proxy + encodeURIComponent(url);
  }
  if(proxy.endsWith('?') || proxy.endsWith('&')){
    return proxy + 'url=' + encodeURIComponent(url);
  }
  if(proxy.includes('?')){
    return proxy + '&url=' + encodeURIComponent(url);
  }
  return proxy + '?url=' + encodeURIComponent(url);
}

function normalizeUserName(value){
  if(!value) return '';
  return value.toString().trim().toLowerCase();
}

function getUserByName(name){
  const normalized = normalizeUserName(name);
  if(!normalized) return null;
  return ADMIN_CONFIG.users.find(u=>{
    if(!u) return false;
    const username = normalizeUserName(u.username);
    const displayName = normalizeUserName(u.name);
    const fullName = normalizeUserName(`${u.firstName||''} ${u.lastName||''}`.trim());
    const email = normalizeUserName(u.email);
    return username === normalized || displayName === normalized || fullName === normalized || email === normalized;
  }) || null;
}

function updateCurrentUserBadge(){
  const name = CURRENT_USER?.name || CURRENT_USER?.username || 'Invitado';
  const welcome = document.getElementById('current-user-name-welcome');
  if(welcome) welcome.innerHTML = `Usuario: <strong>${esc(name)}</strong>`;
}

function setCurrentUser(name){
  const user = getUserByName(name) || {name:name||'invitado', username:name||'invitado', firstName:name||'Invitado', role:'cliente', site:'todas'};
  CURRENT_USER = {...user};
  const userName = user.name || user.username;
  sessionStorage.setItem('er_user', userName);
  localStorage.setItem('er_user', userName);
  updateCurrentUserBadge();
}

function filterEventsByCurrentUser(){
  if(!CURRENT_USER || CURRENT_USER.role==='admin'){
    FILTERED_EVENTS = [...ALL_EVENTS];
    return;
  }
  if(!CURRENT_USER.site || CURRENT_USER.site==='todas'){
    FILTERED_EVENTS = [...ALL_EVENTS];
    return;
  }
  FILTERED_EVENTS = ALL_EVENTS.filter(e=>eventMatchesAssignedSite(e, CURRENT_USER.site));
  if(typeof renderAll === 'function') renderAll();
}

function isAuthorizedAdminUser(){
  const username = document.getElementById('cfg-username')?.value.trim() || '';
  const password = document.getElementById('cfg-password')?.value.trim() || '';
  const user = getUserByName(username);
  return Boolean(user && user.role==='admin' && user.password === password);
}

function checkAdminCode(){
  const code = document.getElementById('cfg-admin-code').value.trim();
  IS_ADMIN = code===ADMIN_CODE && isAuthorizedAdminUser();
  if(IS_ADMIN){
    sessionStorage.setItem('er_is_admin','true');
    localStorage.setItem('er_is_admin','true');
  } else {
    sessionStorage.removeItem('er_is_admin');
    localStorage.removeItem('er_is_admin');
  }
  updateAdminNav();
}

function showAdminAccessPanel(){
  const panel = document.getElementById('admin-access-panel');
  if(!panel) return;
  panel.style.display = 'block';
  const codeInput = document.getElementById('cfg-admin-code');
  if(codeInput) codeInput.focus();
}

function openAdminFromLogin(){
  const codeInput = document.getElementById('cfg-admin-code');
  if(!codeInput) return;
  const code = codeInput.value.trim();
  if(!code){
    alert('Ingrese la clave administrativa en el campo correspondiente.');
    codeInput.focus();
    return;
  }
  if(!validateAdminAccess(code)){
    return;
  }
  activateAdminAccess();
  if(IS_ADMIN){
    // Asegura que la sesión quede activada para persistir al recargar
    const username = document.getElementById('cfg-username')?.value?.trim() || '';
    if(username) setCurrentUser(username);
    sessionStorage.setItem('er_session_active','true');
    localStorage.setItem('er_session_active','true');
    localStorage.setItem('er_is_admin','true');
    // Si hay configuración administrativa disponible, persístela como cfg seguro
    try{
      const url = normalizeUrl(ADMIN_CONFIG.url || '');
      const token = (ADMIN_CONFIG.token || sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '').trim();
      if(url && token){
        const authHeader = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : ('Token ' + token);
        const safeCfg = { url, days: ADMIN_CONFIG.days || 30, regional: ADMIN_CONFIG.regional || '', authHeader, token };
        localStorage.setItem('er_cfg', JSON.stringify(safeCfg));
        sessionStorage.setItem('er_cfg', JSON.stringify(safeCfg));
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      }
    }catch(e){}
    goToAdmin();
  } else {
    alert('Código incorrecto.');
  }
}

window.addEventListener('DOMContentLoaded',()=>{
  initAdmin();
  const adminInput = document.getElementById('cfg-admin-code');
  if(adminInput){
    adminInput.addEventListener('blur',checkAdminCode);
    adminInput.addEventListener('keydown',e=>{ if(e.key==='Enter') checkAdminCode(); });
  }
  renderAdminPanel();
});
