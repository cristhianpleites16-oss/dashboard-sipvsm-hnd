// ============================================================
// MÓDULO MAPA — Leaflet
// ============================================================
let GEO_TILE_LAYERS = [];
let GEO_LAYER_ACTIVE = false;
function initMap(containerId='map', retryCount=0){
  const container = document.getElementById(containerId);
  if(!container){
    console.warn('Map container not found:', containerId);
    return;
  }
  const rect = container.getBoundingClientRect();
  if(rect.width === 0 || rect.height === 0){
    if(retryCount > 20){
      return;
    }
    return setTimeout(()=>initMap(containerId, retryCount + 1), 180);
  }
  if(MAP_INSTANCE){
    const currentId = MAP_INSTANCE.getContainer()?.id;
    if(currentId === containerId) return;
    MAP_INSTANCE.remove();
    MAP_INSTANCE = null;
  }
  const s=localStorage.getItem('er_settings');
  const defLayer=s?JSON.parse(s).defaultLayer||'dark':'dark';
  const startLayer = defLayer === 'geoportal' && !isGeoportalConfigured() ? 'dark' : defLayer;
  CURRENT_MAP_LAYER = startLayer;
  GEO_TILE_LAYER = null;
  GEO_LAYER_ACTIVE = false;
  MAP_INSTANCE=L.map(containerId,{zoomControl:true}).setView([14.9,-86.8],7);
  const initialLayer = createMapLayer(startLayer) || L.tileLayer(MAP_LAYERS.dark,{attribution:'© OpenStreetMap',maxZoom:20});
  TILE_LAYER = initialLayer.addTo(MAP_INSTANCE);
  GEO_TILE_LAYERS = [];
  GEO_LAYER_ACTIVE = false;
  MARKER_LAYER=L.layerGroup().addTo(MAP_INSTANCE);
  showMapStatus('Mapa inicializado. Seleccione la capa deseada.');
  MAP_INSTANCE.whenReady(()=>{
    MAP_INSTANCE.invalidateSize();
    setLayer(CURRENT_MAP_LAYER);
    if(typeof renderMap==='function') renderMap();
  });
  setTimeout(()=>{
    if(MAP_INSTANCE){
      MAP_INSTANCE.invalidateSize();
      setLayer(CURRENT_MAP_LAYER);
      if(typeof renderMap==='function') renderMap();
    }
  },250);
}
function setLayer(name){
  if(name === 'geoportal'){
    setGeoportalOverlay();
    return;
  }
  CURRENT_MAP_LAYER = name;
  document.querySelectorAll('#layer-menu .map-btn').forEach(b=>b.classList.remove('active'));
  const button = document.getElementById('lyr-'+name);
  if(button) button.classList.add('active');
  if(TILE_LAYER && MAP_INSTANCE) MAP_INSTANCE.removeLayer(TILE_LAYER);
  const newLayer = createMapLayer(name);
  if(!newLayer){
    CURRENT_MAP_LAYER = 'dark';
    const fallback = L.tileLayer(MAP_LAYERS.dark,{attribution:'© OpenStreetMap',maxZoom:20});
    TILE_LAYER = fallback.addTo(MAP_INSTANCE);
    document.getElementById('lyr-dark')?.classList.add('active');
    return;
  }
  TILE_LAYER = newLayer.addTo(MAP_INSTANCE);
  if(GEO_TILE_LAYER && MAP_INSTANCE) {
    GEO_TILE_LAYER.bringToFront();
  }
}

function setGeoportalOverlay(){
  if(!MAP_INSTANCE) return;
  GEO_TILE_LAYERS.forEach(layer=>{
    if(MAP_INSTANCE && layer) MAP_INSTANCE.removeLayer(layer);
  });
  GEO_TILE_LAYERS = buildGeoportalOverlayLayers();
  if(GEO_TILE_LAYERS.length === 0){
    showMapStatus('El geoportal no está configurado correctamente. Usa la configuración de administración.');
    GEO_LAYER_ACTIVE = false;
    return;
  }
  GEO_TILE_LAYERS.forEach(layer => {
    layer.addTo(MAP_INSTANCE);
    if(layer.bringToFront) layer.bringToFront();
  });
  GEO_LAYER_ACTIVE = true;
}

