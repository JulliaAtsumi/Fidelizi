// gerenciar_testes.js
import { getTests, deleteTest } from './firebase-services.js';

// Variáveis globais
let currentPage = 1;
let recordsPerPage = 10;
let currentTests = [];
let allTests = [];
let filteredTests = [];

// Verificar acesso
function checkAccess() {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    if (!usuarioLogado.email) {
        alert('❌ Acesso negado! Faça login primeiro.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    if (checkAccess()) {
        await loadTests();
        setupEventListeners();
    }
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('search-tests').addEventListener('input', searchTests);
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

// Carregar testes do Firebase
async function loadTests() {
    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Se for admin, carrega todos os testes. Se for usuário comum, carrega apenas os dele.
        const filters = usuarioLogado.perfil === 'admin' ? {} : { userId: usuarioLogado.id };
        
        const testes = await getTests(filters);
        currentTests = testes.filter(test => test.ativo !== false);
        renderTestsTable();
        updateTestsCount();
    } catch (error) {
        console.error('Erro ao carregar testes:', error);
        showAlert('Erro ao carregar testes', 'danger');
    }
}

// Atualizar contador de testes
function updateTestsCount() {
    document.getElementById('total-tests-count').textContent = `${currentTests.length} teste(s)`;
}

// Renderizar tabela de testes
function renderTestsTable() {
    const tbody = document.getElementById('tests-table-body');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const testsToShow = currentTests.slice(startIndex, endIndex);

    if (testsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="fas fa-vial fa-2x mb-2 d-block"></i>
                    Nenhum teste encontrado
                    <br>
                    <a href="novo_teste.html" class="btn btn-primary mt-2">
                        <i class="fas fa-vial me-2"></i>Criar Primeiro Teste
                    </a>
                </td>
            </tr>
        `;
        renderPagination();
        return;
    }

    tbody.innerHTML = testsToShow.map(test => {
        const getTestIcon = (tipo) => {
            const icons = {
                'Penetração (Network)': 'fa-network-wired',
                'Análise de Firmware': 'fa-microchip',
                'Stress / DoS': 'fa-bolt',
                'SAST / DAST': 'fa-code',
                'Configuração de Segurança': 'fa-cog',
                'Auditoria de Código': 'fa-file-code'
            };
            return icons[tipo] || 'fa-vial';
        };

        const getSeverityBadge = (severidade) => {
            if (!severidade) return '';
            const badges = {
                'baixa': 'badge-baixa',
                'media': 'badge-media',
                'alta': 'badge-alta',
                'critica': 'badge-critica'
            };
            return `<span class="badge ${badges[severidade]}">${severidade}</span>`;
        };

        const getStatusBadge = (status) => {
            const badges = {
                'pendente': 'badge-pendente',
                'andamento': 'badge-andamento',
                'concluido': 'badge-concluido',
                'falha': 'badge-falha'
            };
            const textos = {
                'pendente': 'Pendente',
                'andamento': 'Em Andamento',
                'concluido': 'Concluído',
                'falha': 'Falha'
            };
            return `<span class="badge ${badges[status]}">${textos[status]}</span>`;
        };

        return `
            <tr>
                <td>
                    <div class="test-icon">
                        <i class="fas ${getTestIcon(test.tipo)}"></i>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${test.nome}</strong><br>
                        <small class="text-muted">${test.descricao.substring(0, 60)}...</small>
                    </div>
                </td>
                <td><small>${test.dispositivo}</small></td>
                <td><small>${test.tipo}</small></td>
                <td>${getStatusBadge(test.status)}</td>
                <td>${getSeverityBadge(test.severidade)}</td>
                <td class="text-center"><strong>${test.vulnerabilidades || 0}</strong></td>
                <td><small class="text-muted">${new Date(test.dataCriacao?.toDate()).toLocaleDateString('pt-BR')}</small></td>
                <td class="text-center">
                    <div class="table-actions">
                        <button class="action-btn btn-warning" onclick="editTest('${test.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-success" onclick="viewTest('${test.id}')" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn btn-danger" onclick="deleteTestFromSystem('${test.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination();
}

// ... (mantenha as funções renderPagination, changePage, changeRecordsPerPage)

// Pesquisar testes
function searchTests() {
    const searchTerm = document.getElementById('search-tests').value.toLowerCase();
    const filterDevice = document.getElementById('filter-device').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterSeverity = document.getElementById('filter-severity').value;
    
    const filteredTests = currentTests.filter(test => {
        const matchesSearch = test.nome.toLowerCase().includes(searchTerm) ||
                             test.descricao.toLowerCase().includes(searchTerm);
        
        const matchesDevice = !filterDevice || test.dispositivo === filterDevice;
        const matchesStatus = !filterStatus || test.status === filterStatus;
        const matchesSeverity = !filterSeverity || test.severidade === filterSeverity;
        
        return matchesSearch && matchesDevice && matchesStatus && matchesSeverity;
    });
    
    currentTests = filteredTests;
    currentPage = 1;
    renderTestsTable();
    updateTestsCount();
}

// Editar teste
function editTest(id) {
    window.location.href = `novo_teste.html?edit=${id}`;
}

// Visualizar teste
async function viewTest(id) {
    try {
        const test = currentTests.find(t => t.id === id);
        
        if (test) {
            const mensagem = `
                📋 Detalhes do Teste:
                
                Nome: ${test.nome}
                Dispositivo: ${test.dispositivo}
                Tipo: ${test.tipo}
                Status: ${test.status}
                Severidade: ${test.severidade || 'Nenhuma'}
                Vulnerabilidades: ${test.vulnerabilidades || 0}
                Prioridade: ${test.prioridade}
                
                Descrição:
                ${test.descricao}
                
                ${test.observacoes ? `Observações:\n${test.observacoes}` : ''}
            `;
            alert(mensagem);
        }
    } catch (error) {
        console.error('Erro ao visualizar teste:', error);
        showAlert('Erro ao visualizar teste', 'danger');
    }
}

// Excluir teste do Firebase
async function deleteTestFromSystem(id) {
    if (confirm('Tem certeza que deseja excluir este teste?')) {
        try {
            await deleteTest(id);
            await loadTests(); // Recarregar a lista
            showAlert('Teste excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir teste:', error);
            showAlert('Erro ao excluir teste', 'danger');
        }
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});

// Exportar funções para uso global
window.editTest = editTest;
window.viewTest = viewTest;
window.deleteTestFromSystem = deleteTestFromSystem;
window.changePage = changePage;
window.changeRecordsPerPage = changeRecordsPerPage;
window.searchTests = searchTests;









document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadTests();
    
    const form = document.getElementById('test-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTest();
    });
});

