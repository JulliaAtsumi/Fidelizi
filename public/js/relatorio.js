// relatorio.js
// Página de relatórios com exportação funcional

let filteredReports = [];
let allReports = [];

// Verificar se é admin ou usuário
function checkAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
        alert('❌ Você precisa estar logado para acessar esta página.');
        window.location.href = 'index.html';
        return false;
    }
    return user;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    const user = checkAccess();
    if (user) {
        await loadReports(user);
        setupEventListeners();
        setupFilters();
    }
});

// Configurar event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', filterReports);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterReports();
            }
        });
    }
}

// Carregar relatórios do Firebase
async function loadReports(user) {
    try {
        const isAdmin = user.perfil === 'admin';
        const filters = isAdmin ? {} : { userId: user.uid };
        
        const tests = await getTests(filters);
        allReports = tests.map(test => {
            const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
            return {
                id: test.id,
                nome: test.nome || 'Teste sem nome',
                dispositivo: test.dispositivo || '-',
                data: dataCriacao,
                status: test.status || 'pendente',
                vulnerabilidades: test.vulnerabilidades || 0,
                severidade: test.severidade || '',
                tipo: test.tipo || '',
                descricao: test.descricao || '',
                observacoes: test.observacoes || ''
            };
        });
        
        filteredReports = [...allReports];
        renderReportsTable();
        updateMetrics();
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        alert('Erro ao carregar relatórios');
    }
}

// Atualizar métricas
function updateMetrics() {
    const totalTests = allReports.length;
    const completedTests = allReports.filter(r => r.status === 'concluido').length;
    const successRate = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;
    const criticalVulns = allReports.filter(r => r.severidade === 'critica' || r.severidade === 'alta').length;
    const safeDevices = totalTests > 0 ? Math.round(((totalTests - criticalVulns) / totalTests) * 100) : 100;

    const totalEl = document.getElementById('metric-total');
    const rateEl = document.getElementById('metric-success');
    const criticalEl = document.getElementById('metric-critical');
    const safeEl = document.getElementById('metric-safe');

    if (totalEl) totalEl.textContent = totalTests;
    if (rateEl) rateEl.textContent = successRate + '%';
    if (criticalEl) criticalEl.textContent = criticalVulns;
    if (safeEl) safeEl.textContent = safeDevices + '%';
}

