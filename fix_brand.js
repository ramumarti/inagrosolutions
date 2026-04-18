const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    
    // Normalizar Inagro Solutions a Inagrosolutions
    content = content.replace(/InagroSolutions/g, 'Inagrosolutions');
    content = content.replace(/Inagro Solutions/g, 'Inagrosolutions');
    
    // Normalizar IASOLUTIONS
    content = content.replace(/IASOLUTIONS/g, 'INAGROSOLUTIONS');
    content = content.replace(/iasolutions\.ai/g, 'inagrosolutions.com');
    content = content.replace(/iasolutions/g, 'inagrosolutions');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
