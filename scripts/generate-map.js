#!/usr/bin/env node
/**
 * DOOHPLAY Map Generator
 * Generates SVG map + city pixel positions for any country using D3 Mercator projection.
 * 
 * Usage:
 *   node scripts/generate-map.js --geojson /path/to/states.geojson --output public/brazil-map.svg --cities cities.json
 * 
 * The key principle: map path AND city dots use the EXACT SAME d3-geo projection.
 * This guarantees perfect alignment regardless of country.
 */

const { geoMercator, geoPath } = require('d3-geo');
const fs = require('fs');
const path = require('path');

function generateMap(geojsonPath, outputSvgPath, cities, W=700, H=700, simplifyStep=8) {
  const geo = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  
  // Single projection — fitted to the full dataset
  const projection = geoMercator()
    .fitSize([W, H], { type: 'FeatureCollection', features: geo.features });
  
  const pathGen = geoPath(projection);
  
  // Simplify rings while keeping same projection
  function simplifyRing(ring, step) {
    const out = [];
    for (let i = 0; i < ring.length; i += step) out.push(ring[i]);
    out.push(ring[0]); // close
    return out;
  }
  
  // Generate all state paths
  const allPaths = [];
  geo.features.forEach(f => {
    const g = f.geometry;
    
    function processPolygon(coords) {
      const simplified = { type: 'Polygon', coordinates: coords.map(r => simplifyRing(r, simplifyStep)) };
      const d = pathGen(simplified);
      if (d) allPaths.push(d);
    }
    
    if (g.type === 'Polygon') processPolygon(g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(processPolygon);
  });
  
  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<path d="${allPaths.join(' ')}" fill="rgba(59,130,246,0.1)" stroke="#3B82F6" stroke-width="1.2" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>`;
  
  fs.writeFileSync(outputSvgPath, svg);
  console.log(`✅ SVG written to ${outputSvgPath} (${Math.round(svg.length/1024)}KB)`);
  
  // Calculate city positions using SAME projection
  if (cities && cities.length > 0) {
    console.log('\nCity pixel positions (copy to component):');
    cities.forEach(c => {
      const [x, y] = projection([c.lon, c.lat]);
      console.log(`  { name: "${c.name}", svgX: ${Math.round(x)}, svgY: ${Math.round(y)} },`);
    });
  }
  
  return { projection, svg };
}

// Brazil default
const BRAZIL_CITIES = [
  { name: "São Paulo",      lon: -46.633, lat: -23.550 },
  { name: "Rio de Janeiro", lon: -43.172, lat: -22.907 },
  { name: "Belo Horizonte", lon: -43.938, lat: -19.921 },
  { name: "Brasília",       lon: -47.929, lat: -15.779 },
  { name: "Curitiba",       lon: -49.273, lat: -25.430 },
  { name: "Porto Alegre",   lon: -51.230, lat: -30.033 },
  { name: "Salvador",       lon: -38.519, lat: -12.972 },
  { name: "Recife",         lon: -34.877, lat:  -8.054 },
  { name: "Fortaleza",      lon: -38.543, lat:  -3.718 },
  { name: "Manaus",         lon: -60.025, lat:  -3.102 },
];

// Run if called directly
if (require.main === module) {
  const geojsonArg = process.argv[2] || '/tmp/brazil.geojson';
  const outputArg  = process.argv[3] || path.join(__dirname, '../public/brazil-map.svg');
  generateMap(geojsonArg, outputArg, BRAZIL_CITIES);
}

module.exports = { generateMap };
