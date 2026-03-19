// js/pages/user/user-tests.js
import { checkAuth } from './js/auth/auth-guard.js';
import { getTestsByUser, createTest, updateTest, deleteTest } from './js/firebase/firebase-services.js';

let allTests = [];
let currentPage = 1;
let recordsPerPage = 10;
let editingTestId = null;

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    await loadTests();
    setupEventListeners();
});

async function loadTests() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        allTests = await getTestsByUser(user.uid);
        renderTestsTable();
        renderPagination();
    } catch (error) {
        console.error('Erro ao carregar testes:', error);
        showAlert('Erro ao carregar testes', 'error');
    }
}

function renderTestsTable() {
    const tbody = document.getElementById('tests-table-body');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const testsToShow = allTests.slice(startIndex, endIndex);

    tbody.innerHTML = testsToShow.map(test => `
        <tr>
            <td>${test.nome}</td>
            <td>${test.dispositivo}</td>
            <td>${test.tipo}</td>
            <td><span class="badge bg-${getStatusBadge(test.status)}">${test.status}</span></td>
            <td>${test.vulnerabilidades || 0}</td>
            <td>${test.severidade ? `<span class="badge bg-${getSeverityBadge(test.severidade)}">${test.severidade}</span>` : 'N/A'}</td>
            <td>${formatDate(test.dataCriacao)}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editTest('${test.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteTest('${test.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    const statusMap = {
        'pendente': 'warning',
        'andamento': 'info',
        'concluido': 'success',
        'falha': 'danger'
    };
    return statusMap[status] || 'secondary';
}

function getSeverityBadge(severity) {
    const severityMap = {
        'baixa': 'success',
        'media': 'warning',
        'alta': 'danger',
        'critica': 'dark'
    };
    return severityMap[severity] || 'secondary';
}

async function saveTest(event) {
    event.preventDefault();
    
    const testData = {
        nome: document.getElementById('test-name').value.trim(),
        dispositivo: document.getElementById('test-device').value,
        tipo: document.getElementById('test-type').value,
        status: document.getElementById('test-status').value,
        severidade: document.getElementById('test-severity').value || null,
        vulnerabilidades: parseInt(document.getElementById('test-vulnerabilities').value) || 0,
        prioridade: document.getElementById('test-priority').value,
        descricao: document.getElementById('test-description').value.trim(),
        observacoes: document.getElementById('test-observations').value.trim(),
    };

    if (!testData.nome || !testData.dispositivo || !testData.tipo || !testData.descricao) {
        showAlert('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    try {
        if (editingTestId) {
            await updateTest(editingTestId, testData);
            showAlert('Teste atualizado com sucesso!', 'success');
        } else {
            await createTest(testData);
            showAlert('Teste criado com sucesso!', 'success');
        }
        
        resetForm();
        await loadTests();
        
    } catch (error) {
        console.error('Erro ao salvar teste:', error);
        showAlert('Erro ao salvar teste. Tente novamente.', 'error');
    }
}

async function editTest(testId) {
    try {
        const test = await getTestById(testId);
        if (test) {
            editingTestId = testId;
            
            document.getElementById('test-name').value = test.nome;
            document.getElementById('test-device').value = test.dispositivo;
            document.getElementById('test-type').value = test.tipo;
            document.getElementById('test-status').value = test.status;
            document.getElementById('test-severity').value = test.severidade || '';
            document.getElementById('test-vulnerabilities').value = test.vulnerabilidades || 0;
            document.getElementById('test-priority').value = test.prioridade || 'media';
            document.getElementById('test-description').value = test.descricao;
            document.getElementById('test-observations').value = test.observacoes || '';
            
            document.getElementById('form-title').textContent = 'Editar Teste';
            document.getElementById('test-form').scrollIntoView();
        }
    } catch (error) {
        console.error('Erro ao carregar teste:', error);
        showAlert('Erro ao carregar teste', 'error');
    }
}

async function confirmDeleteTest(testId) {
    if (confirm('Tem certeza que deseja excluir este teste?')) {
        try {
            await deleteTest(testId);
            showAlert('Teste excluído com sucesso!', 'success');
            await loadTests();
        } catch (error) {
            console.error('Erro ao excluir teste:', error);
            showAlert('Erro ao excluir teste', 'error');
        }
    }
}

function resetForm() {
    document.getElementById('test-form').reset();
    editingTestId = null;
    document.getElementById('form-title').textContent = 'Novo Teste';
}

function setupEventListeners() {
    document.getElementById('test-form').addEventListener('submit', saveTest);
    document.getElementById('search-tests').addEventListener('input', filterTests);
    document.getElementById('filter-device').addEventListener('change', filterTests);
    document.getElementById('filter-status').addEventListener('change', filterTests);
}

function filterTests() {
    const searchTerm = document.getElementById('search-tests').value.toLowerCase();
    const filterDevice = document.getElementById('filter-device').value;
    const filterStatus = document.getElementById('filter-status').value;

    let filtered = allTests;

    if (searchTerm) {
        filtered = filtered.filter(test => 
            test.nome.toLowerCase().includes(searchTerm) ||
            test.descricao.toLowerCase().includes(searchTerm)
        );
    }

    if (filterDevice) {
        filtered = filtered.filter(test => test.dispositivo === filterDevice);
    }

    if (filterStatus) {
        filtered = filtered.filter(test => test.status === filterStatus);
    }

    allTests = filtered;
    currentPage = 1;
    renderTestsTable();
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(allTests.length / recordsPerPage);
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
    renderTestsTable();
    renderPagination();
}

function changeRecordsPerPage() {
    recordsPerPage = parseInt(document.getElementById('records-per-page').value);
    currentPage = 1;
    renderTestsTable();
    renderPagination();
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
}

function showAlert(message, type) {
    // Implementar função de alerta conforme seu sistema
    const alertDiv = document.getElementById('alert-message');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.display = 'block';
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Exportar para uso global
window.changePage = changePage;
window.changeRecordsPerPage = changeRecordsPerPage;
window.confirmDeleteTest = confirmDeleteTest;
window.editTest = editTest;
window.resetForm = resetForm;