function refreshCurrentMapLayer(){
  if(!MAP_INSTANCE) return;
  const activeLayer = CURRENT_MAP_LAYER || 'dark';
  if(TILE_LAYER) MAP_INSTANCE.removeLayer(TILE_LAYER);
  let newLayer = createMapLayer(activeLayer);
  if(!newLayer){
    CURRENT_MAP_LAYER = 'dark';
    newLayer = L.tileLayer(MAP_LAYERS.dark,{attribution:'© OpenStreetMap',maxZoom:20});
    document.querySelectorAll('#layer-menu .map-btn').forEach(b=>b.classList.remove('active'));
    document.getElementById('lyr-dark')?.classList.add('active');
  }
  TILE_LAYER = newLayer.addTo(MAP_INSTANCE);
}
function getGeoportalLayers(){
  const geo = ADMIN_CONFIG?.geoportal || {};
  if(Array.isArray(geo.layers) && geo.layers.length > 0){
    return geo.layers;
  }
  if(geo.url && geo.layerType){
    return [{
      name: geo.name || 'Geoportal',
      layerType: geo.layerType,
      url: geo.url,
      layerName: geo.layerType === 'wms' ? geo.layerName || '' : geo.url,
      attribution: geo.attribution || '',
      username: geo.username || '',
      password: geo.password || '',
      proxy: geo.proxy || ''
    }];
  }
  return [];
}

function getCurrentGeoportalLayerConfig(){
  const geo = ADMIN_CONFIG?.geoportal || {};
  const layers = getGeoportalLayers();
  if(layers.length === 0) return null;
  const index = Number.isInteger(geo.activeLayerIndex) && geo.activeLayerIndex >= 0 && geo.activeLayerIndex < layers.length ? geo.activeLayerIndex : 0;
  return { layer: layers[index], index };
}

function isGeoportalConfigured(){
  const current = getCurrentGeoportalLayerConfig();
  return Boolean(current && current.layer && current.layer.url && current.layer.layerType && (current.layer.layerType === 'xyz' || current.layer.layerName));
}
function createMapLayer(name){
  if(name === 'geoportal'){
    return null;
  }
  const url = MAP_LAYERS[name];
  if(!url) return null;
  return L.tileLayer(url,{attribution:'© OpenStreetMap',maxZoom:20});
}

function showMapStatus(message){
  const status = document.getElementById('map-status-message');
  if(status){
    status.textContent = message || 'Estado del mapa disponible.';
  }
}

