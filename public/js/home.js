// Toggle sidebar - será gerenciado pelo user-common.js
// Mantido apenas como fallback
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle && typeof initUserSidebarToggle !== 'function') {
        menuToggle.addEventListener('click', function () {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');

            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
});

// Dark mode toggle - será gerenciado pelo user-common.js
// Mantido apenas como fallback
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle && typeof initUserDarkMode !== 'function') {
        darkModeToggle.addEventListener('click', function (e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');

            // Salvar preferência no localStorage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });

        // Verificar preferência de modo escuro ao carregar a página
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
        }
    }
});

// Logout function
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                if (typeof auth !== 'undefined') {
                    auth.signOut().then(() => {
                        localStorage.removeItem('user');
                        window.location.href = 'index.html';
                    }).catch(error => {
                        console.error('Erro ao fazer logout:', error);
                        localStorage.removeItem('user');
                        window.location.href = 'index.html';
                    });
                } else {
                    localStorage.removeItem('user');
                    window.location.href = 'index.html';
                }
            }
        });
    }
});

// Função de busca - será sobrescrita pelo user-common.js se disponível
function buscar() {
    if (typeof window.buscar === 'function' && window.buscar !== buscar) {
        window.buscar();
        return;
    }
    const termo = document.getElementById('search')?.value || '';
    if (termo.trim() !== '') {
        // Usar a função de busca global se disponível
        if (typeof performUserSearch === 'function') {
            performUserSearch(termo.toLowerCase().trim());
        } else {
            alert(`Buscando por: ${termo}`);
        }
    }
}

// Exportar função globalmente
window.buscar = buscar;

// Função do formulário
function enviarFormulario(event) {
    event.preventDefault(); // impede o reload da página
    const mensagem = document.getElementById('mensagem-sucesso');
    mensagem.style.display = 'block'; // mostra a mensagem
    // opcional: limpar o formulário
    event.target.reset();
}

// Fechar sidebar ao clicar em um link (em telas pequenas)
if (window.innerWidth <= 900) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function () {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');

            sidebar.classList.add('collapsed');
            mainContent.classList.remove('expanded');
        });
    });
}

// Carregar informações do usuário
function loadUserInfo() {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    
    document.getElementById('user-name').textContent = usuarioLogado.nome || usuarioLogado.razaoSocial || 'Usuário';
    
    document.getElementById('user-info').innerHTML = `
        <p><strong>Email:</strong> ${usuarioLogado.email || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${usuarioLogado.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
        <p><strong>Data de Cadastro:</strong> ${usuarioLogado.dataCadastro ? new Date(usuarioLogado.dataCadastro).toLocaleDateString('pt-BR') : 'N/A'}</p>
        ${usuarioLogado.tipo === 'pj' ? `<p><strong>Contato:</strong> ${usuarioLogado.contato || 'N/A'}</p>` : ''}
    `;
    
    console.log('Usuário logado (comum):', usuarioLogado);
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Ver informações no console
function checkMyInfo() {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('=== MINHAS INFORMAÇÕES ===');
    console.log(usuarioLogado);
    console.log('=== FIM ===');
    alert('Suas informações foram exibidas no console (F12)');
}

// Verificar se está logado
function checkLogin() {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    if (!usuarioLogado.email) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (checkLogin()) {
        loadUserInfo();
    }
});