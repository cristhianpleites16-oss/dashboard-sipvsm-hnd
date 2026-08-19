// ============================================================
// MÓDULO LOGIN — Pantalla de inicio de sesión / conexión
// ============================================================
function showLogin(){ showScreen('login'); }

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
  const selectedUser = getUserByName(selectedUserName);
  const password = document.getElementById('cfg-password')?.value.trim() || '';
  if(!selectedUser){ showErr('Nombre de usuario incorrecto.'); return; }
  if(!password){ showErr('Ingresa la contraseña de usuario.'); return; }
  if(selectedUser.password !== password){ showErr('Contraseña incorrecta.'); return; }
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
      const site = (ADMIN_CONFIG.sites||[]).find(s=>s.name===selectedUser.site || s.externalId===selectedUser.site);
      if(site && site.url){ url = normalizeUrl(site.url); }
      if(site && site.token){ token = (site.token||'').trim(); }
    }
    regional = selectedUser.site && selectedUser.site !== 'todas' ? selectedUser.site : (ADMIN_CONFIG.regional || '');
    if(!url||!token){ showErr('El usuario de Gestión Ambiental requiere un sitio EarthRanger configurado.'); return; }
  }
  const btn=document.getElementById('btn-connect');
  btn.textContent='Verificando...'; btn.disabled=true;
  document.getElementById('cfg-error').style.display='none';
  try{
    if(hasEnvironmental){
      const conn = await verifyEarthRangerConnection(url, token);
      setCurrentUser(selectedUserName);
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
