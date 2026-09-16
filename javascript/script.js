
// TODO: replace with your real Mapbox public token from account.mapbox.com
mapboxgl.accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMzUwZmEzLWI...';
const lightStyle = 'mapbox://styles/milly-1/cmn7epjkq004301s4a7qj70sx';
const darkStyle  = 'mapbox://styles/mapbox/dark-v11';

// ---------- Campus walking-path network (from Path.geojson) ----------
const campusPaths = {"type":"FeatureCollection","features":[
    {"type":"Feature","properties":{"name":"SOTSS to T-Junction","id":"seg-1"},"geometry":{"type":"LineString","coordinates":[[-0.201082,5.635087],[-0.201082,5.635367]]}},
    {"type":"Feature","properties":{"name":"T-Junction to Public School","id":"seg-2"},"geometry":{"type":"LineString","coordinates":[[-0.201082,5.635367],[-0.20128,5.635372]]}},
    {"type":"Feature","properties":{"name":"T-Junction to Gimpa Cafeteria","id":"seg-3"},"geometry":{"type":"LineString","coordinates":[[-0.201082,5.635367],[-0.200579,5.635373]]}},
    {"type":"Feature","properties":{"name":"T-Junction to T-Junction2","id":"seg-4"},"geometry":{"type":"LineString","coordinates":[[-0.201082,5.635367],[-0.201079,5.635932]]}},
    {"type":"Feature","properties":{"name":"T-Junction2 to Academic Affairs","id":"seg-5"},"geometry":{"type":"LineString","coordinates":[[-0.201079,5.635932],[-0.200749,5.635956]]}},
    {"type":"Feature","properties":{"name":"SOTSS to T-Junction3","id":"seg-6"},"geometry":{"type":"LineString","coordinates":[[-0.201082,5.635087],[-0.20093,5.635087]]}},
    {"type":"Feature","properties":{"name":"T-Junction3 to MTN Lab","id":"seg-7"},"geometry":{"type":"LineString","coordinates":[[-0.20093,5.635087],[-0.200949,5.634837],[-0.201018,5.634837],[-0.201018,5.634837]]}},
    {"type":"Feature","properties":{"name":"MTN Lab to Philip's Consult","id":"seg-8"},"geometry":{"type":"LineString","coordinates":[[-0.201018,5.634837],[-0.200714,5.634737],[-0.200536,5.634811]]}},
    {"type":"Feature","properties":{"name":"T-Junction3 to Gimpa Cafeteria","id":"seg-9"},"geometry":{"type":"LineString","coordinates":[[-0.20093,5.635087],[-0.200911,5.635164],[-0.200639,5.635164],[-0.200573,5.635371],[-0.200579,5.635373]]}},
    {"type":"Feature","properties":{"name":"Philip's Consult to Mamphey Hall","id":"seg-10"},"geometry":{"type":"LineString","coordinates":[[-0.200536,5.634811],[-0.200142,5.634816]]}},
    {"type":"Feature","properties":{"name":"MTN Lab to T-Junction4","id":"seg-11"},"geometry":{"type":"LineString","coordinates":[[-0.201018,5.634837],[-0.200807,5.634605]]}},
    {"type":"Feature","properties":{"name":"T-Junction4 to Consultency Car Park","id":"seg-12"},"geometry":{"type":"LineString","coordinates":[[-0.200807,5.634605],[-0.201248,5.634563],[-0.201248,5.63444]]}},
    {"type":"Feature","properties":{"name":"Consultency Car Park to Student Affairs","id":"seg-13"},"geometry":{"type":"LineString","coordinates":[[-0.201248,5.63444],[-0.201179,5.634364]]}},
    {"type":"Feature","properties":{"name":"Student Affairs to Consultency","id":"seg-14"},"geometry":{"type":"LineString","coordinates":[[-0.201179,5.634364],[-0.201317,5.634251]]}},
    {"type":"Feature","properties":{"name":"T-Junction4 to Fafa's Kebab","id":"seg-15"},"geometry":{"type":"LineString","coordinates":[[-0.200807,5.634605],[-0.200724,5.634519],[-0.200807,5.634439]]}},
    {"type":"Feature","properties":{"name":"Fafa's Kebab to SRC Shed","id":"seg-16"},"geometry":{"type":"LineString","coordinates":[[-0.200807,5.634439],[-0.200868,5.634442],[-0.200881,5.63439]]}},
    {"type":"Feature","properties":{"name":"Fafa's Kebab to Fafa's Restaurant","id":"seg-17"},"geometry":{"type":"LineString","coordinates":[[-0.200807,5.634439],[-0.200764,5.634416],[-0.200769,5.634276]]}},
    {"type":"Feature","properties":{"name":"Fafa's Restaurant to LOT 2","id":"seg-18"},"geometry":{"type":"LineString","coordinates":[[-0.200769,5.634276],[-0.200614,5.63426]]}},
    {"type":"Feature","properties":{"name":"LOT 2 to Baby Room","id":"seg-19"},"geometry":{"type":"LineString","coordinates":[[-0.200614,5.63426],[-0.200472,5.63434]]}},
    {"type":"Feature","properties":{"name":"LOT 2 to LOT 1","id":"seg-20"},"geometry":{"type":"LineString","coordinates":[[-0.200614,5.63426],[-0.200618,5.634007],[-0.200332,5.634012],[-0.200245,5.633937],[-0.199832,5.63403],[-0.199733,5.634082]]}},
    {"type":"Feature","properties":{"name":"T-Junction4 to Baby Room","id":"seg-21"},"geometry":{"type":"LineString","coordinates":[[-0.200807,5.634605],[-0.200545,5.63458],[-0.200495,5.634352],[-0.200472,5.63434]]}},
    {"type":"Feature","properties":{"name":"T-Junction4 to YALI","id":"seg-22"},"geometry":{"type":"LineString","coordinates":[[-0.200807,5.634605],[-0.200211,5.634583],[-0.200211,5.634456],[-0.200211,5.634456]]}},
    {"type":"Feature","properties":{"name":"YALI to PSMPT Authorium","id":"seg-23"},"geometry":{"type":"LineString","coordinates":[[-0.200211,5.634456],[-0.200048,5.634449],[-0.200048,5.634562],[-0.199707,5.634565],[-0.199697,5.634435],[-0.199697,5.634435]]}},
    {"type":"Feature","properties":{"name":"PSMPT Auditorium to LOT 1","id":"seg-24"},"geometry":{"type":"LineString","coordinates":[[-0.199697,5.634435],[-0.199597,5.634456],[-0.199593,5.634123],[-0.199734,5.634095],[-0.199733,5.634082]]}},
    {"type":"Feature","properties":{"name":"Mamphey Hall to GB Block","id":"seg-25"},"geometry":{"type":"LineString","coordinates":[[-0.200142,5.634816],[-0.200207,5.634824],[-0.200184,5.634758],[-0.199857,5.634776],[-0.199862,5.63527],[-0.199862,5.63527]]}},
    {"type":"Feature","properties":{"name":"GB Block to GB Auditorium","id":"seg-26"},"geometry":{"type":"LineString","coordinates":[[-0.199862,5.63527],[-0.199955,5.63527],[-0.199964,5.635227],[-0.200109,5.635247],[-0.200109,5.635495],[-0.200199,5.635495],[-0.200194,5.635452],[-0.200194,5.635452]]}},
    {"type":"Feature","properties":{"name":"Gimpa Cafeteria to GB auditorium","id":"seg-27"},"geometry":{"type":"LineString","coordinates":[[-0.200579,5.635373],[-0.200615,5.63544],[-0.20048,5.635458],[-0.200196,5.635455],[-0.200194,5.635452]]}},
    {"type":"Feature","properties":{"name":"GB Auditorium to Library","id":"seg-28"},"geometry":{"type":"LineString","coordinates":[[-0.200194,5.635452],[-0.200129,5.635507],[-0.200118,5.635844],[-0.200105,5.635954],[-0.199949,5.635951],[-0.199949,5.635951]]}},
    {"type":"Feature","properties":{"name":"Library to GB Block","id":"seg-29"},"geometry":{"type":"LineString","coordinates":[[-0.199949,5.635951],[-0.199934,5.635611],[-0.199882,5.635588],[-0.199882,5.635359],[-0.199862,5.63527]]}},
    {"type":"Feature","properties":{"name":"GB Block to Potter's Lodge","id":"seg-30"},"geometry":{"type":"LineString","coordinates":[[-0.199862,5.63527],[-0.199835,5.63491],[-0.199681,5.634794],[-0.19929,5.634788]]}},
    {"type":"Feature","properties":{"name":"Library to Syndicate Block","id":"seg-31"},"geometry":{"type":"LineString","coordinates":[[-0.199949,5.635951],[-0.19994,5.635701],[-0.199871,5.635699],[-0.199867,5.635667],[-0.199609,5.635676],[-0.1996,5.635833],[-0.199636,5.635835],[-0.199636,5.635835]]}},
    {"type":"Feature","properties":{"name":"Library to Banking Hall","id":"seg-32"},"geometry":{"type":"LineString","coordinates":[[-0.199949,5.635951],[-0.200236,5.635949],[-0.200236,5.636302],[-0.200426,5.636291],[-0.200426,5.636291]]}},
    {"type":"Feature","properties":{"name":"Academic Affairs to Maintenance Yard","id":"seg-33"},"geometry":{"type":"LineString","coordinates":[[-0.200749,5.635956],[-0.201672,5.63599],[-0.201681,5.63547],[-0.201925,5.635453]]}},
    {"type":"Feature","properties":{"name":"Maintenance yard to Rectorate Office","id":"seg-34"},"geometry":{"type":"LineString","coordinates":[[-0.201925,5.635453],[-0.201684,5.63547],[-0.201684,5.635105],[-0.201805,5.635084],[-0.201805,5.635084]]}},
    {"type":"Feature","properties":{"name":"Rectorate Office to Gimpa Clinic","id":"seg-35"},"geometry":{"type":"LineString","coordinates":[[-0.201805,5.635084],[-0.201676,5.63511],[-0.20162,5.6346],[-0.201667,5.634231],[-0.201786,5.63383],[-0.201786,5.63383],[-0.200703,5.633729],[-0.200703,5.633611],[-0.200703,5.633611]]}},
    {"type":"Feature","properties":{"name":"Gimpa Clinic to Law School","id":"seg-36"},"geometry":{"type":"LineString","coordinates":[[-0.200703,5.633611],[-0.200618,5.633611],[-0.20061,5.633751],[-0.200593,5.63381],[-0.200223,5.633819],[-0.200176,5.633493]]}},
    {"type":"Feature","properties":{"name":"Law School to Law School Cafeteria","id":"seg-37"},"geometry":{"type":"LineString","coordinates":[[-0.200176,5.633493],[-0.200198,5.633324],[-0.200253,5.633332],[-0.200253,5.633332]]}},
    {"type":"Feature","properties":{"name":"YALI to Law School","id":"seg-38"},"geometry":{"type":"LineString","coordinates":[[-0.200211,5.634456],[-0.200308,5.634465],[-0.200257,5.633865],[-0.200189,5.633506],[-0.200176,5.633493]]}},
    {"type":"Feature","properties":{"name":"Law School to Executive Hostel","id":"seg-39"},"geometry":{"type":"LineString","coordinates":[[-0.200176,5.633493],[-0.200187,5.633813],[-0.198726,5.633805],[-0.198709,5.633568],[-0.198607,5.633572],[-0.198607,5.633572]]}},
    {"type":"Feature","properties":{"name":"Gimpa Cafeteria to Mamphey Hall","id":"seg-40"},"geometry":{"type":"LineString","coordinates":[[-0.200579,5.635373],[-0.200612,5.635162],[-0.200327,5.635145],[-0.200323,5.635018],[-0.200213,5.635001],[-0.200149,5.634984],[-0.200142,5.634816]]}},
    {"type":"Feature","properties":{"name":"PSMPT Auditorium to Executive Hostel","id":"seg-41"},"geometry":{"type":"LineString","coordinates":[[-0.199697,5.634435],[-0.199669,5.634593],[-0.199113,5.634504],[-0.198913,5.634141],[-0.198917,5.633929],[-0.198905,5.633824],[-0.198739,5.633807],[-0.198722,5.633597],[-0.19863,5.633597],[-0.198607,5.633572]]}}]};

