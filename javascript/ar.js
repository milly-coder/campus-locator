/* =====================================================================
   OUTDOOR AR NAVIGATION  (add AFTER script.js in index.html)

   Reuses from script.js:  buildings, campusPaths, pathGraph,
                           findNearestNode, dijkstra, haversineMeters, nodeKey
   Does not change anything in script.js.

   How it works
   1. GPS gives your position, the compass gives the direction you face.
   2. Your position is snapped onto the nearest point of your traced paths
      (even the middle of a segment), then Dijkstra finds the shortest way
      to the destination.
   3. The arrow points at a spot ~15 m ahead along that route, so it follows
      the path around corners instead of pointing through buildings.
   ===================================================================== */
(function () {
  'use strict';

  const LOOKAHEAD_M = 15;   // how far ahead on the route the arrow aims
  const ARRIVE_M    = 15;   // closer than this = arrived
  const NEAR_M      = 25;   // closer than this = just point straight at the building
  const MAX_SNAP_M  = 120;  // farther than this from any path = straight-line mode
  const WALK_SPEED  = 1.3;  // m/s, same pace the map route uses
  const CAMERA_FOV  = 60;   // rough horizontal field of view of a phone camera (deg)

  /* ---------------------------- geometry ---------------------------- */
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const norm360 = a => ((a % 360) + 360) % 360;
  const norm180 = a => ((a % 360) + 540) % 360 - 180;

  // compass bearing from a to b, both [lng, lat]; 0 = north, 90 = east
  function bearingTo(a, b) {
    const p1 = rad(a[1]), p2 = rad(b[1]), dl = rad(b[0] - a[0]);
    const y = Math.sin(dl) * Math.cos(p2);
    const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return norm360(deg(Math.atan2(y, x)));
  }

  // lng/lat -> metres east/north of a reference point (fine at campus scale)
  function toMeters(p, ref) {
    return [
      (p[0] - ref[0]) * 111320 * Math.cos(rad(ref[1])),
      (p[1] - ref[1]) * 110540
    ];
  }

  // closest point on a polyline to pt
  function nearestOnPolyline(pt, coords) {
    let best = null;
    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i], b = coords[i + 1];
      const A = toMeters(a, pt), B = toMeters(b, pt);
      const dx = B[0] - A[0], dy = B[1] - A[1];
      const len2 = dx * dx + dy * dy;
      let t = len2 ? (-A[0] * dx - A[1] * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const dist = Math.hypot(A[0] + t * dx, A[1] + t * dy);
      if (!best || dist < best.dist) {
        best = {
          dist, index: i,
          point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
        };
      }
    }
    return best;
  }

  function polyLength(coords) {
    let sum = 0;
    for (let i = 1; i < coords.length; i++) sum += haversineMeters(coords[i - 1], coords[i]);
    return sum;
  }

  // the point `dist` metres along a polyline (or its end if shorter)
  function pointAlong(coords, dist) {
    let acc = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const seg = haversineMeters(coords[i], coords[i + 1]);
      if (seg > 0 && acc + seg >= dist) {
        const t = (dist - acc) / seg;
        return [
          coords[i][0] + (coords[i + 1][0] - coords[i][0]) * t,
          coords[i][1] + (coords[i + 1][1] - coords[i][1]) * t
        ];
      }
      acc += seg;
    }
    return coords[coords.length - 1];
  }

  /* ---------------------------- routing ---------------------------- */
  function straightRoute(userPos, destCoord, reason, quiet) {
    return {
      coords: [userPos, destCoord],
      length: haversineMeters(userPos, destCoord),
      onNetwork: false, offPath: null, reason, quiet: !!quiet
    };
  }

  // Route from any GPS position to a destination, over your traced paths.
  function computeRoute(userPos, destCoord) {
    // already next to the building: no need to walk out to a path node and back
    if (haversineMeters(userPos, destCoord) < NEAR_M) return straightRoute(userPos, destCoord, 'close to destination', true);

    const destNode = findNearestNode(destCoord, 100);
    if (!destNode) return straightRoute(userPos, destCoord, 'destination is not near the path network');

    // find the path segment closest to the user
    let best = null;
    campusPaths.features.forEach(f => {
      const c = f.geometry.coordinates;
      if (c.length < 2) return;
      const n = nearestOnPolyline(userPos, c);
      if (n && (!best || n.dist < best.n.dist)) best = { c, n };
    });
    if (!best || best.n.dist > MAX_SNAP_M) return straightRoute(userPos, destCoord, 'you are away from the campus paths');

    // From the snapped point the user can walk to either end of that segment.
    const { c, n } = best;
    const options = [
      { key: nodeKey(c[0]),               lead: [n.point, ...c.slice(0, n.index + 1).reverse()] },
      { key: nodeKey(c[c.length - 1]),    lead: [n.point, ...c.slice(n.index + 1)] }
    ];

    let winner = null;
    options.forEach(o => {
      const r = dijkstra(pathGraph, o.key, destNode);
      if (!r) return;
      const coords = [userPos, ...o.lead];
      r.edges.forEach(e => coords.push(...e.coords));
      coords.push(destCoord);
      const length = polyLength(coords);
      if (!winner || length < winner.length) {
        winner = { coords, length, onNetwork: true, offPath: n.dist, reason: null };
      }
    });
    return winner || straightRoute(userPos, destCoord, 'no connected path found');
  }

  /* ---------------------------- compass ---------------------------- */
  // Direction the BACK of the phone (the camera) points, from alpha/beta/gamma
  // (formula from the W3C DeviceOrientation spec).
  function eulerHeading(alpha, beta, gamma) {
    const a = rad(alpha), b = rad(beta), g = rad(gamma);
    const cA = Math.cos(a), sA = Math.sin(a), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
    const rA = -cA * sG - sA * sB * cG;
    const rB = -sA * sG + cA * sB * cG;
    let h = Math.atan(rA / rB);
    if (rB < 0) h += Math.PI; else if (rA < 0) h += 2 * Math.PI;
    return norm360(deg(h));
  }

  // handy for testing in the console / Node
  if (typeof window !== 'undefined') {
    window.CampusAR = { computeRoute, pointAlong, bearingTo, eulerHeading, nearestOnPolyline, polyLength, norm180 };
  }
  if (typeof document === 'undefined') return;   // no DOM (tests): stop here

  /* ------------------------------ UI ------------------------------ */
  const S = {};
  let el = {};

  function resetState() {
    Object.assign(S, {
      open: false, userPos: null, accuracy: null,
      hx: 0, hy: 0, hasHeading: false, heading: null, compassDenied: false,
      route: null, targetBearing: null, destBearing: null, destStraight: null, arrived: false,
      arrowAngle: 0, watchId: null, stream: null, raf: 0,
      geoErr: null, cameraErr: null, lastMsg: '', lastPin: ''
    });
  }
  resetState();

  function buildUI() {
    const fab = document.createElement('button');
    fab.className = 'fab ar-fab';
    fab.id = 'ar-btn';
    fab.title = 'AR navigation';
    fab.setAttribute('aria-label', 'Open AR navigation');
    fab.innerHTML = '<span>AR</span>';
    (document.querySelector('.fab-container') || document.body).appendChild(fab);

    const wrap = document.createElement('div');
    wrap.className = 'ar-overlay';
    wrap.id = 'arOverlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'AR navigation');
    wrap.innerHTML = `
      <video class="ar-video" id="arVideo" autoplay playsinline muted></video>
      <div class="ar-scrim"></div>
      <div class="ar-top">
        <button class="ar-close" id="arClose" aria-label="Close AR"><i class="fas fa-xmark"></i></button>
        <select class="ar-dest" id="arDest" aria-label="Destination"></select>
      </div>
      <div class="ar-pin" id="arPin">
        <div class="ar-pin-label"><b id="arPinName"></b><span id="arPinDist"></span></div>
        <i class="fas fa-location-dot"></i>
      </div>
      <div class="ar-stage" id="arStage">
        <div class="ar-arrow" id="arArrow">
          <svg viewBox="0 0 120 160" aria-hidden="true">
            <path class="arrow-fill" d="M60 6 L113 72 H80 V152 H40 V72 H7 Z"/>
            <path class="arrow-edge" d="M60 6 L113 72 H80 V152 H40 V72 H7 Z"/>
          </svg>
        </div>
      </div>
      <div class="ar-hud">
        <div class="ar-card">
          <div class="ar-msg" id="arMsg"></div>
          <div class="ar-row">
            <div>
              <div class="ar-dist" id="arDist">--</div>
              <div class="ar-sub" id="arSub">Pick a destination</div>
            </div>
            <button class="ar-status" id="arStatus" aria-label="Show GPS details">
              <span class="ar-dot" id="arDot"></span><span id="arStatusText">GPS</span>
            </button>
          </div>
          <div class="ar-debug" id="arDebug"></div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    el = {
      fab, overlay: wrap,
      video: wrap.querySelector('#arVideo'), close: wrap.querySelector('#arClose'),
      dest: wrap.querySelector('#arDest'), pin: wrap.querySelector('#arPin'),
      pinName: wrap.querySelector('#arPinName'), pinDist: wrap.querySelector('#arPinDist'),
      stage: wrap.querySelector('#arStage'), arrow: wrap.querySelector('#arArrow'),
      msg: wrap.querySelector('#arMsg'), dist: wrap.querySelector('#arDist'), sub: wrap.querySelector('#arSub'),
      status: wrap.querySelector('#arStatus'), dot: wrap.querySelector('#arDot'),
      statusText: wrap.querySelector('#arStatusText'), debug: wrap.querySelector('#arDebug')
    };

    fab.addEventListener('click', openAR);
    el.close.addEventListener('click', closeAR);
    el.dest.addEventListener('change', recompute);
    el.status.addEventListener('click', () => el.debug.classList.toggle('show'));
  }

  function currentDest() {
    const name = el.dest.value;
    return name ? buildings.find(b => b.name === name) || null : null;
  }

  function populateDestinations() {
    const prefill = ((document.getElementById('dest-input') || {}).value || '').trim().toLowerCase();
    el.dest.innerHTML = '';
    const first = document.createElement('option');
    first.value = ''; first.textContent = 'Choose a destination';
    el.dest.appendChild(first);
    buildings
      .filter(b => b.name !== 'Unnamed')
      .slice().sort((a, b) => a.name.localeCompare(b.name))
      .forEach(b => {
        const o = document.createElement('option');
        o.value = b.name; o.textContent = b.name;
        el.dest.appendChild(o);
      });
    const match = buildings.find(b => b.name.toLowerCase() === prefill);
    el.dest.value = match ? match.name : '';
  }

  /* --------------------------- sensors --------------------------- */
  async function askMotionPermission() {
    // iOS only. Must be the first thing that runs inside the tap handler.
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') {
      try { S.compassDenied = (await D.requestPermission()) !== 'granted'; }
      catch (e) { S.compassDenied = true; }
    }
  }

  function onOrient(e) {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
      h = e.webkitCompassHeading;                       // iOS
    } else if ((e.absolute || e.type === 'deviceorientationabsolute') &&
               e.alpha != null && e.beta != null && e.gamma != null) {
      h = eulerHeading(e.alpha, e.beta, e.gamma);       // Android
    }
    if (h == null) return;
    const r = rad(h);
    if (!S.hasHeading) { S.hx = Math.sin(r); S.hy = Math.cos(r); S.hasHeading = true; }
    else { const k = 0.15; S.hx += (Math.sin(r) - S.hx) * k; S.hy += (Math.cos(r) - S.hy) * k; }  // smooth, wrap-safe
  }

  function startOrientation() {
    window.addEventListener('deviceorientationabsolute', onOrient, true);
    window.addEventListener('deviceorientation', onOrient, true);
  }
  function stopOrientation() {
    window.removeEventListener('deviceorientationabsolute', onOrient, true);
    window.removeEventListener('deviceorientation', onOrient, true);
  }

  function onPos(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    const p = [longitude, latitude];
    S.geoErr = null;
    S.accuracy = accuracy;
    if (!S.userPos) S.userPos = p;
    else {
      const k = accuracy > 40 ? 0.2 : 0.5;              // trust weak fixes less
      S.userPos = [S.userPos[0] + (p[0] - S.userPos[0]) * k, S.userPos[1] + (p[1] - S.userPos[1]) * k];
    }
    el.dot.className = 'ar-dot ' + (accuracy <= 12 ? 'good' : accuracy <= 25 ? 'ok' : 'bad');
    el.statusText.textContent = 'GPS \u00B1' + Math.round(accuracy) + ' m';
    recompute();
  }

  function onGeoErr(err) {
    S.geoErr = err.code === 1
      ? 'Location is blocked. Allow location for this site, then reopen AR.'
      : 'No GPS fix yet. Move to an open area, away from tall buildings.';
    el.dot.className = 'ar-dot bad';
    el.statusText.textContent = 'No GPS';
  }

  function startGeo() {
    if (!navigator.geolocation) { S.geoErr = 'This browser cannot access your location.'; return; }
    S.watchId = navigator.geolocation.watchPosition(onPos, onGeoErr,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
  }

  async function startCamera() {
    try {
      S.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false
      });
      if (!S.open) { S.stream.getTracks().forEach(t => t.stop()); S.stream = null; return; }
      el.video.srcObject = S.stream;
      el.overlay.classList.remove('no-camera');
      try { await el.video.play(); } catch (e) { /* autoplay is already set */ }
    } catch (e) {
      S.cameraErr = e && e.name ? e.name : 'unavailable';
      el.overlay.classList.add('no-camera');            // still works: arrow over a plain background
    }
  }

  /* --------------------------- navigation --------------------------- */
  function recompute() {
    const dest = currentDest();
    if (!dest || !S.userPos) { S.route = null; S.targetBearing = null; renderStats(); return; }
    const dc = [dest.lng, dest.lat];
    S.route = computeRoute(S.userPos, dc);
    S.targetBearing = bearingTo(S.userPos, pointAlong(S.route.coords, LOOKAHEAD_M));
    S.destBearing = bearingTo(S.userPos, dc);
    S.destStraight = haversineMeters(S.userPos, dc);
    const arriveAt = Math.max(ARRIVE_M, Math.min(S.accuracy || 0, 30));
    S.arrived = S.destStraight < arriveAt || S.route.length < arriveAt;
    renderStats();
  }

  function renderStats() {
    if (!S.route) { el.dist.textContent = '--'; el.sub.textContent = currentDest() ? 'Waiting for GPS' : 'Pick a destination'; return; }
    const len = S.route.length;
    el.dist.textContent = len >= 1000 ? (len / 1000).toFixed(2) + ' km' : Math.round(len) + ' m';
    el.sub.textContent = S.arrived ? 'Arrived' : 'About ' + Math.max(1, Math.round(len / WALK_SPEED / 60)) + ' min on foot';
  }

  function instructionFor(rel) {
    const a = Math.abs(rel), side = rel > 0 ? 'right' : 'left';
    if (a < 15) return 'Keep going straight';
    if (a < 45) return 'Bear slightly ' + side;
    if (a < 120) return 'Turn ' + side;
    return 'Turn around';
  }

  function setText(node, key, text) {
    if (S[key] !== text) { S[key] = text; node.textContent = text; }
  }

  function frame() {
    S.raf = requestAnimationFrame(frame);
    S.heading = S.hasHeading ? norm360(deg(Math.atan2(S.hx, S.hy))) : null;
    const dest = currentDest();
    let msg, rel = null;

    if (!dest) msg = 'Choose a destination at the top.';
    else if (!S.userPos) msg = S.geoErr || 'Finding your location. Stay outside, away from tall buildings.';
    else if (S.arrived) msg = 'You have arrived at ' + dest.name + '.';
    else if (S.heading == null) {
      msg = S.compassDenied
        ? 'Compass access was blocked. Allow motion and orientation access, then reopen AR.'
        : 'Waiting for the compass. Hold the phone upright and sweep it in a figure 8.';
    } else {
      rel = norm180(S.targetBearing - S.heading);
      msg = instructionFor(rel) + (S.route && !S.route.onNetwork && !S.route.quiet ? ' (straight line, off the campus paths)' : '');
    }
    setText(el.msg, 'lastMsg', msg);

    // ground arrow
    if (rel !== null) {
      S.arrowAngle = norm180(S.arrowAngle + norm180(rel - S.arrowAngle) * 0.25);
      el.arrow.style.transform = 'rotateX(58deg) rotateZ(' + S.arrowAngle.toFixed(1) + 'deg)';
      el.arrow.classList.toggle('aligned', Math.abs(rel) < 12);
      el.stage.style.opacity = '1';
    } else {
      el.stage.style.opacity = '0';
    }

    // destination pin when the building is inside the camera view
    let showPin = false;
    if (dest && S.userPos && S.heading != null && !S.arrived && S.destStraight < 400) {
      const relD = norm180(S.destBearing - S.heading);
      if (Math.abs(relD) < CAMERA_FOV / 2) {
        showPin = true;
        el.pin.style.left = (50 + (relD / (CAMERA_FOV / 2)) * 50) + '%';
        setText(el.pinName, 'lastPin', dest.name);
        el.pinDist.textContent = Math.round(S.destStraight) + ' m away';
      }
    }
    el.pin.classList.toggle('show', showPin);

    if (el.debug.classList.contains('show')) updateDebug(rel);
  }

  function updateDebug(rel) {
    const r = S.route;
    el.debug.textContent = [
      'pos     ' + (S.userPos ? S.userPos[1].toFixed(6) + ', ' + S.userPos[0].toFixed(6) : 'none') +
              (S.accuracy != null ? '  (+/-' + Math.round(S.accuracy) + ' m)' : ''),
      'heading ' + (S.heading != null ? Math.round(S.heading) + ' deg' : 'none') +
              '   target ' + (S.targetBearing != null ? Math.round(S.targetBearing) + ' deg' : '-') +
              '   turn ' + (rel != null ? Math.round(rel) + ' deg' : '-'),
      'route   ' + (r ? Math.round(r.length) + ' m, ' + (r.onNetwork ? 'on paths, ' + Math.round(r.offPath) + ' m from nearest path' : 'straight line: ' + r.reason) : 'none'),
      'camera  ' + (S.cameraErr ? 'unavailable (' + S.cameraErr + ')' : 'ok')
    ].join('\n');
  }

  /* --------------------------- open / close --------------------------- */
  async function openAR() {
    if (S.open) return;
    resetState();
    S.open = true;
    el.overlay.classList.add('open');
    populateDestinations();
    renderStats();
    el.dot.className = 'ar-dot';
    el.statusText.textContent = 'GPS';

    await askMotionPermission();     // iOS: must come first, straight from the tap
    if (!S.open) return;
    if (!window.isSecureContext) S.geoErr = 'AR needs a secure (https) page to use the camera and sensors.';
    startOrientation();
    startGeo();
    S.raf = requestAnimationFrame(frame);
    await startCamera();
  }

  function closeAR() {
    cancelAnimationFrame(S.raf);
    stopOrientation();
    if (S.watchId != null) navigator.geolocation.clearWatch(S.watchId);
    if (S.stream) S.stream.getTracks().forEach(t => t.stop());
    el.video.srcObject = null;
    el.overlay.classList.remove('open', 'no-camera');
    el.debug.classList.remove('show');
    resetState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();
})();
