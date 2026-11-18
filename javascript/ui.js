/* =====================================================================
   INTERFACE  (load LAST in index2.html)

   The screen works like Google Maps:
   - a search bar and category chips at the top
   - tap a place (search result or map dot) -> a place card slides up,
     with Directions, 3D View and Live View
   - Directions starts from "My Location" and shows the route straight away
   - round buttons on the right: Locate, 3D View, Live View, Settings
   - Settings: dark mode, voice guidance, voice input, feedback, about

   Reuses from script.js: map, buildings, findBuilding, suggestPlaces,
   getBuildingDetails, getCustomRoute, resolveLocation, getWalkingRoute,
   renderRoute, getFreshPosition, startTracking, speakText, ...
   ===================================================================== */
(function () {
  'use strict';

  // Paste your Google Form link here (Send > link icon > Copy).
  const FEEDBACK_URL = '';

  const $ = id => document.getElementById(id);
  const isPhone = () => window.matchMedia('(max-width:768px)').matches;
  const km = d => d >= 1000 ? (d / 1000).toFixed(2) + ' km' : Math.round(d) + ' m';
  const mins = d => Math.max(1, Math.round(d / 1.3 / 60)) + ' min';
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------------------- settings ---------------------------- */
  const KEY = 'campusLocatorSettings';
  const DEFAULTS = { dark: false, voiceGuidance: true, voiceInput: true };
  let settings = Object.assign({}, DEFAULTS);
  try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* private mode */ }
  window.appSettings = settings;                       // speakText() in script.js reads this
  const saveSettings = () => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } };

  function applyDark(on) {
    document.body.classList.toggle('dark', on);
    if (!map) return;
    map.setStyle(on ? darkStyle : lightStyle);
    map.once('style.load', () => {
      addBuildingPointsLayer();
      if (currentRouteGeometry) restoreRouteAfterStyleChange();
    });
  }
  const applyVoiceInput = on => document.body.classList.toggle('no-voice', !on);

  /* --------------------------- bottom sheet --------------------------- */
  let place = null;           // the building shown on the place card
  let routeOptions = [];      // campus-path and Mapbox routes, shortest first

  function setSheetHeight() {
    const sh = $('sheet');
    const h = (!sh.hidden && isPhone()) ? sh.offsetHeight : 0;
    document.documentElement.style.setProperty('--sheet-h', h + 'px');
  }
  function showSheet(view) {
    $('sheet').hidden = false;
    $('placeView').hidden = view !== 'place';
    $('dirView').hidden = view !== 'dir';
    document.body.classList.add('sheet-open');
    $('sheet').scrollTop = 0;
    requestAnimationFrame(setSheetHeight);
  }
  function hideSheet() {
    $('sheet').hidden = true;
    document.body.classList.remove('sheet-open');
    setSheetHeight();
  }
  // leave room for the sheet when fitting the map to a route
  const mapPadding = () => isPhone()
    ? { top: 130, bottom: ($('sheet').hidden ? 0 : $('sheet').offsetHeight) + 30, left: 40, right: 80 }
    : { top: 80, bottom: 60, left: 470, right: 100 };

  function clearRoute() {
    if (currentRouteLayer) { try { map.removeLayer(currentRouteLayer); map.removeSource(currentRouteLayer); } catch (e) { /* gone */ } }
    currentRouteLayer = null;
    if (startMarker) { startMarker.remove(); startMarker = null; }
    if (endMarker) { endMarker.remove(); endMarker = null; }
    currentRouteGeometry = null;
    isNavigating = false;
    routeOptions = [];
    setPathsNetworkDim(false);
  }

  /* ---------------------------- place card ---------------------------- */
  function openPlace(name) {
    const b = buildings.find(x => x.name === name) || findBuilding(name);
    if (!b) return;
    place = b;
    const d = getBuildingDetails(b.name, b.category);
    const img = $('placeImg');
    img.onerror = () => { img.onerror = null; img.src = 'images/e-gate.jpg'; };
    img.src = d.imageUrl; img.alt = b.name;
    $('placeName').textContent = b.name;
    $('placeCode').hidden = !d.official;
    $('placeCode').textContent = d.official ? d.official.code : '';
    $('placeOfficial').textContent = d.official ? d.official.official : (b.category ? b.category.charAt(0).toUpperCase() + b.category.slice(1) : '');
    $('placeDesc').textContent = d.history;
    $('placeSource').textContent = d.official ? 'Source: ' + EMSD_SOURCE : '';
    closeSuggest();
    if (activePopup) { activePopup.remove(); activePopup = null; }
    showSheet('place');
    map.flyTo({ center: [b.lng, b.lat], zoom: 18, padding: mapPadding() });
  }
  window.openPlace = openPlace;                       // script.js calls this when a map dot is tapped

  /* ---------------------------- directions ---------------------------- */
  function openDirections() {
    if (!place) return;
    $('dest-input').value = place.name;
    if (!$('start-input').value.trim()) $('start-input').value = 'My Location';
    showSheet('dir');
    computeRoute();
  }

  let routeRun = 0;
  async function computeRoute() {
    const run = ++routeRun;                           // ignore answers to older requests
    const startTxt = $('start-input').value.trim();
    const destTxt = $('dest-input').value.trim();
    const summary = $('routeSummary');
    $('routeActions').hidden = true;
    $('routeStepsWrap').hidden = true;
    if (!startTxt || !destTxt) { summary.innerHTML = '<p class="route-msg">Choose a starting point and a destination.</p>'; return; }
    summary.innerHTML = '<p class="route-msg"><i class="fas fa-spinner fa-spin"></i> Finding the best route…</p>';

    if ((isMyLocation(startTxt) || isMyLocation(destTxt)) && !currentPosition) {
      const pos = await getFreshPosition();
      if (run !== routeRun) return;
      if (!pos) {
        summary.innerHTML = '<p class="route-msg">Couldn\'t get your location. Turn on location (GPS) and allow this site to use it, or type a starting building.</p>';
        return;
      }
    }

    const options = [];
    const custom = getCustomRoute(startTxt, destTxt);
    if (custom) options.push(Object.assign({ label: 'Campus paths', isCustom: true }, custom));
    const startCoord = custom ? custom.startCoord : await resolveLocation(startTxt);
    const endCoord = custom ? custom.destCoord : await resolveLocation(destTxt);
    if (startCoord && endCoord) {
      try {
        const road = await getWalkingRoute(startCoord, endCoord);       // needs internet
        options.push({ label: 'Mapbox walking route', isCustom: false, geometry: road.geometry, distance: road.distance,
          steps: road.legs[0].steps.map(st => st.maneuver.instruction), startCoord, destCoord: endCoord });
      } catch (e) { /* offline or no road route: campus paths only */ }
    }
    if (run !== routeRun) return;
    if (!options.length) {
      summary.innerHTML = '<p class="route-msg">No walking route found. Try picking both places from the list.</p>';
      return;
    }
    options.sort((x, y) => x.distance - y.distance);
    routeOptions = options;
    showRoute(0);
  }

  function showRoute(i) {
    const o = routeOptions[i];
    if (!o) return;
    renderRoute(o.geometry, o.distance, o.steps, o.startCoord, o.destCoord, o.isCustom);
    let html = `<div class="route-main"><span class="route-time">${mins(o.distance)}</span><span class="route-dist">${km(o.distance)}</span></div>
      <div class="route-choice">${esc(o.label)}${routeOptions.length > 1 && i === 0 ? ' · shortest' : ''}</div>`;
    if (routeOptions.length > 1) {
      const j = i === 0 ? 1 : 0, other = routeOptions[j];
      html += `<div class="route-alt">Other option: ${esc(other.label)} · ${km(other.distance)} · ${mins(other.distance)}
        <button class="route-alt-btn" data-i="${j}">Show</button></div>`;
    }
    $('routeSummary').innerHTML = html;
    const alt = $('routeSummary').querySelector('.route-alt-btn');
    if (alt) alt.onclick = () => showRoute(+alt.dataset.i);
    $('routeSteps').innerHTML = (o.steps || []).map(st => `<li>${esc(st)}</li>`).join('');
    $('routeStepsWrap').hidden = !(o.steps || []).length;
    $('routeActions').hidden = false;
    requestAnimationFrame(() => {
      setSheetHeight();
      map.fitBounds(new mapboxgl.LngLatBounds().extend(o.startCoord).extend(o.destCoord), { padding: mapPadding(), maxZoom: 18 });
    });
  }

  /* ---------------------------- suggestions ---------------------------- */
  // One drop-down helper for the search bar and both direction boxes.
  // Works after 2 letters, ignores capitals, matches names, EMSD codes and offices.
  function attachSuggest(input, box, opts) {
    let items = [], active = -1;
    const close = () => { box.style.display = 'none'; active = -1; input.setAttribute('aria-expanded', 'false'); };
    const choose = i => { const it = items[i]; if (!it) return; close(); opts.onChoose(it.value); };
    const highlight = () => box.querySelectorAll('.suggest-item').forEach((el, k) => el.classList.toggle('active', k === active));
    const render = list => {
      items = list;
      if (!items.length) return close();
      box.innerHTML = items.map((it, k) => `<div class="suggest-item" role="option" data-i="${k}">
        ${it.icon ? `<i class="fas ${it.icon}"></i>` : it.code ? `<span class="result-code">${esc(it.code)}</span>` : '<i class="fas fa-location-dot fa-map-marker-alt"></i>'}
        <span class="suggest-name">${esc(it.value)}</span>${it.category ? `<span class="suggest-cat">${esc(it.category)}</span>` : ''}</div>`).join('');
      box.querySelectorAll('.suggest-item').forEach(el => {
        el.addEventListener('mousedown', e => { e.preventDefault(); choose(+el.dataset.i); });   // before blur
      });
      active = -1; box.style.display = 'block'; input.setAttribute('aria-expanded', 'true');
    };
    const open = () => render(opts.list(input.value));
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', box.id);
    input.addEventListener('input', open);
    input.addEventListener('focus', () => { if (input.value) open(); });
    input.addEventListener('blur', () => setTimeout(close, 120));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && box.style.display !== 'block') { open(); if (items.length) { e.preventDefault(); choose(0); } return; }
      if (box.style.display !== 'block') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(items.length - 1, active + 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(active < 0 ? 0 : active); }
      else if (e.key === 'Escape') { close(); }
    });
    return { open, close, render };
  }
  let searchSuggest = null;
  const closeSuggest = () => searchSuggest && searchSuggest.close();

  function searchList(text) {
    const inCat = it => currentCategory === 'all' || it.category === currentCategory;
    if (!text.trim() && currentCategory !== 'all') {     // a chip with an empty search: list that category
      return buildings.filter(b => b.category === currentCategory && b.name !== 'Unnamed')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(b => ({ value: b.name, code: (getOfficialInfo(b.name) || {}).code, category: b.category }));
    }
    return suggestPlaces(text, false).filter(inCat);
  }

  /* ---------------------------- voice input ---------------------------- */
  // Shows "Listening…" straight away and fills in words as you speak.
  function listen(input, btn, done) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input isn\'t supported in this browser. Try Chrome.'); return; }
    const rec = new SR();
    rec.lang = 'en-GB'; rec.interimResults = true; rec.maxAlternatives = 1;
    const oldPh = input.placeholder;
    input.placeholder = 'Listening…'; input.value = '';
    btn.classList.add('listening');
    let finalText = '';
    rec.onresult = e => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) finalText = t; }
      input.value = t;
    };
    rec.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted') alert('Voice input didn\'t work. Check the microphone permission and try again.'); };
    rec.onend = () => {
      btn.classList.remove('listening'); input.placeholder = oldPh;
      const t = (finalText || input.value).trim();
      if (t) done(t);
    };
    try { rec.start(); } catch (e) { btn.classList.remove('listening'); input.placeholder = oldPh; }
  }

  /* ------------------------------ wiring ------------------------------ */
  function initUI() {
    // search bar
    const si = $('search-input');
    searchSuggest = attachSuggest(si, $('search-suggest'), { list: searchList, onChoose: name => { si.value = name; $('searchClear').hidden = false; openPlace(name); si.blur(); } });
    si.addEventListener('input', () => { $('searchClear').hidden = !si.value; });
    $('searchClear').onclick = () => { si.value = ''; $('searchClear').hidden = true; closeSuggest(); si.focus(); };
    $('voiceSearchBtn').onclick = () => listen(si, $('voiceSearchBtn'), t => { $('searchClear').hidden = false; searchSuggest.open(); });

    // tapping anywhere outside the search area closes the suggestions
    document.addEventListener('pointerdown', e => { if (!$('topbar').contains(e.target)) closeSuggest(); });

    // category chips
    document.querySelectorAll('#category-filters .cat-chip').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('#category-filters .cat-chip').forEach(c => c.classList.toggle('active', c === chip));
        currentCategory = chip.dataset.cat;
        filterBuildingsByCategory(currentCategory);
        if (currentCategory === 'all') { closeSuggest(); return; }
        si.value = ''; $('searchClear').hidden = true;      // show the whole category
        searchSuggest.open();
      };
    });

    // place card
    $('btnDirections').onclick = openDirections;
    $('btnPlace3d').onclick = async () => {
      if (window.Sim3D && !Sim3D.isOn()) await Sim3D.set3D(true);
      if (place) map.flyTo({ center: [place.lng, place.lat], zoom: 17.6, pitch: 62, bearing: map.getBearing() - 30, padding: mapPadding(), duration: 1600 });
    };
    $('btnPlaceLive').onclick = () => { if (window.openLiveView) openLiveView(place ? place.name : ''); };

    // directions
    const startBox = $('start-input'), destBox = $('dest-input');
    [['start-input', true], ['dest-input', false]].forEach(([id, withMe]) => {
      const input = $(id);
      const box = document.createElement('div');
      box.className = 'suggest-box'; box.id = id + '-suggest'; box.setAttribute('role', 'listbox');
      input.parentElement.appendChild(box);
      attachSuggest(input, box, { list: t => suggestPlaces(t, withMe), onChoose: v => { input.value = v; computeRoute(); } });
    });
    $('voiceStartBtn').onclick = () => listen(startBox, $('voiceStartBtn'), () => computeRoute());
    $('voiceDestBtn').onclick = () => listen(destBox, $('voiceDestBtn'), () => computeRoute());
    $('dirBack').onclick = () => { clearRoute(); if (place) openPlace(place.name); else hideSheet(); };
    $('btnRouteLive').onclick = () => { if (window.openLiveView) openLiveView(destBox.value); };
    window.onSimPreview = () => { if (isPhone()) hideSheet(); };   // see the whole screen during the fly-through

    // sheet close
    $('sheetClose').onclick = () => { if (window.Sim3D) Sim3D.stop(); clearRoute(); hideSheet(); };
    window.addEventListener('resize', setSheetHeight);

    // round buttons
    $('locate-btn').onclick = () => { startTracking(); };

    // settings
    const panel = $('settingsPanel');
    const openSettings = () => { panel.hidden = false; $('settingsClose').focus(); };
    const closeSettings = () => { panel.hidden = true; $('settings-btn').focus(); };
    $('settings-btn').onclick = openSettings;
    $('settingsClose').onclick = closeSettings;
    panel.addEventListener('click', e => { if (e.target === panel) closeSettings(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) closeSettings(); });
    $('setDark').checked = settings.dark;
    $('setVoiceGuide').checked = settings.voiceGuidance;
    $('setVoiceInput').checked = settings.voiceInput;
    $('setDark').onchange = e => { settings.dark = e.target.checked; saveSettings(); applyDark(settings.dark); };
    $('setVoiceGuide').onchange = e => {
      settings.voiceGuidance = e.target.checked; saveSettings();
      if (settings.voiceGuidance) speakText('Voice guidance is on.');
      else if (window.speechSynthesis) speechSynthesis.cancel();
    };
    $('setVoiceInput').onchange = e => { settings.voiceInput = e.target.checked; saveSettings(); applyVoiceInput(settings.voiceInput); };
    const fb = $('feedbackLink');
    if (FEEDBACK_URL) { fb.href = FEEDBACK_URL; }
    else {
      fb.removeAttribute('href'); fb.setAttribute('aria-disabled', 'true'); fb.classList.add('disabled');
      fb.textContent = 'Coming soon'; $('feedbackNote').textContent = 'The feedback form will be added here';
    }

    applyVoiceInput(settings.voiceInput);
    // saved dark mode: switch once the first map style has loaded
    if (settings.dark) { document.body.classList.add('dark'); map.once('load', () => applyDark(true)); }
  }
  window.initUI = initUI;                             // script.js calls this after the intro
})();
