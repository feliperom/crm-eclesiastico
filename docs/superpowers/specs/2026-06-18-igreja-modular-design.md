# Especificação de Design: Transição para Sistema de Gestão de Igreja e Trilho

## Visão Geral
O objetivo é expandir o sistema CRM Escola, atualmente focado na gestão acadêmica (Alunos e Turmas), para uma plataforma centralizada de gestão eclesiástica. O sistema agora suportará a jornada completa do membro (Trilho) e a organização pastoral (Células e Redes), permitindo acesso distribuído para a liderança.

## 1. Unificação de Identidade (Membros)
A entidade `Aluno` será descontinuada como um perfil isolado. Todos os indivíduos do sistema serão categorizados na entidade unificada `Membro`.

**Mudanças Estruturais:**
- Fusão de `Aluno` para dentro de `Membro`.
- O `Membro` passará a ter um campo de `cargo` com diferentes níveis de acesso: `ADMIN` (Coordenadores/Pastores), `LIDER_CELULA`, e `COMUM` (Membro regular sem acesso administrativo).
- Para fins de autenticação no painel, o sistema de credenciais validará este cargo.

## 2. Modelagem de Organização (Células e Redes)
A organização eclesiástica não segue uma hierarquia estrita entre Células e Redes.

**Células:**
- Entidade: `Celula` (Nome, Dia/Horário de encontro, Bairro).
- Relação: **1-para-N** com Membros. Um membro só pode pertencer a no máximo **uma** célula.
- Liderança: Cada célula terá um líder responsável (que é um `Membro` com permissão `LIDER_CELULA`).

**Redes (Ministérios):**
- Entidade: `Rede` (ex: Jovens, Casais, Homens, Mulheres, Kids, Teens).
- Relação: **N-para-N** com Membros. Um membro pode fazer parte de **várias** redes simultaneamente (ex: Homens e Casais).

## 3. Gestão do Trilho (Jornada)
A igreja monitora o crescimento através de etapas sequenciais:
*Novo Membro -> Consolidação -> Pré Encontro -> Retiro Encontro com Deus -> Pós-encontro -> Escola Ministerial Nível 1 -> Escola Ministerial Nível 2*

**Modelagem:**
- Entidade: `HistoricoTrilho`.
- Registra a relação entre um `Membro` e uma `etapa` específica do trilho, gravando a `dataConclusao`.
- Permite gerar métricas precisas sobre conversão, retenção e a data exata de realização dos encontros.

## 4. Controle de Acesso e Permissões Distribuídas (Painel)
O sistema deixará de ser uso exclusivo da secretaria:
- **Administradores (ADMIN):** Acesso irrestrito a todos os dados do sistema, configuração de novas Redes, Células, Turmas da Escola e permissão para alterar cargos.
- **Líderes de Célula (LIDER_CELULA):** Ao logarem no painel (que usará RLS - Row Level Security na camada da API ou bloqueios lógicos), sua visão e permissões de edição serão restritas. Eles poderão ver **apenas** a lista de membros vinculados à sua própria célula. Através dessa visualização, poderão editar os dados básicos e registrar as conclusões de etapas do trilho de seus discípulos (ex: marcar que o membro X concluiu a consolidação).

## 5. Integração com a Escola Ministerial
- O módulo da Escola (Turmas, Matrículas, Módulos e Presenças) permanece estruturalmente igual, mas a relação `matricula` agora apontará para o ID do `Membro`.
- Ao registrar aprovação/formatura em um módulo específico da escola, o sistema poderá atualizar automaticamente o respectivo `HistoricoTrilho` do membro.

## Resumo do Trabalho

A transição demandará:
1. Migração complexa de dados (se a tabela Aluno atual possuir registros).
2. Atualização massiva do `schema.prisma`.
3. Ajuste nos Middlewares de Autorização e nas queries do Next.js para refletirem as permissões isoladas dos Líderes de Célula.
4. Criação das novas telas de interface: Gestão de Células, Gestão de Redes e o Kanban/Lista do Trilho.
