/**
 * AuthService - Sistema Centralizado de Autenticação
 * Versão 2.0 - Seguro e Padronizado
 */

class AuthService {
    // Chave criptografada para localStorage (simples ofuscação)
    static #STORAGE_KEY = 'fidelizi_auth';
    static #ENCRYPTION_KEY = 'fidelizi_secure_2024';

    /**
     * Criptografa dados sensíveis
     */
    static #encrypt(data) {
        try {
            const encrypted = btoa(JSON.stringify(data));
            return encrypted;
        } catch (error) {
            console.error('Erro ao criptografar dados:', error);
            return null;
        }
    }

    /**
     * Descriptografa dados sensíveis
     */
    static #decrypt(encryptedData) {
        try {
            const decrypted = atob(encryptedData);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Erro ao descriptografar dados:', error);
            return null;
        }
    }

    /**
     * Realiza login do usuário
     */
    static async login(email, password) {
        try {
            // Validação básica
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios');
            }

            // Autenticação Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Buscar dados completos no Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            let userData = userDoc.exists ? userDoc.data() : null;

            // Se não existe no Firestore, criar usuário básico
            if (!userData) {
                userData = await this.#createUserInFirestore(user);
            }

            // Preparar dados de sessão
            const sessionData = {
                uid: user.uid,
                email: user.email,
                perfil: userData.perfil || 'usuario',
                nome: userData.nome || userData.companyName || user.email.split('@')[0],
                tipo: userData.tipo || 'pf',
                dataLogin: new Date().toISOString(),
                authenticated: true
            };

            // Salvar sessão criptografada
            this.#saveSession(sessionData);

            return {
                success: true,
                user: sessionData,
                redirectTo: this.#getRedirectUrl(sessionData.perfil)
            };

        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                error: this.#getErrorMessage(error)
            };
        }
    }

    /**
     * Realiza logout do usuário
     */
    static async logout() {
        try {
            // Logout do Firebase
            if (auth) {
                await auth.signOut();
            }

            // Limpar sessão local
            localStorage.removeItem(this.#STORAGE_KEY);
            localStorage.removeItem('darkMode');
            
            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtém usuário atual da sessão
     */
    static getCurrentUser() {
        try {
            const encryptedSession = localStorage.getItem(this.#STORAGE_KEY);
            if (!encryptedSession) return null;

            const sessionData = this.#decrypt(encryptedSession);
            if (!sessionData || !sessionData.authenticated) return null;

            // Verificar se sessão não expirou (24 horas)
            const loginTime = new Date(sessionData.dataLogin);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                this.logout();
                return null;
            }

            return sessionData;
        } catch (error) {
            console.error('Erro ao obter usuário atual:', error);
            return null;
        }
    }

    /**
     * Verifica se usuário está autenticado
     */
    static isAuthenticated() {
        const user = this.getCurrentUser();
        return user !== null && user.authenticated === true;
    }

    /**
     * Verifica se usuário tem perfil específico
     */
    static hasRole(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.perfil === requiredRole;
    }

    /**
     * Verifica acesso baseado em perfil
     */
    static checkAuth(requiredRole = null) {
        if (!this.isAuthenticated()) {
            return {
                authorized: false,
                reason: 'Usuário não autenticado',
                redirectTo: 'index.html'
            };
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            const user = this.getCurrentUser();
            return {
                authorized: false,
                reason: 'Acesso não autorizado para este perfil',
                redirectTo: user.perfil === 'admin' ? 'admin_dashboard.html' : 'home.html'
            };
        }

        return { authorized: true };
    }

    /**
     * Redireciona baseado no perfil
     */
    static redirectBasedOnRole() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        const redirectUrl = this.#getRedirectUrl(user.perfil);
        window.location.href = redirectUrl;
    }

    /**
     * Salva sessão criptografada
     */
    static #saveSession(sessionData) {
        const encrypted = this.#encrypt(sessionData);
        if (encrypted) {
            localStorage.setItem(this.#STORAGE_KEY, encrypted);
        }
    }

    /**
     * Cria usuário no Firestore se não existir
     */
    static async #createUserInFirestore(user) {
        const userData = {
            email: user.email,
            perfil: user.email === 'admin@fidelizi.com' ? 'admin' : 'usuario',
            tipo: 'pf',
            nome: user.email.split('@')[0],
            dataCadastro: firebase.firestore.Timestamp.now(),
            ativo: true
        };

        await db.collection('users').doc(user.uid).set(userData);
        return userData;
    }

    /**
     * Obtém URL de redirecionamento baseada no perfil
     */
    static #getRedirectUrl(perfil) {
        const redirectMap = {
            'admin': 'admin_dashboard.html',
            'usuario': 'home.html'
        };
        return redirectMap[perfil] || 'home.html';
    }

    /**
     * Traduz erros de autenticação
     */
    static #getErrorMessage(error) {
        const errorMap = {
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Conta desativada',
            'auth/user-not-found': 'Usuário não encontrado',
            'auth/wrong-password': 'Senha incorreta',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
        };

        return errorMap[error.code] || 'Erro ao fazer login. Tente novamente.';
    }

    /**
     * Atualiza dados do usuário na sessão
     */
    static updateUserData(newData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const updatedUser = { ...currentUser, ...newData };
        this.#saveSession(updatedUser);
        return true;
    }

    /**
     * Verifica se sessão está expirada
     */
    static isSessionExpired() {
        const user = this.getCurrentUser();
        return !user;
    }
}

// Exportar para uso global
window.AuthService = AuthService;

// Manter compatibilidade com código legado
window.getCurrentUser = () => AuthService.getCurrentUser();
window.checkAuth = (role) => AuthService.checkAuth(role);
