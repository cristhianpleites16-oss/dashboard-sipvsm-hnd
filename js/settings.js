// ============================================================
// MÓDULO DE AJUSTES DEL DASHBOARD
// ============================================================
function showSettings(){ document.getElementById('settings-overlay').classList.add('open'); }
function closeSettings(){
  document.getElementById('settings-overlay').classList.remove('open');
  const rm=parseInt(document.getElementById('s-refresh').value)||30;
  startRefresh(rm);
  localStorage.setItem('er_settings',JSON.stringify({
    chartH:document.getElementById('s-chart-h').value,
    panelW:document.getElementById('s-panel-w').value,
    sidebarW:document.getElementById('s-sidebar-w').value,
    refresh:rm,
    defaultLayer:document.getElementById('s-default-layer').value
  }));
}
function applySettings(){
  const h=document.getElementById('s-chart-h').value;
  const pw=document.getElementById('s-panel-w').value;
  const sw=document.getElementById('s-sidebar-w').value;
  document.getElementById('s-chart-h-val').textContent=h;
  document.getElementById('s-panel-w-val').textContent=pw;
  document.getElementById('s-sidebar-w-val').textContent=sw;
  document.querySelectorAll('.chart-wrap').forEach(el=>el.style.height=h+'px');
  document.getElementById('main').style.gridTemplateColumns=`${sw}px 1fr ${pw}px`;
  document.getElementById('table-panel').style.left=sw+'px';
  if(MAP_INSTANCE) setTimeout(()=>MAP_INSTANCE.invalidateSize(),200);
}
function loadSettings(){
  const s=localStorage.getItem('er_settings');
  if(!s) return;
  try{
    const c=JSON.parse(s);
    if(c.chartH) document.getElementById('s-chart-h').value=c.chartH;
    if(c.panelW) document.getElementById('s-panel-w').value=c.panelW;
    if(c.sidebarW) document.getElementById('s-sidebar-w').value=c.sidebarW;
    if(c.refresh) document.getElementById('s-refresh').value=c.refresh;
    if(c.defaultLayer) document.getElementById('s-default-layer').value=c.defaultLayer;
    applySettings();
  }catch(e){}
}
