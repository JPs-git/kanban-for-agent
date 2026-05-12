const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const version = fs.readFileSync(path.join(rootDir, 'VERSION'), 'utf-8').trim();

const packages = ['backend', 'frontend', 'kanban-cli'];

packages.forEach(pkgName => {
  const pkgPath = path.join(rootDir, pkgName, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
});

const rootPkgPath = path.join(rootDir, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
rootPkg.version = version;
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));

console.log(`Version synchronized to ${version}`);
