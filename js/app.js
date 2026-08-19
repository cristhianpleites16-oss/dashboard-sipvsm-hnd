// ============================================================
// APP — Punto de entrada. Une todos los módulos al cargar la página.
// ============================================================
function isReloadNavigation(){
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if(nav && nav.type) return nav.type === 'reload';
  if(performance.navigation) return performance.navigation.type === 1;
  return false;
}

function restoreSession(){
  const saved = localStorage.getItem('er_cfg') || sessionStorage.getItem('er_cfg');
  const sessionActive = sessionStorage.getItem('er_session_active') === 'true' || localStorage.getItem('er_session_active') === 'true';
  const savedUser = sessionStorage.getItem('er_user') || localStorage.getItem('er_user');
  if(!savedUser || !sessionActive) return false;
  try{
    const c = saved ? JSON.parse(saved) : {};
    const token = localStorage.getItem('er_admin_token') || sessionStorage.getItem('er_admin_token') || c.token || '';
    const adminFlag = sessionStorage.getItem('er_is_admin') === 'true' || localStorage.getItem('er_is_admin') === 'true';

    if(saved && c.url){
      CONFIG.url = c.url;
      CONFIG.days = c.days || 30;
      CONFIG.regional = c.regional || '';
      CONFIG.authHeader = c.authHeader || '';
      CONFIG.token = token;
      if(!CONFIG.authHeader && CONFIG.token) CONFIG.authHeader = 'Token ' + CONFIG.token;
    } else {
      CONFIG = { url:'', token:'', authHeader:'', days:30, regional:'' };
    }

    if(typeof getUserByName === 'function' && typeof setCurrentUser === 'function'){
      const user = getUserByName(savedUser);
      setCurrentUser(savedUser);
      if(user?.role==='admin' && adminFlag){
        IS_ADMIN = true;
        updateAdminNav();
      } else {
        IS_ADMIN = Boolean(adminFlag);
      }
    }

    if(CONFIG.url){
      const label = CONFIG.regional || new URL(CONFIG.url).hostname;
      const siteLabel = document.getElementById('site-label');
      if(siteLabel) siteLabel.textContent = label;
    } else {
      const siteLabel = document.getElementById('site-label');
      if(siteLabel) siteLabel.textContent = 'General';
    }

    const savedScreen = sessionStorage.getItem('er_screen') || localStorage.getItem('er_screen') || 'welcome';
    if(savedScreen === 'admin' && IS_ADMIN) showScreen('admin');
    else if(savedScreen === 'dashboard') showScreen('dashboard');
    else if(savedScreen === 'reports') showScreen('reports');
    else showScreen('welcome');

    if(CONFIG.url && CONFIG.token && CURRENT_SCREEN !== 'admin'){
      initMap();
      loadData(true).then(()=>{ if(typeof filterEventsByCurrentUser === 'function') filterEventsByCurrentUser(); if(CURRENT_SCREEN==='welcome' && typeof prepareWelcome === 'function') prepareWelcome(); startRefresh(); }).catch(()=>{});
    }
    return true;
  }catch(e){
    return false;
  }
}

window.addEventListener('DOMContentLoaded',()=>{
  loadSettings();
  if(typeof ensureGeographicFilterControls === 'function') ensureGeographicFilterControls();
  if(typeof buildGeographicFilterOptions === 'function') buildGeographicFilterOptions();
  // Solo restaurar la sesión en recarga real; abrir la app desde cero debe arrancar en login.
  if(isReloadNavigation() && restoreSession()){
    // sesión restaurada correctamente tras recarga
  } else {
    showScreen('login');
  }

  const saved=localStorage.getItem('er_cfg');
  if(saved){
    try{
      const c=JSON.parse(saved);
      document.getElementById('cfg-url').value=c.url||'';
      document.getElementById('cfg-days').value=c.days||30;
      document.getElementById('cfg-regional').value=c.regional||'';
    }catch(e){}
  }
  document.getElementById('search-input').addEventListener('input',applyFilters);
});
