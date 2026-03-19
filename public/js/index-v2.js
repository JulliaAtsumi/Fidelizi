/**
 * Index.js - Versão Refatorada com AuthService
 * Sistema de Login Principal - Versão 2.0
 */

// Variáveis globais
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;

/**
 * Função principal de login
 */
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validação básica
    if (!validateLoginForm(email, password)) {
        return;
    }

    // Desabilitar botão e mostrar loading
    setLoginButtonState(true, 'Entrando...');

    try {
        // Usar novo AuthService
        const result = await AuthService.login(email, password);

        if (result.success) {
            // Login bem-sucedido
            Utils.alerts.success('Login realizado com sucesso!');
            
            // Atualizar StateManager
            StateManager.set('user', result.user);
            
            // Redirecionar após breve delay
            setTimeout(() => {
                window.location.href = result.redirectTo;
            }, 1000);

        } else {
            // Login falhou
            handleLoginError(result.error);
        }

    } catch (error) {
        console.error('Erro inesperado no login:', error);
        Utils.alerts.error('Erro inesperado. Tente novamente.');
    } finally {
        // Reabilitar botão
        setLoginButtonState(false);
    }
}

/**
 * Valida formulário de login
 */
function validateLoginForm(email, password) {
    const errors = [];

    if (!email) {
        errors.push('Email é obrigatório');
    } else if (!Utils.validators.email(email)) {
        errors.push('Email inválido');
    }

    if (!password) {
        errors.push('Senha é obrigatória');
    } else if (password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (errors.length > 0) {
        Utils.alerts.error(errors.join('<br>'));
        return false;
    }

    return true;
}

/**
 * Manipula erros de login
 */
function handleLoginError(error) {
    loginAttempts++;
    
    Utils.alerts.error(error);

    // Bloquear após muitas tentativas
    if (loginAttempts >= MAX_ATTEMPTS) {
        blockLoginForm();
    }
}

/**
 * Bloqueia formulário após muitas tentativas
 */
function blockLoginForm() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn-primary');

    emailInput.disabled = true;
    passwordInput.disabled = true;
    loginButton.disabled = true;

    Utils.alerts.warning('Muitas tentativas de login. Tente novamente em 5 minutos.');

    // Desbloquear após 5 minutos
    setTimeout(() => {
        emailInput.disabled = false;
        passwordInput.disabled = false;
        loginButton.disabled = false;
        loginAttempts = 0;
        Utils.alerts.info('Formulário desbloqueado. Você pode tentar novamente.');
    }, 5 * 60 * 1000);
}

/**
 * Define estado do botão de login
 */
function setLoginButtonState(loading, text = 'Entrar') {
    const loginButton = document.querySelector('.btn-primary');
    
    if (loading) {
        loginButton.disabled = true;
        loginButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${text}
        `;
    } else {
        loginButton.disabled = false;
        loginButton.innerHTML = text;
    }
}

/**
 * Redireciona para cadastro
 */
function cadastrar() {
    window.location.href = 'cadastro_publico.html';
}

/**
 * Verifica se usuário já está logado
 */
function checkExistingSession() {
    const authStatus = AuthService.checkAuth();
    
    if (authStatus.authorized) {
        // Usuário já está logado, redirecionar
        const user = AuthService.getCurrentUser();
        Utils.alerts.info(`Você já está logado como ${user.nome}. Redirecionando...`);
        
        setTimeout(() => {
            AuthService.redirectBasedOnRole();
        }, 1500);
    }
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Enter para submeter
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });

        // Limpar tentativas ao digitar
        input.addEventListener('input', () => {
            if (loginAttempts >= MAX_ATTEMPTS) {
                loginAttempts = 0;
            }
        });
    });

    // Validação em tempo real
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && !Utils.validators.email(email)) {
            emailInput.classList.add('is-invalid');
        } else {
            emailInput.classList.remove('is-invalid');
        }
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password && password.length < 6) {
            passwordInput.classList.add('is-invalid');
        } else {
            passwordInput.classList.remove('is-invalid');
        }
    });
}

/**
 * Inicializa página
 */
function initializePage() {
    // Verificar sessão existente
    checkExistingSession();

    // Configurar event listeners
    setupEventListeners();

    // Foco no email
    document.getElementById('email').focus();

    // Adicionar estilos para validação
    addValidationStyles();

    console.log('Página de login inicializada');
}

/**
 * Adiciona estilos de validação
 */
function addValidationStyles() {
    if (document.querySelector('#validation-styles')) return;

    const style = document.createElement('style');
    style.id = 'validation-styles';
    style.textContent = `
        .is-invalid {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .btn:disabled {
            cursor: not-allowed;
            opacity: 0.65;
        }
        
        .spinner-border-sm {
            width: 1rem;
            height: 1rem;
        }
        
        .form-control.is-invalid:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
    `;
    document.head.appendChild(style);
}

// Inicializar quando DOM estiver pronto
Utils.dom.ready(initializePage);

// Exportar funções para compatibilidade
window.login = login;
window.cadastrar = cadastrar;

// Manter compatibilidade com código legado
window.getCurrentUser = () => AuthService.getCurrentUser();
window.checkAuth = (role) => AuthService.checkAuth(role);

// Listener para mudanças de autenticação
StateManager.on('user:changed', (data) => {
    console.log('Usuário alterado:', data.newValue);
});

// Limpar tentativas ao sair da página
window.addEventListener('beforeunload', () => {
    loginAttempts = 0;
});
