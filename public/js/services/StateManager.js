/**
 * StateManager - Gerenciamento de Estado Seguro
 * Centraliza o estado da aplicação com persistência segura
 */

class StateManager {
    // Estado global da aplicação
    static #state = {
        user: null,
        theme: 'light',
        sidebarCollapsed: false,
        notifications: [],
        currentPage: 'home',
        filters: {},
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        }
    };

    // Chaves de persistência
    static #STORAGE_KEYS = {
        USER: 'fidelizi_user',
        THEME: 'fidelizi_theme',
        SIDEBAR: 'fidelizi_sidebar',
        FILTERS: 'fidelizi_filters'
    };

    // Observers para reatividade
    static #observers = new Map();

    /**
     * Inicializa o StateManager
     */
    static async initialize() {
        try {
            // Carregar estado persistido
            this.#loadPersistedState();
            
            // Verificar autenticação
            if (this.#state.user && !AuthService.isSessionExpired()) {
                // Usuário já está logado
                this.emit('user:authenticated', this.#state.user);
            } else {
                // Limpar estado inválido
                this.#state.user = null;
                this.#clearPersistedUser();
            }

            console.log('StateManager inicializado:', this.#state);
        } catch (error) {
            console.error('Erro ao inicializar StateManager:', error);
        }
    }

    /**
     * Obtém valor do estado
     */
    static get(key) {
        return key ? this.#state[key] : { ...this.#state };
    }

    /**
     * Define valor no estado
     */
    static set(key, value) {
        const oldValue = this.#state[key];
        this.#state[key] = value;

        // Persistir se necessário
        this.#persistState(key, value);

        // Notificar observadores
        this.emit(`${key}:changed`, { newValue: value, oldValue });

        console.log(`StateManager: ${key} alterado`, { oldValue, newValue });
    }

    /**
     * Atualiza múltiplos valores
     */
    static setMultiple(updates) {
        const changes = {};

        Object.entries(updates).forEach(([key, value]) => {
            const oldValue = this.#state[key];
            this.#state[key] = value;
            changes[key] = { newValue: value, oldValue };
            
            this.#persistState(key, value);
        });

        // Notificar todas as mudanças
        Object.entries(changes).forEach(([key, change]) => {
            this.emit(`${key}:changed`, change);
        });

        console.log('StateManager: atualização múltipla', changes);
    }

    /**
     * Reseta parte do estado
     */
    static reset(key) {
        if (key) {
            const defaultValue = this.#getDefaultValue(key);
            this.set(key, defaultValue);
        } else {
            // Resetar tudo
            Object.keys(this.#state).forEach(key => {
                const defaultValue = this.#getDefaultValue(key);
                this.#state[key] = defaultValue;
            });
            this.#clearAllPersisted();
        }
    }

    /**
     * Inscreve observador para mudanças
     */
    static on(event, callback) {
        if (!this.#observers.has(event)) {
            this.#observers.set(event, []);
        }
        this.#observers.get(event).push(callback);

        // Retornar função de unsubscribe
        return () => {
            const observers = this.#observers.get(event);
            if (observers) {
                const index = observers.indexOf(callback);
                if (index > -1) {
                    observers.splice(index, 1);
                }
            }
        };
    }

    /**
     * Emite evento para observadores
     */
    static emit(event, data) {
        const observers = this.#observers.get(event);
        if (observers) {
            observers.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Erro no observer do evento ${event}:`, error);
                }
            });
        }
    }

    /**
     * Carrega estado persistido
     */
    static #loadPersistedState() {
        try {
            // Carregar usuário do AuthService
            this.#state.user = AuthService.getCurrentUser();

            // Carregar tema
            const theme = localStorage.getItem(this.#STORAGE_KEYS.THEME);
            if (theme) {
                this.#state.theme = theme;
            }

            // Carregar estado da sidebar
            const sidebar = localStorage.getItem(this.#STORAGE_KEYS.SIDEBAR);
            if (sidebar) {
                this.#state.sidebarCollapsed = sidebar === 'true';
            }

            // Carregar filtros
            const filters = localStorage.getItem(this.#STORAGE_KEYS.FILTERS);
            if (filters) {
                this.#state.filters = JSON.parse(filters);
            }

        } catch (error) {
            console.error('Erro ao carregar estado persistido:', error);
        }
    }

    /**
     * Persiste estado específico
     */
    static #persistState(key, value) {
        try {
            switch (key) {
                case 'theme':
                    localStorage.setItem(this.#STORAGE_KEYS.THEME, value);
                    break;
                case 'sidebarCollapsed':
                    localStorage.setItem(this.#STORAGE_KEYS.SIDEBAR, value.toString());
                    break;
                case 'filters':
                    localStorage.setItem(this.#STORAGE_KEYS.FILTERS, JSON.stringify(value));
                    break;
                // Usuário é gerenciado pelo AuthService
                case 'user':
                    // Não persistir aqui - AuthService cuida disso
                    break;
            }
        } catch (error) {
            console.error(`Erro ao persistir ${key}:`, error);
        }
    }

    /**
     * Limpa usuário persistido
     */
    static #clearPersistedUser() {
        try {
            localStorage.removeItem(this.#STORAGE_KEYS.USER);
        } catch (error) {
            console.error('Erro ao limpar usuário persistido:', error);
        }
    }

    /**
     * Limpa todo estado persistido
     */
    static #clearAllPersisted() {
        try {
            Object.values(this.#STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Erro ao limpar estado persistido:', error);
        }
    }

    /**
     * Obtém valor padrão para uma chave
     */
    static #getDefaultValue(key) {
        const defaults = {
            user: null,
            theme: 'light',
            sidebarCollapsed: false,
            notifications: [],
            currentPage: 'home',
            filters: {},
            pagination: { page: 1, limit: 10, total: 0 }
        };
        return defaults[key];
    }

    /**
     * Utilitários para tema
     */
    static toggleTheme() {
        const newTheme = this.#state.theme === 'light' ? 'dark' : 'light';
        this.set('theme', newTheme);
        document.body.classList.toggle('dark-mode', newTheme === 'dark');
    }

    /**
     * Utilitários para sidebar
     */
    static toggleSidebar() {
        const newState = !this.#state.sidebarCollapsed;
        this.set('sidebarCollapsed', newState);
        return newState;
    }

    /**
     * Utilitários para paginação
     */
    static updatePagination(updates) {
        const currentPagination = this.get('pagination');
        const newPagination = { ...currentPagination, ...updates };
        this.set('pagination', newPagination);
    }

    /**
     * Utilitários para filtros
     */
    static updateFilter(filterKey, filterValue) {
        const currentFilters = this.get('filters');
        const newFilters = { ...currentFilters, [filterKey]: filterValue };
        this.set('filters', newFilters);
    }

    /**
     * Utilitários para notificações
     */
    static addNotification(notification) {
        const notifications = this.get('notifications');
        const newNotifications = [...notifications, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...notification
        }];
        this.set('notifications', newNotifications);
    }

    /**
     * Remove notificação
     */
    static removeNotification(notificationId) {
        const notifications = this.get('notifications');
        const newNotifications = notifications.filter(n => n.id !== notificationId);
        this.set('notifications', newNotifications);
    }

    /**
     * Exporta estado atual (para debug)
     */
    static exportState() {
        return {
            ...this.#state,
            exportedAt: new Date().toISOString()
        };
    }
}

// Exportar para uso global
window.StateManager = StateManager;

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    StateManager.initialize();
});