// ---------- Building images ----------
const buildingImageMap = {
  "POTTERS LODGE":"images/potter1.jpg","ROBERT GARDNER BLOCK":"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=160&fit=crop",
  "TACHIE MANSON":"images/tachie_manson.jpg","CIDA BLOCK":"https://images.unsplash.com/photo-1540541338287-41700207dee6?w=300&h=160&fit=crop",
  "SCHOOL OF RESEARCH AND GRADUATE STUDIES":"images/psmpt1.jpg","PSMPT AUDITORIUM":"images/psmpt3.jpg",
  "GIMPA EXECUTIVE CONFERENCE CENTER":"images/gecc.jpg","GIMPA LAW SCHOOL":"images/law 1.jpg",
  "LAW SCHOOL CAFETERIA":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=160&fit=crop",
  "GIMPA CLINIC":"images/hospital.jpg","GIMPA SCHOOL OF TECHNOLOGY (SOTSS)":"images/sot1.jpg",
  "LIBRARY BLOCK":"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&h=160&fit=crop",
  "GB AUDITORIUM":"images/gb audi.jpg","GIMPA RESTAURANT":"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=160&fit=crop",
  "GIMPA CAFETERIA":"images/cafeteria1.jpg","MAIN RECEPTION":"images/governer.jpg",
  "RECTORATE RECTORAT( RECTOR'S OFFICE)":"https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=300&h=160&fit=crop",
  "GIMPA E-GATE":"images/e-gate.jpg","LAW SCHOOL PARKING":"images/law p.jpg","PHILIP CONSULT":"images/philip.jpg",
  "UN BLOCK":"images/UN1.jpg","YALI REGIONAL LEADERSHIP CENTER":"images/yale1.jpg","MAMPHEY CONFERENCE HALL":"images/mamphey1.jpg",
  "SYNDICATE BLOCK":"images/syndicate1.jpg","NEW BUILDING (HOSTEL)":"images/new hostel.jpg","GIMPA TECHNOLOGY LAB (MTN LAB)":"images/mtn1.jpg",
  "LOT 1":"images/lot1.jpg","GB BLOCK":"images/gb1.jpg"
};
function getManualImage(n){return buildingImageMap[n] || "https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=160&fit=crop";}

