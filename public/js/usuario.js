// Variáveis globais
let currentPage = 1;
let recordsPerPage = 10;
let currentUsers = [];
let editingUserId = null;

// Verificar acesso admin
function checkAdminAccess() {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    if (usuarioLogado.perfil !== 'admin') {
        alert('❌ Acesso negado! Esta área é restrita para administradores.');
        window.location.href = 'home.html';
        return false;
    }
    return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (checkAdminAccess()) {
        initializeData();
        loadUsers();
        setupEventListeners();
        toggleFields(); // Inicializar campos corretos
    }
});

// Inicializar dados
function initializeData() {
    if (!localStorage.getItem('usuarios')) {
        const usuarios = [
            {
                id: 1,
                email: "admin@fidelizi.com",
                senha: "123456",
                tipo: "pf",
                nome: "Administrador Principal",
                cpf: "123.456.789-00",
                perfil: "admin",
                dataCadastro: new Date().toISOString()
            },
            {
                id: 2,
                email: "usuario@fidelizi.com",
                senha: "123456",
                tipo: "pf",
                nome: "Usuário de Teste",
                cpf: "987.654.321-00",
                perfil: "usuario",
                dataCadastro: new Date().toISOString()
            },
            {
                id: 3,
                email: "empresa@fidelizi.com",
                senha: "123456",
                tipo: "pj",
                razaoSocial: "Empresa Teste Ltda",
                cnpj: "12.345.678/0001-90",
                contato: "João Silva",
                telefone: "(11) 99999-9999",
                perfil: "usuario",
                dataCadastro: new Date().toISOString()
            }
        ];
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('user-form').addEventListener('submit', saveUser);
    document.getElementById('search-users').addEventListener('input', searchUsers);
    document.getElementById('global-search').addEventListener('input', searchUsers);
    document.getElementById('user-type').addEventListener('change', toggleFields);
}

// Alternar campos PF/PJ com validação
function toggleFields() {
    const type = document.getElementById('user-type').value;
    const pfFields = document.getElementById('pf-fields');
    const pjFields = document.getElementById('pj-fields');
    
    // Resetar validações
    resetValidation();
    
    if (type === 'pf') {
        pfFields.classList.remove('hidden');
        pjFields.classList.add('hidden');
        // Tornar campos PF obrigatórios
        document.getElementById('user-name').required = true;
        document.getElementById('user-cpf').required = true;
        // Remover obrigatoriedade dos campos PJ
        document.getElementById('company-name').required = false;
        document.getElementById('company-cnpj').required = false;
    } else if (type === 'pj') {
        pfFields.classList.add('hidden');
        pjFields.classList.remove('hidden');
        // Remover obrigatoriedade dos campos PF
        document.getElementById('user-name').required = false;
        document.getElementById('user-cpf').required = false;
        // Tornar campos PJ obrigatórios
        document.getElementById('company-name').required = true;
        document.getElementById('company-cnpj').required = true;
    } else {
        // Tipo não selecionado
        pfFields.classList.add('hidden');
        pjFields.classList.add('hidden');
    }
}

// Resetar validações
function resetValidation() {
    const inputs = document.querySelectorAll('#user-form input');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
    });
}

// Validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

// Validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digitos.charAt(1));
}

// Formatar CPF
function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ
function formatarCNPJ(cnpj) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.getElementById('alert-message');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.classList.remove('hidden');
    
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

// Carregar usuários
function loadUsers() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    currentUsers = usuarios;
    renderUsersTable();
}