// Render the map module sidebar (map-only) and dashboard map layer controls
function renderMapModuleSidebar(context='map'){
  const layerContainerId = context === 'dashboard' ? 'dashboard-map-sidebar-layers' : 'map-sidebar-layers';
  const container = document.getElementById(layerContainerId);
  if(!container) return;
  const keys = ['dark','satellite','topo','streets'].filter(key=>MAP_LAYERS?.[key]);
  const labels = { dark:'Oscuro', satellite:'Satélite', topo:'Topográfico', streets:'Calles' };
  container.innerHTML = keys.map(k=>{
    const label = labels[k] || k;
    return `<label style="display:block;margin-bottom:6px;"><input type="radio" name="${context}-base-layer" value="${k}" ${CURRENT_MAP_LAYER===k?'checked':''}/> ${label}</label>`;
  }).join('');
  // attach listeners
  container.querySelectorAll(`input[name="${context}-base-layer"]`).forEach(r=>{
    r.addEventListener('change', e=>{
      const v = e.target.value;
      setLayer(v);
    });
  });
  const geoRefreshBtn = document.getElementById(`${context}-geoportal-refresh`);
  const geoLayerContainer = document.getElementById(`${context}-geoportal-layers`);
  if(geoRefreshBtn) geoRefreshBtn.onclick = ()=>{ populateGeoportalLayerList(true, context); };
  if(geoLayerContainer) {
    if(!isGeoportalConfigured()) {
      geoLayerContainer.innerHTML = '<div style="color:#475569;font-size:.9rem;">Geoportal no configurado. Ve a Administración > Mapas para conectarlo.</div>';
      if(geoRefreshBtn) geoRefreshBtn.disabled = true;
    } else {
      if(geoRefreshBtn) geoRefreshBtn.disabled = false;
      if(GEO_LAYER_ACTIVE){
        setGeoportalOverlay();
      }
    }
  }

  if(context === 'map'){
    const rptToggle = document.getElementById('map-toggle-reports');
    if(rptToggle){
      rptToggle.checked = typeof SHOW_REPORT_POINTS !== 'undefined' ? SHOW_REPORT_POINTS : true;
      rptToggle.onchange = function(){ SHOW_REPORT_POINTS = this.checked; renderMap(); };
    }
  }

  updateGeoportalStatus(context);
  populateGeoportalLayerList(false, context);
}

function handleGeoportalCheckboxChange(prefix='map'){
  const sel = document.getElementById(`${prefix}-geoportal-layers`);
  if(!sel) return;
  const selectedValues = Array.from(sel.querySelectorAll('input[name="geoportal-layer-checkbox"]:checked')).map(input=>input.value);
  const numericValues = selectedValues.map(v=>parseInt(v,10)).filter(n=>!Number.isNaN(n));
  const updatedGeoportal = {
    ...ADMIN_CONFIG.geoportal,
    activeLayerIndexes: undefined,
    activeLayerNames: undefined,
    activeLayerIndex: undefined
  };
  if(selectedValues.length === 0){
    updatedGeoportal.activeLayerIndexes = [];
    updatedGeoportal.activeLayerNames = [];
  } else if(numericValues.length === selectedValues.length){
    updatedGeoportal.activeLayerIndexes = numericValues;
    delete updatedGeoportal.activeLayerNames;
  } else {
    updatedGeoportal.activeLayerNames = selectedValues;
    delete updatedGeoportal.activeLayerIndexes;
  }
  ADMIN_CONFIG.geoportal = updatedGeoportal;
  persistAdminData();
  setGeoportalOverlay();
  updateGeoportalStatus(prefix);
}

function updateGeoportalStatus(prefix='map', message){
  const status = document.getElementById(`${prefix}-geoportal-status`);
  const geo = ADMIN_CONFIG?.geoportal || {};
  if(!status) return;
  if(message){
    status.textContent = message;
    return;
  }
  const layers = getGeoportalLayers();
  if(layers.length === 0){
    status.textContent = 'Geoportal no configurado. Ve a Administración > Mapas para conectarlo.';
    return;
  }
  if(Array.isArray(geo.layers) && geo.layers.length > 0){
    status.textContent = `Geoportal conectado: ${geo.name || 'Geoportal'}.`;
    return;
  }
  const current = getCurrentGeoportalLayerConfig();
  if(!current){
    status.textContent = 'Geoportal no configurado. Ve a Administración > Mapas para conectarlo.';
    return;
  }
  const layer = current.layer;
  const layerTypeText = layer.layerType === 'xyz' ? 'XYZ' : 'WMS';
  const selectedLayer = layer.layerType === 'xyz' ? layer.layerName || layer.url : layer.layerName || layer.name || 'No seleccionada';
  status.textContent = `Geoportal conectado: ${geo.name || layer.name || 'Geoportal'} (${layerTypeText}). Capa activa: ${selectedLayer}.`;
}

