// admin-header.js
// Header padronizado para páginas administrativas

function createAdminHeader(pageTitle) {
    return `
      <header class="top-header">
        <button class="menu-toggle" id="menu-toggle">
          <i class="fas fa-bars"></i>
        </button>

        <div class="header-center">
          <img src="/src/assets/img/logo_horizontal.png" alt="Fidelizi" class="header-logo">
          <span class="admin-badge ms-2">${pageTitle}</span>
        </div>

        <div class="search-container">
          <input type="text" id="global-search" placeholder="Buscar no sistema..." />
          <button onclick="performGlobalSearch(document.getElementById('global-search').value)" 
                  style="background: none; border: none; color: #1e3a8a; cursor: pointer;">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </header>
    `;
}

// Atualizar classe ativa no menu
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
                }
            }
        }
    });
}
