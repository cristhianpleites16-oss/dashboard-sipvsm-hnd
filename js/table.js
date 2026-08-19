// ============================================================
// MÓDULO TABLA DE EVENTOS
// ============================================================
function toggleTable(){
  TABLE_VISIBLE=!TABLE_VISIBLE;
  const main = document.getElementById('main');
  if(main) main.classList.toggle('table-only', TABLE_VISIBLE);
  document.getElementById('table-panel').classList.toggle('visible',TABLE_VISIBLE);
  document.getElementById('toggle-table').classList.toggle('table-active',TABLE_VISIBLE);
  document.getElementById('toggle-table').textContent=TABLE_VISIBLE?'Cerrar':'Tabla';
  if(TABLE_VISIBLE)renderTable();
  if(!TABLE_VISIBLE&&MAP_INSTANCE)setTimeout(()=>MAP_INSTANCE.invalidateSize(),100);
}
function renderTable(){
  if(!TABLE_VISIBLE)return;
  document.getElementById('tbl-count').textContent=FILTERED_EVENTS.length+' eventos';
  const tbody=document.getElementById('table-body');
  if(!FILTERED_EVENTS.length){tbody.innerHTML=`<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-dim);">Sin eventos</td></tr>`;return;}
  tbody.innerHTML=FILTERED_EVENTS.slice(0,500).map(e=>{
    const cat=mapCat(e), color=getCatColor(cat);
    const dt=fmtDateTime(getDate(e));
    const coords=getCoords(e);
    const state=e.state||'—';
    const sc=state==='active'?'#52b788':state==='resolved'?'#8abdb8':'#e9c46a';
    const rep=e.reported_by?.name||e.reported_by?.username||'—';
    const pri=e.priority_label||'—';
    const priC=e.priority>=300?'#ef4444':e.priority>=200?'#f59e0b':'#52b788';
    return`<tr>
      <td style="font-size:.7rem;white-space:nowrap;">${dt}</td>
      <td><span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${esc(cat)}</span></td>
      <td style="font-size:.7rem;">${esc(e.event_type||'—')}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(e.title||'')}">${esc(e.title||'—')}</td>
      <td><span style="color:${priC};font-size:.7rem;">${esc(pri)}</span></td>
      <td><span style="color:${sc};font-size:.7rem;">${esc(state)}</span></td>
      <td style="font-size:.7rem;">${esc(rep)}</td>
      <td style="font-size:.68rem;color:var(--text-dim);font-family:monospace;">${coords?`${coords[0].toFixed(3)},${coords[1].toFixed(3)}`:'—'}</td>
    </tr>`;
  }).join('');
}
