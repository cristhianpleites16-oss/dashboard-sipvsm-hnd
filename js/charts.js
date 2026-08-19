// ============================================================
// MÓDULO GRÁFICOS — Chart.js
// ============================================================
// Registra el plugin de etiquetas de datos (porcentajes en el
// gráfico de pastel). Antes se usaba en las opciones pero el
// plugin nunca se cargaba ni se registraba — completado aquí.
if (typeof ChartDataLabels !== 'undefined') {
  Chart.register(ChartDataLabels);
}

function renderCharts(){ renderPie(); renderBar(); renderTypes(); renderPatrols(); renderLine(); }

function renderPie(){
  const counts={};
  FILTERED_EVENTS.forEach(e=>{ const c=mapCat(e); counts[c]=(counts[c]||0)+1; });
  const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const labels=sorted.map(x=>x[0]), data=sorted.map(x=>x[1]);
  const colors=labels.map(l=>getCatColor(l));
  const total=data.reduce((a,b)=>a+b,0);
  if(CHARTS.pie)CHARTS.pie.destroy();
  CHARTS.pie=new Chart(document.getElementById('pie-chart'),{
    type:'doughnut',
    data:{labels,datasets:[{data,backgroundColor:colors.map(c=>c+'cc'),borderColor:colors,borderWidth:1.5}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{
      legend:{position:'right',labels:{color:'#8abdb8',font:{size:9,family:'Barlow'},boxWidth:9,padding:6}},
      tooltip:tTip(),
      datalabels:{color:'#e8f4f2',font:{weight:'bold',size:10},formatter:(v,ctx)=>{const pct=((v*100)/total).toFixed(0);return pct+'%';}}
    }}
  });
}
function renderBar(){
  const counts={};
  FILTERED_EVENTS.forEach(e=>{const d=getDate(e);if(!d)return;const day=d.substring(0,10);counts[day]=(counts[day]||0)+1;});
  const sorted=Object.keys(counts).sort();
  const labels=sorted.map(d=>new Date(d+'T12:00:00').toLocaleDateString('es-HN',{day:'2-digit',month:'short'}));
  const data=sorted.map(d=>counts[d]);
  if(CHARTS.bar)CHARTS.bar.destroy();
  CHARTS.bar=new Chart(document.getElementById('bar-chart'),{type:'bar',
    data:{labels,datasets:[{label:'Eventos',data,backgroundColor:'#2a9d8f55',borderColor:'#2a9d8f',borderWidth:1.5,borderRadius:3}]},
    options:cOpts()});
}
function renderTypes(){
  const types={};
  FILTERED_EVENTS.forEach(e=>{
    const t=e.event_type||'Sin tipo';
    types[t]=(types[t]||0)+1;
  });
  const sorted=Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const labels=sorted.map(x=>x[0]), data=sorted.map(x=>x[1]);
  const colors=['#52b788','#e9c46a','#4895ef','#e76f51','#c77dff','#06b6d4','#f59e0b','#8b5cf6'];
  if(CHARTS.types)CHARTS.types.destroy();
  CHARTS.types=new Chart(document.getElementById('types-chart'),{type:'bar',
    data:{labels,datasets:[{label:'Eventos',data,backgroundColor:colors.map(c=>c+'88'),borderColor:colors,borderWidth:1.5,borderRadius:3}]},
    options:cOpts()});
}
function renderPatrols(){
  const tc={};
  ALL_PATROLS.forEach(p=>{const t=p.patrol_type?.name||'Sin tipo';tc[t]=(tc[t]||0)+1;});
  if(!Object.keys(tc).length){if(CHARTS.pat)CHARTS.pat.destroy();return;}
  const labels=Object.keys(tc), data=labels.map(l=>tc[l]);
  const colors=['#52b788','#e9c46a','#4895ef','#e76f51','#c77dff'];
  if(CHARTS.pat)CHARTS.pat.destroy();
  CHARTS.pat=new Chart(document.getElementById('pat-chart'),{type:'bar',
    data:{labels,datasets:[{label:'Patrullajes',data,backgroundColor:colors.map(c=>c+'88'),borderColor:colors,borderWidth:1.5,borderRadius:3}]},
    options:cOpts()});
}
function renderLine(){
  const counts={};
  FILTERED_EVENTS.forEach(e=>{const d=getDate(e);if(!d)return;const day=d.substring(0,10);counts[day]=(counts[day]||0)+1;});
  const sorted=Object.keys(counts).sort(); let cum=0;
  const labels=sorted.map(d=>new Date(d+'T12:00:00').toLocaleDateString('es-HN',{day:'2-digit',month:'short'}));
  const data=sorted.map(d=>{cum+=counts[d];return cum;});
  if(CHARTS.line)CHARTS.line.destroy();
  CHARTS.line=new Chart(document.getElementById('line-chart'),{type:'line',
    data:{labels,datasets:[{label:'Acumulado',data,borderColor:'#52b788',backgroundColor:'rgba(82,183,136,.12)',fill:true,tension:.4,pointRadius:2,borderWidth:2}]},
    options:cOpts()});
}
function cOpts(){
  return{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:tTip()},
    scales:{
      x:{ticks:{color:'#4a7a76',font:{size:9},maxRotation:45},grid:{color:'#1e4040'}},
      y:{ticks:{color:'#4a7a76',font:{size:9}},grid:{color:'#1e4040'}}
    }};
}
function tTip(){return{backgroundColor:'#193330',titleColor:'#e8f4f2',bodyColor:'#8abdb8',borderColor:'#2a5a58',borderWidth:1,padding:8};}
