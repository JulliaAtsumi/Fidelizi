# Fidelizi - Sistema de Segurança IoT

**Sistema web para testes de segurança e análise de vulnerabilidades em dispositivos IoT**

## 🚀 Versão 2.0 - Refatorada e Segura

Esta versão inclui melhorias significativas de segurança, organização de código e boas práticas de desenvolvimento.

---

## 📋 Sumário

- [✅ Problemas Resolvidos](#-problemas-resolvidos)
- [🏗️ Arquitetura](#️-arquitetura)
- [🔧 Instalação](#-instalação)
- [🔐 Segurança](#-segurança)
- [📁 Estrutura de Arquivos](#-estrutura-de-arquivos)
- [🚀 Como Usar](#-como-usar)
- [🛠️ Desenvolvimento](#️-desenvolvimento)
- [📝 API](#-api)
- [🧪 Testes](#-testes)

---

## ✅ Problemas Resolvidos

### 🔐 **Autenticação**
- ✅ **Inconsistência de localStorage corrigida**
- ✅ **Sistema de autenticação centralizado (AuthService)**
- ✅ **Criptografia de dados sensíveis**
- ✅ **Sessão com expiração automática**
- ✅ **Proteção contra múltiplas tentativas**

### 🎨 **CSS & Estilos**
- ✅ **Font-family URLs corrigidas**
- ✅ **Google Fonts importado corretamente**
- ✅ **Estilos padronizados**

### 🏗️ **Organização**
- ✅ **Módulos ES6** - Código estruturado e reutilizável
- ✅ **Componentes reutilizáveis** - DataTable com paginação
- ✅ **Sistema de estado global (StateManager)**
- ✅ **Utilitários centralizados (Utils)**

---

## 🏗️ Arquitetura

```
Fidelizi/
├── 📁 public/                    # Arquivos estáticos
│   ├── 📁 js/
│   │   ├── 📁 services/          # Serviços centrais
│   │   │   ├── AuthService.js    # Autenticação segura
│   │   │   └── StateManager.js  # Gerenciamento de estado
│   │   ├── 📁 components/       # Componentes reutilizáveis
│   │   │   └── DataTable.js     # Tabela dinâmica
│   │   ├── 📁 utils/           # Funções utilitárias
│   │   │   └── Utils.js         # Validações, formatação, etc
│   │   ├── 📁 firebase/        # Configuração Firebase
│   │   │   ├── firebase-config.js
│   │   │   └── firebase-config-v2.js
│   │   └── index-v2.js         # Login refatorado
│   ├── 📄 *.html              # Páginas HTML
│   └── 📁 assets/             # Imagens, CSS
├── 📁 src/                    # Código-fonte (futuro)
├── 📄 .env                    # Variáveis de ambiente
├── 📄 package.json            # Dependências e scripts
└── 📄 README.md               # Documentação
```

---

## 🔧 Instalação

### Pré-requisitos
- Node.js 16+ (opcional, para desenvolvimento)
- Python 3+ (para servidor local)
- Navegador moderno com ES6+

### Passos

1. **Clonar repositório**
   ```bash
   git clone <repository-url>
   cd Fidelizi
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar ambiente**
   ```bash
   cp .env.example .env
   # Editar .env com suas credenciais Firebase
   ```

4. **Iniciar servidor**
   ```bash
   npm run dev
   # ou
   python -m http.server 8000
   ```

5. **Acessar aplicação**
   ```
   http://localhost:8000
   ```

---

## 🔐 Segurança

### 🛡️ Medidas Implementadas

#### **Autenticação**
- ✅ Criptografia de dados no localStorage
- ✅ Sessão com expiração (24h)
- ✅ Proteção contra brute force
- ✅ Validação server-side (Firebase)

#### **Dados**
- ✅ Credenciais em variáveis de ambiente
- ✅ Validação de entrada (CPF/CNPJ/Email)
- ✅ Sanitização de dados
- ✅ Proteção XSS

#### **Comunicação**
- ✅ HTTPS obrigatório (produção)
- ✅ Firebase Security Rules
- ✅ Tokens de sessão seguros

### 🔑 Credenciais de Teste

```
👤 Administrador:
Email: admin@fidelizi.com
Senha: 123456

👤 Usuário Comum:
Email: usuario@fidelizi.com
Senha: 123456
```

---

## 📁 Estrutura de Arquivos

### 📂 Services (Serviços)

#### `AuthService.js`
- Login/logout seguros
- Gerenciamento de sessão
- Verificação de permissões
- Criptografia de dados

#### `StateManager.js`
- Estado global da aplicação
- Persistência segura
- Sistema de observadores
- Gestão de tema e preferências

### 🧩 Components (Componentes)

#### `DataTable.js`
- Tabela dinâmica reutilizável
- Paginação integrada
- Busca e filtros
- Ordenação de colunas

### 🔧 Utils (Utilitários)

#### `Utils.js`
- Validações (CPF, CNPJ, Email)
- Formatação (moeda, data, telefone)
- Sistema de alertas melhorado
- Utilitários DOM e string

---

## 🚀 Como Usar

### 🔑 Login

```javascript
// Usando novo AuthService
const result = await AuthService.login(email, password);

if (result.success) {
    console.log('Usuário logado:', result.user);
    window.location.href = result.redirectTo;
} else {
    console.error('Erro:', result.error);
}
```

### 📊 Tabela de Dados

```javascript
// Criar tabela
const table = new DataTable('#minha-tabela', {
    columns: [
        { key: 'nome', title: 'Nome', sortable: true },
        { key: 'email', title: 'Email', sortable: true },
        { key: 'perfil', title: 'Perfil', formatter: formatPerfil }
    ],
    data: usuarios,
    pagination: true,
    pageSize: 10,
    searchable: true
});

// Atualizar dados
table.setData(novosDados);
```

### 🔔 Alertas

```javascript
// Tipos de alerta
Utils.alerts.success('Operação realizada com sucesso!');
Utils.alerts.error('Erro ao processar solicitação');
Utils.alerts.warning('Atenção: dados incompletos');
Utils.alerts.info('Informação importante');

// Confirmação
Utils.alerts.confirm('Tem certeza?', () => {
    console.log('Confirmado!');
});
```

### 🎨 Tema

```javascript
// Alternar tema
StateManager.toggleTheme();

// Observar mudanças
StateManager.on('theme:changed', (data) => {
    console.log('Tema alterado:', data.newValue);
});
```

---

## 🛠️ Desenvolvimento

### 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run lint         # Verificação de código
npm run lint:fix     # Correção automática
npm run format       # Formatação do código
npm run test         # Executar testes
npm run validate     # Validação completa
```

### 🔍 Code Quality

- **ESLint** para qualidade de código
- **Prettier** para formatação
- **Módulos ES6** para organização
- **JSDoc** para documentação

### 🚀 Deploy

1. **Build para produção**
   ```bash
   npm run build
   ```

2. **Configurar Firebase Hosting**
   ```bash
   firebase login
   firebase init
   firebase deploy
   ```

---

## 📝 API

### 🔐 AuthService

```javascript
// Login
await AuthService.login(email, password)

// Logout
await AuthService.logout()

// Usuário atual
AuthService.getCurrentUser()

// Verificar autenticação
AuthService.checkAuth(requiredRole)

// Verificar permissão
AuthService.hasRole('admin')

// Redirecionar baseado em perfil
AuthService.redirectBasedOnRole()
```

### 🗂️ StateManager

```javascript
// Obter estado
StateManager.get('user')
StateManager.get() // Estado completo

// Definir estado
StateManager.set('theme', 'dark')
StateManager.setMultiple({ user: newUser, theme: 'light' })

// Observadores
StateManager.on('user:changed', callback)

// Utilitários
StateManager.toggleTheme()
StateManager.toggleSidebar()
StateManager.updatePagination({ page: 2 })
```

### 🛠️ Utils

```javascript
// Validações
Utils.validators.cpf(cpf)
Utils.validators.cnpj(cnpj)
Utils.validators.email(email)
Utils.validators.password(senha)

// Formatação
Utils.formatters.cpf(cpf)
Utils.formatters.currency(valor)
Utils.formatters.date(data)

// Alertas
Utils.alerts.success(mensagem)
Utils.alerts.error(mensagem)
Utils.alerts.confirm(mensagem, callback)

// Utilitários
Utils.debounce(funcao, delay)
Utils.throttle(funcao, limit)
Utils.string.truncate(texto, 50)
```

---

## 🧪 Testes

### 🧪 Testes Automatizados

```bash
# Executar todos os testes
npm test

# Testes específicos
npm test -- --grep "AuthService"
npm test -- --grep "DataTable"
```

### 🔍 Testes Manuais

1. **Autenticação**
   - [ ] Login com credenciais válidas
   - [ ] Login com credenciais inválidas
   - [ ] Múltiplas tentativas de login
   - [ ] Sessão expirada

2. **Funcionalidades**
   - [ ] Criação de usuários
   - [ ] Edição de dados
   - [ ] Exclusão de registros
   - [ ] Paginação e busca

3. **Segurança**
   - [ ] Validação de entrada
   - [ ] Proteção XSS
   - [ ] Criptografia de dados
   - [ ] Controle de acesso

---

## 🔄 Migração da v1 para v2

### 📋 Checklist de Migração

#### ✅ **Concluído**
- [x] Correção de inconsistências de localStorage
- [x] Implementação de AuthService
- [x] Criação de StateManager
- [x] Refatoração de utilitários
- [x] Componentes reutilizáveis

#### 🔄 **Em Progresso**
- [ ] Migrar todas as páginas para novo sistema
- [ ] Implementar DataTable em todas as listagens
- [ ] Adicionar testes unitários
- [ ] Documentação completa da API

#### ⏳ **Pendente**
- [ ] Sistema de build com Vite
- [ ] CI/CD automatizado
- [ ] Testes E2E com Cypress
- [ ] Monitoramento e analytics

---

## 🤝 Contribuição

### 📋 Como Contribuir

1. **Fork** o repositório
2. **Branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. **Push** para o branch (`git push origin feature/nova-funcionalidade`)
5. **Pull Request** descrevendo as mudanças

### 📝 Padrões de Código

- Usar **ES6+** (const/let, arrow functions)
- Seguir **JSDoc** para documentação
- Manter **nomenclatura consistente**
- Escrever **testes** para novas funcionalidades
- Seguir **convenções Git** (commits semânticos)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Contato

- **Email**: contato@fidelizi.com
- **Issues**: [GitHub Issues](https://github.com/username/fidelizi-tcc/issues)
- **Documentação**: [Wiki](https://github.com/username/fidelizi-tcc/wiki)

---

## 🙏 Agradecimentos

- **Firebase** - Plataforma de backend
- **Bootstrap** - Framework CSS
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia
- **Comunidade** - Feedback e suporte

---

**🎓 Trabalho de Conclusão de Curso - Engenharia de Software**  
**📅 Ano: 2024**  
**👥 Autor: Fidelizi Team**
