const fs = require('fs');
const path = require('path');

const rootIndexPath = path.join(__dirname, '../index.html');
const rootBakPath = path.join(__dirname, '../index.html.bak');
const clientIndexPath = path.join(__dirname, '../client/index.html');
const clientJsPath = path.join(__dirname, '../client/js/app.js');

console.log('--- SYNCING ROOT INDEX.HTML WITH MODERN ARCHITECTURE ---');

// 1. Back up legacy root index.html if not already backed up
if (!fs.existsSync(rootBakPath)) {
  fs.copyFileSync(rootIndexPath, rootBakPath);
  console.log('Created backup index.html.bak');
}

// 2. Read client/index.html
let clientHtml = fs.readFileSync(clientIndexPath, 'utf8');

// Ensure cache buster is v=2.6.0
clientHtml = clientHtml.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=2.6.0');
clientHtml = clientHtml.replace(/app\.js\?v=[0-9.]+/g, 'app.js?v=2.6.0');

// Save updated client/index.html
fs.writeFileSync(clientIndexPath, clientHtml, 'utf8');
console.log('Saved client/index.html with v=2.6.0');

// 3. Create root index.html from clientHtml with relative paths that work everywhere (file://, http://localhost:3000, Live Server)
let rootHtml = clientHtml;
// Replace /client/css/style.css with client/css/style.css (works both on http and file://)
rootHtml = rootHtml.replace(/href="\/client\/css\/style\.css/g, 'href="client/css/style.css');
rootHtml = rootHtml.replace(/src="\/client\/js\/app\.js/g, 'src="client/js/app.js');
// Also ensure manifest and icon have relative paths
rootHtml = rootHtml.replace(/href="\/manifest\.webmanifest"/g, 'href="manifest.webmanifest"');
rootHtml = rootHtml.replace(/href="\/icon-192\.png"/g, 'href="icon-192.png"');

fs.writeFileSync(rootIndexPath, rootHtml, 'utf8');
console.log('Successfully updated root index.html!');

// 4. Update client/js/app.js to clear legacy caches on launch
let js = fs.readFileSync(clientJsPath, 'utf8');
js = js.replace(/b\.textContent = 'â¬‡ Install App';/g, "b.textContent = '⬇ Install App';");
if (!js.includes('caches.delete(\'hrms-cache-v1\')')) {
  js = js.replace(
    "if (location.protocol === 'https:' && 'serviceWorker' in navigator)",
    "if (typeof caches !== 'undefined') { caches.keys().then(keys => keys.forEach(k => { if (k === 'hrms-cache-v1') caches.delete(k); })); }\n      if (location.protocol === 'https:' && 'serviceWorker' in navigator)"
  );
  fs.writeFileSync(clientJsPath, js, 'utf8');
  console.log('Added legacy cache clearing to client/js/app.js');
}

console.log('--- ALL FILES SYNCED WITH ZERO CACHE CONFLICTS ---');
