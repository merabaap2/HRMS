const fs = require('fs');
let s = fs.readFileSync('./client/js/app.js', 'utf8');
s = s.replace('excess hours Ã· daily working hours', 'excess hours ÷ daily working hours');
s = s.replace(/icon:\s*'[^']+',\s*heading:\s*`Congratulations/, "icon: '🏆', heading: `Congratulations");
fs.writeFileSync('./client/js/app.js', s, 'utf8');
console.log('Fixed both perfectly!');
