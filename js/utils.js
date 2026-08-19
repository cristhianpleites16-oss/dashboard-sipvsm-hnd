// ============================================================
// UTILIDADES COMPARTIDAS
// ============================================================
function esc(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function setLoading(on,msg){ document.getElementById('loading').style.display=on?'flex':'none'; if(msg)document.getElementById('loading-msg').textContent=msg; }
function setStatus(ok,txt){ document.getElementById('status-dot').className='dot'+(ok?' on':''); document.getElementById('status-text').textContent=txt; }

function getReportCatalogLookup(){
  const rows=[];
  (REPORT_FILTER_GROUPS || []).forEach(group=>{
    (group.reports || []).forEach(report=>{
      rows.push({ category:group.category, report, normalized:normalizeSiteValue(report) });
    });
  });
  return rows;
}

function getCatalogReportByValue(value){
  const normalized = normalizeSiteValue(value);
  if(!normalized) return null;
  const match = getReportCatalogLookup().find(item=>item.normalized===normalized);
  return match || null;
}

function getEventReportDefinition(e){
  const directCandidates = [
    e?.event_type_display,
    e?.event_type,
    e?.title,
    e?.event_category
  ];
  const nestedCandidates = [
    getEventField(e,['report_type','report_name','form_name','formulario','activity_type','tipo_reporte'])
  ];
  const candidates = [...directCandidates, ...nestedCandidates].filter(Boolean);
  for(const candidate of candidates){
    const found = getCatalogReportByValue(candidate);
    if(found) return found;
  }
  return null;
}

function getEventReportName(e){
  const catalog = getEventReportDefinition(e);
  if(catalog) return catalog.report;
  return e?.event_type_display || e?.event_type || 'Sin reporte';
}

function eventMatchesReportFilter(e, selectedReport){
  if(!selectedReport || selectedReport==='Todos') return true;
  const selected = getCatalogReportByValue(selectedReport);
  const eventReport = getEventReportDefinition(e);
  if(selected && eventReport){
    return selected.normalized === eventReport.normalized;
  }
  return normalizeSiteValue(getEventReportName(e)) === normalizeSiteValue(selectedReport);
}

function mapCat(e){
  const catalog = getEventReportDefinition(e);
  if(catalog?.category) return catalog.category;
  const raw=(e.event_category||e.event_type||'').toLowerCase().trim();
  const disp=(e.event_type_display||'').toLowerCase().trim();
  return CAT_MAP[raw]||CAT_MAP[disp]||e.event_type_display||e.event_category||e.event_type||'Sin categoría';
}
function getDate(e){ return e.time||e.created_at||e.updated_at||''; }
function getCoords(e){
  if(e.location&&e.location.latitude!=null) return [e.location.latitude,e.location.longitude];
  if(e.geojson&&e.geojson.geometry){const g=e.geojson.geometry;if(g.type==='Point')return[g.coordinates[1],g.coordinates[0]];}
  return null;
}
function getCatColor(cat){ return CAT_COLORS[cat]||'#64748b'; }

function getEventField(e, keys){
  const wanted = new Set(keys.map(key=>normalizeSiteValue(key)));
  const visit = value=>{
    if(!value || typeof value !== 'object') return '';
    for(const [key, child] of Object.entries(value)){
      if(wanted.has(normalizeSiteValue(key)) && (typeof child !== 'object' || child === null)) return String(child);
      if(typeof child === 'object'){
        const found = visit(child);
        if(found) return found;
      }
    }
    return '';
  };
  return visit(e);
}

function getEventDataSource(e){
  const source = getEventField(e,['source','data_source','datasource','origin','origen','source_system']);
  if(normalizeSiteValue(source).includes('kobo')) return 'KoboToolbox';
  return 'EarthRanger';
}

function getEventDepartment(e){
  const value = getEventField(e,['department','departamento','depto','departamento_name']);
  const normalized = normalizeSiteValue(value);
  if(normalized.includes('colon')) return 'Colón';
  if(normalized.includes('atlantida')) return 'Atlántida';
  if(normalized.includes('cortes')) return 'Cortés';
  return value || '';
}

function getEventMunicipality(e){
  return getEventField(e,['municipality','municipio','municipality_name','municipio_name']) || '';
}

function getEventSIPVSM(e){
  const value = getEventField(e,['sipvsm','sipvsm_area','sipvsm_site','sitio_sipvsm']);
  const normalized = normalizeSiteValue(value);
  if(normalized.includes('iriona') && normalized.includes('limon')) return 'Iriona-Limón';
  if(normalized.includes('santa fe')) return 'Santa Fe';
  if(normalized.includes('trujillo')) return 'Trujillo';
  if(normalized.includes('balfate')) return 'Balfate';
  return value || '';
}

function fmtDateTime(iso){
  if(!iso) return '—';
  const d=new Date(iso);
  return d.toLocaleDateString('es-HN',{day:'2-digit',month:'short',year:'numeric'})+' '+d.toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'});
}

function normalizeSiteValue(value){
  if(value==null) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function collectSiteCandidates(value){
  const values=[];
  const visit = (current)=>{
    if(current==null) return;
    if(typeof current==='string' || typeof current==='number' || typeof current==='boolean'){
      const text=String(current).trim();
      if(text) values.push(text);
      return;
    }
    if(Array.isArray(current)){
      current.forEach(visit);
      return;
    }
    if(typeof current==='object'){
      Object.values(current).forEach(visit);
    }
  };
  visit(value);
  return values;
}

function eventMatchesAssignedSite(e, site){
  if(!site||site==='todas') return true;
  const needle = normalizeSiteValue(site);
  if(!needle) return true;

  const candidates = collectSiteCandidates(e)
    .map(value=>normalizeSiteValue(value))
    .filter(Boolean);

  if(!candidates.length) return false;

  return candidates.some(value=>{
    if(value===needle) return true;
    if(value.includes(needle) || needle.includes(value)) return true;
    const needleTokens = needle.split(/\s+/).filter(Boolean);
    const valueTokens = value.split(/\s+/).filter(Boolean);
    if(!needleTokens.length || !valueTokens.length) return false;
    return needleTokens.some(token=>valueTokens.includes(token));
  });
}
