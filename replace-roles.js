const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('grep -rl "garantirCoordenador" src/ || true').toString().split('\n').filter(Boolean);
files.push('src/lib/auth/access.ts');
files.push('src/app/(painel)/layout.tsx');
files.push('src/components/app-shell.tsx');
files.push('src/app/(painel)/page.tsx');

[...new Set(files)].forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(/garantirCoordenador/g, "garantirAdmin");
    content = content.replace(/souCoordenador/g, "souAdmin");
    content = content.replace(/COORDENADOR/g, "ADMIN");
    content = content.replace(/DIRETOR/g, "LIDER_CELULA");
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Updated roles in ${file}`);
  }
});
