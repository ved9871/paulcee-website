---
title: Roman roads and meeting points in lincolnshire
datePublished: 2026-10-18T20:20:00
draft: true
noindex: true
topic: beginners
tags: []
cover: ''
heroVideo: ''
summary: An illustrated schematic map of North Lincolnshire is provided below, followed by an interactive web map code template and historical survey data for investigating ancient wells, Roman corridors, and rights of way.
seo: null
---

```plain
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>North Lincolnshire: Roman Roads, Wells & Paths</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; }
    #map { width: 100vw; height: 100vh; }
    .legend {
      background: white; padding: 12px; line-height: 1.5;
      box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; font-size: 13px;
    }
    .legend span { display: inline-block; width: 14px; height: 14px; margin-right: 6px; vertical-align: middle; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([53.60, -0.55], 11);

    // OpenStreetMap Base Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Roman Ermine Street (Approximate line from Hibaldstow to Winteringham)
    const ermineStreet = L.polyline([
      [53.486, -0.533], // Hibaldstow
      [53.535, -0.537], // Redbourne / Scawby turn
      [53.612, -0.547], // Broughton / Appleby crossing
      [53.693, -0.579]  // Winteringham Haven
    ], { color: '#c0292b', weight: 4, dashArray: '6, 6' }).addTo(map)
      .bindPopup('<b>Ermine Street (RR 2d)</b><br>Roman arterial road terminating at the Humber ferry crossing.');

    // Historic Wells & Springs
    const wells = [
      { name: "Castledyke Blow Wells", lat: 53.682, lng: -0.441, desc: "Natural artesian chalk springs at Barton-upon-Humber." },
      { name: "Alkborough Spring / Well", lat: 53.685, lng: -0.668, desc: "Historic freshwater spring above the Trent-Humber confluence." },
      { name: "Hibaldstow Staniwells Spring", lat: 53.510, lng: -0.540, desc: "Spring beside Roman wayside settlement." },
      { name: "Winterton Holy Well", lat: 53.652, lng: -0.596, desc: "Historic mineral spring / chalybeate site." }
    ];

    wells.forEach(w => {
      L.circleMarker([w.lat, w.lng], {
        radius: 7, fillColor: '#0074d9', color: '#fff', weight: 2, fillOpacity: 0.9
      }).addTo(map).bindPopup(`<b>${w.name}</b><br>${w.desc}`);
    });

    // Viking Way Trailhead
    L.marker([53.691, -0.443]).addTo(map)
      .bindPopup('<b>Viking Way Trailhead</b><br>Start of 147-mile trail along the Wolds scarp.');

    // Add map legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend');
      div.innerHTML = `
        <strong>North Lincolnshire Heritage</strong><br>
        <span style="background: #c0292b;"></span> Roman Roads (Ermine St)<br>
        <span style="background: #0074d9; border-radius: 50%;"></span> Historic Springs & Wells<br>
        <span style="background: #2ecc40;"></span> Public Rights of Way / Viking Way
      `;
      return div;
    };
    legend.addTo(map);
  </script>
</body>
</html>
```
Core Historical Features in North Lincolnshire
1. Roman Roads
Ermine Street (Margary Route 2d): The primary arterial route built by the Romans running straight north from Lincoln (Lindum Colonia) through Hibaldstow to the Humber terminus at Winteringham (Ad Abum), where a ferry connected across to Petuaria (Brough). Much of its alignment today survives as the straight stretch of the A15 and rural green lanes/bridleways.

The Jurassic Cliff Trackway / Old High Street: A prehistoric ridgeway enhanced under Roman occupation running along the Lincoln Cliff escarpment towards Alkborough and Winterton.

Winteringham to Kirmington Link: A diagonal Roman route connecting Ermine Street to the Roman settlement and extraction centre at Kirmington on the northern edge of the Lincolnshire Wolds.

2. Historic Wells & Springs
Blow Wells & Artesian Springs (Barton & Humber Bank): Barton-upon-Humber and the coastal chalk aquifer feature artesian springs historically called "blow wells" (such as those around Castledyke and Dam Road).

Staniwells / Hibaldstow Spring: Located adjacent to Ermine Street at the Roman settlement site of Hibaldstow, where natural freshwater springs supplied travelers and Roman cavalry.

Winterton & Alkborough Chalybeate/Holy Wells: Springs with natural mineral (iron/chalybeate) properties that were revered as healing waters from medieval times.

St. Helen's Wells: Traditional dedications to St. Helen (common across Roman Lincolnshire along springs near Roman tracks).

3. Footpaths and Public Rights of Way
The Viking Way: A 147-mile long-distance trail starting at Barton-upon-Humber and heading south along the high chalk scarp of the Lincolnshire Wolds.

Nev Cole Way: Connects Burton upon Stather and Scunthorpe through Brigg towards the coastline.

Ancient Green Lanes & Byways: Public footpaths frequently preserve the diverted or abandoned stretches of Roman aggers (banks) where the modern A15 deviates from the original Roman surveyed