// ================= CUSTOM PATH-NETWORK ROUTING =================
// Turns your 41 traced segments into a graph (nodes = junctions/endpoints,
// edges = segments) and runs Dijkstra's shortest-path so "Get Route" lights
// up ONLY the segments actually needed, instead of showing the whole network.

function haversineMeters(a,b){
  const R=6371000, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b[1]-a[1]), dLon=toRad(b[0]-a[0]);
  const lat1=toRad(a[1]), lat2=toRad(b[1]);
  const h=Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
function nodeKey(coord){ return coord[0].toFixed(6)+','+coord[1].toFixed(6); }

function buildPathGraph(geojson){
  const nodes=new Map();       // key -> [lng,lat]
  const adjacency=new Map();   // key -> [{to,weight,coords,name,id}]
  const addNode=c=>{ const k=nodeKey(c); if(!nodes.has(k)) nodes.set(k,c); return k; };
  const addEdge=(from,to,weight,coords,name,id)=>{
    if(!adjacency.has(from)) adjacency.set(from,[]);
    adjacency.get(from).push({to,weight,coords,name,id});
  };
  geojson.features.forEach(f=>{
    const coords=f.geometry.coordinates;
    if(coords.length<2) return;
    let weight=0;
    for(let i=1;i<coords.length;i++) weight+=haversineMeters(coords[i-1],coords[i]);
    const startKey=addNode(coords[0]), endKey=addNode(coords[coords.length-1]);
    addEdge(startKey,endKey,weight,coords,f.properties.name,f.properties.id);
    addEdge(endKey,startKey,weight,[...coords].reverse(),f.properties.name,f.properties.id);
  });
  return {nodes,adjacency};
}
const pathGraph = buildPathGraph(campusPaths);

// Snap a raw coordinate (a building's marker position) onto the nearest network node.
function findNearestNode(coord,maxMeters=70){
  let best=null,bestDist=Infinity;
  pathGraph.nodes.forEach((nCoord,key)=>{
    const d=haversineMeters(coord,nCoord);
    if(d<bestDist){ bestDist=d; best=key; }
  });
  return (best && bestDist<=maxMeters) ? best : null;
}

