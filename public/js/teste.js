// teste.js
// Gerenciamento de testes para usuários comuns (podem criar, mas não editar/deletar)

// Variáveis globais
let currentTestPage = 1;
let testsPerPage = 30;
let currentTests = [];

// Verificar autenticação
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
        alert('❌ Você precisa estar logado para acessar esta página.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Verificar se é admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.perfil === 'admin';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadTests();
        setupEventListeners();
    }
});

// Configurar event listeners
function setupEventListeners() {
    const testForm = document.getElementById('test-form');
    if (testForm) {
        testForm.addEventListener('submit', saveTest);
    }
    
    const searchTests = document.getElementById('search-tests');
    if (searchTests) {
        searchTests.addEventListener('input', filterTests);
    }
    
    const filterDevice = document.getElementById('filter-device');
    if (filterDevice) {
        filterDevice.addEventListener('change', filterTests);
    }
    
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.addEventListener('change', filterTests);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Carregar testes do Firebase
async function loadTests() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.uid) {
            alert('Erro: usuário não autenticado');
            return;
        }
        
        // Se for admin, carrega todos os testes
        // Se for usuário comum, carrega apenas os próprios testes
        let tests = [];
        if (isAdmin()) {
            tests = await getTests();
        } else {
            tests = await getTestsByUser(user.uid);
        }
        
        currentTests = tests;
        renderTestsTable();
    } catch (error) {
        console.error('Erro ao carregar testes:', error);
        alert('Erro ao carregar testes');
    }
}

