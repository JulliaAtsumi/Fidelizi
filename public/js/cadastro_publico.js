// js/cadastro_publico.js
// Cadastro público - qualquer pessoa pode se cadastrar

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('user-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    
    // Inicializar campos PF como padrão
    toggleFields();
});

function toggleFields() {
    const userType = document.getElementById('user-type').value;
    const pfFields = document.getElementById('pf-fields');
    const pjFields = document.getElementById('pj-fields');

    if (userType === 'pf') {
        pfFields.classList.remove('hidden');
        pjFields.classList.add('hidden');
        
        // Tornar campos PF obrigatórios
        document.getElementById('user-name').required = true;
        document.getElementById('company-name').required = false;
    } else if (userType === 'pj') {
        pfFields.classList.add('hidden');
        pjFields.classList.remove('hidden');
        
        // Tornar campos PJ obrigatórios
        document.getElementById('user-name').required = false;
        document.getElementById('company-name').required = true;
    }
}

async function saveUser() {
    const userType = document.getElementById('user-type').value;
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const passwordConfirm = document.getElementById('user-password-confirm').value;

    // Validações básicas
    if (!email) {
        showAlert('E-mail é obrigatório.', 'danger');
        return;
    }

    if (!password || password.length < 6) {
        showAlert('A senha deve ter no mínimo 6 caracteres.', 'danger');
        return;
    }

    if (password !== passwordConfirm) {
        showAlert('As senhas não coincidem.', 'danger');
        return;
    }

    // Validação específica do tipo
    if (userType === 'pf') {
        const nome = document.getElementById('user-name').value.trim();
        if (!nome) {
            showAlert('Nome completo é obrigatório para Pessoa Física.', 'danger');
            return;
        }
    } else if (userType === 'pj') {
        const companyName = document.getElementById('company-name').value.trim();
        if (!companyName) {
            showAlert('Razão Social é obrigatória para Pessoa Jurídica.', 'danger');
            return;
        }
    }

    showAlert('Criando conta...', 'info');

    // Preparar dados do usuário (sempre como 'usuario', nunca 'admin')
    const userData = {
        email: email,
        perfil: 'usuario', // Sempre usuário comum em cadastro público
        tipo: userType
    };

    // Adicionar campos específicos
    if (userType === 'pf') {
        userData.nome = document.getElementById('user-name').value.trim();
        userData.cpf = document.getElementById('user-cpf').value.trim();
    } else {
        userData.companyName = document.getElementById('company-name').value.trim();
        userData.cnpj = document.getElementById('company-cnpj').value.trim();
        userData.contactName = document.getElementById('company-contact').value.trim();
        userData.phone = document.getElementById('company-phone').value.trim();
    }

    try {
        // Criar novo usuário
        const result = await registerUser(userData, password);
        if (!result.success) {
            showAlert('Erro ao criar conta: ' + result.error, 'danger');
            return;
        }
        
        showAlert('Conta criada com sucesso! Redirecionando para login...', 'success');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        showAlert('Erro ao criar conta: ' + (error.error || error.message || 'Erro desconhecido'), 'danger');
    }
}

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

function goToLogin() {
    window.location.href = 'index.html';
}

function cancelForm() {
    if (confirm('Deseja cancelar o cadastro? Todos os dados preenchidos serão perdidos.')) {
        window.location.href = 'index.html';
    }
}

// Exportar funções para uso global
window.toggleFields = toggleFields;
window.goToLogin = goToLogin;
window.cancelForm = cancelForm;
