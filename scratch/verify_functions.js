const fs = require('fs');

const js = fs.readFileSync('client/js/app.js', 'utf8');

const renderFns = [
  'renderDashboard',
  'renderEmployees',
  'renderAttendance',
  'renderPermissions',
  'renderMyPerm',
  'renderStatMods',
  'renderMyStat',
  'renderLeave',
  'renderMyLeave',
  'renderResign',
  'renderMyResign',
  'renderLetters',
  'renderMyLetters',
  'renderPayroll',
  'renderRecruitment',
  'renderPerformance',
  'renderMyPerf',
  'renderMyAtt',
  'renderService',
  'renderAccess',
  'renderMyService',
  'renderDepartments',
  'renderSettings',
];

console.log('--- CHECKING RENDER FUNCTIONS IN app.js ---');
renderFns.forEach((fn) => {
  const hasFn =
    js.includes(`function ${fn}(`) ||
    js.includes(`const ${fn} =`) ||
    js.includes(`let ${fn} =`) ||
    js.includes(`var ${fn} =`);
  if (hasFn) {
    console.log(`✅ [FOUND] ${fn}`);
  } else {
    console.log(`❌ [MISSING] ${fn}`);
  }
});

// Check modals in HTML vs JS event listeners
const html = fs.readFileSync('index.html', 'utf8');
const modalIds = ['perfModal', 'empModal', 'leaveModal', 'attModal', 'apptModal', 'letterModal', 'empImportModal'];
console.log('\n--- CHECKING MODAL IDS IN index.html ---');
modalIds.forEach((id) => {
  const hasId = html.includes(`id="${id}"`);
  if (hasId) {
    console.log(`✅ [FOUND] #${id}`);
  } else {
    console.log(`❌ [MISSING] #${id} in index.html!`);
  }
});