// Classic Dijkstra over the segment graph.
function dijkstra(graph,startKey,endKey){
  const dist=new Map(), prev=new Map();
  graph.nodes.forEach((_,k)=>dist.set(k,Infinity));
  dist.set(startKey,0);
  const queue=new Set(graph.nodes.keys());
  while(queue.size){
    let u=null,best=Infinity;
    queue.forEach(k=>{ if(dist.get(k)<best){ best=dist.get(k); u=k; } });
    if(u===null) break;
    queue.delete(u);
    if(u===endKey) break;
    (graph.adjacency.get(u)||[]).forEach(e=>{
      const alt=dist.get(u)+e.weight;
      if(alt<dist.get(e.to)){ dist.set(e.to,alt); prev.set(e.to,{from:u,edge:e}); }
    });
  }
  if(startKey!==endKey && !prev.has(endKey)) return null;
  const edges=[];
  let cur=endKey;
  while(cur!==startKey){
    const p=prev.get(cur);
    if(!p) return null;
    edges.unshift(p.edge);
    cur=p.from;
  }
  return {distance:dist.get(endKey), edges};
}

function findBuildingCoord(text){
  if(text.toLowerCase()==='my location' && currentPosition) return currentPosition;
  const b=buildings.find(x=>x.name.toLowerCase()===text.toLowerCase());
  return b ? [b.lng,b.lat] : null;
}

// Returns null if either point isn't part of your traced network (caller then
// falls back to Mapbox's road-based walking directions).
function getCustomRoute(startText,destText){
  const startCoord=findBuildingCoord(startText), destCoord=findBuildingCoord(destText);
  if(!startCoord||!destCoord) return null;
  const startNode=findNearestNode(startCoord), endNode=findNearestNode(destCoord);
  if(!startNode||!endNode) return null;
  const result=dijkstra(pathGraph,startNode,endNode);
  if(!result) return null;
  const coordinates=[startCoord];
  result.edges.forEach(e=>coordinates.push(...e.coords));
  coordinates.push(destCoord);
  return {
    geometry:{type:'LineString',coordinates},
    distance:result.distance,
    steps:result.edges.map(e=>e.name),
    startCoord, destCoord
  };
}
// ================= END ROUTING ENGINE =================

