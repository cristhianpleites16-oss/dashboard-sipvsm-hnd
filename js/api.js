// ============================================================
// MÓDULO API — Comunicación con EarthRanger
// ============================================================

// Cuando la app corre en localhost usa un proxy local (evita CORS).
// Si se abre como archivo (file://) o desde un dominio propio, llama directo.
function pUrl(url){
  if(location.protocol!=='file:'&&location.hostname==='localhost')
    return `http://127.0.0.1:5000/?url=${encodeURIComponent(url)}`;
  return url;
}

async function erFetch(path){
  const r=await fetch(pUrl(CONFIG.url+path),{headers:{'Authorization':CONFIG.authHeader,'Accept':'application/json'}});
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Descarga eventos (paginado) y patrullajes desde EarthRanger según CONFIG
async function loadData(silent=false){
  // If silent=true, show a small indicator on welcome screen instead of the global overlay
  if(silent){ try{ const wi=document.getElementById('wl-loading-indicator'); if(wi) wi.style.display='flex'; }catch(e){} }
  else { setLoading(true,'Conectando con EarthRanger...'); }

  try{
    const since=new Date(); since.setDate(since.getDate()-CONFIG.days);
    const sinceStr=since.toISOString().split('T')[0];
    let events=[],page=1,hasMore=true;
    ALL_EVENTS=[];
    FILTERED_EVENTS=[];
    while(hasMore){
      if(!silent) setLoading(true,`Cargando eventos página ${page}...`);
      const d=await erFetch(`/api/v1.0/activity/events/?page_size=200&page=${page}&date_after=${sinceStr}&include_details=true`);
      const res=(d.data&&d.data.results)||d.results||[];
      events=events.concat(res);
      ALL_EVENTS=[...events];
      // Render incremental so users can start seeing data before full download finishes.
      processData({ incremental:true });
      if(!silent){
        setStatus(true,`Cargando eventos... ${ALL_EVENTS.length} registros`);
      }
      await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
      const nxt=(d.data&&d.data.next)||d.next;
      if(nxt&&page<20) page++; else hasMore=false;
    }

    if(!silent) setLoading(true,'Cargando patrullajes...');
    try{
      const pd=await erFetch(`/api/v1.0/activity/patrols/?page_size=200&date_after=${sinceStr}`);
      ALL_PATROLS=(pd.data&&pd.data.results)||pd.results||[];
    }catch(e){ ALL_PATROLS=[]; }
    processData();
    setStatus(true,`${ALL_EVENTS.length} eventos · ${ALL_PATROLS.length} patrullajes`);
    document.getElementById('last-upd').textContent='Act: '+new Date().toLocaleTimeString('es-HN');
  }catch(e){
    console.error(e); setStatus(false,'Error');
    if(!silent) alert('Error: '+e.message);
  }finally{
    if(silent){ try{ const wi=document.getElementById('wl-loading-indicator'); if(wi) wi.style.display='none'; }catch(e){} }
    else{ setLoading(false); }
  }
}

function processData(options={}){
  const incremental = Boolean(options.incremental);
  FILTERED_EVENTS=[...ALL_EVENTS];
  if(typeof filterEventsByCurrentUser==='function') filterEventsByCurrentUser();
  buildCatList();
  if(!incremental) buildGeographicFilterOptions();
  renderAll();
}

function startRefresh(min){
  if(REFRESH_TIMER) clearInterval(REFRESH_TIMER);
  REFRESH_TIMER=setInterval(()=>{ if(ALL_EVENTS.length>0) loadData(); },(min||30)*60*1000);
}
