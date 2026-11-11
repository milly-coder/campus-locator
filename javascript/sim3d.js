/* =====================================================================
   3D CAMPUS + ROUTE PREVIEW  (add AFTER script.js in index2.html)

   Reuses from script.js:  map, currentRouteGeometry, collapseSidebar
   Does not change anything in script.js.

   What it adds
   1. A "3D" button: raises buildings into 3D blocks, adds hills (terrain)
      and a sky, and tilts the camera. Tap again to go back to flat.
   2. A "Preview route in 3D" button under every route: the camera glides
      along the route at street level, like walking it before you arrive.
      Tap the map (or the button) to stop.

   Where the 3D buildings come from
   - Your own building outlines in your Mapbox Studio style (the light-brown
     "campus-buildings" layer). In 3D mode they become solid blocks; in 2D
     mode they go back to the faint brown highlight you designed.
   - In dark mode (which uses a Mapbox style without your outlines),
     Mapbox's own building outlines are used instead.
   - PLUS your own outlines, if you add a file named buildings3d.geojson
     next to index2.html (polygons exported from QGIS in EPSG:4326, with a
     "height_m" field and a "name" field). Use this for GIMPA buildings
     that Mapbox doesn't have. If the file isn't there, it is skipped.
   ===================================================================== */
(function () {
  'use strict';

  const FLY_PITCH   = 65;    // camera tilt during the preview (0 = top-down)
  const FLY_ZOOM    = 18.3;  // how close the camera is during the preview
  const FLY_SPEED   = 12;    // metres of route per second of animation
  const LOOK_AHEAD  = 25;    // metres ahead the camera faces
  const FLAT_PITCH  = 42;    // same tilt the map starts with in script.js

  const OWN_LAYER   = 'campus-buildings';   // your layer in Mapbox Studio
  const OWN_3D_PAINT = {                     // how it looks in 3D mode
    'fill-extrusion-color': '#EFE7D6',       // light stone, like GIMPA's walls
    'fill-extrusion-opacity': 1,             // solid: nothing shows through
    'fill-extrusion-base': 0,                // start on the ground...
    'fill-extrusion-height': 14              // ...and rise about 3 storeys
  };

  const S = { on: false, flying: false, raf: null, hooked: false, ownBuildings: undefined, saved: null };
  let btn3d = null;

  /* ---------------------------- geometry ---------------------------- */
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const norm180 = a => ((a % 360) + 540) % 360 - 180;

  function meters(a, b) {
    const dx = (b[0] - a[0]) * 111320 * Math.cos(rad((a[1] + b[1]) / 2));
    const dy = (b[1] - a[1]) * 110540;
    return Math.hypot(dx, dy);
  }
  function bearingTo(a, b) {
    const p1 = rad(a[1]), p2 = rad(b[1]), dl = rad(b[0] - a[0]);
    const y = Math.sin(dl) * Math.cos(p2);
    const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return deg(Math.atan2(y, x));
  }
  function lineLength(c) {
    let t = 0;
    for (let i = 1; i < c.length; i++) t += meters(c[i - 1], c[i]);
    return t;
  }
  function pointAlong(c, dist) {
    for (let i = 1; i < c.length; i++) {
      const seg = meters(c[i - 1], c[i]);
      if (dist <= seg && seg > 0) {
        const t = dist / seg;
        return [c[i - 1][0] + (c[i][0] - c[i - 1][0]) * t, c[i - 1][1] + (c[i][1] - c[i - 1][1]) * t];
      }
      dist -= seg;
    }
    return c[c.length - 1];
  }

  /* --------------------------- 3D layers --------------------------- */
  function firstLayerAbove() {
    // keep buildings underneath your markers and route lines
    return map.getLayer('building-circles') ? 'building-circles' : undefined;
  }

  function addTerrain() {
    // remember the style's own terrain (yours has some) so 2D mode gets it back
    if (S.terrain === undefined) S.terrain = map.getTerrain ? map.getTerrain() : null;
    if (!map.getSource('sim-dem')) {
      map.addSource('sim-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512 });
    }
    map.setTerrain({ source: 'sim-dem', exaggeration: 1.3 });
    try { map.setFog({ 'horizon-blend': 0.08 }); } catch (e) { /* older styles */ }
  }

  // Your own outlines (light style): make them solid 3D blocks, remembering
  // their 2D look so it can be put back exactly.
  function raiseOwnBuildings() {
    if (S.saved) return;               // already raised
    S.saved = {};
    Object.keys(OWN_3D_PAINT).forEach(k => {
      S.saved[k] = map.getPaintProperty(OWN_LAYER, k);
      map.setPaintProperty(OWN_LAYER, k, OWN_3D_PAINT[k]);
    });
  }
  function lowerOwnBuildings() {
    if (!S.saved || !map.getLayer(OWN_LAYER)) { S.saved = null; return; }
    Object.keys(S.saved).forEach(k => {
      if (S.saved[k] !== undefined) map.setPaintProperty(OWN_LAYER, k, S.saved[k]);
    });
    S.saved = null;
  }

  // Mapbox's buildings: only used when your outlines aren't in the style (dark mode)
  function addMapboxBuildings() {
    if (!map.getSource('sim-bldg')) {
      map.addSource('sim-bldg', { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' });
    }
    if (!map.getLayer('sim-bldg-3d')) {
      map.addLayer({
        id: 'sim-bldg-3d', type: 'fill-extrusion', source: 'sim-bldg', 'source-layer': 'building',
        minzoom: 14,
        filter: ['==', ['get', 'extrude'], 'true'],
        paint: {
          'fill-extrusion-color': '#3a4552',
          // Mapbox lists most GIMPA buildings as 3 m tall; 7 m minimum so they read as buildings
          'fill-extrusion-height': ['max', ['coalesce', ['get', 'height'], 7], 7],
          'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 1
        }
      }, firstLayerAbove());
    }
  }

  // Optional buildings3d.geojson: real heights for key buildings
  function addHeightFile() {
    if (S.ownBuildings && !map.getSource('sim-own')) {
      map.addSource('sim-own', { type: 'geojson', data: S.ownBuildings });
      map.addLayer({
        id: 'sim-own-3d', type: 'fill-extrusion', source: 'sim-own',
        paint: {
          'fill-extrusion-color': '#EFE7D6',
          'fill-extrusion-height': ['coalesce', ['to-number', ['get', 'height_m']], 10],
          'fill-extrusion-opacity': 1
        }
      }, firstLayerAbove());
    }
  }

  function addLayers() {
    addTerrain();
    if (map.getLayer(OWN_LAYER)) raiseOwnBuildings();
    else addMapboxBuildings();
    addHeightFile();
  }

  function removeLayers() {
    lowerOwnBuildings();
    ['sim-own-3d', 'sim-bldg-3d'].forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
    ['sim-own', 'sim-bldg'].forEach(id => { if (map.getSource(id)) map.removeSource(id); });
    map.setTerrain(S.terrain || null);
    S.terrain = undefined;
  }

  async function loadOwnBuildings() {
    if (S.ownBuildings !== undefined) return;
    try {
      const res = await fetch('buildings3d.geojson', { cache: 'no-cache' });
      S.ownBuildings = res.ok ? await res.json() : null;
    } catch (e) { S.ownBuildings = null; }
  }

  function hookStyleChanges() {
    if (S.hooked) return;
    S.hooked = true;
    // dark mode swaps the whole style, which wipes our layers: put them back
    map.on('style.load', () => { S.saved = null; S.terrain = undefined; if (S.on) addLayers(); });
  }

  async function set3D(on) {
    if (typeof map === 'undefined' || !map) return;
    hookStyleChanges();
    S.on = on;
    btn3d.classList.toggle('active', on);
    btn3d.setAttribute('aria-pressed', String(on));
    if (on) {
      await loadOwnBuildings();
      addLayers();
      map.easeTo({ pitch: 60, zoom: Math.max(map.getZoom(), 16.5), duration: 1200 });
    } else {
      stopFly();
      removeLayers();
      map.easeTo({ pitch: FLAT_PITCH, duration: 800 });
    }
  }

  /* ------------------------- route preview ------------------------- */
  function stopFly() {
    if (!S.flying) return;
    S.flying = false;
    cancelAnimationFrame(S.raf);
    ['mousedown', 'touchstart', 'wheel'].forEach(ev => map.off(ev, stopFly));
    const b = document.getElementById('simPreviewBtn');
    if (b) b.innerHTML = '<i class="fas fa-play"></i> Preview route in 3D';
  }

  async function preview() {
    if (S.flying) return stopFly();
    if (typeof currentRouteGeometry === 'undefined' || !currentRouteGeometry) {
      alert('Get a route first (Directions tab), then tap Preview.');
      return;
    }
    const coords = currentRouteGeometry.coordinates;
    const total = lineLength(coords);
    if (total < 1) return;

    if (!S.on) await set3D(true);
    if (typeof collapseSidebar === 'function') collapseSidebar(true);

    const duration = Math.min(60000, Math.max(8000, total / FLY_SPEED * 1000));
    let bearing = bearingTo(coords[0], pointAlong(coords, Math.min(total, LOOK_AHEAD)));
    let t0 = null;

    S.flying = true;
    const b = document.getElementById('simPreviewBtn');
    if (b) b.innerHTML = '<i class="fas fa-stop"></i> Stop preview';
    // any touch on the map hands control back to the user
    ['mousedown', 'touchstart', 'wheel'].forEach(ev => map.on(ev, stopFly));

    map.jumpTo({ center: coords[0], zoom: FLY_ZOOM, pitch: FLY_PITCH, bearing });

    const step = now => {
      if (!S.flying) return;
      if (t0 === null) t0 = now;
      const k = Math.min(1, (now - t0) / duration);
      const d = total * k;
      const here = pointAlong(coords, d);
      const ahead = pointAlong(coords, Math.min(total, d + LOOK_AHEAD));
      if (meters(here, ahead) > 1) bearing += norm180(bearingTo(here, ahead) - bearing) * 0.06;
      map.jumpTo({ center: here, bearing, zoom: FLY_ZOOM, pitch: FLY_PITCH });
      if (k < 1) S.raf = requestAnimationFrame(step);
      else stopFly();
    };
    S.raf = requestAnimationFrame(step);
  }

  /* ------------------------------- UI ------------------------------- */
  function addPreviewButton(info) {
    if (!info || info.style.display === 'none' || document.getElementById('simPreviewBtn')) return;
    const p = document.createElement('button');
    p.id = 'simPreviewBtn';
    p.className = 'sim-preview-btn';
    p.innerHTML = S.flying ? '<i class="fas fa-stop"></i> Stop preview' : '<i class="fas fa-play"></i> Preview route in 3D';
    p.addEventListener('click', preview);
    info.appendChild(p);
  }

  function buildUI() {
    const css = document.createElement('style');
    css.textContent = `
      .fab.sim-fab span{font:700 .95rem 'Poppins',sans-serif;letter-spacing:.02em;}
      .fab.sim-fab.active{background:var(--green);border-color:rgba(255,255,255,.4);}
      .sim-preview-btn{margin-top:10px;width:100%;padding:10px 14px;border:0;border-radius:12px;
        background:var(--green);color:#fff;font:600 .9rem 'Inter',sans-serif;cursor:pointer;}
      .sim-preview-btn i{margin-right:6px;}
      .sim-preview-btn:active{transform:scale(.98);}`;
    document.head.appendChild(css);

    btn3d = document.createElement('button');
    btn3d.className = 'fab sim-fab';
    btn3d.id = 'sim3d-btn';
    btn3d.title = '3D campus';
    btn3d.setAttribute('aria-label', 'Toggle 3D campus view');
    btn3d.setAttribute('aria-pressed', 'false');
    btn3d.innerHTML = '<span>3D</span>';
    btn3d.addEventListener('click', () => set3D(!S.on));
    (document.querySelector('.fab-container') || document.body).appendChild(btn3d);

    const info = document.getElementById('route-info');
    if (info) {
      // script.js rewrites route-info for every new route; add our button each time
      new MutationObserver(() => addPreviewButton(info))
        .observe(info, { childList: true, attributes: true, attributeFilter: ['style'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();
})();
