// ============================================================
// MÓDULO DE NAVEGACIÓN — cambia entre las 4 pantallas de ARIS
// ============================================================
function showScreen(name){
  CURRENT_SCREEN=name;
  sessionStorage.setItem('er_screen', name);
  localStorage.setItem('er_screen', name);
  document.getElementById('login-screen').style.display = name==='login' ? 'flex':'none';
  document.getElementById('welcome-screen').classList.toggle('visible', name==='welcome');
  document.getElementById('app').style.display = name==='dashboard' ? 'flex' : 'none';
  document.getElementById('reports-screen').classList.toggle('visible', name==='reports');
  document.getElementById('admin-screen').classList.toggle('visible', name==='admin');
  document.getElementById('header').classList.toggle('visible', name==='dashboard' || name==='reports');

  document.querySelectorAll('.hdr-nav .hbtn').forEach(b=>b.classList.remove('active'));
  const navBtn=document.getElementById('nav-'+name);
  if(navBtn) navBtn.classList.add('active');

  const appFooter = document.querySelector('.app-footer');
  if(appFooter) appFooter.style.display = 'block';
}

function goToWelcome(){ showScreen('welcome'); }
function ensureDashboardGeoportalControls(){
  if(document.getElementById('dashboard-geoportal-layers')) return;
  const layerContainer = document.getElementById('dashboard-map-sidebar-layers');
  if(!layerContainer || !layerContainer.parentElement) return;
  const geoportal = document.createElement('div');
  geoportal.innerHTML = '<div class="s-title">Capas del geoportal</div><div id="dashboard-geoportal-status">Verificando configuración...</div><div id="dashboard-geoportal-layers"></div><button class="s-btn ghost small" id="dashboard-geoportal-refresh">Actualizar capas</button>';
  layerContainer.parentElement.after(geoportal);
}
function goToDashboard(){
  showScreen('dashboard');
  if(typeof ensureGeographicFilterControls === 'function') ensureGeographicFilterControls();
  if(typeof buildGeographicFilterOptions === 'function') buildGeographicFilterOptions();
  ensureDashboardGeoportalControls();
  setTimeout(()=>{
    initMap('map');
    if(typeof renderMapModuleSidebar === 'function') renderMapModuleSidebar('dashboard');
    if(MAP_INSTANCE) MAP_INSTANCE.invalidateSize();
  },150);
}
function goToReports(){ showScreen('reports'); }
function goToMap(){
  goToDashboard();
}

function logout(){
  localStorage.removeItem('er_cfg');
  localStorage.removeItem('er_user');
  localStorage.removeItem('er_is_admin');
  localStorage.removeItem('er_screen');
  localStorage.removeItem('er_session_active');
  localStorage.removeItem('er_admin_token');
  sessionStorage.removeItem('er_user');
  sessionStorage.removeItem('er_is_admin');
  sessionStorage.removeItem('er_screen');
  sessionStorage.removeItem('er_session_active');
  sessionStorage.removeItem('er_admin_token');
  CONFIG={url:'',token:'',authHeader:'',days:30,regional:''};
  CURRENT_USER={name:'',role:'',site:''};
  IS_ADMIN=false;
  updateAdminNav();
  if(document.getElementById('cfg-admin-code')) document.getElementById('cfg-admin-code').value='';
  if(REFRESH_TIMER) clearInterval(REFRESH_TIMER);
  showScreen('login');
}

function openSupport(){
  const subject = encodeURIComponent('Soporte ARIS');
  const body = encodeURIComponent('Hola,%0A%0ANecesito ayuda con el sistema ARIS. Por favor describa el problema aquí...%0A%0AGracias.');
  window.location.href = `mailto:soporte@cjpleites.com?subject=${subject}&body=${body}`;
}
