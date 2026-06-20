const fs = require('fs');
const path = require('path');

const file = 'src/app/(painel)/usuarios/page.tsx';
const fullPath = path.join(__dirname, file);

if (fs.existsSync(fullPath)) {
  let content = fs.readFileSync(fullPath, 'utf-8');
  content = content.replace(/CARGO.COORDENADOR/g, "CARGO.ADMIN");
  content = content.replace(/coordenação/g, "administração");
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`Updated ${file}`);
}
