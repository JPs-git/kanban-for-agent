const fs = require('fs');
const path = require('path');

const currentDir = process.cwd();
const frontendDist = path.join(currentDir, 'frontend', 'dist');
const backendPublic = path.join(currentDir, 'backend', 'dist', 'public');

console.log(`Looking for frontend dist at: ${frontendDist}`);
console.log(`Will copy to: ${backendPublic}`);

function deleteDir(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    }
    fs.rmdirSync(dir);
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying frontend build files to backend...');

if (fs.existsSync(frontendDist)) {
  if (fs.existsSync(backendPublic)) {
    deleteDir(backendPublic);
  }
  copyDir(frontendDist, backendPublic);
  console.log(`✓ Frontend files copied to ${backendPublic}`);
} else {
  console.error('✗ Frontend dist directory not found.');
  console.error(`  Expected: ${frontendDist}`);
  process.exit(1);
}