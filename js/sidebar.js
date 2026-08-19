// ============================================================
// MÓDULO SIDEBAR — categorías, búsqueda, filtros, resumen
// ============================================================
function buildCatList(){
  const counts={};
  ALL_EVENTS.forEach(e=>{ const c=mapCat(e); counts[c]=(counts[c]||0)+1; });
  const catalogCategories = (REPORT_FILTER_GROUPS || []).map(group=>group.category);
  const cats=[...new Set([...Object.keys(counts), ...catalogCategories])].sort();
  document.getElementById('cat-list').innerHTML=cats.map(c=>`
    <label class="cat-item">
      <input type="checkbox" class="cat-cb" value="${esc(c)}" checked>
      <span class="cat-dot" style="background:${getCatColor(c)}"></span>
      ${esc(c)}<span class="cat-count">${counts[c]||0}</span>
    </label>`).join('');
  document.getElementById('legend-items').innerHTML=cats.map(c=>`
    <div class="leg-item"><span class="leg-dot" style="background:${getCatColor(c)}"></span>${esc(c)}</div>`).join('');
}

function ensureGeographicFilterControls(){
  if(document.getElementById('filter-source')) return;
  const sidebar = document.getElementById('sidebar');
  const categoryList = document.getElementById('cat-list');
  if(!sidebar || !categoryList) return;
  const searchInput = document.getElementById('search-input');
  if(searchInput) searchInput.placeholder='Buscar tipo de reporte...';
  const searchTitle = searchInput?.closest('div')?.parentElement?.querySelector('.s-title');
  if(searchTitle) searchTitle.textContent='Tipo de reporte';
  const categoryTitle = categoryList.closest('div')?.querySelector('.s-title');
  if(categoryTitle) categoryTitle.textContent='Categoría de reportes';
  const siteFilter = document.getElementById('site-filter');
  siteFilter?.closest('div')?.parentElement?.remove();
  document.querySelectorAll('.state-cb').forEach(cb=>cb.closest('label')?.remove());
  document.querySelectorAll('#sidebar .s-title').forEach(title=>{
    if(title.textContent.trim().toLowerCase()==='estado') title.parentElement.remove();
  });
  const block = document.createElement('div');
  block.innerHTML = `
    <div><div class="s-title">Fuente de datos</div><select id="filter-source"></select></div>
    <div><div class="s-title">Reporte / Formulario</div><select id="filter-report"></select></div>
    <div><div class="s-title">Departamento</div><select id="filter-department"></select></div>
    <div><div class="s-title">Municipio costero</div><select id="filter-municipality"></select></div>
    <div><div class="s-title">SIPVSM</div><select id="filter-sipvsm"></select></div>`;
  categoryList.closest('div')?.after(block);
  document.getElementById('filter-department').addEventListener('change', buildGeographicFilterOptions);
}

function applyFilters(){
  ensureGeographicFilterControls();
  const q=document.getElementById('search-input').value.toLowerCase();
  const ds=document.getElementById('date-start').value;
  const de=document.getElementById('date-end').value;
  const siteText=document.getElementById('site-filter')?.value.trim() || '';
  const cks=[...document.querySelectorAll('.cat-cb:checked')].map(cb=>cb.value);
  const source=document.getElementById('filter-source')?.value || 'Todas';
  const report=document.getElementById('filter-report')?.value || 'Todos';
  const department=document.getElementById('filter-department')?.value || 'Todos';
  const municipality=document.getElementById('filter-municipality')?.value || 'Todos';
  const sipvsm=document.getElementById('filter-sipvsm')?.value || 'Todos';
  FILTERED_EVENTS=ALL_EVENTS.filter(e=>{
    if(!cks.includes(mapCat(e))) return false;
    if(source!=='Todas' && getEventDataSource(e)!==source) return false;
    if(!eventMatchesReportFilter(e, report)) return false;
    if(department!=='Todos' && getEventDepartment(e)!==department) return false;
    if(municipality!=='Todos' && normalizeSiteValue(getEventMunicipality(e))!==normalizeSiteValue(municipality)) return false;
    if(sipvsm!=='Todos' && getEventSIPVSM(e)!==sipvsm) return false;
    if(siteText && !eventMatchesAssignedSite(e, siteText)) return false;
    if(q){const t=(e.title||'')+' '+(e.event_type||'')+' '+(e.event_type_display||'')+' '+mapCat(e)+' '+(e.notes||'');if(!t.toLowerCase().includes(q))return false;}
    const dt=getDate(e);
    if(ds&&dt&&dt<ds)return false;
    if(de&&dt&&dt>de+'T23:59:59')return false;
    return true;
  });
  renderAll();
}
function clearFilters(){
  ensureGeographicFilterControls();
  document.getElementById('search-input').value='';
  const siteFilter=document.getElementById('site-filter');
  if(siteFilter) siteFilter.value='';
  document.getElementById('date-start').value='';
  document.getElementById('date-end').value='';
  document.querySelectorAll('.cat-cb').forEach(cb=>cb.checked=true);
  ['filter-report','filter-department','filter-municipality','filter-sipvsm'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value='Todos'; });
  const source=document.getElementById('filter-source');
  if(source) source.value='Todas';
  FILTERED_EVENTS=[...ALL_EVENTS]; renderAll();
}

