// js/index.js
// Versão compatível com Firebase 8.10.0

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validação básica
    if (!email || !password) {
        showAlert('Por favor, preencha todos os campos.', 'error');
        return;
    }

    showAlert('Entrando...', 'info');

    // Firebase Authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Verificar dados no Firestore
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        
                        // Salvar no localStorage
                        localStorage.setItem('user', JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            perfil: userData.perfil || 'usuario',
                            nome: userData.nome || userData.companyName || user.email
                        }));

                        showAlert('Login realizado com sucesso!', 'success');

                        // Redirecionar baseado no perfil
                        setTimeout(() => {
                            if (userData.perfil === 'admin') {
                                window.location.href = 'admin_dashboard.html';
                            } else {
                                window.location.href = 'home.html';
                            }
                        }, 1000);
                    } else {
                        // Se não existe no Firestore, criar automaticamente como usuário comum
                        createUserInFirestore(user);
                    }
                })
                .catch((error) => {
                    console.error('Erro ao buscar dados do usuário:', error);
                    // Mesmo com erro, permitir login se autenticação foi bem-sucedida
                    localStorage.setItem('user', JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        perfil: 'usuario',
                        nome: user.email.split('@')[0]
                    }));
                    showAlert('Login realizado com sucesso!', 'success');
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1000);
                });
        })
        .catch((error) => {
            console.error('Erro de login:', error);
            let errorMessage = 'E-mail ou senha incorretos.';

            // Tratamento de erros mais específico
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Esta conta foi desativada.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Senha incorreta.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                    break;
                default:
                    errorMessage = 'Erro ao fazer login. Tente novamente.';
            }

            showAlert(errorMessage, 'error');
        });
}

// Função para criar usuário no Firestore se não existir
function createUserInFirestore(user) {
    const userData = {
        email: user.email,
        perfil: user.email === 'admin@fidelizi.com' ? 'admin' : 'usuario',
        tipo: 'pf',
        nome: user.email.split('@')[0],
        dataCadastro: firebase.firestore.Timestamp.now(),
        ativo: true
    };

    db.collection('users').doc(user.uid).set(userData)
        .then(() => {
            console.log('✅ Usuário criado no Firestore:', userData);
            completeLogin(user, userData);
        })
        .catch((error) => {
            console.error('❌ Erro ao criar usuário no Firestore:', error);
            showAlert('Erro ao criar perfil do usuário.', 'error');
        });
}

// Função comum para completar o login
function completeLogin(user, userData) {
    localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        perfil: userData.perfil || 'usuario',
        nome: userData.nome || userData.companyName || user.email
    }));

    showAlert('Login realizado com sucesso!', 'success');

    // Redirecionar baseado no perfil
    setTimeout(() => {
        if (userData.perfil === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'home.html';
        }
    }, 1000);
}

function cadastrar() {
    window.location.href = 'cadastro_publico.html';
}

function showAlert(message, type) {
    const alert = document.getElementById('alert-message');
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';

    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Adicionar evento de enter para login
document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput && passwordInput) {
        emailInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                login();
            }
        });

        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }

    // Verificar se usuário já está logado
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        // Redirecionar automaticamente se já estiver logado
        if (user.perfil === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'home.html';
        }
    }
});

// Tornar funções disponíveis globalmente
window.login = login;
window.cadastrar = cadastrar;