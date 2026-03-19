// admin_teste.js
// CRUD completo de testes com Firebase para Admin

// Variáveis globais
let currentPage = 1;
let recordsPerPage = 10;
let currentTests = [];
let editingTestId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar acesso é feito pelo admin-common.js
    if (typeof checkAdminAccess === 'function' && checkAdminAccess()) {
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
    
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', filterTests);
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
        alert.className = `alert alert-${type}`;
        alert.classList.remove('hidden');
        
        setTimeout(() => {
            alert.classList.add('hidden');
        }, 5000);
    }
}

// Carregar testes do Firebase
async function loadTests() {
    try {
        const tests = await getTests();
        currentTests = tests.filter(test => test.ativo !== false);
        renderTestsTable();
        updateTestsCount();
    } catch (error) {
        console.error('Erro ao carregar testes:', error);
        showAlert('Erro ao carregar testes', 'danger');
    }
}

// Atualizar contador de testes
function updateTestsCount() {
    const countElement = document.getElementById('total-tests-count');
    if (countElement) {
        countElement.textContent = `${currentTests.length} teste(s)`;
    }
}

// Renderizar tabela de testes
function renderTestsTable() {
    const tbody = document.getElementById('tests-table-body');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const testsToShow = currentTests.slice(startIndex, endIndex);

    if (testsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="fas fa-vial fa-2x mb-2 d-block"></i>
                    Nenhum teste encontrado
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

        const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
        const dataFormatada = dataCriacao ? dataCriacao.toLocaleDateString('pt-BR') : '-';

        return `
            <tr>
                <td>
                    <div class="test-icon">
                        <i class="fas ${getTestIcon(test.tipo)}"></i>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${test.nome || '-'}</strong><br>
                        <small class="text-muted">${(test.descricao || '').substring(0, 60)}...</small>
                    </div>
                </td>
                <td><small>${test.dispositivo || '-'}</small></td>
                <td><small>${test.tipo || '-'}</small></td>
                <td>${getStatusBadge(test.status)}</td>
                <td>${getSeverityBadge(test.severidade)}</td>
                <td class="text-center"><strong>${test.vulnerabilidades || 0}</strong></td>
                <td><small class="text-muted">${dataFormatada}</small></td>
                <td class="text-center">
                    <div class="table-actions">
                        <button class="action-btn btn-primary" onclick="editTest('${test.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-success" onclick="viewTest('${test.id}')" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn btn-info" onclick="downloadReport('${test.id}')" title="Download Relatório">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn btn-danger" onclick="deleteTest('${test.id}')" title="Excluir">
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
    const totalPages = Math.ceil(currentTests.length / recordsPerPage);
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
    const totalPages = Math.ceil(currentTests.length / recordsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTestsTable();
    }
}

// Mudar registros por página
function changeRecordsPerPage() {
    recordsPerPage = parseInt(document.getElementById('records-per-page')?.value || 10);
    currentPage = 1;
    renderTestsTable();
}

// Filtrar testes
async function filterTests() {
    const searchTerm = (document.getElementById('search-tests')?.value || 
                       document.getElementById('global-search')?.value || '').toLowerCase();
    const filterDevice = document.getElementById('filter-device')?.value || '';
    const filterStatus = document.getElementById('filter-status')?.value || '';
    const filterSeverity = document.getElementById('filter-severity')?.value || '';
    
    try {
        // Buscar todos os testes do Firebase
        const tests = await getTests();
        const allTests = tests.filter(test => test.ativo !== false);
        
        currentTests = allTests.filter(test => {
            const matchesSearch = !searchTerm ||
                (test.nome || '').toLowerCase().includes(searchTerm) ||
                (test.descricao || '').toLowerCase().includes(searchTerm) ||
                (test.dispositivo || '').toLowerCase().includes(searchTerm) ||
                (test.tipo || '').toLowerCase().includes(searchTerm);
            
            const matchesDevice = !filterDevice || test.dispositivo === filterDevice;
            const matchesStatus = !filterStatus || test.status === filterStatus;
            const matchesSeverity = !filterSeverity || test.severidade === filterSeverity;
            
            return matchesSearch && matchesDevice && matchesStatus && matchesSeverity;
        });
        
        currentPage = 1;
        renderTestsTable();
        updateTestsCount();
    } catch (error) {
        console.error('Erro ao filtrar testes:', error);
        showAlert('Erro ao filtrar testes', 'danger');
    }
}

// Pesquisar testes (para compatibilidade)
function searchTests() {
    filterTests();
}

// Salvar teste (Create/Update)
async function saveTest(event) {
    if (event) event.preventDefault();
    
    const testData = {
        nome: document.getElementById('test-name').value.trim(),
        dispositivo: document.getElementById('test-device').value,
        tipo: document.getElementById('test-type').value,
        status: document.getElementById('test-status').value,
        severidade: document.getElementById('test-severity').value || null,
        vulnerabilidades: parseInt(document.getElementById('test-vulnerabilities').value) || 0,
        prioridade: document.getElementById('test-priority').value,
        descricao: document.getElementById('test-description').value.trim(),
        observacoes: document.getElementById('test-observations')?.value.trim() || '',
    };

    // Validação
    if (!testData.nome || !testData.dispositivo || !testData.tipo || !testData.descricao) {
        showAlert('Preencha todos os campos obrigatórios!', 'danger');
        return;
    }

    try {
        if (editingTestId) {
            // Update no Firebase
            await updateTest(editingTestId, testData);
            showAlert('Teste atualizado com sucesso!', 'success');
        } else {
            // Create no Firebase
            await createTest(testData);
            showAlert('Teste criado com sucesso!', 'success');
        }
        
        resetForm();
        hideForm();
        await loadTests();
    } catch (error) {
        console.error('Erro ao salvar teste:', error);
        showAlert('Erro ao salvar teste. Tente novamente.', 'danger');
    }
}

// Editar teste
async function editTest(id) {
    try {
        const test = await getTestById(id);
        if (test) {
            editingTestId = test.id;
            const formTitle = document.getElementById('form-title');
            if (formTitle) {
                formTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Teste';
            }
            
            // Preencher formulário
            if (document.getElementById('test-name')) document.getElementById('test-name').value = test.nome || '';
            if (document.getElementById('test-device')) document.getElementById('test-device').value = test.dispositivo || '';
            if (document.getElementById('test-type')) document.getElementById('test-type').value = test.tipo || '';
            if (document.getElementById('test-status')) document.getElementById('test-status').value = test.status || '';
            if (document.getElementById('test-severity')) document.getElementById('test-severity').value = test.severidade || '';
            if (document.getElementById('test-vulnerabilities')) document.getElementById('test-vulnerabilities').value = test.vulnerabilidades || 0;
            if (document.getElementById('test-priority')) document.getElementById('test-priority').value = test.prioridade || 'media';
            if (document.getElementById('test-description')) document.getElementById('test-description').value = test.descricao || '';
            if (document.getElementById('test-observations')) document.getElementById('test-observations').value = test.observacoes || '';
            
            // Mostrar formulário
            const formSection = document.getElementById('form-section');
            if (formSection) {
                formSection.classList.remove('hidden');
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar teste:', error);
        showAlert('Erro ao carregar teste', 'danger');
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
        showAlert('Erro ao visualizar teste', 'danger');
    }
}

// Download de relatório PDF
async function downloadReport(testId) {
    try {
        const test = await getTestById(testId);
        if (!test) {
            showAlert('Teste não encontrado', 'danger');
            return;
        }

        // Verificar se jsPDF está carregado
        if (!window.jspdf || !window.jspdf.jsPDF) {
            showAlert('Erro: Biblioteca jsPDF não está carregada. Por favor, recarregue a página.', 'danger');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = doc.internal.pageSize.width - 2 * margin;

        // Título
        doc.setFontSize(18);
        doc.text('RELATÓRIO DE TESTE', margin, y);
        y += 15;

        // Informações do teste
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Informações Gerais', margin, y);
        y += 8;

        doc.setFont(undefined, 'normal');
        const info = [
            `Nome: ${test.nome || '-'}`,
            `Dispositivo: ${test.dispositivo || '-'}`,
            `Tipo: ${test.tipo || '-'}`,
            `Status: ${test.status || '-'}`,
            `Severidade: ${test.severidade || 'Nenhuma'}`,
            `Vulnerabilidades Encontradas: ${test.vulnerabilidades || 0}`,
            `Prioridade: ${test.prioridade || 'Média'}`
        ];

        info.forEach(line => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 7;
        });

        y += 5;

        // Descrição
        if (test.descricao) {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 20;
            }
            doc.setFont(undefined, 'bold');
            doc.text('Descrição', margin, y);
            y += 8;

            doc.setFont(undefined, 'normal');
            const descLines = doc.splitTextToSize(test.descricao, maxWidth);
            descLines.forEach(line => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, margin, y);
                y += 7;
            });
            y += 5;
        }

        // Observações
        if (test.observacoes) {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 20;
            }
            doc.setFont(undefined, 'bold');
            doc.text('Observações', margin, y);
            y += 8;

            doc.setFont(undefined, 'normal');
            const obsLines = doc.splitTextToSize(test.observacoes, maxWidth);
            obsLines.forEach(line => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, margin, y);
                y += 7;
            });
        }

        // Data
        const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
        const dataFormatada = dataCriacao ? dataCriacao.toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
        
        doc.setFontSize(10);
        doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10);
        doc.text(`Data de criação do teste: ${dataFormatada}`, margin, pageHeight - 5);

        // Download
        const fileName = `relatorio_teste_${(test.nome || 'teste').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
        doc.save(fileName);
        
        showAlert('Relatório baixado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showAlert('Erro ao gerar relatório: ' + (error.message || 'Erro desconhecido'), 'danger');
    }
}

// Excluir teste
async function deleteTestById(id) {
    if (confirm('Tem certeza que deseja excluir este teste?\nEsta ação não pode ser desfeita.')) {
        try {
            await deleteTest(id);
            showAlert('Teste excluído com sucesso!', 'success');
            await loadTests();
        } catch (error) {
            console.error('Erro ao excluir teste:', error);
            showAlert('Erro ao excluir teste', 'danger');
        }
    }
}

// Mostrar formulário de novo teste
function showNewTestForm() {
    const formSection = document.getElementById('form-section');
    if (formSection) {
        resetForm();
        formSection.classList.remove('hidden');
        formSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Esconder formulário
function hideForm() {
    const formSection = document.getElementById('form-section');
    if (formSection) {
        formSection.classList.add('hidden');
    }
}

// Resetar formulário
function resetForm() {
    const form = document.getElementById('test-form');
    if (form) {
        form.reset();
    }
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-vial me-2"></i>Novo Teste';
    }
    editingTestId = null;
    hideForm(); // Esconder formulário após reset
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

// Função cancelar formulário
function cancelForm() {
    if (confirm('Deseja cancelar a operação? As alterações não salvas serão perdidas.')) {
        resetForm();
        hideForm();
    }
}

// Exportar todos os testes filtrados para PDF
async function exportAllTestsPDF() {
    if (currentTests.length === 0) {
        showAlert('Nenhum teste para exportar.', 'info');
        return;
    }

    try {
        // Verificar se jsPDF está carregado
        if (!window.jspdf || !window.jspdf.jsPDF) {
            showAlert('Erro: Biblioteca jsPDF não está carregada. Por favor, recarregue a página.', 'danger');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = doc.internal.pageSize.width - 2 * margin;

        // Título
        doc.setFontSize(18);
        doc.text('RELATÓRIO GERAL DE TESTES', margin, y);
        y += 15;

        // Informações do relatório
        doc.setFontSize(10);
        doc.text(`Total de testes: ${currentTests.length}`, margin, y);
        y += 8;
        doc.text(`Data de exportação: ${new Date().toLocaleString('pt-BR')}`, margin, y);
        y += 10;

        // Resumo
        const completed = currentTests.filter(t => t.status === 'concluido').length;
        const critical = currentTests.filter(t => t.severidade === 'critica' || t.severidade === 'alta').length;
        const inProgress = currentTests.filter(t => t.status === 'andamento').length;
        const pending = currentTests.filter(t => t.status === 'pendente').length;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Resumo', margin, y);
        y += 8;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const resumo = [
            `Testes concluídos: ${completed}`,
            `Testes em andamento: ${inProgress}`,
            `Testes pendentes: ${pending}`,
            `Vulnerabilidades críticas/altas: ${critical}`
        ];
        resumo.forEach(line => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 7;
        });
        y += 10;

        // Lista de testes
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Lista de Testes', margin, y);
        y += 8;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);

        currentTests.forEach((test, index) => {
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }

            const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
            const dataFormatada = dataCriacao ? dataCriacao.toLocaleDateString('pt-BR') : '-';

            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${test.nome || 'Sem nome'}`, margin, y);
            y += 6;

            doc.setFont(undefined, 'normal');
            const info = [
                `   Dispositivo: ${test.dispositivo || '-'}`,
                `   Tipo: ${test.tipo || '-'}`,
                `   Status: ${test.status || '-'}`,
                `   Severidade: ${test.severidade || 'Nenhuma'}`,
                `   Vulnerabilidades: ${test.vulnerabilidades || 0}`,
                `   Data: ${dataFormatada}`
            ];

            info.forEach(line => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, margin, y);
                y += 5;
            });

            if (test.descricao) {
                const descLines = doc.splitTextToSize(`   Descrição: ${test.descricao}`, maxWidth - 10);
                descLines.forEach(line => {
                    if (y > pageHeight - 20) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, margin + 5, y);
                    y += 5;
                });
            }

            y += 5; // Espaço entre testes
        });

        // Rodapé
        doc.setFontSize(8);
        doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 5);

        // Download
        const fileName = `relatorio_geral_testes_${Date.now()}.pdf`;
        doc.save(fileName);
        
        showAlert('Relatório PDF exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar relatório:', error);
        showAlert('Erro ao exportar relatório: ' + (error.message || 'Erro desconhecido'), 'danger');
    }
}

// Exportar funções para uso global
window.editTest = editTest;
window.viewTest = viewTest;
window.deleteTest = deleteTestById;
window.downloadReport = downloadReport;
window.changePage = changePage;
window.changeRecordsPerPage = changeRecordsPerPage;
window.searchTests = searchTests;
window.filterTests = filterTests;
window.cancelForm = cancelForm;
window.showNewTestForm = showNewTestForm;
window.exportAllTestsPDF = exportAllTestsPDF;