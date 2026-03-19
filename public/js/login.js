// js/login.js
// Versão compatível com Firebase 8.10.0

function Login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validação básica
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return false;
    }

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

                        alert('Login realizado com sucesso!');

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
                    alert('Login realizado com sucesso!');
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

            alert(errorMessage);
        });

    return false; // Prevenir submit do form
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
            
            // Completar login
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                perfil: userData.perfil,
                nome: userData.nome
            }));

            alert('Login realizado com sucesso!');

            setTimeout(() => {
                if (userData.perfil === 'admin') {
                    window.location.href = 'admin_dashboard.html';
                } else {
                    window.location.href = 'home.html';
                }
            }, 1000);
        })
        .catch((error) => {
            console.error('❌ Erro ao criar usuário no Firestore:', error);
            alert('Erro ao criar perfil do usuário.');
        });
}