const rawBuildings=[{"name":"POTTERS LODGE","lng":-0.19922668227915573,"lat":5.634788211777222,"cat":"hostel"},
    {"name":"ROBERT GARDNER BLOCK","lng":-0.19942063698727417,"lat":5.63502099987865,"cat":"hostel"},
    {"name":"TACHIE MANSON","lng":-0.1988129303268574,"lat":5.634963149492839,"cat":"hostel"},
    {"name":"CIDA BLOCK","lng":-0.1987820806663926,"lat":5.63457786286767,"cat":"hostel"},
    {"name":"SCHOOL OF RESEARCH AND GRADUATE STUDIES","lng":-0.19984060727952115,"lat":5.634292891684326,"cat":"lecture"},
    {"name":"PSMPT AUDITORIUM","lng":-0.19968220226165533,"lat":5.634281517567876,"cat":"lecture"},
    {"name":"GIMPA EXECUTIVE CONFERENCE CENTER","lng":-0.19848307741894284,"lat":5.633391114053598,"cat":"lecture"},
    {"name":"GIMPA TRAINING AND CONSULTING","lng":-0.1994882858969999,"lat":5.633481483701117,"cat":"admin"},
    {"name":"Unnamed","lng":-0.20011655069010447,"lat":5.633352757307132,"cat":"admin"},
    {"name":"GIMPA LAW SCHOOL","lng":-0.20010046685210326,"lat":5.633149711514876,"cat":"lecture"},
    {"name":"LAW SCHOOL CAFETERIA","lng":-0.2002915328688221,"lat":5.633323830324403,"cat":"food"},
    {"name":"LAW SCHOOL STUDENT AFFAIRS","lng":-0.20031822129991123,"lat":5.633504230360176,"cat":"admin"},
    {"name":"GIMPA CLINIC","lng":-0.20078964838520045,"lat":5.633463690928346,"cat":"admin"},
    {"name":"GIMPA COUNCIL CHAMBER","lng":-0.20117238146322016,"lat":5.63350039504504,"cat":"admin"},
    {"name":"GIMPA COUNCIL SECRETARIAT","lng":-0.20131168307685532,"lat":5.633527789213718,"cat":"admin"},
    {"name":"LECTURER BUNGALOW","lng":-0.2016246652580101,"lat":5.633449147652492,"cat":"admin"},
    {"name":"NEW BUILDING (HOSTEL)","lng":-0.2019905917727997,"lat":5.634147872469564,"cat":"hostel"},
    {"name":"INVEST IN AFRICA","lng":-0.20149842093940027,"lat":5.634287180917346,"cat":"admin"},
    {"name":"GIMPA CONSULTANCY SERVICES","lng":-0.201333853019926,"lat":5.63414777550618,"cat":"admin"},
    {"name":"STUDENTS AFFAIRS OFFICE","lng":-0.20113346924825292,"lat":5.634361880122993,"cat":"admin"},
    {"name":"CENTRE FOR REGIONAL INTERGRATION IN AFRICA","lng":-0.20114821195449702,"lat":5.634252393510139,"cat":"lecture"},
    {"name":"SRC SHED","lng":-0.20089989102264775,"lat":5.634371851792339,"cat":"admin"},
    {"name":"FAFA'S KEBAB","lng":-0.20082561556940677,"lat":5.63444327551051,"cat":"food"},
    {"name":"BUSINESS CENTRE","lng":-0.20082955410107743,"lat":5.634312380530358,"cat":"admin"},
    {"name":"FAFA'S RESTUARANT","lng":-0.2007180975840143,"lat":5.634229885439395,"cat":"food"},
    {"name":"BABY CARE ROOM","lng":-0.20044143187438946,"lat":5.634340532391862,"cat":"admin"},
    {"name":"PROCUREMENT UNIT","lng":-0.2004576493317295,"lat":5.634216193347339,"cat":"admin"},
    {"name":"LOT 1 (GIMPA BUSINESS SCHOOL)","lng":-0.20061338673336936,"lat":5.634057890625254,"cat":"lecture"},
    {"name":"CENTRE FOR INFORMATION TECHNOLOGY DEVELOPMENT","lng":-0.20021859805773334,"lat":5.634333848089895,"cat":"lecture"},
    {"name":"YALI REGIONAL LEADERSHIP CENTER","lng":-0.2001110698703825,"lat":5.634296389445487,"cat":"lecture"},
    {"name":"GIMPA PURC CENTRE OF EXCELLENCE I PUBLIC UTILITY REGULATION","lng":-0.19999988025454376,"lat":5.634837616699148,"cat":"lecture"},
    {"name":"MAMPHEY CONFERENCE HALL","lng":-0.20014551452486022,"lat":5.63482071816902,"cat":"lecture"},
    {"name":"UN BLOCK","lng":-0.2005754241716144,"lat":5.634891262624005,"cat":"admin"},
    {"name":"PHILIP CONSULT","lng":-0.20050047410922384,"lat":5.634812618556913,"cat":"admin"},
    {"name":"GIMPA TECHNOLOGY LAB (MTN LAB)","lng":-0.20103341776906393,"lat":5.634893717950187,"cat":"lecture"},
    {"name":"GIMPA SCHOOL OF TECHNOLOGY (SOTSS)","lng":-0.2011733152572868,"lat":5.635036414691764,"cat":"lecture"},
    {"name":"SOTSS SECRETARAIT","lng":-0.20127311374174115,"lat":5.635150832934298,"cat":"admin"},
    {"name":"RECTORATE RECTORAT( RECTOR'S OFFICE)","lng":-0.2020563710719767,"lat":5.63466842509663,"cat":"admin"},
    {"name":"MAINTENANCE YARD","lng":-0.20217473801835745,"lat":5.635265594364462,"cat":"admin"},
    {"name":"SECURITY POST","lng":-0.20206905553859446,"lat":5.635476250165344,"cat":"admin"},
    {"name":"STUDENT CAR PARK AND VISITORS CAR PARK","lng":-0.20205779798207307,"lat":5.636640446997134,"cat":"admin"},
    {"name":"SCHOOL OF PUBLIC SERVICE AND GOVERNANCE","lng":-0.20138900462697743,"lat":5.635469209687487,"cat":"lecture"},
    {"name":"DAVID ANDOH BLOCK","lng":-0.20095037086370694,"lat":5.635478486092786,"cat":"admin"},
    {"name":"GOVERNANCE BLOCK (ACADEMIC AFFAIRS DIRECTORATE)","lng":-0.2008267418024265,"lat":5.63599118591063,"cat":"admin"},
    {"name":"MAIN RECEPTION","lng":-0.20051502978628593,"lat":5.63599643391425,"cat":"admin"},
    {"name":"BANKING HALL","lng":-0.20050706852259224,"lat":5.636237670471293,"cat":"admin"},
    {"name":"GIMPA KITCHEN","lng":-0.2003002269423131,"lat":5.635756110044128,"cat":"food"},
    {"name":"GIMPA RESTAURANT","lng":-0.20055635843574123,"lat":5.635657344037103,"cat":"food"},
    {"name":"GIMPA CAFETERIA","lng":-0.20044706028731935,"lat":5.635341980080032,"cat":"food"},
    {"name":"GB AUDITORIUM","lng":-0.20021678472926845,"lat":5.635307935593167,"cat":"lecture"},
    {"name":"GIMPA SERVICES DEPARTMENT","lng":-0.20017274823112407,"lat":5.636377959319742,"cat":"admin"},
    {"name":"LIBRARY BLOCK","lng":-0.19988342774578627,"lat":5.635898635720484,"cat":"lecture"},
    {"name":"LIBRARY-BANKING HALL CAR PARKS","lng":-0.20024361207926294,"lat":5.636070332448491,"cat":"admin"},
    {"name":"GB BLOCK","lng":-0.1998936375695301,"lat":5.635444967424428,"cat":"lecture"},
    {"name":"IRC INSTRUCTIONAL RESOURCE CENTER","lng":-0.19986613075923474,"lat":5.635702500384565,"cat":"lecture"},
    {"name":"SYNDICATE BLOCK","lng":-0.19968948042479188,"lat":5.63595063942596,"cat":"lecture"},
    {"name":"LOT 1","lng":-0.1997667409535503,"lat":5.633959806315088,"cat":"admin"},
    {"name":"GIMPA DATA CENTER","lng":-0.2004204496656463,"lat":5.632468440011355,"cat":"admin"},
    {"name":"LAW SCHOOL PARKING","lng":-0.20011713139040504,"lat":5.632527356149981,"cat":"admin"},
    {"name":"GIMPA E-GATE","lng":-0.1978828284199048,"lat":5.633770954482717,"cat":"admin"},
    {"name":"GIMPA MAIN GATE","lng":-0.20489356755910868,"lat":5.64045791050991,"cat":"admin"}];
const buildings = rawBuildings.map(b=>({name:b.name,lng:b.lng,lat:b.lat,category:b.cat}));

