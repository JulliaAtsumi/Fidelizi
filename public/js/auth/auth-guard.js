// js/auth/auth-guard.js
// Versão compatível com Firebase 8.10.0 (não modular)

function checkAuth(requiredProfile = null) {
    const user = getCurrentUser();
    
    if (!user || !user.uid) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (requiredProfile && user.perfil !== requiredProfile) {
        alert('Acesso não autorizado!');
        if (user.perfil === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'home.html';
        }
        return false;
    }
    
    return true;
}

function redirectIfAuthenticated() {
    const user = getCurrentUser();
    if (user && user.uid) {
        if (user.perfil === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'home.html';
        }
    }
}