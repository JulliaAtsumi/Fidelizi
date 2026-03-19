// gerenciar_usuarios.js
// CRUD completo de usuários com Firebase para Admin

// Variáveis globais
let currentPage = 1;
let recordsPerPage = 10;
let currentUsers = [];
let allUsers = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar acesso é feito pelo admin-common.js
    if (typeof checkAdminAccess === 'function' && checkAdminAccess()) {
        await loadUsers();
        setupEventListeners();
    }
});

// Configurar event listeners
function setupEventListeners() {
    const searchUsers = document.getElementById('search-users');
    if (searchUsers) {
        searchUsers.addEventListener('input', filterUsers);
    }
    
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', filterUsers);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.getElementById('alert-message');
    if (alert) {
        alert.textContent = message;
        alert.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
        alert.classList.remove('hidden');
        
        setTimeout(() => {
            alert.classList.add('hidden');
        }, 5000);
    }
}

// Carregar usuários do Firebase
async function loadUsers() {
    try {
        showAlert('Carregando usuários...', 'info');
        const users = await getUsers();
        allUsers = users.filter(user => user.ativo !== false);
        currentUsers = [...allUsers];
        renderUsersTable();
        updateUsersCount();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showAlert('Erro ao carregar usuários', 'danger');
    }
}

// Atualizar contador de usuários
function updateUsersCount() {
    const countElement = document.getElementById('total-users-count');
    if (countElement) {
        countElement.textContent = `${currentUsers.length} usuário${currentUsers.length !== 1 ? 's' : ''}`;
    }
}

// Formatar CPF
function formatarCPF(cpf) {
    if (!cpf) return '-';
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return cpf;
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ
function formatarCNPJ(cnpj) {
    if (!cnpj) return '-';
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return cnpj;
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Renderizar tabela de usuários
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const usersToShow = currentUsers.slice(startIndex, endIndex);

    if (usersToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="fas fa-users fa-2x mb-2 d-block"></i>
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        renderPagination();
        return;
    }

    tbody.innerHTML = usersToShow.map(user => {
        // Avatar
        const avatarText = (user.nome || user.companyName || 'U').charAt(0).toUpperCase();
        
        // Nome/Email
        const displayName = user.nome || user.companyName || user.email;
        
        // Documento
        const documento = user.tipo === 'pf' ? formatarCPF(user.cpf) : formatarCNPJ(user.cnpj);
        
        // Data de cadastro
        const dataCadastro = user.dataCadastro?.toDate ? user.dataCadastro.toDate() : new Date(user.dataCadastro);
        const dataFormatada = dataCadastro ? dataCadastro.toLocaleDateString('pt-BR') : '-';

        return `
            <tr>
                <td>
                    <div class="user-avatar">${avatarText}</div>
                </td>
                <td>
                    <div><strong>${displayName}</strong></div>
                    <small class="text-muted">${user.email}</small>
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
                <td>${documento}</td>
                <td>${user.contactName || '-'}</td>
                <td>${user.phone || '-'}</td>
                <td><small class="text-muted">${dataFormatada}</small></td>
                <td class="text-center">
                    <div class="table-actions">
                        <button class="action-btn btn-warning" onclick="editUser('${user.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-danger" onclick="deleteUserById('${user.id}')" title="Excluir">
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
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `
        <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `
            <button class="btn btn-sm btn-outline-primary ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <span class="ms-3 text-muted">Página ${currentPage} de ${totalPages}</span>
    `;

    pagination.innerHTML = html;
}

// Mudar página
function changePage(page) {
    const totalPages = Math.ceil(currentUsers.length / recordsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderUsersTable();
    }
}

// Mudar registros por página
function changeRecordsPerPage() {
    recordsPerPage = parseInt(document.getElementById('records-per-page')?.value || 10);
    currentPage = 1;
    renderUsersTable();
}

// Filtrar usuários
function filterUsers() {
    const searchTerm = (document.getElementById('search-users')?.value || 
                       document.getElementById('global-search')?.value || '').toLowerCase();
    const filterType = document.getElementById('filter-type')?.value || '';
    const filterPerfil = document.getElementById('filter-perfil')?.value || '';
    
    currentUsers = allUsers.filter(user => {
        const nome = user.tipo === 'pf' ? user.nome : user.companyName;
        const matchesSearch = !searchTerm ||
            user.email.toLowerCase().includes(searchTerm) ||
            (nome && nome.toLowerCase().includes(searchTerm)) ||
            (user.cpf && user.cpf.includes(searchTerm)) ||
            (user.cnpj && user.cnpj.includes(searchTerm));
        
        const matchesType = !filterType || user.tipo === filterType;
        const matchesPerfil = !filterPerfil || user.perfil === filterPerfil;
        
        return matchesSearch && matchesType && matchesPerfil;
    });
    
    currentPage = 1;
    renderUsersTable();
    updateUsersCount();
}

// Pesquisar usuários (para compatibilidade)
function searchUsers() {
    filterUsers();
}

// Editar usuário
function editUser(userId) {
    window.location.href = `novo_usuario.html?edit=${userId}`;
}

// Excluir usuário
async function deleteUserById(userId) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userToDelete = allUsers.find(u => u.id === userId);
    
    if (userToDelete && currentUser.uid === userId) {
        showAlert('Você não pode excluir sua própria conta!', 'danger');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este usuário?\nEsta ação não pode ser desfeita.')) {
        try {
            await deleteUser(userId);
            showAlert('Usuário excluído com sucesso!', 'success');
            await loadUsers();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            showAlert('Erro ao excluir usuário', 'danger');
        }
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        auth.signOut().then(() => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }).catch(error => {
            console.error('Erro ao fazer logout:', error);
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

// Exportar funções para uso global
window.editUser = editUser;
window.deleteUserById = deleteUserById;
window.deleteUser = deleteUserById; // Para compatibilidade
window.changePage = changePage;
window.changeRecordsPerPage = changeRecordsPerPage;
window.searchUsers = searchUsers;
window.filterUsers = filterUsers;