// ---------- Custom descriptions ----------
// Add or edit any building here to give it its own personal description.
// Anything NOT listed here keeps the generic category text as a fallback,
// so you can personalize buildings one at a time without breaking the rest.
const buildingDescriptionMap = {
  "GIMPA CAFETERIA": "The main campus cafeteria — grab a quick bite between classes, known for its jollof and always-busy lunch rush.",
  "POTTERS LODGE": "A quiet hostel block on the edge of campus, popular for its short walk to the Governance and GB blocks.",
  "GIMPA SCHOOL OF TECHNOLOGY (SOTSS)": "Home to GIMPA's tech programs — labs, project rooms, and the starting point for most routes on this side of campus.",
  // Add more like this:
  // "EXACT BUILDING NAME AS IN THE LIST ABOVE": "Your own description here."
};

function getBuildingDetails(name,category){
  const imageUrl=getManualImage(name);
  let history = buildingDescriptionMap[name];
  if(!history){
    history=`${name} is a landmark at GIMPA. `;
    if(category==='hostel') history+='Modern accommodation hub with vibrant student life.';
    else if(category==='lecture') history+='State-of-the-art lecture halls and research spaces.';
    else if(category==='food') history+='A favorite dining spot with delicious meals.';
    else history+='Essential administrative center of the university.';
  }
  let lectureCount=null;
  if(category==='lecture') lectureCount=2+(name.length%8);
  return {imageUrl,history,lectureCount};
}

function showRichPopup(lngLat,name,category){
  const {imageUrl,history,lectureCount}=getBuildingDetails(name,category);
  const lectureHtml = lectureCount!==null ? `<div class="popup-lecture-count"><i class="fas fa-chalkboard-user"></i> ${lectureCount} Lecture Halls</div>` : '';
  const html = `<div class="custom-popup">
    <div class="popup-image"><img src="${imageUrl}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=160&fit=crop'"></div>
    <div class="popup-title">${name}</div>
    <div class="popup-history"><i class="fas fa-info-circle"></i> ${history}</div>
    ${lectureHtml}
  </div>`;
  if(activePopup) activePopup.remove();
  activePopup = new mapboxgl.Popup({closeButton:true,closeOnClick:false,maxWidth:'300px'})
    .setLngLat(lngLat).setHTML(html).addTo(map);
}

// ---------- lightweight hover preview popup ----------
let hoverPopup=null, activePopup=null;
function showHoverPreview(lngLat,name,category){
  if(hoverPopup) hoverPopup.remove();
  const img=getManualImage(name);
  const html=`<div class="mini-popup">
    <img src="${img}" onerror="this.src='https://images.unsplash.com/photo-1562774053-701939374585?w=120&h=120&fit=crop'">
    <div><div class="mini-name">${name}</div><div class="mini-cat">${category}</div></div>
  </div>`;
  hoverPopup=new mapboxgl.Popup({closeButton:false,closeOnClick:false,offset:14,maxWidth:'260px'})
    .setLngLat(lngLat).setHTML(html).addTo(map);
}
function hideHoverPreview(){ if(hoverPopup){ hoverPopup.remove(); hoverPopup=null; } }

let map, currentRouteLayer=null, startMarker=null, endMarker=null, geolocateControl=null;
let currentCategory="all";
let speechSynth=window.speechSynthesis;
let currentRouteSteps=[], isNavigating=false, currentPosition=null, currentRouteGeometry=null;

function addCampusPathsLayer(){
  if(map.getSource('campus-paths')){ map.removeLayer('campus-paths-line'); map.removeSource('campus-paths'); }
  map.addSource('campus-paths',{type:'geojson',data:campusPaths});
  map.addLayer({
    id:'campus-paths-line',type:'line',source:'campus-paths',
    layout:{'line-cap':'round','line-join':'round'},
    paint:{'line-color':'#1B7A3D','line-width':3,'line-opacity':0.55,'line-dasharray':[2,1.4]}
  });
}

function addBuildingPointsLayer(){
  const geojson={type:'FeatureCollection',features:buildings.map(b=>({type:'Feature',geometry:{type:'Point',coordinates:[b.lng,b.lat]},properties:{name:b.name,category:b.category}}))};
  if(map.getSource('campus-buildings')) map.removeSource('campus-buildings');
  map.addSource('campus-buildings',{type:'geojson',data:geojson});
  if(map.getLayer('building-circles')) map.removeLayer('building-circles');
  map.addLayer({
    id:'building-circles',type:'circle',source:'campus-buildings',
    paint:{
      'circle-radius':7,
      'circle-color':['match',['get','category'],
        'hostel','#D9A62A',
        'lecture','#0B5FA8',
        'food','#1B7A3D',
        'admin','#12181F',
        '#D9A62A'],
      'circle-stroke-width':2,
      'circle-stroke-color':'#fff'
    }
  });
  // NOTE: no persistent text labels — names appear via hover/tap popup only, keeping the map clean.
  filterBuildingsByCategory(currentCategory);

  map.on('mouseenter','building-circles',(e)=>{
    map.getCanvas().style.cursor='pointer';
    const p=e.features[0].properties;
    showHoverPreview(e.lngLat,p.name,p.category);
  });
  map.on('mousemove','building-circles',(e)=>{
    if(hoverPopup && e.features.length){ hoverPopup.setLngLat(e.lngLat); }
  });
  map.on('mouseleave','building-circles',()=>{ map.getCanvas().style.cursor=''; hideHoverPreview(); });
  map.on('click','building-circles',(e)=>{
    const p=e.features[0].properties;
    hideHoverPreview();
    map.flyTo({center:e.lngLat,zoom:18});
    showRichPopup(e.lngLat,p.name,p.category);
    document.getElementById('dest-input').value=p.name;
  });
}