// Renderizar tabela de testes
function renderTestsTable() {
    const tbody = document.getElementById('tests-table-body');
    if (!tbody) return;

    const startIndex = (currentTestPage - 1) * testsPerPage;
    const endIndex = startIndex + testsPerPage;
    const testsToShow = currentTests.slice(startIndex, endIndex);

    if (testsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="fas fa-vial fa-2x mb-2 d-block"></i>
                    Nenhum teste encontrado
                </td>
            </tr>
        `;
        renderTestsPagination();
        return;
    }

    tbody.innerHTML = testsToShow.map(test => {
        const statusClass = `status-${test.status}`;
        const statusText = {
            'pendente': 'Pendente',
            'andamento': 'Em Andamento',
            'concluido': 'Concluído',
            'falha': 'Falha'
        }[test.status] || test.status;

        const severityText = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta',
            'critica': 'Crítica'
        }[test.severidade] || '-';

        const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
        const dataFormatada = dataCriacao ? dataCriacao.toLocaleDateString('pt-BR') : '-';

        // Usuários comuns só podem visualizar seus próprios testes
        // Admins podem ver todos e têm opções de editar/deletar
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const canEdit = isAdmin() || (user.uid === test.userId);
        const canDelete = isAdmin();
        const canDownload = isAdmin(); // Apenas admin pode baixar relatório

        let actionButtons = `
            <button class="action-btn btn-view" onclick="viewTest('${test.id}')" title="Visualizar">
                <i class="fas fa-eye"></i>
            </button>
        `;

        if (canEdit) {
            actionButtons += `
                <button class="action-btn btn-edit" onclick="editTest('${test.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }

        if (canDelete) {
            actionButtons += `
                <button class="action-btn btn-delete" onclick="deleteTest('${test.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        if (canDownload) {
            actionButtons += `
                <button class="action-btn btn-warning" onclick="downloadReport('${test.id}')" title="Download Relatório">
                    <i class="fas fa-download"></i>
                </button>
            `;
        }

        return `
            <tr>
                <td>${test.nome || '-'}</td>
                <td>${test.dispositivo || '-'}</td>
                <td>${test.tipo || '-'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${test.vulnerabilidades || 0}</td>
                <td>${severityText}</td>
                <td>${dataFormatada}</td>
                <td>
                    <div class="table-actions">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderTestsPagination();
}

// Renderizar paginação
function renderTestsPagination() {
    const totalPages = Math.ceil(currentTests.length / testsPerPage);
    const pagination = document.getElementById('pagination-controls');
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `
        <span>Página ${currentTestPage} de ${totalPages}</span>
        <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary ${currentTestPage === 1 ? 'disabled' : ''}" onclick="changeTestPage(${currentTestPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn btn-sm ${currentTestPage === i ? 'btn-primary' : 'btn-outline-primary'}" onclick="changeTestPage(${i})">${i}</button>`;
    }

    html += `
            <button class="btn btn-sm btn-outline-primary ${currentTestPage === totalPages ? 'disabled' : ''}" onclick="changeTestPage(${currentTestPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    pagination.innerHTML = html;
}

// Mudar página
function changeTestPage(page) {
    const totalPages = Math.ceil(currentTests.length / testsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentTestPage = page;
        renderTestsTable();
    }
}

// Mudar registros por página
function changeRecordsPerPage() {
    testsPerPage = parseInt(document.getElementById('records-per-page')?.value || 30);
    currentTestPage = 1;
    renderTestsTable();
}

// Filtrar testes
async function filterTests() {
    const searchTerm = (document.getElementById('search-tests')?.value || 
                       document.getElementById('global-search')?.value || 
                       document.getElementById('search')?.value || '').toLowerCase();
    const filterDevice = document.getElementById('filter-device')?.value || '';
    const filterStatus = document.getElementById('filter-status')?.value || '';
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let tests = [];
        
        if (isAdmin()) {
            tests = await getTests();
        } else {
            tests = await getTestsByUser(user.uid);
        }
        
        currentTests = tests.filter(test => {
            const matchesSearch = !searchTerm ||
                (test.nome || '').toLowerCase().includes(searchTerm) ||
                (test.descricao || '').toLowerCase().includes(searchTerm) ||
                (test.dispositivo || '').toLowerCase().includes(searchTerm) ||
                (test.tipo || '').toLowerCase().includes(searchTerm);
            
            const matchesDevice = !filterDevice || test.dispositivo === filterDevice;
            const matchesStatus = !filterStatus || test.status === filterStatus;
            
            return matchesSearch && matchesDevice && matchesStatus;
        });
        
        currentTestPage = 1;
        renderTestsTable();
    } catch (error) {
        console.error('Erro ao filtrar testes:', error);
        alert('Erro ao filtrar testes');
    }
}

// Pesquisar testes
function searchTests() {
    filterTests();
}

// Salvar teste (Create/Update) - Usuários comuns podem criar, admin pode criar e editar
async function saveTest(event) {
    if (event) event.preventDefault();

    const testData = {
        nome: document.getElementById('test-name')?.value.trim(),
        dispositivo: document.getElementById('test-device')?.value,
        tipo: document.getElementById('test-type')?.value,
        status: document.getElementById('test-status')?.value || 'pendente',
        severidade: document.getElementById('test-severity')?.value || null,
        vulnerabilidades: parseInt(document.getElementById('test-vulnerabilities')?.value) || 0,
        prioridade: document.getElementById('test-priority')?.value || 'media',
        descricao: document.getElementById('test-description')?.value.trim(),
        observacoes: document.getElementById('test-observations')?.value.trim() || '',
    };

    // Validação
    if (!testData.nome || !testData.dispositivo || !testData.tipo || !testData.descricao) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    try {
        // Se estiver editando, verificar permissão
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            // Verificar se é admin ou se é o dono do teste
            const test = await getTestById(editId);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!isAdmin() && test.userId !== user.uid) {
                alert('Você não tem permissão para editar este teste!');
                return;
            }
            
            await updateTest(editId, testData);
            alert('Teste atualizado com sucesso!');
        } else {
            // Criar novo teste
            await createTest(testData);
            alert('Teste cadastrado com sucesso!');
        }
        
        resetForm();
        await loadTests();
    } catch (error) {
        console.error('Erro ao salvar teste:', error);
        alert('Erro ao salvar teste. Tente novamente.');
    }
}

// Editar teste - redirecionar para admin_teste.html se for admin, ou apenas visualizar
async function editTest(id) {
    if (isAdmin()) {
        window.location.href = `admin_teste.html?edit=${id}`;
    } else {
        // Usuário comum pode apenas visualizar seus próprios testes
        const test = await getTestById(id);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (test.userId === user.uid) {
            // Permitir edição apenas para testes próprios
            window.location.href = `admin_teste.html?edit=${id}`;
        } else {
            alert('Você não tem permissão para editar este teste!');
        }
    }
}

// Visualizar teste
async function viewTest(id) {
    try {
        const test = await getTestById(id);
        if (test) {
            const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
            const mensagem = `
                📋 Detalhes do Teste:
                
                Nome: ${test.nome}
                Dispositivo: ${test.dispositivo}
                Tipo: ${test.tipo}
                Status: ${test.status}
                Severidade: ${test.severidade || 'Nenhuma'}
                Vulnerabilidades: ${test.vulnerabilidades || 0}
                Prioridade: ${test.prioridade || 'Média'}
                
                Descrição:
                ${test.descricao}
                
                ${test.observacoes ? `Observações:\n${test.observacoes}` : ''}
                
                Data de Criação: ${dataCriacao ? dataCriacao.toLocaleString('pt-BR') : '-'}
            `;
            alert(mensagem);
        }
    } catch (error) {
        console.error('Erro ao visualizar teste:', error);
        alert('Erro ao visualizar teste');
    }
}

// Excluir teste - apenas admin
async function deleteTest(id) {
    if (!isAdmin()) {
        alert('Apenas administradores podem excluir testes!');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este teste?\nEsta ação não pode ser desfeita.')) {
        try {
            // Usar a função global do firebase-services
            await window.deleteTest(id);
            alert('Teste excluído com sucesso!');
            await loadTests();
        } catch (error) {
            console.error('Erro ao excluir teste:', error);
            alert('Erro ao excluir teste');
        }
    }
}

// Download de relatório - apenas admin
async function downloadReport(testId) {
    if (!isAdmin()) {
        alert('Apenas administradores podem baixar relatórios!');
        return;
    }
    
    // Redirecionar para a página de admin que tem a função de download
    window.location.href = `admin_teste.html?download=${testId}`;
}

// Resetar formulário
function resetForm() {
    const form = document.getElementById('test-form');
    if (form) {
        form.reset();
    }
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Novo Teste';
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
window.editTest = editTest;
window.viewTest = viewTest;
window.deleteTest = deleteTest;
window.downloadReport = downloadReport;
window.changeTestPage = changeTestPage;
window.changeRecordsPerPage = changeRecordsPerPage;
window.searchTests = searchTests;
window.filterTests = filterTests;
window.loadTests = loadTests;
window.renderTestsTable = renderTestsTable;