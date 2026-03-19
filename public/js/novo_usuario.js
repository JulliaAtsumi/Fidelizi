// js/novo_usuario.js
// Versão compatível com Firebase 8.10.0

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('user-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    
    // Verificar se está em modo de edição
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        loadUserForEdit(editId);
    }
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

// Carregar usuário para edição
async function loadUserForEdit(userId) {
    try {
        const user = await getUserById(userId);
        if (user) {
            // Preencher formulário
            document.getElementById('user-type').value = user.tipo || 'pf';
            document.getElementById('user-perfil').value = user.perfil || 'usuario';
            document.getElementById('user-email').value = user.email || '';
            document.getElementById('user-email').disabled = true; // Email não pode ser editado
            
            // Remover obrigatoriedade da senha na edição
            const passwordInput = document.getElementById('user-password');
            passwordInput.required = false;
            passwordInput.placeholder = 'Deixe em branco para manter a senha atual';
            
            toggleFields();
            
            if (user.tipo === 'pf') {
                document.getElementById('user-name').value = user.nome || '';
                document.getElementById('user-cpf').value = user.cpf || '';
            } else {
                document.getElementById('company-name').value = user.companyName || '';
                document.getElementById('company-cnpj').value = user.cnpj || '';
                document.getElementById('company-contact').value = user.contactName || '';
                document.getElementById('company-phone').value = user.phone || '';
            }
            
            // Atualizar título
            const formTitle = document.getElementById('form-title');
            if (formTitle) {
                formTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Usuário';
            }
            
            // Salvar ID do usuário sendo editado
            document.getElementById('user-id').value = userId;
        }
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        showAlert('Erro ao carregar usuário', 'error');
    }
}

async function saveUser() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const userId = editId || document.getElementById('user-id')?.value;
    
    const userType = document.getElementById('user-type').value;
    const perfil = document.getElementById('user-perfil').value;
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;

    if (!email) {
        showAlert('E-mail é obrigatório.', 'error');
        return;
    }

    // Validação de senha apenas para criação
    if (!userId && (!password || password.length < 6)) {
        showAlert('Por favor, preencha todos os campos obrigatórios com dados válidos. A senha deve ter no mínimo 6 caracteres.', 'error');
        return;
    }

    // Validação específica do tipo
    if (userType === 'pf') {
        const nome = document.getElementById('user-name').value.trim();
        if (!nome) {
            showAlert('Nome completo é obrigatório para Pessoa Física.', 'error');
            return;
        }
    } else if (userType === 'pj') {
        const companyName = document.getElementById('company-name').value.trim();
        if (!companyName) {
            showAlert('Razão Social é obrigatória para Pessoa Jurídica.', 'error');
            return;
        }
    }

    showAlert(userId ? 'Atualizando usuário...' : 'Criando usuário...', 'info');

    // Preparar dados do usuário
    const userData = {
        email: email,
        perfil: perfil || 'usuario',
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
        if (userId) {
            // Editar usuário existente
            // Se não há senha, atualizar apenas os dados do Firestore
            if (!password) {
                await updateUser(userId, userData);
                showAlert('Usuário atualizado com sucesso!', 'success');
            } else {
                // Se há senha, precisa atualizar no Auth também
                // Por enquanto, apenas atualizar dados no Firestore
                await updateUser(userId, userData);
                showAlert('Usuário atualizado com sucesso! (Nota: senha não foi alterada)', 'success');
            }
        } else {
            // Criar novo usuário
            const result = await registerUser(userData, password);
            if (!result.success) {
                showAlert('Erro ao criar usuário: ' + result.error, 'error');
                return;
            }
            showAlert('Usuário criado com sucesso!', 'success');
        }
        
        setTimeout(() => {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser && currentUser.perfil === 'admin') {
                window.location.href = 'gerenciar_usuarios.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        showAlert('Erro ao salvar usuário: ' + (error.error || error.message || 'Erro desconhecido'), 'error');
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
    } else {
        // Fallback para alert simples
        alert(message);
    }
}

// Tornar função disponível globalmente
window.toggleFields = toggleFields;