function restoreRouteAfterStyleChange(){
  if(currentRouteGeometry){
    const routeId='route-'+Date.now();
    if(currentRouteLayer){ try{ map.removeLayer(currentRouteLayer); map.removeSource(currentRouteLayer);}catch(e){} }
    map.addSource(routeId,{type:'geojson',data:{type:'Feature',geometry:currentRouteGeometry}});
    map.addLayer({id:routeId,type:'line',source:routeId,layout:{'line-cap':'round','line-join':'round'},
      paint:{'line-color':lastRouteWasCustom?'#D9A62A':'#0B5FA8','line-width':6}});
    currentRouteLayer=routeId;
    setPathsNetworkDim(true);
  }
}

function filterBuildingsByCategory(cat){
  if(!map||!map.getLayer('building-circles')) return;
  map.setFilter('building-circles', cat==='all'?null:['==',['get','category'],cat]);
}

function initMap(){
  map=new mapboxgl.Map({container:'map',style:lightStyle,center:[-0.200,5.635],zoom:15.5,pitch:42});
  map.addControl(new mapboxgl.NavigationControl(),'bottom-right');

  // Live location puck: shows an arrow that points the direction you're facing/moving,
  // and re-centers the map on you as you walk (same as Google Maps' blue navigation dot).
  geolocateControl=new mapboxgl.GeolocateControl({
    positionOptions:{enableHighAccuracy:true},
    trackUserLocation:true,
    showUserHeading:true,
    showAccuracyCircle:true
  });
  map.addControl(geolocateControl,'bottom-right');

  geolocateControl.on('geolocate',(e)=>{
    currentPosition=[e.coords.longitude,e.coords.latitude];
    // While actively navigating, rotate the map to match the direction you're facing,
    // so the route ahead always points "up" — true turn-by-turn behavior.
    if(isNavigating && e.coords.heading!=null && !isNaN(e.coords.heading)){
      map.easeTo({bearing:e.coords.heading,duration:600});
    }
  });
  geolocateControl.on('error',(err)=>{
    console.error('Geolocate error:',err);
    if(err.code===1) alert("Location permission denied. Please enable GPS to use 'My Location'.");
  });

  map.on('load',()=>{
    addBuildingPointsLayer();
    if(currentRouteGeometry) restoreRouteAfterStyleChange();
  });
}

async function resolveLocation(text){
  if(text.toLowerCase()==='my location' && currentPosition) return currentPosition;
  const b=buildings.find(x=>x.name.toLowerCase()===text.toLowerCase());
  if(b) return [b.lng,b.lat];
  try{
    const url=`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${mapboxgl.accessToken}&limit=1`;
    const res=await fetch(url); const data=await res.json();
    return data.features?.[0]?.geometry.coordinates || null;
  }catch(e){ return null; }
}

function speakText(text){
  if(!speechSynth) return;
  speechSynth.cancel();
  const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=0.9;
  speechSynth.speak(u);
}

