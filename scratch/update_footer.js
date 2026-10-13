const fs = require('fs');

function updateFile(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/<footer class="footer">[\s\S]*?<\/footer>/, `<footer class="footer">
      <div class="footer-inner">
        <span>&copy; 2026 HRMS &middot; Enterprise Human Resource Management System</span>
        <span class="footer-sync-status" id="footerSyncStatus"><span class="sync-dot live"></span> Backend Synced (JSON Server Active)</span>
      </div>
    </footer>`);
  fs.writeFileSync(file, c, 'utf8');
  console.log('Updated footer in ' + file);
}

updateFile('./client/index.html');
updateFile('./index.html');
