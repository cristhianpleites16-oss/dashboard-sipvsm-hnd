// ============================================================
// MÓDULO LOGIN — Pantalla de inicio de sesión / conexión
// ============================================================
function showLogin(){ showScreen('login'); }

function togglePasswordVisibility(){
  const input = document.getElementById('cfg-password');
  const button = document.getElementById('toggle-password');
  if(!input || !button) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  button.textContent = showing ? '👁' : '🙈';
  button.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
  button.title = showing ? 'Mostrar contraseña' : 'Ocultar contraseña';
}

function normalizeUrl(value){
  if(!value) return '';
  let url = value.trim();
  if(!url) return '';
  if(!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)){
    url = 'https://' + url;
  }
  return url.replace(/\/+$/,'');
}

async function connect(){
  const selectedUserName = document.getElementById('cfg-username')?.value?.trim() || '';
  let selectedUser = getUserByName(selectedUserName);
  const password = document.getElementById('cfg-password')?.value.trim() || '';
  if(!selectedUserName){ showErr('Ingresa tu usuario o correo.'); return; }
  if(!password){ showErr('Ingresa la contraseña de usuario.'); return; }

  let sharedAccount = null;
  let sharedSites = [];
  if(isSupabaseConfigured()){
    try{
      sharedAccount = await signInWithSharedAccount(selectedUserName, password);
      if(sharedAccount){
        const profile = sharedAccount.profile || {};
        selectedUser = {
          ...selectedUser,
          ...profile,
          name: profile.username || profile.full_name || profile.email || selectedUserName,
          username: profile.username || profile.email || selectedUserName,
          email: profile.email || sharedAccount.user.email,
          role: profile.role || 'cliente',
          site: profile.site || 'todas',
          sections: Array.isArray(profile.sections) && profile.sections.length ? profile.sections : ['environmental']
        };
        try{ sharedSites = await loadSharedEarthRangerSites(); }catch(error){
          if(!selectedUser.site || selectedUser.site === 'todas') throw error;
        }
        if(sharedSites.length){
          ADMIN_CONFIG.sites = sharedSites.map(site=>({
            id:site.id,
            name:site.name,
            externalId:site.external_id || '',
            url:site.url,
            token:site.token,
            regional:site.regional || site.name,
            days:site.days || ADMIN_CONFIG.days
          }));
        }
      }
    }catch(error){
      if(!selectedUser){
        showErr('No se pudo validar la cuenta compartida: ' + (error.message || error));
        return;
      }
    }
  }

  if(!selectedUser){ showErr('Nombre de usuario o correo incorrecto.'); return; }
  if(!sharedAccount && selectedUser.password !== password){ showErr('Contraseña incorrecta.'); return; }
  const hasEnvironmental = Array.isArray(selectedUser.sections) && selectedUser.sections.includes('environmental');
  let url = '';
  let token = '';
  let regional = '';
  if(hasEnvironmental){
    const adminUrl = normalizeUrl(ADMIN_CONFIG.url);
    const adminToken = (ADMIN_CONFIG.token || sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '').trim();
    url = adminUrl;
    token = adminToken;
    if(selectedUser.site && selectedUser.site!=='todas'){
      const site = sharedSites.find(s=>s.name===selectedUser.site || s.external_id===selectedUser.site)
        || (ADMIN_CONFIG.sites||[]).find(s=>s.name===selectedUser.site || s.externalId===selectedUser.site);
      if(site && site.url){ url = normalizeUrl(site.url); }
      if(site && site.token){ token = (site.token||'').trim(); }
      if(site && site.regional) regional = site.regional;
    } else if(sharedSites.length === 1 && sharedAccount){
      const site = sharedSites[0];
      url = normalizeUrl(site.url);
      token = (site.token || '').trim();
      regional = site.regional || site.name;
    }
    if(!regional) regional = selectedUser.site && selectedUser.site !== 'todas' ? selectedUser.site : (ADMIN_CONFIG.regional || '');
    if(!url||!token){ showErr('El usuario de Gestión Ambiental requiere un sitio EarthRanger configurado.'); return; }
  }
  const btn=document.getElementById('btn-connect');
  btn.textContent='Verificando...'; btn.disabled=true;
  document.getElementById('cfg-error').style.display='none';
  try{
    if(hasEnvironmental){
      const conn = await verifyEarthRangerConnection(url, token);
      setCurrentUser(selectedUserName);
      CURRENT_USER = {...CURRENT_USER, ...selectedUser};
      sessionStorage.setItem('er_session_active','true');
      localStorage.setItem('er_session_active','true');
      sessionStorage.setItem('er_admin_token', conn.token);
      localStorage.setItem('er_admin_token', conn.token);
      CONFIG={url:conn.url,token:conn.token,authHeader:conn.authHeader,days:ADMIN_CONFIG.days||30,regional};
      const safeCfg={url:conn.url,days:ADMIN_CONFIG.days||30,regional,authHeader:conn.authHeader,token:conn.token};
      localStorage.setItem('er_cfg',JSON.stringify(safeCfg));
      document.getElementById('site-label').textContent=regional||new URL(url).hostname;
      initMap();
      showScreen('welcome');
      try{ prepareWelcome(); }catch(e){}
      loadData(true).then(()=>{ filterEventsByCurrentUser(); startRefresh(); try{ prepareWelcome(); }catch(e){} }).catch(e=>{ console.error(e); });
    } else {
      setCurrentUser(selectedUserName);
      sessionStorage.setItem('er_session_active','true');
      localStorage.setItem('er_session_active','true');
      CONFIG={url:'',token:'',authHeader:'',days:ADMIN_CONFIG.days||30,regional:''};
      document.getElementById('site-label').textContent='General';
      showScreen('welcome');
      try{ prepareWelcome(); }catch(e){}
    }
  }catch(e){ showErr('❌ '+e.message); }
  finally{ btn.textContent='Ingresar al Sistema →'; btn.disabled=false; }
}
function showErr(m){ const el=document.getElementById('cfg-error'); el.textContent=m; el.style.display='block'; }

window.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('toggle-password')?.addEventListener('click', togglePasswordVisibility);
});