function buildReportFilterOptionsMarkup(){
  const groups = REPORT_FILTER_GROUPS || [];
  const grouped = groups.map(group=>{
    const options = (group.reports || []).map(report=>`<option value="${esc(report)}">${esc(report)}</option>`).join('');
    return `<optgroup label="${esc(group.category)}">${options}</optgroup>`;
  }).join('');
  return `<option value="Todos">Todos</option>${grouped}`;
}

function buildGeographicFilterOptions(){
  ensureGeographicFilterControls();
  const source = document.getElementById('filter-source');
  const report = document.getElementById('filter-report');
  const department = document.getElementById('filter-department');
  const municipality = document.getElementById('filter-municipality');
  const sipvsm = document.getElementById('filter-sipvsm');
  if(source && !source.options.length) source.innerHTML=DATA_SOURCE_OPTIONS.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
  if(report && !report.options.length) report.innerHTML = buildReportFilterOptionsMarkup();
  if(department && !department.options.length) department.innerHTML=DEPARTMENT_OPTIONS.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
  if(sipvsm && !sipvsm.options.length) sipvsm.innerHTML=SIPVSM_OPTIONS.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
  if(municipality){
    const selectedDepartment=department?.value || 'Todos';
    const municipalities=selectedDepartment==='Todos' ? Object.values(MUNICIPALITY_OPTIONS).flat() : (MUNICIPALITY_OPTIONS[selectedDepartment]||[]);
    const current=municipality.value;
    municipality.innerHTML=['Todos',...new Set(municipalities)].map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
    municipality.value=[...municipality.options].some(option=>option.value===current) ? current : 'Todos';
  }
}

function renderAll(){ updateStats(); renderMap(); renderCharts(); if(TABLE_VISIBLE) renderTable(); }
function getUniqueAreaCount(events){
  const areas=new Set();
  events.forEach(e=>{
    const candidates=[];
    if(e.location?.name) candidates.push(e.location.name);
    if(e.location?.description) candidates.push(e.location.description);
    if(e.site) candidates.push(e.site);
    if(e.event_area) candidates.push(e.event_area);
    if(e.area) candidates.push(e.area);
    if(e.region) candidates.push(e.region);
    if(e.zone) candidates.push(e.zone);
    if(e.place) candidates.push(e.place);
    if(e.camp) candidates.push(e.camp);
    candidates.forEach(value=>{
      const normalized=normalizeSiteValue(value);
      if(normalized) areas.add(normalized);
    });
  });
  return areas.size;
}

function getUniqueReporterCount(events){
  const reporters=new Set();
  events.forEach(e=>{
    const rep=e.reported_by?.name||e.reported_by?.username||e.reported_by?.email||e.reported_by?.id||'';
    const normalized=normalizeSiteValue(rep);
    if(normalized) reporters.add(normalized);
  });
  return reporters.size;
}

function updateStats(){
  const totalEvents=FILTERED_EVENTS.length;
  const geoEvents=FILTERED_EVENTS.filter(e=>getCoords(e)).length;
  document.getElementById('stat-total').textContent=totalEvents;
  document.getElementById('stat-patrols').textContent=ALL_PATROLS.length;
  document.getElementById('stat-registered').textContent=geoEvents;
  document.getElementById('stat-cats').textContent=new Set(FILTERED_EVENTS.map(e=>mapCat(e))).size;
  document.getElementById('stat-areas').textContent=getUniqueAreaCount(FILTERED_EVENTS);
  document.getElementById('stat-reporters').textContent=getUniqueReporterCount(FILTERED_EVENTS);
}
