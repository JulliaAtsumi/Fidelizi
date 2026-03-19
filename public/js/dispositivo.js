// Toggle sidebar
document.getElementById('menu-toggle').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

// Dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', function (e) {
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
window.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

// Logout function
document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair?')) {
        window.location.href = 'index.html';
    }
});

// Função de busca
function buscar() {
    const termo = document.getElementById('search').value;
    if (termo.trim() !== '') {
        alert(`Buscando por: ${termo}`);
        // Aqui você implementaria a lógica de busca real
    }
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