// Fetch WMS GetCapabilities and populate geoportal layers dropdown
async function populateGeoportalLayerList(force, prefix='map'){
  const container = document.getElementById(`${prefix}-geoportal-layers`);
  if(!container) return;
  const geo = ADMIN_CONFIG?.geoportal || {};
  const layers = getGeoportalLayers();
  if(layers.length === 0) {
    container.innerHTML = '<div style="color:#475569;font-size:.9rem;">Geoportal no configurado. Ve a Administración > Mapas.</div>';
    updateGeoportalStatus(prefix, 'Geoportal no configurado. Ve a Administración > Mapas.');
    return;
  }
  updateGeoportalStatus(prefix, 'Cargando capas del geoportal...');

  let activeIndexes = Array.isArray(geo.activeLayerIndexes) ? geo.activeLayerIndexes : (Number.isInteger(geo.activeLayerIndex) ? [geo.activeLayerIndex] : []);
  let activeNames = Array.isArray(geo.activeLayerNames) ? geo.activeLayerNames : [];
  let html = '';

  if(Array.isArray(geo.layers) && geo.layers.length > 0){
    html = layers.map((layer,index)=>{
      const title = `${layer.name || `Capa ${index + 1}`} (${layer.layerType.toUpperCase()}${layer.layerType === 'wms' ? `: ${layer.layerName}` : ''})`;
      const checked = activeIndexes.includes(index) ? ' checked' : '';
      return `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" name="geoportal-layer-checkbox" value="${index}"${checked}/> <span>${esc(title)}</span></label>`;
    }).join('');
    container.innerHTML = html;
  } else if(geo.layerType === 'xyz'){
    const display = geo.layerName || geo.url;
    const checked = activeIndexes.includes(0) ? ' checked' : '';
    container.innerHTML = `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" name="geoportal-layer-checkbox" value="0"${checked}/> <span>${esc(display)}</span></label>`;
  } else {
    try{
      const capsUrl = (geo.url.includes('?') ? geo.url + '&' : geo.url + '?') + 'service=WMS&request=GetCapabilities&version=1.3.0';
      let resp = null;
      let text = null;
      const configuredProxy = geo.proxy || '';
      const proxy = isLocalGeoportalProxy(configuredProxy) && !isLocalApp() ? '' : configuredProxy;
      let usedProxy = !!proxy;
      const tryDirect = !proxy;

      if(tryDirect){
        try{
          resp = await fetch(capsUrl, { method:'GET', mode:'cors' });
          if(!resp.ok) throw new Error('HTTP ' + resp.status);
          text = await resp.text();
        }catch(directError){
          const proxied = wrapProxyUrl(capsUrl, proxy);
          resp = await fetch(proxied, { method:'GET', mode:'cors' });
          if(!resp.ok) throw new Error('HTTP ' + resp.status);
          text = await resp.text();
          usedProxy = true;
          showMapStatus('GetCapabilities directo falló. Reintentando con proxy local.');
        }
      } else {
        const proxied = wrapProxyUrl(capsUrl, proxy);
        resp = await fetch(proxied, { method:'GET', mode:'cors' });
        if(!resp.ok) throw new Error('HTTP ' + resp.status);
        text = await resp.text();
      }

      if(!text){
        throw new Error('No se recibió respuesta de GetCapabilities.');
      }

      const doc = new DOMParser().parseFromString(text, 'application/xml');
      const nameEls = Array.from(doc.querySelectorAll('Capability>Layer>Name'));
      const names = nameEls.map(n=>n.textContent.trim()).filter(t=>t && t.length>0);
      const unique = Array.from(new Set(names));
      if(unique.length===0) {
        container.innerHTML = '<div style="color:#475569;font-size:.9rem;">No se encontraron capas</div>';
      } else {
        html = unique.map(name=>{
          const checked = activeNames.includes(name) ? ' checked' : '';
          return `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" name="geoportal-layer-checkbox" value="${esc(name)}"${checked}/> <span>${esc(name)}</span></label>`;
        }).join('');
        container.innerHTML = html;
        if(usedProxy && !configuredProxy){
          showMapStatus('Capas cargadas usando proxy local. Si el proxy no está ejecutándose, inicia node proxy.js en aris-test.');
        }
      }
    }catch(e){
      container.innerHTML = '<div style="color:#de3a3a;font-size:.9rem;">Error cargando capas</div>';
      console.debug('Error cargando capas geoportal:', e);
    }
  }

  container.querySelectorAll('input[name="geoportal-layer-checkbox"]').forEach(chk=>{
    chk.addEventListener('change', ()=>handleGeoportalCheckboxChange(prefix));
  });

  if(MAP_INSTANCE){
    setGeoportalOverlay();
  }
  updateGeoportalStatus(prefix);
}
function buildGeoportalOverlayLayers(){
  const geo = ADMIN_CONFIG?.geoportal || {};
  const layers = getGeoportalLayers();
  if(layers.length === 0) return [];
  const overlays = [];
  if(Array.isArray(geo.layers) && geo.layers.length > 0){
    const activeIndexes = Array.isArray(geo.activeLayerIndexes) ? geo.activeLayerIndexes : (Number.isInteger(geo.activeLayerIndex) ? [geo.activeLayerIndex] : []);
    activeIndexes.forEach(index => {
      const layerConfig = layers[index];
      if(layerConfig){
        const overlay = buildGeoportalOverlay(layerConfig);
        if(overlay) overlays.push(overlay);
      }
    });
    return overlays;
  }
  if(geo.layerType === 'xyz'){
    const activeIndexes = Array.isArray(geo.activeLayerIndexes) ? geo.activeLayerIndexes : (Number.isInteger(geo.activeLayerIndex) ? [geo.activeLayerIndex] : []);
    if(activeIndexes.length === 0) return [];
    const overlay = buildGeoportalOverlay(layers[0]);
    return overlay ? [overlay] : [];
  }
  if(geo.layerType === 'wms'){
    const activeLayerNames = Array.isArray(geo.activeLayerNames) ? geo.activeLayerNames : [];
    if(activeLayerNames.length === 0) return [];
    activeLayerNames.forEach(name => {
      const config = {...layers[0], layerName: name};
      const overlay = buildGeoportalOverlay(config);
      if(overlay) overlays.push(overlay);
    });
    return overlays;
  }
  return [];
}

