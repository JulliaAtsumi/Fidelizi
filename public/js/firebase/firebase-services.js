// firebase-services.js
// Versão compatível com Firebase 8.10.0 (não modular)

// ========== SERVIÇOS DE USUÁRIOS ==========
function getUsers() {
    return new Promise((resolve, reject) => {
        db.collection('users')
            .where('ativo', '==', true)
            .get()
            .then((querySnapshot) => {
                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push({ id: doc.id, ...doc.data() });
                });
                resolve(users);
            })
            .catch((error) => {
                console.error('Erro ao buscar usuários:', error);
                reject(error);
            });
    });
}

function getUserById(userId) {
    return new Promise((resolve, reject) => {
        db.collection('users').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    resolve({ id: doc.id, ...doc.data() });
                } else {
                    resolve(null);
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar usuário:', error);
                reject(error);
            });
    });
}

function createUser(userData) {
    return new Promise((resolve, reject) => {
        const userWithTimestamp = {
            ...userData,
            dataCadastro: firebase.firestore.Timestamp.now(),
            ativo: true
        };

        db.collection('users').add(userWithTimestamp)
            .then((docRef) => {
                resolve({ id: docRef.id, ...userData });
            })
            .catch((error) => {
                console.error('Erro ao criar usuário:', error);
                reject(error);
            });
    });
}

function updateUser(userId, userData) {
    return new Promise((resolve, reject) => {
        db.collection('users').doc(userId).update(userData)
            .then(() => {
                resolve({ id: userId, ...userData });
            })
            .catch((error) => {
                console.error('Erro ao atualizar usuário:', error);
                reject(error);
            });
    });
}

function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        db.collection('users').doc(userId).update({ ativo: false })
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                console.error('Erro ao deletar usuário:', error);
                reject(error);
            });
    });
}

// ========== SERVIÇOS DE TESTES ==========
function getTests(filters = {}) {
    return new Promise((resolve, reject) => {
        let query = db.collection('tests').where('ativo', '==', true);

        if (filters.userId) {
            query = query.where('userId', '==', filters.userId);
        }
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters.dispositivo) {
            query = query.where('dispositivo', '==', filters.dispositivo);
        }
        if (filters.severidade) {
            query = query.where('severidade', '==', filters.severidade);
        }

        query.orderBy('dataCriacao', 'desc').get()
            .then((querySnapshot) => {
                const tests = [];
                querySnapshot.forEach((doc) => {
                    tests.push({ id: doc.id, ...doc.data() });
                });
                resolve(tests);
            })
            .catch((error) => {
                console.error('Erro ao buscar testes:', error);
                reject(error);
            });
    });
}

function getTestById(testId) {
    return new Promise((resolve, reject) => {
        db.collection('tests').doc(testId).get()
            .then((doc) => {
                if (doc.exists) {
                    resolve({ id: doc.id, ...doc.data() });
                } else {
                    resolve(null);
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar teste:', error);
                reject(error);
            });
    });
}

function createTest(testData) {
    return new Promise((resolve, reject) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const testWithTimestamp = {
            ...testData,
            userId: user.uid || '',
            userEmail: user.email || '',
            dataCriacao: firebase.firestore.Timestamp.now(),
            ativo: true
        };

        db.collection('tests').add(testWithTimestamp)
            .then((docRef) => {
                resolve({ id: docRef.id, ...testData });
            })
            .catch((error) => {
                console.error('Erro ao criar teste:', error);
                reject(error);
            });
    });
}

function updateTest(testId, testData) {
    return new Promise((resolve, reject) => {
        db.collection('tests').doc(testId).update(testData)
            .then(() => {
                resolve({ id: testId, ...testData });
            })
            .catch((error) => {
                console.error('Erro ao atualizar teste:', error);
                reject(error);
            });
    });
}

function deleteTest(testId) {
    return new Promise((resolve, reject) => {
        db.collection('tests').doc(testId).update({ ativo: false })
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                console.error('Erro ao deletar teste:', error);
                reject(error);
            });
    });
}

function getTestsByUser(userId) {
    return getTests({ userId });
}

function getSystemMetrics() {
    return new Promise((resolve, reject) => {
        Promise.all([getUsers(), getTests()])
            .then(([users, tests]) => {
                resolve({
                    totalUsers: users.length,
                    totalTests: tests.length,
                    activeTests: tests.filter(test => test.status === 'andamento').length,
                    criticalIssues: tests.filter(test => test.severidade === 'critica' || test.severidade === 'alta').length
                });
            })
            .catch((error) => {
                console.error('Erro ao buscar métricas:', error);
                reject(error);
            });
    });
}

// Exportar funções globalmente para uso em todas as páginas
window.getUsers = getUsers;
window.getUserById = getUserById;
window.createUser = createUser;
window.updateUser = updateUser;
window.deleteUser = deleteUser;
window.getTests = getTests;
window.getTestById = getTestById;
window.createTest = createTest;
window.updateTest = updateTest;
window.deleteTest = deleteTest;
window.getTestsByUser = getTestsByUser;
window.getSystemMetrics = getSystemMetrics;