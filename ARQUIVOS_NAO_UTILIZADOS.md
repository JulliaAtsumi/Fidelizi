# Arquivos Não Utilizados ou Obsoletos

## Arquivos JavaScript Não Utilizados:

### 1. **public/js/pages/admin/admin-users.js**
   - **Motivo**: Usa ES6 modules (`import`) incompatíveis com a estrutura atual não-modular
   - **Substituído por**: `public/js/gerenciar_usuarios.js`
   - **Status**: NÃO UTILIZADO - pode ser removido

### 2. **public/js/pages/user/user-tests.js**
   - **Motivo**: Usa ES6 modules (`import`) incompatíveis com a estrutura atual não-modular
   - **Substituído por**: `public/js/teste.js`
   - **Status**: NÃO UTILIZADO - pode ser removido

### 3. **public/js/gerenciar_testes.js**
   - **Motivo**: Funcionalidade duplicada/substituída por `admin_teste.js`
   - **Status**: NÃO UTILIZADO - pode ser removido

### 4. **public/js/usuario.js**
   - **Motivo**: Usa estrutura antiga (`localStorage.getItem('usuarioLogado')`) e funcionalidade substituída
   - **Substituído por**: `novo_usuario.js` e `gerenciar_usuarios.js`
   - **Status**: NÃO UTILIZADO - pode ser removido

### 5. **public/js/admin_config.js**
   - **Motivo**: Página `admin_config.html` não existe (apenas alerta de "em desenvolvimento")
   - **Status**: NÃO UTILIZADO - pode ser removido ou mantido para implementação futura

### 6. **public/js/campo_busca.js**
   - **Motivo**: Funcionalidade de busca integrada em `admin-common.js` e `user-common.js`
   - **Status**: NÃO UTILIZADO - pode ser removido

### 7. **public/js/cadastro.js**
   - **Motivo**: Funcionalidade específica movida para `cadastro_pf.js` e `cadastro_pj.js`
   - **Status**: NÃO UTILIZADO - pode ser removido

### 8. **public/js/admin-header.js**
   - **Motivo**: Criado como template mas não está sendo usado (header está inline nas páginas)
   - **Status**: NÃO UTILIZADO - pode ser removido ou usado futuramente para padronização

### 9. **public/partials/admin-sidebar.html**
   - **Motivo**: Criado como template mas não está sendo usado (sidebar está inline nas páginas)
   - **Status**: NÃO UTILIZADO - pode ser removido ou usado futuramente para padronização

## Arquivos HTML Não Utilizados:

### 1. **public/cadastro/usuario.html**
   - **Motivo**: Funcionalidade substituída por `novo_usuario.html` e `gerenciar_usuarios.html`
   - **Status**: NÃO UTILIZADO - não referenciado em nenhuma página

### 2. **public/landing_page.html**
   - **Motivo**: Página de landing page - verificar se `index.html` é a landing principal
   - **Status**: VERIFICAR USO - pode estar sendo usado ou não

### 3. **public/recup_senha.html**
   - **Motivo**: Página de recuperação de senha - verificar se funcionalidade está completa
   - **Status**: VERIFICAR USO - pode precisar de implementação

## Observações Importantes:

- **Arquivos que usam ES6 modules (`import/export`)** não são compatíveis com a estrutura atual que usa script tags globais e Firebase 8 (não modular)
- **Arquivos que usam `localStorage.getItem('usuarioLogado')`** estão usando estrutura antiga - todos agora usam `localStorage.getItem('user')`
- **Os arquivos `admin-common.js` e `user-common.js`** centralizam funcionalidades comuns e substituem várias funcionalidades duplicadas
- **Arquivos marcados como "pode ser removido"** não estão sendo referenciados em nenhum HTML atual

## Recomendações:

1. **Remover** os arquivos JavaScript não utilizados listados acima para limpar o projeto
2. **Verificar** se `landing_page.html` e `recup_senha.html` são necessários ou precisam ser implementados
3. **Manter** apenas os arquivos que estão sendo ativamente usados nas páginas HTML