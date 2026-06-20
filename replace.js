const fs = require('fs');
const path = require('path');

const files = [
  "src/app/(painel)/page.tsx",
  "src/app/(painel)/turmas/[id]/chamada/[aulaId]/page.tsx",
  "src/app/(painel)/turmas/[id]/notas/page.tsx",
  "src/app/(painel)/turmas/actions.ts",
  "src/app/(painel)/turmas/page.tsx",
  "src/app/membro/[token]/page.tsx",
  "src/app/certificado/[matriculaId]/page.tsx",
  "src/app/layout.tsx",
  "src/app/relatorio/[turmaId]/page.tsx",
  "src/components/app-shell.tsx",
  "src/components/lista-presenca.tsx",
  "src/lib/base-url.ts",
  "src/lib/situacao.ts",
  "src/middleware.ts"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(/alunoId/g, "membroId");
    content = content.replace(/alunoNome/g, "membroNome");
    content = content.replace(/AlunoDetalhePage/g, "MembroDetalhePage");
    content = content.replace(/AlunoPortalPage/g, "MembroPortalPage");
    content = content.replace(/obterAlunoPorToken/g, "obterMembroPorToken");
    content = content.replace(/matricularAluno/g, "matricularMembro");
    content = content.replace(/aluno/g, "membro");
    content = content.replace(/alunos/g, "membros");
    content = content.replace(/Alunos/g, "Membros");
    content = content.replace(/Aluno/g, "Membro");
    content = content.replace(/ALUNO/g, "MEMBRO");
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
