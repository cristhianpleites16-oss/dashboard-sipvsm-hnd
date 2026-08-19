# ARIS · Gestión y Análisis Ambiental

Proyecto independiente extraído de ARIS-TES. Incluye el dashboard ambiental conectado a EarthRanger, mapa Leaflet, gráficos, tabla de eventos, generación de informes y administración del módulo.

## Alcance

- Inicio de sesión para usuarios con permiso `environmental`.
- Dashboard de eventos y patrullajes.
- Mapa ambiental con capas base y geoportal configurable.
- Filtros por fecha, categoría, estado, sitio y texto.
- Informes con vista previa, impresión, Word y PDF.
- Administración de conexión EarthRanger, geoportal, informes, usuarios y sitios.
- Configuración de conexión KoboToolbox desde Administración.
- No incluye proyectos, consultorías ni inventario.

## Ejecución

Es una aplicación estática de navegador. Puede abrirse directamente con `index.html` o servirse desde cualquier hosting estático.

Para probarla localmente con Node.js:

```powershell
npx --yes serve .
```

También puede abrirse `index.html` directamente, aunque algunos navegadores pueden restringir peticiones CORS.

## Proxy opcional

Si EarthRanger o el geoportal bloquean las peticiones desde el navegador:

```powershell
node proxy.js
```

Después configura en Administración el proxy `http://127.0.0.1:5000/?url=`.

## Configuración inicial

1. Entra a `Administración` desde la pantalla de acceso.
2. Usa la cuenta administrativa configurada en `js/admin.js` o reemplázala antes de desplegar.
3. En `Integración EarthRanger`, guarda la URL y el token.
4. Configura los sitios, los permisos y, si aplica, el geoportal.
5. Inicia sesión con un usuario que tenga la sección `environmental`.

## KoboToolbox

La configuración se encuentra en `Administración > Integración EarthRanger`, dentro del bloque de KoboToolbox. Requiere:

- URL del servidor KoboToolbox.
- Token personal de API.
- UID del formulario o asset.
- Campo de fecha de los envíos, por defecto `_submission_time`.
- Intervalo de sincronización en minutos.

El botón `Probar conexión` valida el servidor, el token y, si se indicó, el formulario. La configuración queda guardada junto con la configuración administrativa. La carga y normalización de envíos al Dashboard debe implementarse después de confirmar el formulario y el mapeo de sus preguntas.

La visualización recomendada es el mismo Dashboard ambiental, con un filtro de origen (`EarthRanger` / `KoboToolbox`), distintivo de fuente en la tabla y capas o colores diferenciados en el mapa. Esto permite comparar ambas fuentes en una sola vista sin duplicar gráficos, filtros e informes.

La configuración se almacena en `localStorage` del navegador. Antes de producción, cambia la clave administrativa de ejemplo y evita distribuir credenciales reales dentro de archivos JavaScript.

## Estructura

```text
index.html       Entrada exclusiva del módulo ambiental
css/             Estilos del dashboard, reportes y administración
js/              Estado, API, mapas, gráficos, reportes y administración
assets/          Logo ARIS
proxy.js         Proxy local opcional para CORS
```