async function getWalkingRoute(startCoord,endCoord){
  const url=`https://api.mapbox.com/directions/v5/mapbox/walking/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
  const res=await fetch(url); const data=await res.json();
  if(data.code==='Ok') return data.routes[0];
  throw new Error('No route');
}

let lastRouteWasCustom=false;

function setPathsNetworkDim(dim){
  if(map.getLayer('campus-paths-line')) map.setPaintProperty('campus-paths-line','line-opacity', dim?0.12:0.55);
}

function renderRoute(geometry,distanceMeters,steps,startCoord,endCoord,isCustom){
  if(currentRouteLayer){ try{ map.removeLayer(currentRouteLayer); map.removeSource(currentRouteLayer);}catch(e){} }
  if(startMarker) startMarker.remove();
  if(endMarker) endMarker.remove();

  const routeId='route-'+Date.now();
  currentRouteGeometry=geometry;
  lastRouteWasCustom=isCustom;
  map.addSource(routeId,{type:'geojson',data:{type:'Feature',geometry}});
  map.addLayer({id:routeId,type:'line',source:routeId,layout:{'line-cap':'round','line-join':'round'},
    paint:{'line-color':isCustom?'#D9A62A':'#0B5FA8','line-width':6}});
  currentRouteLayer=routeId;

  startMarker=new mapboxgl.Marker({color:'#1B7A3D'}).setLngLat(startCoord).addTo(map);
  endMarker=new mapboxgl.Marker({color:'#D9A62A'}).setLngLat(endCoord).addTo(map);

  const durationSec=distanceMeters/1.3; // ~ average walking pace
  const stepsHtml = steps.length ? `<ul>${steps.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
  document.getElementById('route-info').innerHTML=`<div><i class="fas fa-walking"></i> ${(distanceMeters/1000).toFixed(2)} km · ${Math.round(durationSec/60)} min${isCustom?' · via your campus paths':''}</div><div class="step-by-step">${stepsHtml}</div>`;
  document.getElementById('route-info').style.display='block';
  speakText(`Route found. ${(distanceMeters/1000).toFixed(2)} kilometers, about ${Math.round(durationSec/60)} minutes.`);

  isNavigating=true;
  setPathsNetworkDim(true);
  if(document.getElementById('start-input').value.toLowerCase()==='my location') geolocateControl.trigger();
  collapseSidebar(true);
}

// ---------- Sidebar collapse / expand ----------
function isMobile(){ return window.matchMedia('(max-width:768px)').matches; }
function collapseSidebar(collapsed){
  const sb=document.getElementById('glassSidebar');
  const tg=document.getElementById('sidebarToggle');
  sb.classList.toggle('collapsed',collapsed);
  tg.classList.toggle('collapsed-pos',collapsed);
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  const icon=tg.querySelector('i');
  const label=tg.querySelector('span');
  if(isMobile()){
    icon.className = collapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
  } else {
    icon.className = collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
  }
  label.textContent = collapsed ? 'Menu' : 'Hide';
}
function toggleSidebar(){
  const sb=document.getElementById('glassSidebar');
  collapseSidebar(!sb.classList.contains('collapsed'));
}

function bindEvents(){
  document.getElementById('sidebarToggle').onclick = toggleSidebar;
  document.getElementById('dragHandle').onclick = toggleSidebar;

  document.getElementById('locate-btn').onclick=()=>{
    geolocateControl.trigger();
    document.getElementById('start-input').value='My Location';
  };

  document.getElementById('get-directions-btn').onclick=async ()=>{
    const startTxt=document.getElementById('start-input').value.trim();
    const destTxt=document.getElementById('dest-input').value.trim();
    if(!startTxt||!destTxt) return alert('Enter start and destination');

    // 1) Try your own traced path network first.
    const customRoute=getCustomRoute(startTxt,destTxt);
    if(customRoute){
      renderRoute(customRoute.geometry,customRoute.distance,customRoute.steps,customRoute.startCoord,customRoute.destCoord,true);
      map.fitBounds(new mapboxgl.LngLatBounds().extend(customRoute.startCoord).extend(customRoute.destCoord),{padding:80});
      return;
    }

    // 2) Fall back to Mapbox's road-based walking directions (used only when
    //    a point isn't part of your traced campus network, e.g. an outside address).
    const startCoord=await resolveLocation(startTxt);
    const endCoord=await resolveLocation(destTxt);
    if(!startCoord||!endCoord) return alert('Location not found');
    try{
      const route=await getWalkingRoute(startCoord,endCoord);
      renderRoute(route.geometry,route.distance,route.legs[0].steps.map(s=>s.maneuver.instruction),startCoord,endCoord,false);
      map.fitBounds(new mapboxgl.LngLatBounds().extend(startCoord).extend(endCoord),{padding:80});
    }catch(e){ alert('Routing error: '+e.message); }
  };

  const catContainer=document.getElementById('category-filters');
  catContainer.querySelectorAll('.cat-chip').forEach(chip=>{
    chip.onclick=()=>{
      catContainer.querySelectorAll('.cat-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory=chip.dataset.cat;
      filterBuildingsByCategory(currentCategory);
      updateSearchResults();
    };
  });

  const searchInput=document.getElementById('search-input');
  const searchResultsDiv=document.getElementById('search-results');
  function updateSearchResults(){
    const query=searchInput.value.toLowerCase();
    let matches=buildings.filter(b=>b.name.toLowerCase().includes(query));
    if(currentCategory!=='all') matches=matches.filter(b=>b.category===currentCategory);
    if(!query||!matches.length){ searchResultsDiv.style.display='none'; return; }
    searchResultsDiv.innerHTML=matches.map(m=>`<div class="result-item" data-lng="${m.lng}" data-lat="${m.lat}" data-name="${m.name}" data-cat="${m.category}">${m.name} <span style="opacity:.6">(${m.category})</span></div>`).join('');
    searchResultsDiv.style.display='block';
    document.querySelectorAll('.result-item').forEach(el=>{
      el.onclick=()=>{
        const lng=parseFloat(el.dataset.lng), lat=parseFloat(el.dataset.lat), name=el.dataset.name, cat=el.dataset.cat;
        map.flyTo({center:[lng,lat],zoom:18});
        showRichPopup([lng,lat],name,cat);
        document.getElementById('dest-input').value=name;
        searchResultsDiv.style.display='none';
      };
    });
  }
  searchInput.addEventListener('input',updateSearchResults);

  const voiceFn=(callback)=>{
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){ alert('🎤 Voice recognition not supported on this device/browser'); return; }
    const recognition=new SpeechRecognition();
    recognition.lang='en-US'; recognition.interimResults=false; recognition.maxAlternatives=1;
    recognition.start();
    recognition.onresult=(event)=>callback(event.results[0][0].transcript);
    recognition.onerror=(event)=>{ console.error(event); alert('Voice recognition failed. Please try again.'); };
  };

  document.getElementById('voiceSearchBtn').onclick=()=>voiceFn(t=>{ searchInput.value=t; updateSearchResults(); });
  document.getElementById('voiceStartBtn').onclick=()=>voiceFn(t=>document.getElementById('start-input').value=t);
  document.getElementById('voiceDestBtn').onclick=()=>voiceFn(t=>document.getElementById('dest-input').value=t);
  document.getElementById('global-voice-nav').onclick=()=>voiceFn(t=>{ searchInput.value=t; updateSearchResults(); });

  let dark=false;
  document.getElementById('dark-mode-toggle').onclick=()=>{
    dark=!dark;
    document.body.classList.toggle('dark',dark);
    map.setStyle(dark?darkStyle:lightStyle);
    map.once('style.load',()=>{
      addBuildingPointsLayer();
      if(currentRouteGeometry) restoreRouteAfterStyleChange();
    });
  };

  document.getElementById('offline-cache-btn').onclick=()=>alert('💾 Map tiles are automatically cached by your browser for offline use');

  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    };
  });
}

// ---------- Intro video fallback ----------
const videoElem = document.getElementById('campusVideo');
const fallbackDiv = document.getElementById('videoFallback');

function showVideoFallback() {
    videoElem.style.display = 'none';
    fallbackDiv.style.display = 'flex';
}

videoElem.addEventListener('error', showVideoFallback);

const source = videoElem.querySelector('source');
source.addEventListener('error', showVideoFallback);

videoElem.play().catch(showVideoFallback);
const intro = document.getElementById('introOverlay');
const mainApp = document.getElementById('mainApp');

function startApp() {
    intro.style.opacity = '0';

    setTimeout(() => {
        intro.style.display = 'none';
        mainApp.classList.add('visible');

        if (!map) {
            initMap();
            bindEvents();
        }
    }, 800);
}

document.getElementById('enterAppBtn').addEventListener('click', startApp);




