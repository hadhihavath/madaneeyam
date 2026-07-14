const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'Divided Files');
const DEST_DIR = path.resolve(__dirname, '..', 'client', 'dist', 'Divided Files');

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function run() {
  console.log("Copying Divided Files to client/dist for relative downloads...");
  if (!fs.existsSync(SRC_DIR)) {
    console.error("Source directory does not exist:", SRC_DIR);
    return;
  }
  copyFolderRecursive(SRC_DIR, DEST_DIR);
  console.log("Divided Files copied successfully to client/dist.");
}

run();
