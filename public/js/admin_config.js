function checkAdminAccess() {
    const usuarioLogado = JSON.parse(localStorage.getItem('user') || '{}');
    if (usuarioLogado.perfil !== 'admin') {
        alert('Acesso negado! Esta área é restrita para administradores.');
        window.location.href = 'home.html';
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    checkAdminAccess();
});