function buildGeoportalOverlay(geo){
  let layerUrl = geo.url || '';
  if(!layerUrl) return null;
  if(geo.username && geo.password){
    layerUrl = addBasicAuthToUrl(layerUrl, geo.username, geo.password);
  }
  let layer = null;
  if(geo.layerType === 'xyz'){
    layer = L.tileLayer(layerUrl,{attribution:geo.attribution||'',maxZoom:20,crossOrigin:true,tiled:true});
  } else if(geo.layerType === 'wms'){
    if(!geo.layerName) return null;
    layer = L.tileLayer.wms(layerUrl,{layers: geo.layerName,format: 'image/png',transparent: true,attribution: geo.attribution||'',maxZoom: 20,version: '1.3.0',crs: L.CRS.EPSG3857,uppercase: true,crossOrigin: true,tiled: true});
  }
  if(!layer) return null;

  let fallbackAttempted = false;
  layer.on('tileerror', (e)=> {
    console.debug('Tile error loading geoportal layer:', e);
    if(geo.proxy){
      showMapStatus('Error cargando la capa geoportal. Revisa la URL y el proxy.');
      return;
    }

    if(fallbackAttempted){
      showMapStatus('Error cargando la capa geoportal. Revisa la URL y el proxy local.');
      return;
    }
    fallbackAttempted = true;
    const fallbackProxy = typeof getDefaultLocalGeoportalProxy === 'function' ? getDefaultLocalGeoportalProxy() : '';
    if(!fallbackProxy){
      showMapStatus('El geoportal requiere CORS habilitado o un proxy público HTTPS.');
      return;
    }
    showMapStatus('Error cargando la capa geoportal. Reintentando con proxy local...');
    const fallbackLayer = buildGeoportalOverlay({...geo, proxy: fallbackProxy});
    if(fallbackLayer && MAP_INSTANCE){
      MAP_INSTANCE.removeLayer(layer);
      fallbackLayer.addTo(MAP_INSTANCE);
      showMapStatus('Usando proxy local para geoportal. Inicia el proxy con: node proxy.js si todavía no está ejecutándose.');
    }
  });

  return geo.proxy ? augmentProxyLayer(layer, geo.proxy) : layer;
}

