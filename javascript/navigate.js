/* =====================================================================
   NAVIGATION MODE  (load after script.js, before ui.js)

   After "Start": follows the user's GPS position along the route,
   turns the map so the way ahead points up, shows the next turn,
   speaks the turns ("In 30 metres, turn left" / "Turn left now"),
   re-routes when the user strays, and announces arrival.

   Turns are worked out from the shape of the route line itself, so the
   same code works for campus-path routes and for Mapbox's route.

   Used by ui.js:  Nav.start(routeOption, options), Nav.stop(), Nav.active
   ===================================================================== */
(function () {
  'use strict';

  const ANNOUNCE_M = 40;      // "In 30 metres, turn left" when the turn is this close
  const NOW_M = 12;           // "Turn left now"
  const OFF_ROUTE_M = 25;     // further than this from the route = off route
  const REROUTE_GAP_MS = 10000;
  const WALK = 1.3;           // metres per second

  /* ----------------------------- geometry ----------------------------- */
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const norm180 = a => ((a % 360) + 540) % 360 - 180;
  function dist(a, b) {
    const dx = (b[0] - a[0]) * 111320 * Math.cos(rad((a[1] + b[1]) / 2)), dy = (b[1] - a[1]) * 110540;
    return Math.hypot(dx, dy);
  }
  function bearing(a, b) {
    const p1 = rad(a[1]), p2 = rad(b[1]), dl = rad(b[0] - a[0]);
    return (deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))) + 360) % 360;
  }
  // the route as a line with distance markers along it
  function prepare(coords) {
    const c = [coords[0]];
    coords.forEach(p => { if (dist(c[c.length - 1], p) > 0.5) c.push(p); });
    const cum = [0];
    for (let i = 1; i < c.length; i++) cum.push(cum[i - 1] + dist(c[i - 1], c[i]));
    return { c, cum, total: cum[cum.length - 1] || 0 };
  }
  function pointAt(r, d) {
    d = Math.max(0, Math.min(r.total, d));
    for (let i = 1; i < r.c.length; i++) {
      if (r.cum[i] >= d) {
        const seg = r.cum[i] - r.cum[i - 1], t = seg ? (d - r.cum[i - 1]) / seg : 0;
        return [r.c[i - 1][0] + (r.c[i][0] - r.c[i - 1][0]) * t, r.c[i - 1][1] + (r.c[i][1] - r.c[i - 1][1]) * t];
      }
    }
    return r.c[r.c.length - 1];
  }
  // The turns along the route. Campus paths have small kinks, so: bends under
  // 40 degrees are ignored, and bends within 20 m of each other are added together
  // (a quick left-right jog cancels out instead of becoming two instructions).
  function findTurns(r) {
    const raw = [];
    for (let i = 1; i < r.c.length - 1; i++) {
      const d = r.cum[i];
      if (d < 4 || r.total - d < 4) continue;
      const before = pointAt(r, d - 8), after = pointAt(r, d + 8);
      const turn = norm180(bearing(r.c[i], after) - bearing(before, r.c[i]));
      if (Math.abs(turn) >= 20) raw.push({ at: d, turn });
    }
    const out = [];
    for (let k = 0; k < raw.length; k++) {
      let { at, turn } = raw[k];
      while (k + 1 < raw.length && raw[k + 1].at - at < 20) { turn = norm180(turn + raw[k + 1].turn); k++; }
      if (Math.abs(turn) >= 40) out.push({ at, turn });
    }
    return out;
  }
  // written directions for a route line: "Walk 40 m, then turn left", ...
  function describe(coords) {
    const r = prepare(coords), turns = findTurns(r), out = [];
    let from = 0;
    turns.forEach(t => { out.push(`Walk ${fmt(t.at - from)}, then ${phrase(t.turn)}`); from = t.at; });
    out.push(`Walk ${fmt(r.total - from)} to your destination`);
    return out;
  }
  function phrase(turn) {
    const a = Math.abs(turn), side = turn > 0 ? 'right' : 'left';
    if (a >= 150) return 'turn around';
    if (a >= 110) return 'turn sharp ' + side;
    if (a < 55) return 'bear ' + side;
    return 'turn ' + side;
  }
  // closest point on the route to the user: how far along, and how far off
  function snap(r, p, hint) {
    let best = null;
    const lo = hint == null ? -Infinity : hint - 30, hi = hint == null ? Infinity : hint + 80;
    for (let i = 0; i < r.c.length - 1; i++) {
      if (r.cum[i + 1] < lo || r.cum[i] > hi) continue;
      const k = 111320 * Math.cos(rad(p[1]));
      const ax = (r.c[i][0] - p[0]) * k, ay = (r.c[i][1] - p[1]) * 110540;
      const bx = (r.c[i + 1][0] - p[0]) * k, by = (r.c[i + 1][1] - p[1]) * 110540;
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
      const off = Math.hypot(ax + t * dx, ay + t * dy);
      if (!best || off < best.off) best = { off, along: r.cum[i] + t * (r.cum[i + 1] - r.cum[i]) };
    }
    if (!best && hint != null) return snap(r, p, null);
    return best;
  }

  /* ----------------------------- formatting ----------------------------- */
  const roundM = m => m >= 100 ? Math.round(m / 10) * 10 : Math.max(5, Math.round(m / 5) * 5);
  const fmt = m => m >= 1000 ? (m / 1000).toFixed(1) + ' km' : roundM(m) + ' m';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const clock = sec => { const t = new Date(Date.now() + sec * 1000); return t.toTimeString().slice(0, 5); };

  /* ------------------------------- state ------------------------------- */
  const $ = id => document.getElementById(id);
  let S = null;

  function say(text) {
    if (!S || S.muted) return;
    if (typeof speakText === 'function') speakText(text);
  }
  const buzz = pattern => { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* not supported */ } };

  function loadRoute(opt) {
    S.r = prepare(opt.geometry.coordinates);
    S.turns = findTurns(S.r);
    S.spoken = {};
    S.along = 0;
    S.offCount = 0;
    S.dest = opt.destCoord;
  }

  async function keepScreenOn() {
    try { if (navigator.wakeLock) S.wake = await navigator.wakeLock.request('screen'); } catch (e) { /* not allowed */ }
  }

  function setBottomSpace() {
    const h = (S && window.matchMedia('(max-width:768px)').matches) ? $('navBottom').offsetHeight : 0;
    document.documentElement.style.setProperty('--sheet-h', h + 'px');
  }

  /* ------------------------------- start ------------------------------- */
  function start(opt, o) {
    if (S) stop(true);
    S = { muted: false, follow: true, watch: null, wake: null, arrived: false, lastReroute: 0, rerouting: false,
      destName: o.destName || 'your destination', destKey: o.destKey || '', onReroute: o.onReroute, onEnd: o.onEnd, feedbackUrl: o.feedbackUrl || '' };
    loadRoute(opt);
    Nav.active = true;
    document.body.classList.add('navigating');
    $('navTop').hidden = false; $('navBottom').hidden = false; $('arriveCard').hidden = true;
    $('navMute').innerHTML = '<i class="fas fa-volume-high fa-volume-up"></i>';
    requestAnimationFrame(setBottomSpace);
    if (typeof stopTracking === 'function') stopTracking();          // we draw our own dot and move the camera ourselves

    // the user's dot, with a pointer showing the direction of the route
    const el = document.createElement('div');
    el.className = 'nav-dot';
    el.innerHTML = '<span class="nav-dot-arrow"></span>';
    S.marker = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' }).setLngLat(S.r.c[0]).addTo(map);

    // the first sentence must be spoken straight from the tap (phones block speech otherwise)
    const first = S.turns[0];
    say(first && first.at < 60
      ? `Starting route to ${S.destName}. In ${roundM(first.at)} metres, ${phrase(first.turn)}.`
      : `Starting route to ${S.destName}. Follow the path for ${roundM(first ? first.at : S.r.total)} metres.`);
    keepScreenOn();
    updateHud(0);
    map.easeTo({ center: S.r.c[0], zoom: 18, pitch: 50, bearing: bearing(S.r.c[0], pointAt(S.r, 15)), duration: 1000 });
    map.on('dragstart', pauseFollow);

    if (!navigator.geolocation) { $('navInstr').textContent = 'This browser can\'t use your location.'; return; }
    S.watch = navigator.geolocation.watchPosition(onFix, onGpsError, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
  }

  function pauseFollow() { if (S && S.follow) { S.follow = false; $('navRecenter').hidden = false; } }
  function recenter() { if (!S) return; S.follow = true; $('navRecenter').hidden = true; if (S.last) moveCamera(S.last.point, S.last.heading); }
  function moveCamera(point, heading) {
    map.easeTo({ center: point, bearing: heading, zoom: 18, pitch: 50, duration: 800,
      padding: { top: 120, bottom: ($('navBottom').offsetHeight || 80) + 20, left: 20, right: 20 } });
  }

  function onGpsError(err) {
    if (!S) return;
    $('navDist').textContent = '';
    $('navInstr').textContent = err.code === 1
      ? 'Location is blocked. Allow location for this site to navigate.'
      : 'Waiting for GPS. Move to an open area.';
  }

  /* --------------------------- each GPS update --------------------------- */
  async function onFix(pos) {
    if (!S || S.arrived) return;
    const p = [pos.coords.longitude, pos.coords.latitude], acc = pos.coords.accuracy || 20;
    currentPosition = p;                                              // shared with script.js

    // arrived?
    const toDest = dist(p, S.dest);
    const snapped = snap(S.r, p, S.along);
    if (!snapped) return;
    if (toDest <= Math.max(15, Math.min(acc, 30)) || (snapped && S.r.total - snapped.along < 10 && snapped.off < OFF_ROUTE_M)) {
      return arrive();
    }

    // off the route? (two readings in a row, to ignore a single GPS jump)
    const offLimit = Math.max(OFF_ROUTE_M, Math.min(acc, 40));
    if (snapped.off > offLimit) {
      S.offCount++;
      if (S.offCount >= 2 && !S.rerouting && Date.now() - S.lastReroute > REROUTE_GAP_MS && S.onReroute) {
        S.rerouting = true; S.lastReroute = Date.now();
        say('You\'ve left the route. Finding a new one.');
        $('navInstr').textContent = 'Finding a new route…';
        try {
          const opt = await S.onReroute(p);
          if (S && opt) { loadRoute(opt); say('New route found.'); }
        } catch (e) { /* keep the old route */ }
        if (S) S.rerouting = false;
      }
    } else {
      S.offCount = 0;
      S.along = Math.max(S.along - 15, snapped.along);               // small GPS wobble backwards is ignored
    }

    const shown = snapped.off < 20 ? pointAt(S.r, S.along) : p;      // keep the dot on the path when close
    const heading = bearing(pointAt(S.r, S.along), pointAt(S.r, S.along + 15));
    S.last = { point: shown, heading };
    S.marker.setLngLat(shown).setRotation(heading);
    if (S.follow) moveCamera(shown, heading);
    speakTurns();
    updateHud(S.along);
  }

  function nextTurn() {
    for (let i = 0; i < S.turns.length; i++) if (S.turns[i].at > S.along + 3) return { i, t: S.turns[i] };
    return null;
  }

  function speakTurns() {
    const n = nextTurn();
    if (!n) return;
    const d = n.t.at - S.along, ph = phrase(n.t.turn);
    if (d <= NOW_M) {
      if (!S.spoken[n.i + 'now']) { S.spoken[n.i + 'now'] = S.spoken[n.i + 'soon'] = true; say(cap(ph) + ' now.'); buzz(150); }
    } else if (d <= ANNOUNCE_M) {
      if (!S.spoken[n.i + 'soon']) { S.spoken[n.i + 'soon'] = true; say(`In ${roundM(d)} metres, ${ph}.`); }
    } else if (n.i > 0 && S.spoken[(n.i - 1) + 'now'] && !S.spoken[n.i + 'cont'] && d > 80) {
      S.spoken[n.i + 'cont'] = true; say(`Continue for ${roundM(d)} metres.`);
    }
  }

  function updateHud(along) {
    const left = Math.max(0, S.r.total - along), n = nextTurn();
    const icon = $('navIcon');
    if (n) {
      $('navDist').textContent = fmt(n.t.at - along);
      $('navInstr').textContent = cap(phrase(n.t.turn));
      icon.innerHTML = '<i class="fas fa-arrow-up"></i>';
      icon.firstChild.style.transform = `rotate(${Math.max(-150, Math.min(150, n.t.turn))}deg)`;
    } else {
      $('navDist').textContent = fmt(left);
      $('navInstr').textContent = 'to ' + S.destName;
      icon.innerHTML = '<i class="fas fa-flag-checkered"></i>';
    }
    const sec = left / WALK;
    $('navTime').textContent = Math.max(1, Math.round(sec / 60)) + ' min';
    $('navLeft').textContent = fmt(left) + ' · arrive ' + clock(sec);
  }

  /* ------------------------------ arrival ------------------------------ */
  function arrive() {
    if (!S || S.arrived) return;
    S.arrived = true;
    if (S.watch != null) navigator.geolocation.clearWatch(S.watch);
    S.watch = null;
    say(`You have arrived at ${S.destName}.`);
    buzz([200, 100, 200]);
    $('navTop').hidden = true; $('navBottom').hidden = true; $('navRecenter').hidden = true;
    $('arrivePlace').textContent = S.destName;
    const fb = $('arriveFeedback');
    if (S.feedbackUrl) { fb.href = S.feedbackUrl; fb.hidden = false; } else fb.hidden = true;
    $('arriveCard').hidden = false;
    $('arriveDone').focus();
  }

  /* -------------------------------- end -------------------------------- */
  function stop(silent) {
    if (!S) return;
    if (S.watch != null) navigator.geolocation.clearWatch(S.watch);
    try { if (S.wake) S.wake.release(); } catch (e) { /* already released */ }
    if (S.marker) S.marker.remove();
    map.off('dragstart', pauseFollow);
    const done = S.onEnd;
    S = null;
    Nav.active = false;
    document.body.classList.remove('navigating');
    ['navTop', 'navBottom', 'navRecenter', 'arriveCard'].forEach(id => { $(id).hidden = true; });
    document.documentElement.style.setProperty('--sheet-h', '0px');
    map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    if (!silent && window.speechSynthesis) speechSynthesis.cancel();
    if (!silent && typeof done === 'function') done();
  }

  function toggleMute() {
    if (!S) return;
    S.muted = !S.muted;
    if (S.muted && window.speechSynthesis) speechSynthesis.cancel();
    $('navMute').innerHTML = S.muted ? '<i class="fas fa-volume-xmark fa-volume-mute"></i>' : '<i class="fas fa-volume-high fa-volume-up"></i>';
    $('navMute').setAttribute('aria-label', S.muted ? 'Turn voice on' : 'Mute voice');
  }

  function bindHud() {
    $('navEnd').onclick = () => stop(false);
    $('navMute').onclick = toggleMute;
    $('navRecenter').onclick = recenter;
    $('arriveDone').onclick = () => stop(false);
    $('navLive').onclick = () => { if (S && window.openLiveView) openLiveView(S.destKey); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindHud); else bindHud();

  const Nav = window.Nav = { start, stop: () => stop(false), active: false, describe, _test: { prepare, findTurns, phrase, snap, pointAt } };
})();
