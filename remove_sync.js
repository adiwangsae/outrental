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

const files = walk('./server');
files.push(...walk('./src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx')));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Remove import declarations for syncManager
  content = content.replace(/import\s*\{\s*syncManager\s*\}\s*from\s*['"].*?sync-manager(\.js)?['"];?\n?/g, '');
  
  // Remove statements calling syncManager.broadcast(...)
  // Handles multi-line statements heuristically or simple lines.
  content = content.replace(/[ \t]*syncManager\.broadcast\([^)]+\);\n?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