function augmentProxyLayer(layer, proxy){
  if(!layer || !proxy || typeof layer.getTileUrl !== 'function') return layer;
  const originalGetTileUrl = layer.getTileUrl.bind(layer);
  layer.getTileUrl = function(tilePoint){
    const url = originalGetTileUrl(tilePoint);
    return wrapProxyUrl(url, proxy);
  };
  return layer;
}

function addBasicAuthToUrl(url, username, password){
  try{
    const parsed = new URL(url);
    parsed.username = username;
    parsed.password = password;
    return parsed.toString();
  }catch(e){
    return url;
  }
}
function toggleMapMenu(menu){
  const layerMenu=document.getElementById('layer-menu');
  const legend=document.getElementById('map-legend');
  const layerBtn=document.getElementById('btn-layer-toggle');
  const legendBtn=document.getElementById('btn-legend-toggle');
  if(menu==='layers'){
    const open=!layerMenu.classList.contains('open');
    layerMenu.classList.toggle('open',open);
    layerBtn.classList.toggle('active',open);
    layerBtn.textContent=open?'Capas ▲':'Capas';
  } else if(menu==='legend'){
    const hidden=legend.classList.toggle('hidden');
    legendBtn.classList.toggle('active',!hidden);
    legendBtn.textContent=hidden?'Símb':'Símb ▲';
  }
}
function renderMap(){
  if(!MAP_INSTANCE)return;
  MARKER_LAYER.clearLayers();
  // If report points are disabled, skip adding markers
  const showPoints = typeof SHOW_REPORT_POINTS === 'undefined' ? true : SHOW_REPORT_POINTS;
  const mapCountEl = document.getElementById('map-count');
  if(!showPoints){
    if(mapCountEl) mapCountEl.innerHTML=`Mostrando <strong>0</strong> de ${FILTERED_EVENTS.length} eventos`;
    return;
  }
  const geo=FILTERED_EVENTS.filter(e=>getCoords(e));
  if(mapCountEl) mapCountEl.innerHTML=`Mostrando <strong>${geo.length}</strong> de ${FILTERED_EVENTS.length} eventos`;
  geo.forEach(e=>{
    const coords=getCoords(e), cat=mapCat(e), color=getCatColor(cat);
    const dt=getDate(e)?new Date(getDate(e)).toLocaleString('es-HN'):'—';
    const icon=L.divIcon({className:'',html:`<div style="width:10px;height:10px;border-radius:50%;background:${color};opacity:0.85;"></div>`,iconSize:[10,10],iconAnchor:[5,5]});
    const m=L.marker(coords,{icon});
    m.bindPopup(`<div class="pu-title">${esc(e.title||cat)}</div>
      <div class="pu-row"><strong>Categoría:</strong> ${esc(cat)}</div>
      <div class="pu-row"><strong>Tipo:</strong> ${esc(e.event_type||'—')}</div>
      <div class="pu-row"><strong>Fecha:</strong> ${dt}</div>
      <div class="pu-row"><strong>Prioridad:</strong> ${esc(e.priority_label||'—')}</div>
      <div class="pu-row"><strong>Estado:</strong> ${esc(e.state||'—')}</div>
      <div class="pu-row"><strong>Coords:</strong> ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}</div>`);
    MARKER_LAYER.addLayer(m);
  });
  if(geo.length>0) MAP_INSTANCE.fitBounds(geo.map(e=>getCoords(e)),{padding:[30,30],maxZoom:12});
}
