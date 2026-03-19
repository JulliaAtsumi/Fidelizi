// admin_dashboard.js
// Dashboard administrativo com Firebase 8

// Carregar métricas do sistema do Firebase
async function loadSystemMetrics() {
    try {
        // Carregar usuários
        const usersSnapshot = await db.collection('users')
            .where('ativo', '==', true)
            .get();
        
        const totalUsers = usersSnapshot.size;
        
        // Carregar testes
        const testsSnapshot = await db.collection('tests')
            .where('ativo', '==', true)
            .get();
        
        let totalTests = 0;
        let activeTests = 0;
        let criticalIssues = 0;
        
        testsSnapshot.forEach(doc => {
            const test = doc.data();
            totalTests++;
            
            if (test.status === 'andamento') {
                activeTests++;
            }
            
            if (test.severidade === 'critica' || test.severidade === 'alta') {
                criticalIssues++;
            }
        });
        
        // Atualizar métricas na UI
        const totalUsersEl = document.getElementById('total-users');
        const totalTestsEl = document.getElementById('total-tests');
        const activeTestsEl = document.getElementById('active-tests');
        const criticalIssuesEl = document.getElementById('critical-issues');
        
        if (totalUsersEl) totalUsersEl.textContent = totalUsers;
        if (totalTestsEl) totalTestsEl.textContent = totalTests;
        if (activeTestsEl) activeTestsEl.textContent = activeTests;
        if (criticalIssuesEl) criticalIssuesEl.textContent = criticalIssues;
        
        // Carregar atividade recente
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        // Valores padrão em caso de erro
        const totalUsersEl = document.getElementById('total-users');
        const totalTestsEl = document.getElementById('total-tests');
        const activeTestsEl = document.getElementById('active-tests');
        const criticalIssuesEl = document.getElementById('critical-issues');
        
        if (totalUsersEl) totalUsersEl.textContent = '0';
        if (totalTestsEl) totalTestsEl.textContent = '0';
        if (activeTestsEl) activeTestsEl.textContent = '0';
        if (criticalIssuesEl) criticalIssuesEl.textContent = '0';
    }
}

// Carregar atividade recente
async function loadRecentActivity() {
    try {
        // Buscar testes recentes (últimos 5)
        const recentTests = await db.collection('tests')
            .where('ativo', '==', true)
            .orderBy('dataCriacao', 'desc')
            .limit(5)
            .get();
        
        // Buscar usuários recentes (últimos 3)
        const recentUsers = await db.collection('users')
            .where('ativo', '==', true)
            .orderBy('dataCadastro', 'desc')
            .limit(3)
            .get();
        
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;
        
        let html = '';
        
        // Adicionar testes recentes
        recentTests.forEach(doc => {
            const test = doc.data();
            const dataCriacao = test.dataCriacao?.toDate ? test.dataCriacao.toDate() : new Date(test.dataCriacao);
            const timeAgo = getTimeAgo(dataCriacao);
            
            const statusIcons = {
                'concluido': 'fa-check-circle',
                'andamento': 'fa-spinner',
                'pendente': 'fa-clock',
                'falha': 'fa-exclamation-triangle'
            };
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${statusIcons[test.status] || 'fa-vial'}"></i>
                    </div>
                    <div class="activity-content">
                        <strong>${test.nome || 'Teste sem nome'}</strong>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        });
        
        // Adicionar usuários recentes
        recentUsers.forEach(doc => {
            const user = doc.data();
            const dataCadastro = user.dataCadastro?.toDate ? user.dataCadastro.toDate() : new Date(user.dataCadastro);
            const timeAgo = getTimeAgo(dataCadastro);
            const userName = user.nome || user.companyName || user.email;
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="activity-content">
                        <strong>Novo usuário: ${userName}</strong>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        });
        
        activityList.innerHTML = html || '<div class="text-muted">Nenhuma atividade recente</div>';
        
    } catch (error) {
        console.error('Erro ao carregar atividade recente:', error);
    }
}

// Calcular tempo decorrido
function getTimeAgo(date) {
    if (!date) return 'Data desconhecida';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} minuto${minutes !== 1 ? 's' : ''} atrás`;
    if (hours < 24) return `${hours} hora${hours !== 1 ? 's' : ''} atrás`;
    return `${days} dia${days !== 1 ? 's' : ''} atrás`;
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        auth.signOut().then(() => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }).catch(error => {
            console.error('Erro ao fazer logout:', error);
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar acesso é feito pelo admin-common.js
    if (typeof checkAdminAccess === 'function' && checkAdminAccess()) {
        await loadSystemMetrics();
    }
});