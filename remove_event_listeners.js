import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Remove window.addEventListener("outrent-sync-event", ...);
  content = content.replace(/[ \t]*window\.addEventListener\("outrent-sync-event"[^\)]+\);\n?/g, '');
  
  // Remove window.removeEventListener("outrent-sync-event", ...);
  content = content.replace(/[ \t]*window\.removeEventListener\("outrent-sync-event"[^\)]+\);\n?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