// Renderizar tabela de usuários
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const usersToShow = currentUsers.slice(startIndex, endIndex);

    if (usersToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="fas fa-users fa-2x mb-2 d-block"></i>
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        renderPagination();
        return;
    }

    tbody.innerHTML = usersToShow.map(user => {
        const nome = user.tipo === 'pf' ? user.nome : user.razaoSocial;
        const documento = user.tipo === 'pf' ? 
            (user.cpf ? formatarCPF(user.cpf) : 'N/A') : 
            (user.cnpj ? formatarCNPJ(user.cnpj) : 'N/A');
        const iniciais = nome ? nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
        
        const contatoInfo = user.tipo === 'pj' ? user.contato || 'N/A' : '-';
        const telefoneInfo = user.tipo === 'pj' ? user.telefone || 'N/A' : '-';

        return `
            <tr>
                <td>
                    <div class="user-avatar">
                        ${iniciais}
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${nome}</strong><br>
                        <small class="text-muted">${user.email}</small>
                    </div>
                </td>
                <td>
                    <span class="badge ${user.tipo === 'pf' ? 'badge-pf' : 'badge-pj'}">
                        ${user.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.perfil === 'admin' ? 'badge-admin' : 'badge-user'}">
                        ${user.perfil === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                </td>
                <td><small class="text-muted">${documento}</small></td>
                <td><small class="text-muted">${contatoInfo}</small></td>
                <td><small class="text-muted">${telefoneInfo}</small></td>
                <td><small class="text-muted">${new Date(user.dataCadastro).toLocaleDateString('pt-BR')}</small></td>
                <td class="text-center">
                    <div class="table-actions">
                        <button class="action-btn btn-primary" onclick="editUser(${user.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-success" onclick="testUserLogin(${user.id})" title="Testar Login">
                            <i class="fas fa-sign-in-alt"></i>
                        </button>
                        <button class="action-btn btn-danger" onclick="deleteUser(${user.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination();
}

// Renderizar paginação
function renderPagination() {
    const totalPages = Math.ceil(currentUsers.length / recordsPerPage);
    const pagination = document.getElementById('pagination-controls');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `
        <div class="btn-group">
            <button class="btn btn-secondary ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="btn ${currentPage === i ? 'btn-primary' : 'btn-secondary'}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `
            <button class="btn btn-secondary ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <span class="ms-3 text-muted">Página ${currentPage} de ${totalPages}</span>
    `;

    pagination.innerHTML = html;
}

// Mudar página
function changePage(page) {
    currentPage = page;
    renderUsersTable();
}

// Mudar registros por página
function changeRecordsPerPage() {
    recordsPerPage = parseInt(document.getElementById('records-per-page').value);
    currentPage = 1;
    renderUsersTable();
}

// Pesquisar usuários
function searchUsers() {
    const searchTerm = document.getElementById('search-users').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    const filterPerfil = document.getElementById('filter-perfil').value;
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    currentUsers = usuarios.filter(user => {
        const nome = user.tipo === 'pf' ? user.nome : user.razaoSocial;
        const matchesSearch = user.email.toLowerCase().includes(searchTerm) ||
                             (nome && nome.toLowerCase().includes(searchTerm)) ||
                             (user.cpf && user.cpf.includes(searchTerm)) ||
                             (user.cnpj && user.cnpj.includes(searchTerm));
        
        const matchesType = !filterType || user.tipo === filterType;
        const matchesPerfil = !filterPerfil || user.perfil === filterPerfil;
        
        return matchesSearch && matchesType && matchesPerfil;
    });
    
    currentPage = 1;
    renderUsersTable();
}

// Salvar usuário (Create/Update)
function saveUser(event) {
    event.preventDefault();
    
    const userData = {
        id: editingUserId || Date.now(),
        email: document.getElementById('user-email').value.trim(),
        senha: document.getElementById('user-password').value,
        tipo: document.getElementById('user-type').value,
        perfil: document.getElementById('user-perfil').value,
        dataCadastro: editingUserId ? undefined : new Date().toISOString()
    };

    // Validações básicas
    if (!userData.email || !userData.senha || !userData.tipo) {
        showAlert('Preencha todos os campos obrigatórios!', 'danger');
        return;
    }

    // Coletar e validar dados específicos
    if (userData.tipo === 'pf') {
        userData.nome = document.getElementById('user-name').value.trim();
        userData.cpf = document.getElementById('user-cpf').value.replace(/\D/g, '');
        
        if (!userData.nome) {
            showAlert('Nome completo é obrigatório para Pessoa Física!', 'danger');
            document.getElementById('user-name').classList.add('is-invalid');
            return;
        }
        
        if (userData.cpf && !validarCPF(userData.cpf)) {
            showAlert('CPF inválido!', 'danger');
            document.getElementById('user-cpf').classList.add('is-invalid');
            return;
        }
    } else {
        userData.razaoSocial = document.getElementById('company-name').value.trim();
        userData.cnpj = document.getElementById('company-cnpj').value.replace(/\D/g, '');
        userData.contato = document.getElementById('company-contact').value.trim();
        userData.telefone = document.getElementById('company-phone').value.trim();
        
        if (!userData.razaoSocial) {
            showAlert('Razão social é obrigatória para Pessoa Jurídica!', 'danger');
            document.getElementById('company-name').classList.add('is-invalid');
            return;
        }
        
        if (userData.cnpj && !validarCNPJ(userData.cnpj)) {
            showAlert('CNPJ inválido!', 'danger');
            document.getElementById('company-cnpj').classList.add('is-invalid');
            return;
        }
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    if (editingUserId) {
        // Update
        const usuarioOriginal = usuarios.find(u => u.id === editingUserId);
        if (usuarioOriginal) {
            userData.dataCadastro = usuarioOriginal.dataCadastro;
        }
        
        const index = usuarios.findIndex(u => u.id === editingUserId);
        if (index !== -1) {
            // Verificar se email já existe (excluindo o próprio usuário)
            const emailExists = usuarios.some((u, i) => i !== index && u.email === userData.email);
            if (emailExists) {
                showAlert('Este e-mail já está cadastrado!', 'danger');
                return;
            }
            
            usuarios[index] = { ...usuarios[index], ...userData };
            showAlert('Usuário atualizado com sucesso!', 'success');
        }
    } else {
        // Create - verificar se email já existe
        if (usuarios.find(u => u.email === userData.email)) {
            showAlert('Este e-mail já está cadastrado!', 'danger');
            return;
        }
        usuarios.push(userData);
        showAlert('Usuário cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    resetForm();
    loadUsers();
}

// Editar usuário
function editUser(id) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find(u => u.id === id);
    
    if (user) {
        editingUserId = user.id;
        document.getElementById('form-title').innerHTML = '<i class="fas fa-user-edit me-2"></i>Editar Usuário';
        
        // Preencher formulário
        document.getElementById('user-type').value = user.tipo;
        document.getElementById('user-perfil').value = user.perfil;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-password').value = user.senha;
        
        toggleFields();
        
        if (user.tipo === 'pf') {
            document.getElementById('user-name').value = user.nome || '';
            document.getElementById('user-cpf').value = user.cpf ? formatarCPF(user.cpf) : '';
        } else {
            document.getElementById('company-name').value = user.razaoSocial || '';
            document.getElementById('company-cnpj').value = user.cnpj ? formatarCNPJ(user.cnpj) : '';
            document.getElementById('company-contact').value = user.contato || '';
            document.getElementById('company-phone').value = user.telefone || '';
        }
        
        // Scroll para o formulário
        document.getElementById('user-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Testar login do usuário
function testUserLogin(id) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find(u => u.id === id);
    
    if (user) {
        if (confirm(`Deseja testar o login com o usuário ${user.email}?`)) {
            // Salvar usuário para teste
            localStorage.setItem('usuarioTeste', JSON.stringify(user));
            window.open('index.html', '_blank');
        }
    }
}

// Excluir usuário
function deleteUser(id) {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    if (usuarioLogado.id === id) {
        showAlert('Você não pode excluir sua própria conta!', 'danger');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este usuário?\nEsta ação não pode ser desfeita.')) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const filteredUsers = usuarios.filter(u => u.id !== id);
        localStorage.setItem('usuarios', JSON.stringify(filteredUsers));
        loadUsers();
        showAlert('Usuário excluído com sucesso!', 'success');
    }
}

// Resetar formulário
function resetForm() {
    document.getElementById('user-form').reset();
    document.getElementById('form-title').innerHTML = '<i class="fas fa-user-plus me-2"></i>Novo Usuário';
    editingUserId = null;
    resetValidation();
    toggleFields(); // Resetar para estado inicial
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});

// Event listeners para formatação automática
document.addEventListener('DOMContentLoaded', function() {
    // Formatação automática do CPF
    const cpfInput = document.getElementById('user-cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                e.target.value = value.substring(0, 14);
            }
        });
    }

    // Formatação automática do CNPJ
    const cnpjInput = document.getElementById('company-cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 14) {
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
                value = value.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
                value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
                e.target.value = value.substring(0, 18);
            }
        });
    }

    // Formatação automática do telefone
    const phoneInput = document.getElementById('company-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value.substring(0, 15);
            }
        });
    }
});