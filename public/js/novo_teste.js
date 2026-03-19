// novo_teste.js
// Versão compatível com Firebase 8.10.0

// Variáveis globais
let editingTestId = null;

// Verificar acesso
function checkAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
        alert('❌ Acesso negado! Faça login primeiro.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    if (checkAccess()) {
        setupEventListeners();
        await checkEditMode();
    }
});

// Configurar event listeners
function setupEventListeners() {
    const form = document.getElementById('test-form');
    if (form) {
        form.addEventListener('submit', saveTest);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                logoutUser().then(() => {
                    window.location.href = 'index.html';
                });
            }
        });
    }
}

// Verificar se está em modo de edição
async function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        editingTestId = editId;
        await loadTestForEdit(editingTestId);
    }
}

// Carregar teste para edição do Firebase
async function loadTestForEdit(id) {
    try {
        const test = await getTestById(id);
        
        if (test) {
            // Atualizar título da página
            const pageTitle = document.getElementById('page-title');
            const formTitle = document.getElementById('form-title');
            if (pageTitle) pageTitle.textContent = 'EDITAR TESTE';
            if (formTitle) formTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Teste';
            
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
        } else {
            alert('Teste não encontrado!');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.perfil === 'admin') {
                window.location.href = 'admin_teste.html';
            } else {
                window.location.href = 'testes.html';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar teste:', error);
        alert('Erro ao carregar teste');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.perfil === 'admin') {
            window.location.href = 'admin_teste.html';
        } else {
            window.location.href = 'testes.html';
        }
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
    } else {
        alert(message);
    }
}

// Salvar teste no Firebase
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
        observacoes: document.getElementById('test-observations').value.trim(),
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
        
        // Redirecionar após sucesso
        setTimeout(() => {
            // Verificar se é admin ou usuário comum
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.perfil === 'admin') {
                window.location.href = 'admin_teste.html';
            } else {
                window.location.href = 'testes.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Erro ao salvar teste:', error);
        showAlert('Erro ao salvar teste. Tente novamente.', 'danger');
    }
}

// Função para cancelar e voltar
function cancelForm() {
    if (confirm('Deseja cancelar a operação? As alterações não salvas serão perdidas.')) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.perfil === 'admin') {
            window.location.href = 'admin_teste.html';
        } else {
            window.location.href = 'testes.html';
        }
    }
}

// Exportar funções para uso no HTML
window.cancelForm = cancelForm;