// ============================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// Compartido por todos los módulos (login, dashboard, informes...)
// ============================================================
let CONFIG = { url:'', token:'', authHeader:'', days:30, regional:'' };
let CURRENT_USER = { name:'', role:'', site:'' };
let ALL_EVENTS = [], FILTERED_EVENTS = [];
let ALL_PATROLS = [];
let MAP_INSTANCE = null, MARKER_LAYER = null, TILE_LAYER = null;
let CURRENT_MAP_LAYER = 'satellite';
let SHOW_REPORT_POINTS = true;
let CHARTS = {};
let TABLE_VISIBLE = false;
let REFRESH_TIMER = null;
let CURRENT_SCREEN = 'login'; // login | welcome | dashboard | reports | admin

const CAT_MAP = {
  'monitoreo_biologico':'Monitoreo Biológico','vida_silvestre':'Monitoreo Biológico',
  'fauna':'Monitoreo Biológico','flora':'Monitoreo Biológico','flora_2':'Monitoreo Biológico',
  'colecta_de_flora_2':'Monitoreo Biológico','colecta de flora 2.0':'Monitoreo Biológico',
  'monitoreo biologico':'Monitoreo Biológico',
  'amenaza':'Monitoreo de Amenazas','amenazas':'Monitoreo de Amenazas',
  'monitoreo_amenazas':'Monitoreo de Amenazas','descombro':'Monitoreo de Amenazas',
  'incendio':'Monitoreo de Amenazas','tala':'Monitoreo de Amenazas',
  'monitoreo de amenazas':'Monitoreo de Amenazas',
  'actividad':'Monitoreo de Actividades','actividades':'Monitoreo de Actividades',
  'monitoreo_actividades':'Monitoreo de Actividades',
  'informacion de patrullaje2.0':'Monitoreo de Actividades',
  'informacion_patrullaje':'Monitoreo de Actividades',
  'monitoreo de actividades':'Monitoreo de Actividades',
  'gestion':'Gestión Técnica de Incidentes','incidente':'Gestión Técnica de Incidentes',
  'gestion_tecnica':'Gestión Técnica de Incidentes',
  'gestion tecnica de incidentes':'Gestión Técnica de Incidentes',
};
const CAT_COLORS = {
  'Monitoreo Biológico':'#52b788',
  'Monitoreo de Amenazas':'#e76f51',
  'Monitoreo de Actividades':'#e9c46a',
  'Gestión Técnica de Incidentes':'#4895ef',
};
const DATA_SOURCE_OPTIONS = ['Todas','EarthRanger','KoboToolbox'];
const DEPARTMENT_OPTIONS = ['Todos','Colón','Atlántida','Cortés'];
const MUNICIPALITY_OPTIONS = {
  'Colón':['Balfate','Iriona','Limón','Santa Fe','Santa Rosa de Aguán','Trujillo'],
  'Atlántida':['El Porvenir','Esparta','Jutiapa','La Ceiba','La Masica','San Francisco','Tela'],
  'Cortés':['Omoa','Puerto Cortés']
};
const SIPVSM_OPTIONS = ['Todos','Santa Fe','Iriona-Limón','Trujillo','Balfate'];
const MAP_LAYERS = {
  satellite:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  streets:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};
