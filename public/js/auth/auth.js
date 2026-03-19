// js/auth/auth.js
// Versão compatível com Firebase 8.10.0 (não modular)

// Login
function loginUser(email, password) {
    return new Promise((resolve, reject) => {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Buscar dados do usuário no Firestore
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

                            resolve({ success: true, user: userData });
                        } else {
                            // Se não existe no Firestore, criar automaticamente como usuário comum
                            const userData = {
                                email: user.email,
                                perfil: 'usuario',
                                tipo: 'pf',
                                nome: user.email.split('@')[0],
                                dataCadastro: firebase.firestore.Timestamp.now(),
                                ativo: true
                            };

                            db.collection('users').doc(user.uid).set(userData)
                                .then(() => {
                                    localStorage.setItem('user', JSON.stringify({
                                        uid: user.uid,
                                        email: user.email,
                                        perfil: userData.perfil,
                                        nome: userData.nome
                                    }));
                                    resolve({ success: true, user: userData });
                                })
                                .catch((error) => {
                                    console.error('Erro ao criar usuário no Firestore:', error);
                                    // Mesmo assim, permitir login
                                    localStorage.setItem('user', JSON.stringify({
                                        uid: user.uid,
                                        email: user.email,
                                        perfil: 'usuario',
                                        nome: user.email.split('@')[0]
                                    }));
                                    resolve({ success: true, user: userData });
                                });
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
                        resolve({ success: true, user: { perfil: 'usuario', email: user.email } });
                    });
            })
            .catch((error) => {
                console.error('Erro de login:', error);
                reject({ success: false, error: error.message });
            });
    });
}

// Cadastrar usuário
function registerUser(userData, password) {
    return new Promise((resolve, reject) => {
        // Criar usuário no Authentication
        auth.createUserWithEmailAndPassword(userData.email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Preparar dados para Firestore
                const userFirestoreData = {
                    email: userData.email,
                    perfil: userData.perfil || 'usuario',
                    tipo: userData.tipo || 'pf',
                    dataCadastro: firebase.firestore.Timestamp.now(),
                    ativo: true
                };

                // Adicionar campos específicos
                if (userData.tipo === 'pf') {
                    if (userData.nome) userFirestoreData.nome = userData.nome;
                    if (userData.cpf) userFirestoreData.cpf = userData.cpf;
                } else {
                    if (userData.companyName) userFirestoreData.companyName = userData.companyName;
                    if (userData.cnpj) userFirestoreData.cnpj = userData.cnpj;
                    if (userData.contactName) userFirestoreData.contactName = userData.contactName;
                    if (userData.phone) userFirestoreData.phone = userData.phone;
                }

                // Salvar no Firestore
                db.collection('users').doc(user.uid).set(userFirestoreData)
                    .then(() => {
                        resolve({ success: true, userId: user.uid });
                    })
                    .catch((error) => {
                        console.error('Erro ao salvar no Firestore:', error);
                        // Se falhar ao salvar no Firestore, deletar o usuário do Auth
                        user.delete().then(() => {
                            reject({ success: false, error: 'Erro ao salvar dados do usuário' });
                        });
                    });
            })
            .catch((error) => {
                console.error('Erro ao cadastrar usuário:', error);
                reject({ success: false, error: error.message });
            });
    });
}

// Logout
function logoutUser() {
    return new Promise((resolve, reject) => {
        auth.signOut()
            .then(() => {
                localStorage.removeItem('user');
                resolve({ success: true });
            })
            .catch((error) => {
                console.error('Erro ao fazer logout:', error);
                reject({ success: false, error: error.message });
            });
    });
}

// Verificar usuário logado
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

// Observar mudanças de autenticação
function setupAuthListener(callback) {
    return auth.onAuthStateChanged(callback);
}

// Exportar funções globalmente para uso em todas as páginas
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.setupAuthListener = setupAuthListener;