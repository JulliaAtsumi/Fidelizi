/**
 * Firebase Configuration - Versão Segura
 * Carrega credenciais de variáveis de ambiente
 */

// Configuração do Firebase (em produção, use variáveis de ambiente)
const firebaseConfig = {
    apiKey: window.ENV?.FIREBASE_API_KEY || "AIzaSyDVFKAW7mlYtCuq-NAl3JtAZZCCXEAl7xo",
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "fidelizi-ac69e.firebaseapp.com",
    projectId: window.ENV?.FIREBASE_PROJECT_ID || "fidelizi-ac69e",
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "fidelizi-ac69e.firebasestorage.app",
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "783994917710",
    appId: window.ENV?.FIREBASE_APP_ID || "1:783994917710:web:5af5df6e5c5d8e3bb4441f",
    measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || "G-43L1778V7F"
};

// Validar configuração
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
    console.error('❌ Configuração Firebase incompleta. Campos faltando:', missingFields);
    throw new Error('Configuração Firebase inválida');
}

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    throw error;
}

// Inicializar serviços
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações adicionais
db.settings({
    timestampsInSnapshots: true,
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Exportar serviços
window.firebase = firebase;
window.auth = auth;
window.db = db;

// Configuração de persistência offline
if ('caches' in window) {
    db.enablePersistence()
        .then(() => {
            console.log('✅ Persistência offline habilitada');
        })
        .catch((error) => {
            console.warn('⚠️ Persistência offline não disponível:', error);
        });
}

console.log('🔥 Firebase Services inicializados');