function checkAuthentication() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
    }
}

function loadTests() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    let testsQuery = db.collection('tests').orderBy('dataCriacao', 'desc');
    
    // Se não for admin, mostrar apenas os próprios testes
    if (user.perfil !== 'admin') {
        testsQuery = testsQuery.where('userId', '==', user.uid);
    }
    
    testsQuery.get()
        .then((querySnapshot) => {
            allTests = [];
            querySnapshot.forEach((doc) => {
                const test = doc.data();
                test.id = doc.id;
                allTests.push(test);
            });
            filteredTests = [...allTests];
            updateTestsTable();
        })
        .catch((error) => {
            console.error('Erro ao carregar testes:', error);
        });
}

function saveTest() {
    const user = JSON.parse(localStorage.getItem('user'));
    const testId = document.getElementById('test-id').value;
    const isEdit = !!testId;

    const testData = {
        nome: document.getElementById('test-name').value,
        dispositivo: document.getElementById('test-device').value,
        tipo: document.getElementById('test-type').value,
        status: document.getElementById('test-status').value,
        severidade: document.getElementById('test-severity').value,
        vulnerabilidades: parseInt(document.getElementById('test-vulnerabilities').value) || 0,
        descricao: document.getElementById('test-description').value,
        dataAtualizacao: new Date().toISOString()
    };

    if (!isEdit) {
        testData.userId = user.uid;
        testData.userEmail = user.email;
        testData.dataCriacao = new Date().toISOString();
    }

    const promise = isEdit ? 
        db.collection('tests').doc(testId).update(testData) :
        db.collection('tests').add(testData);

    promise
        .then(() => {
            showAlert(`Teste ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            resetForm();
            loadTests();
        })
        .catch((error) => {
            console.error('Erro ao salvar teste:', error);
            showAlert('Erro ao salvar teste.', 'error');
        });
}

function editTest(testId) {
    const test = allTests.find(t => t.id === testId);
    if (test) {
        document.getElementById('test-id').value = test.id;
        document.getElementById('test-name').value = test.nome;
        document.getElementById('test-device').value = test.dispositivo;
        document.getElementById('test-type').value = test.tipo;
        document.getElementById('test-status').value = test.status;
        document.getElementById('test-severity').value = test.severidade;
        document.getElementById('test-vulnerabilities').value = test.vulnerabilidades;
        document.getElementById('test-description').value = test.descricao;
        
        document.getElementById('form-title').textContent = 'Editar Teste';
        document.getElementById('test-form').scrollIntoView();
    }
}

function deleteTest(testId) {
    if (confirm('Tem certeza que deseja excluir este teste?')) {
        db.collection('tests').doc(testId).delete()
            .then(() => {
                showAlert('Teste excluído com sucesso!', 'success');
                loadTests();
            })
            .catch((error) => {
                console.error('Erro ao excluir teste:', error);
                showAlert('Erro ao excluir teste.', 'error');
            });
    }
}

function exportToPDF(testId) {
    const test = allTests.find(t => t.id === testId);
    if (test) {
        // Usar jsPDF para gerar o PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(20);
        doc.setTextColor(30, 58, 138);
        doc.text('Relatório de Teste - Fidelizi', 20, 30);
        
        // Informações do teste
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let y = 50;
        doc.text(`Nome do Teste: ${test.nome}`, 20, y);
        y += 10;
        doc.text(`Dispositivo: ${test.dispositivo}`, 20, y);
        y += 10;
        doc.text(`Tipo: ${test.tipo}`, 20, y);
        y += 10;
        doc.text(`Status: ${test.status}`, 20, y);
        y += 10;
        doc.text(`Severidade: ${test.severidade || 'N/A'}`, 20, y);
        y += 10;
        doc.text(`Vulnerabilidades: ${test.vulnerabilidades}`, 20, y);
        y += 15;
        
        // Descrição
        doc.text('Descrição:', 20, y);
        y += 7;
        const descriptionLines = doc.splitTextToSize(test.descricao, 170);
        doc.text(descriptionLines, 20, y);
        
        // Rodapé
        const date = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(10);
        doc.text(`Gerado em: ${date}`, 20, 280);
        
        // Salvar PDF
        doc.save(`relatorio_teste_${test.nome.replace(/\s+/g, '_')}.pdf`);
    }
}