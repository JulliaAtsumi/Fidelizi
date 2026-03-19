/**
 * Utils - Funções Utilitárias Centralizadas
 */

class Utils {
    /**
     * Validações
     */
    static validators = {
        /**
         * Valida CPF
         */
        cpf: (cpf) => {
            if (!cpf) return false;
            cpf = cpf.replace(/[^\d]+/g, '');
            
            if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
            
            let soma = 0;
            for (let i = 0; i < 9; i++) {
                soma += parseInt(cpf.charAt(i)) * (10 - i);
            }
            let resto = soma % 11;
            let digito1 = resto < 2 ? 0 : 11 - resto;
            
            if (digito1 !== parseInt(cpf.charAt(9))) return false;
            
            soma = 0;
            for (let i = 0; i < 10; i++) {
                soma += parseInt(cpf.charAt(i)) * (11 - i);
            }
            resto = soma % 11;
            let digito2 = resto < 2 ? 0 : 11 - resto;
            
            return digito2 === parseInt(cpf.charAt(10));
        },

        /**
         * Valida CNPJ
         */
        cnpj: (cnpj) => {
            if (!cnpj) return false;
            cnpj = cnpj.replace(/[^\d]+/g, '');
            
            if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
            
            let tamanho = cnpj.length - 2;
            let numeros = cnpj.substring(0, tamanho);
            let digitos = cnpj.substring(tamanho);
            let soma = 0;
            let pos = tamanho - 7;
            
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            
            let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado !== parseInt(digitos.charAt(0))) return false;
            
            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            return resultado === parseInt(digitos.charAt(1));
        },

        /**
         * Valida email
         */
        email: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        /**
         * Valida senha forte
         */
        password: (password) => {
            if (!password || password.length < 6) return false;
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            return hasUpper && hasLower && hasNumber && hasSpecial;
        },

        /**
         * Valida telefone
         */
        phone: (phone) => {
            const cleanPhone = phone.replace(/\D/g, '');
            return cleanPhone.length >= 10 && cleanPhone.length <= 11;
        }
    };

    /**
     * Formatações
     */
    static formatters = {
        /**
         * Formata CPF
         */
        cpf: (cpf) => {
            if (!cpf) return '';
            const cleanCpf = cpf.replace(/\D/g, '');
            return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        },

        /**
         * Formata CNPJ
         */
        cnpj: (cnpj) => {
            if (!cnpj) return '';
            const cleanCnpj = cnpj.replace(/\D/g, '');
            return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        },

        /**
         * Formata telefone
         */
        phone: (phone) => {
            if (!phone) return '';
            const cleanPhone = phone.replace(/\D/g, '');
            
            if (cleanPhone.length <= 10) {
                return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        },

        /**
         * Formata data
         */
        date: (date, format = 'pt-BR') => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString(format);
        },

        /**
         * Formata moeda
         */
        currency: (value, currency = 'BRL') => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: currency
            }).format(value);
        },

        /**
         * Formata bytes
         */
        bytes: (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
    };

    /**
     * Sistema de alertas melhorado
     */
    static alerts = {
        /**
         * Mostra alerta de sucesso
         */
        success: (message, duration = 5000) => {
            Utils.alerts.showAlert(message, 'success', duration);
        },

        /**
         * Mostra alerta de erro
         */
        error: (message, duration = 5000) => {
            Utils.alerts.showAlert(message, 'danger', duration);
        },

        /**
         * Mostra alerta de aviso
         */
        warning: (message, duration = 5000) => {
            Utils.alerts.showAlert(message, 'warning', duration);
        },

        /**
         * Mostra alerta informativo
         */
        info: (message, duration = 5000) => {
            Utils.alerts.showAlert(message, 'info', duration);
        },

        /**
         * Mostra confirmação
         */
        confirm: (message, callback) => {
            if (confirm(message)) {
                callback();
            }
        },

        /**
         * Função interna para mostrar alertas
         */
        showAlert: (message, type, duration) => {
            // Criar elemento de alerta
            const alert = document.createElement('div');
            alert.className = `alert alert-${type} alert-dismissible fade show`;
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Estilizar
            alert.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                max-width: 500px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-radius: 8px;
                animation: slideInRight 0.3s ease-out;
            `;

            // Adicionar ao DOM
            document.body.appendChild(alert);

            // Auto remover
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => {
                        if (alert.parentNode) {
                            alert.parentNode.removeChild(alert);
                        }
                    }, 300);
                }
            }, duration);

            // Adicionar animações CSS se não existirem
            if (!document.querySelector('#alert-animations')) {
                const style = document.createElement('style');
                style.id = 'alert-animations';
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    /**
     * Utilitários de DOM
     */
    static dom = {
        /**
         * Espera elemento estar disponível
         */
        ready: (callback) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        },

        /**
         * Cria elemento com atributos
         */
        create: (tag, attributes = {}, content = '') => {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else if (key.startsWith('data-')) {
                    element.setAttribute(key, value);
                } else {
                    element[key] = value;
                }
            });

            if (content) {
                element.innerHTML = content;
            }

            return element;
        },

        /**
         * Adiciona múltiplos event listeners
         */
        on: (element, events, handler) => {
            events.split(' ').forEach(event => {
                element.addEventListener(event, handler);
            });
        },

        /**
         * Remove múltiplos event listeners
         */
        off: (element, events, handler) => {
            events.split(' ').forEach(event => {
                element.removeEventListener(event, handler);
            });
        }
    };

    /**
     * Utilitários de data
     */
    static date = {
        /**
         * Verifica se data é válida
         */
        isValid: (date) => {
            return date instanceof Date && !isNaN(date);
        },

        /**
         * Adiciona dias a uma data
         */
        addDays: (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },

        /**
         * Formata data relativa
         */
        relative: (date) => {
            const now = new Date();
            const diff = now - new Date(date);
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days} dia(s) atrás`;
            if (hours > 0) return `${hours} hora(s) atrás`;
            if (minutes > 0) return `${minutes} minuto(s) atrás`;
            return `${seconds} segundo(s) atrás`;
        }
    };

    /**
     * Utilitários de string
     */
    static string = {
        /**
         * Capitaliza primeira letra
         */
        capitalize: (str) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        /**
         * Remove acentos
         */
        removeAccents: (str) => {
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        },

        /**
         * Gera slug
         */
        slug: (str) => {
            return Utils.string.removeAccents(str)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },

        /**
         * Trunca texto
         */
        truncate: (str, length, suffix = '...') => {
            if (!str || str.length <= length) return str;
            return str.substring(0, length - suffix.length) + suffix;
        }
    };

    /**
     * Utilitários de array
     */
    static array = {
        /**
         * Remove duplicatas
         */
        unique: (arr, key = null) => {
            if (!key) return [...new Set(arr)];
            
            const seen = new Set();
            return arr.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        },

        /**
         * Agrupa por chave
         */
        groupBy: (arr, key) => {
            return arr.reduce((groups, item) => {
                const group = item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        /**
         * Ordena por chave
         */
        sortBy: (arr, key, order = 'asc') => {
            return [...arr].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];
                
                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }
    };

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Exportar para uso global
window.Utils = Utils;

// Compatibilidade com código legado
window.validarCPF = Utils.validators.cpf;
window.validarCNPJ = Utils.validators.cnpj;
window.formatarCPF = Utils.formatters.cpf;
window.formatarCNPJ = Utils.formatters.cnpj;
window.showAlert = Utils.alerts.success;
