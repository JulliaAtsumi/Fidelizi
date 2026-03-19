// admin-common.js
// Funcionalidades comuns para todas as páginas administrativas

// Verificar acesso admin
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid || user.perfil !== 'admin') {
        alert('❌ Acesso negado! Esta área é restrita para administradores.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Toggle Sidebar
function initSidebarToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (menuToggle && sidebar && mainContent) {
        // Garantir que o sidebar começa visível (não collapsed)
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.style.transform = 'translateX(0)';
            mainContent.classList.remove('expanded'); // Sem expanded = sidebar visível
        }

        menuToggle.addEventListener('click', function() {
            const isCollapsed = sidebar.classList.contains('collapsed');
            
            if (isCollapsed) {
                // Abrir sidebar
                sidebar.classList.remove('collapsed');
                sidebar.style.transform = 'translateX(0)';
                mainContent.classList.remove('expanded');
            } else {
                // Fechar sidebar
                sidebar.classList.add('collapsed');
                sidebar.style.transform = 'translateX(-100%)';
                mainContent.classList.add('expanded');
            }
            
            // Salvar estado do sidebar
            localStorage.setItem('sidebarCollapsed', !isCollapsed ? 'true' : 'false');
        });

        // Restaurar estado do sidebar
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            sidebar.style.transform = 'translateX(-100%)';
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            sidebar.style.transform = 'translateX(0)';
            mainContent.classList.remove('expanded');
        }

        // Fechar sidebar ao clicar em um link (em telas pequenas)
        if (window.innerWidth <= 900) {
            document.querySelectorAll('.sidebar-nav a').forEach(link => {
                link.addEventListener('click', function() {
                    sidebar.classList.add('collapsed');
                    sidebar.style.transform = 'translateX(-100%)';
                    mainContent.classList.remove('expanded');
                    localStorage.setItem('sidebarCollapsed', 'true');
                });
            });
        }
    }
}

// Modo Escuro Global
function initDarkMode() {
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

// Busca Global Funcional
function initGlobalSearch() {
    const globalSearch = document.getElementById('global-search');
    if (!globalSearch) return;

    globalSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        performGlobalSearch(searchTerm);
    });

    globalSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performGlobalSearch(this.value.toLowerCase().trim());
        }
    });
}

// Função de busca global
async function performGlobalSearch(searchTerm) {
    if (!searchTerm) {
        // Se vazio, mostrar todos os resultados
        if (typeof loadTests === 'function') loadTests();
        if (typeof loadUsers === 'function') loadUsers();
        return;
    }

    // Buscar em testes
    try {
        const tests = await getTests({});
        const filteredTests = tests.filter(test => {
            return (test.nome || '').toLowerCase().includes(searchTerm) ||
                   (test.descricao || '').toLowerCase().includes(searchTerm) ||
                   (test.dispositivo || '').toLowerCase().includes(searchTerm) ||
                   (test.tipo || '').toLowerCase().includes(searchTerm);
        });

        // Atualizar tabela de testes se existir
        if (typeof filterTests === 'function' && document.getElementById('tests-table-body')) {
            const originalTests = currentTests || [];
            currentTests = filteredTests;
            if (typeof renderTestsTable === 'function') {
                renderTestsTable();
            }
        }
    } catch (error) {
        console.error('Erro ao buscar testes:', error);
    }

    // Buscar em usuários
    try {
        const users = await getUsers();
        const filteredUsers = users.filter(user => {
            const nome = user.nome || user.companyName || '';
            return user.email.toLowerCase().includes(searchTerm) ||
                   nome.toLowerCase().includes(searchTerm) ||
                   (user.cpf || '').includes(searchTerm) ||
                   (user.cnpj || '').includes(searchTerm);
        });

        // Atualizar tabela de usuários se existir
        if (typeof filterUsers === 'function' && document.getElementById('users-table-body')) {
            const originalUsers = allUsers || [];
            allUsers = filteredUsers;
            currentUsers = filteredUsers;
            if (typeof renderUsersTable === 'function') {
                renderUsersTable();
            }
        }
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
    }
}

// Logout Admin
function initAdminLogout() {
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
    if (checkAdminAccess()) {
        initSidebarToggle();
        initDarkMode();
        initGlobalSearch();
        initAdminLogout();
    }
});

// Função para atualizar item ativo do menu
function updateActiveMenuItem(currentPage) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
            // Expandir submenu se necessário
            const parentSubmenu = link.closest('.submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('show');
                const parentNav = parentSubmenu.previousElementSibling;
                if (parentNav) {
                    parentNav.setAttribute('aria-expanded', 'true');
                    parentNav.classList.add('active');
                }
            }
        }
    });
}

// Exportar funções para uso global
window.performGlobalSearch = performGlobalSearch;
window.updateActiveMenuItem = updateActiveMenuItem;
window.checkAdminAccess = checkAdminAccess;
window.initSidebarToggle = initSidebarToggle;
window.initDarkMode = initDarkMode;
window.initGlobalSearch = initGlobalSearch;
window.initAdminLogout = initAdminLogout;
