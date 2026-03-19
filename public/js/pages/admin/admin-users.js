// js/pages/admin/admin-users.js
import { checkAuth } from '../../auth/auth-guard.js';
import { getUsers, deleteUser } from '../../firebase-services.js';

let allUsers = [];
let currentPage = 1;
let recordsPerPage = 10;

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth('admin')) return;
    
    await loadUsers();
    setupEventListeners();
});

async function loadUsers() {
    try {
        allUsers = await getUsers();
        renderUsersTable();
        renderPagination();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showAlert('Erro ao carregar usuários', 'error');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const usersToShow = allUsers.slice(startIndex, endIndex);

    tbody.innerHTML = usersToShow.map(user => `
        <tr>
            <td>${user.nome || user.companyName || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span class="badge bg-${user.perfil === 'admin' ? 'danger' : 'primary'}">${user.perfil}</span></td>
            <td>${user.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
            <td>${formatDate(user.dataCadastro)}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function confirmDeleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        try {
            await deleteUser(userId);
            showAlert('Usuário excluído com sucesso!', 'success');
            await loadUsers();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            showAlert('Erro ao excluir usuário', 'error');
        }
    }
}

function setupEventListeners() {
    document.getElementById('search-users').addEventListener('input', filterUsers);
    document.getElementById('filter-type').addEventListener('change', filterUsers);
    document.getElementById('filter-perfil').addEventListener('change', filterUsers);
}

function filterUsers() {
    const searchTerm = document.getElementById('search-users').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    const filterPerfil = document.getElementById('filter-perfil').value;

    let filtered = allUsers;

    if (searchTerm) {
        filtered = filtered.filter(user => 
            (user.nome && user.nome.toLowerCase().includes(searchTerm)) ||
            (user.companyName && user.companyName.toLowerCase().includes(searchTerm)) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

    if (filterType) {
        filtered = filtered.filter(user => user.tipo === filterType);
    }

    if (filterPerfil) {
        filtered = filtered.filter(user => user.perfil === filterPerfil);
    }

    allUsers = filtered;
    currentPage = 1;
    renderUsersTable();
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(allUsers.length / recordsPerPage);
    const pagination = document.getElementById('pagination-controls');
    
    let html = '';
    
    if (currentPage > 1) {
        html += `<button class="btn btn-sm btn-outline-primary" onclick="changePage(${currentPage - 1})">Anterior</button>`;
    }
    
    html += `<span class="mx-2">Página ${currentPage} de ${totalPages}</span>`;
    
    if (currentPage < totalPages) {
        html += `<button class="btn btn-sm btn-outline-primary" onclick="changePage(${currentPage + 1})">Próxima</button>`;
    }
    
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderUsersTable();
    renderPagination();
}

function changeRecordsPerPage() {
    recordsPerPage = parseInt(document.getElementById('records-per-page').value);
    currentPage = 1;
    renderUsersTable();
    renderPagination();
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
}

function showAlert(message, type) {
    // Implementar função de alerta conforme seu sistema
    alert(message);
}

// Exportar para uso global
window.changePage = changePage;
window.changeRecordsPerPage = changeRecordsPerPage;
window.confirmDeleteUser = confirmDeleteUser;
window.editUser = function(userId) {
    window.location.href = `editar_usuario.html?id=${userId}`;
};