// user-common.js
// Funcionalidades comuns para todas as páginas de usuário

// Verificar autenticação de usuário
function checkUserAuth() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
        alert('❌ Você precisa estar logado para acessar esta página.');
        window.location.href = 'index.html';
        return false;
    }
    
    // Se for admin tentando acessar página de usuário, redirecionar
    if (user.perfil === 'admin') {
        window.location.href = 'admin_dashboard.html';
        return false;
    }
    
    return true;
}

// Toggle Sidebar
function initUserSidebarToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (menuToggle && sidebar && mainContent) {
        // Em mobile, sidebar começa collapsed; em desktop, começa visível
        const isMobile = window.innerWidth <= 900;
        const savedState = localStorage.getItem('userSidebarCollapsed');
        
        if (isMobile) {
            // Mobile: sempre começar collapsed
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            // Desktop: restaurar estado salvo ou começar visível
            if (savedState === 'true') {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        }

        menuToggle.addEventListener('click', function() {
            const isCollapsed = sidebar.classList.contains('collapsed');
            
            if (isCollapsed) {
                // Abrir sidebar
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            } else {
                // Fechar sidebar
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            }
            
            // Salvar estado do sidebar (apenas em desktop)
            if (!isMobile) {
                localStorage.setItem('userSidebarCollapsed', !isCollapsed ? 'true' : 'false');
            }
        });

        // Fechar sidebar ao clicar em um link (em telas pequenas)
        if (isMobile) {
            document.querySelectorAll('.sidebar-nav a').forEach(link => {
                link.addEventListener('click', function() {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('expanded');
                });
            });
        }

        // Atualizar ao redimensionar a janela
        window.addEventListener('resize', function() {
            const isMobileNow = window.innerWidth <= 900;
            if (isMobileNow && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else if (!isMobileNow && savedState !== 'true') {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        });
    }
}

// Modo Escuro Global
function initUserDarkMode() {
    // Verificar preferência salva
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }

    // Toggle do modo escuro
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        });
    }
}

// Busca Global Funcional para Usuários
function initUserGlobalSearch() {
    const globalSearch = document.getElementById('global-search');
    const searchInput = document.getElementById('search');
    const searchBtn = document.querySelector('.search-container button');
    
    const searchField = globalSearch || searchInput;

    if (searchField) {
        searchField.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            performUserSearch(searchTerm);
        });

        searchField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performUserSearch(this.value.toLowerCase().trim());
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const term = searchField?.value.toLowerCase().trim() || '';
            performUserSearch(term);
        });
    }
}

// Função de busca para usuários
async function performUserSearch(searchTerm) {
    if (!searchTerm) {
        // Se vazio, mostrar todos os resultados
        if (typeof loadTests === 'function') loadTests();
        return;
    }

    // Buscar em testes do usuário
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.uid) return;
        
        const tests = await getTestsByUser(user.uid);
        const filteredTests = tests.filter(test => {
            return (test.nome || '').toLowerCase().includes(searchTerm) ||
                   (test.descricao || '').toLowerCase().includes(searchTerm) ||
                   (test.dispositivo || '').toLowerCase().includes(searchTerm) ||
                   (test.tipo || '').toLowerCase().includes(searchTerm);
        });

        // Atualizar tabela de testes se existir
        if (typeof renderTestsTable === 'function' && document.getElementById('tests-table-body')) {
            if (typeof currentTests !== 'undefined') {
                currentTests = filteredTests;
            } else {
                window.currentTests = filteredTests;
            }
            renderTestsTable();
        } else if (typeof filterTests === 'function') {
            if (typeof currentTests !== 'undefined') {
                currentTests = filteredTests;
            } else {
                window.currentTests = filteredTests;
            }
            // Atualizar campo de busca se existir
            const searchInput = document.getElementById('search-tests') || document.getElementById('search') || document.getElementById('global-search');
            if (searchInput) {
                searchInput.value = searchTerm;
            }
            filterTests();
        }
    } catch (error) {
        console.error('Erro ao buscar testes:', error);
    }
}

// Função de busca global (buscarGlobal)
function buscarGlobal() {
    const searchField = document.getElementById('global-search') || document.getElementById('search');
    if (searchField) {
        const term = searchField.value.toLowerCase().trim();
        performUserSearch(term);
    }
}

// Logout Usuário
function initUserLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
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
}

// Inicializar tudo quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação apenas se necessário (não bloquear páginas públicas)
    const currentPath = window.location.pathname;
    const publicPages = ['index.html', 'landing_page.html', 'cadastro_publico.html'];
    const isPublicPage = publicPages.some(page => currentPath.includes(page));
    
    if (isPublicPage) {
        // Páginas públicas não precisam de autenticação
        return;
    }
    
    if (checkUserAuth()) {
        initUserSidebarToggle();
        initUserDarkMode();
        initUserGlobalSearch();
        initUserLogout();
    }
});

// Função buscar (alias para buscarGlobal)
function buscar() {
    buscarGlobal();
}

// Exportar funções para uso global
window.buscarGlobal = buscarGlobal;
window.buscar = buscar;
window.performUserSearch = performUserSearch;
window.performUserGlobalSearch = performUserSearch;