// Renderizar tabela de relatórios
function renderReportsTable() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    if (filteredReports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="fas fa-file-alt fa-2x mb-2 d-block"></i>
                    Nenhum relatório encontrado
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredReports.map(report => {
        const statusBadges = {
            'concluido': '<span class="status-badge status-completed">Concluído</span>',
            'andamento': '<span class="status-badge status-in-progress">Em Andamento</span>',
            'pendente': '<span class="status-badge status-pending">Pendente</span>',
            'falha': '<span class="status-badge status-failed">Falha</span>'
        };

        const severityClasses = {
            'baixa': 'severity-low',
            'media': 'severity-medium',
            'alta': 'severity-high',
            'critica': 'severity-critical'
        };

        const severityTexts = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta',
            'critica': 'Crítica'
        };

        const statusBadge = statusBadges[report.status] || '<span class="status-badge">-</span>';
        const severityClass = severityClasses[report.severidade] || '';
        const severityText = severityTexts[report.severidade] || '-';
        const dataFormatada = report.data ? report.data.toLocaleDateString('pt-BR') : '-';

        return `
            <tr>
                <td>${report.nome}</td>
                <td>${report.dispositivo}</td>
                <td>${dataFormatada}</td>
                <td>${statusBadge}</td>
                <td>${report.vulnerabilidades}</td>
                <td class="${severityClass}">${severityText}</td>
                <td>
                    <button class="action-btn" onclick="verDetalhes('${report.id}')" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="baixarRelatorio('${report.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Configurar filtros
function setupFilters() {
    const filterStatus = document.getElementById('filter-status');
    const filterDevice = document.getElementById('filter-device');
    const filterDate = document.getElementById('filter-date');

    if (filterStatus) {
        filterStatus.addEventListener('change', filterReports);
    }
    if (filterDevice) {
        filterDevice.addEventListener('change', filterReports);
    }
    if (filterDate) {
        filterDate.addEventListener('change', filterReports);
    }
}

// Filtrar relatórios
function filterReports() {
    const searchTerm = (document.getElementById('search')?.value || '').toLowerCase();
    const filterStatus = document.getElementById('filter-status')?.value || '';
    const filterDevice = document.getElementById('filter-device')?.value || '';
    const filterDate = document.getElementById('filter-date')?.value || '';

    filteredReports = allReports.filter(report => {
        // Busca por texto
        const matchesSearch = !searchTerm ||
            report.nome.toLowerCase().includes(searchTerm) ||
            report.descricao.toLowerCase().includes(searchTerm) ||
            report.dispositivo.toLowerCase().includes(searchTerm);

        // Filtro de status
        const matchesStatus = !filterStatus || report.status === filterStatus;

        // Filtro de dispositivo
        const matchesDevice = !filterDevice || report.dispositivo === filterDevice;
        
        // Filtro de data
        let matchesDate = true;
        if (filterDate && report.data) {
            const days = parseInt(filterDate);
            if (!isNaN(days) && days > 0) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                cutoffDate.setHours(0, 0, 0, 0);
                const reportDate = new Date(report.data);
                reportDate.setHours(0, 0, 0, 0);
                matchesDate = reportDate >= cutoffDate;
            }
        }

        return matchesSearch && matchesStatus && matchesDevice && matchesDate;
    });

    renderReportsTable();
    updateMetrics();
}

// Visualizar detalhes
async function verDetalhes(testId) {
    try {
        const test = await getTestById(testId);
        if (test) {
            const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
            const mensagem = `
                📋 Detalhes do Relatório:
                
                Nome: ${test.nome}
                Dispositivo: ${test.dispositivo}
                Tipo: ${test.tipo}
                Status: ${test.status}
                Severidade: ${test.severidade || 'Nenhuma'}
                Vulnerabilidades: ${test.vulnerabilidades || 0}
                
                Descrição:
                ${test.descricao}
                
                ${test.observacoes ? `Observações:\n${test.observacoes}` : ''}
                
                Data: ${dataCriacao ? dataCriacao.toLocaleString('pt-BR') : '-'}
            `;
            alert(mensagem);
        }
    } catch (error) {
        console.error('Erro ao visualizar relatório:', error);
        alert('Erro ao visualizar relatório');
    }
}

// Baixar relatório individual
async function baixarRelatorio(testId) {
    try {
        const test = await getTestById(testId);
        if (!test) {
            alert('Relatório não encontrado');
            return;
        }

        await downloadReportPDF(test);
    } catch (error) {
        console.error('Erro ao baixar relatório:', error);
        alert('Erro ao baixar relatório');
    }
}

// Exportar relatórios filtrados em PDF
async function exportarRelatorios() {
    if (filteredReports.length === 0) {
        alert('Nenhum relatório para exportar com os filtros aplicados.');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let y = 20;
        const margin = 20;
        const maxWidth = doc.internal.pageSize.width - 2 * margin;
        const pageHeight = doc.internal.pageSize.height;

        // Título
        doc.setFontSize(18);
        doc.text('RELATÓRIOS DE TESTES', margin, y);
        y += 15;

        // Informações do relatório
        doc.setFontSize(10);
        doc.text(`Total de relatórios: ${filteredReports.length}`, margin, y);
        y += 8;
        doc.text(`Data de exportação: ${new Date().toLocaleString('pt-BR')}`, margin, y);
        y += 10;

        // Resumo
        const completed = filteredReports.filter(r => r.status === 'concluido').length;
        const critical = filteredReports.filter(r => r.severidade === 'critica' || r.severidade === 'alta').length;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Resumo', margin, y);
        y += 8;

        doc.setFont(undefined, 'normal');
        doc.text(`Testes concluídos: ${completed}`, margin, y);
        y += 6;
        doc.text(`Vulnerabilidades críticas/altas: ${critical}`, margin, y);
        y += 10;

        // Lista de relatórios
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Relatórios Detalhados', margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        for (let i = 0; i < filteredReports.length; i++) {
            const report = filteredReports[i];
            
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }

            doc.setFont(undefined, 'bold');
            doc.text(`${i + 1}. ${report.nome}`, margin, y);
            y += 7;

            doc.setFont(undefined, 'normal');
            const details = [
                `Dispositivo: ${report.dispositivo}`,
                `Status: ${report.status}`,
                `Severidade: ${report.severidade || 'Nenhuma'}`,
                `Vulnerabilidades: ${report.vulnerabilidades}`,
                `Data: ${report.data ? report.data.toLocaleDateString('pt-BR') : '-'}`
            ];

            details.forEach(line => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, margin + 5, y);
                y += 6;
            });

            if (report.descricao) {
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = 20;
                }
                doc.text('Descrição:', margin + 5, y);
                y += 6;
                const descLines = doc.splitTextToSize(report.descricao, maxWidth - 10);
                descLines.forEach(line => {
                    if (y > pageHeight - 20) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, margin + 10, y);
                    y += 6;
                });
            }

            y += 5; // Espaço entre relatórios
        }

        // Rodapé
        doc.setFontSize(8);
        doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10);

        // Download
        const fileName = `relatorios_filtrados_${Date.now()}.pdf`;
        doc.save(fileName);
        
        alert(`Relatório exportado com sucesso! ${filteredReports.length} relatório(s) incluído(s).`);
    } catch (error) {
        console.error('Erro ao exportar relatórios:', error);
        alert('Erro ao exportar relatórios');
    }
}

// Função auxiliar para download de relatório individual
async function downloadReportPDF(test) {
    if (!window.jspdf) {
        alert('Erro: Biblioteca jsPDF não carregada');
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
    const fileName = `relatorio_${(test.nome || 'teste').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
    doc.save(fileName);
}

// Exportar funções para uso global
window.exportarRelatorios = exportarRelatorios;
window.verDetalhes = verDetalhes;
window.baixarRelatorio = baixarRelatorio;
window.filterReports = filterReports;
window.buscarRelatorios = filterReports;
window.downloadReportPDF = downloadReportPDF;