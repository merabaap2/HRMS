const fs = require('fs');

const js = fs.readFileSync('client/js/app.js', 'utf8');

// Find page navigation handling
const lines = js.split('\n');
console.log('Total lines in app.js:', lines.length);

const found = [];
lines.forEach((l, i) => {
  if (l.includes('dataset.page') || l.includes('data-page') || l.includes('function navigate(') || l.includes('currentPage =') || l.includes('function showPage(') || l.includes('function renderPage(')) {
    found.push({ line: i + 1, content: l.trim() });
  }
});

console.log('Found navigation keywords at:');
found.slice(0, 20).forEach(f => console.log(`  Line ${f.line}: ${f.content}`));
