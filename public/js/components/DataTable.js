/**
 * DataTable - Componente Reutilizável de Tabela
 * Versão 2.0 - Com paginação, filtros e ordenação
 */

class DataTable {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            columns: [],
            data: [],
            pagination: true,
            pageSize: 10,
            searchable: true,
            sortable: true,
            emptyMessage: 'Nenhum registro encontrado',
            loadingMessage: 'Carregando...',
            ...options
        };

        this.currentPage = 1;
        this.filteredData = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';

        this.init();
    }

    /**
     * Inicializa o componente
     */
    init() {
        if (!this.container) {
            console.error('Container não encontrado para DataTable');
            return;
        }

        this.createStructure();
        this.bindEvents();
        this.render();
    }

    /**
     * Cria estrutura HTML
     */
    createStructure() {
        this.container.innerHTML = `
            <div class="datatable-wrapper">
                ${this.options.searchable ? this.createSearchHTML() : ''}
                <div class="datatable-content">
                    <div class="datatable-loading" style="display: none;">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">${this.options.loadingMessage}</span>
                        </div>
                    </div>
                    <div class="datatable-table-wrapper">
                        <table class="datatable-table table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>${this.createHeaderHTML()}</tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                    ${this.options.pagination ? this.createPaginationHTML() : ''}
                </div>
                <div class="datatable-empty" style="display: none;">
                    <div class="text-center py-4">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p class="text-muted">${this.options.emptyMessage}</p>
                    </div>
                </div>
            </div>
        `;

        // Referências aos elementos
        this.searchInput = this.container.querySelector('.datatable-search input');
        this.tableBody = this.container.querySelector('.datatable-table tbody');
        this.paginationContainer = this.container.querySelector('.datatable-pagination');
        this.loadingElement = this.container.querySelector('.datatable-loading');
        this.emptyElement = this.container.querySelector('.datatable-empty');
        this.tableWrapper = this.container.querySelector('.datatable-table-wrapper');
    }

    /**
     * HTML da barra de busca
     */
    createSearchHTML() {
        return `
            <div class="datatable-search mb-3">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="Buscar...">
                    <button class="btn btn-outline-secondary" type="button" id="clear-search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * HTML do cabeçalho
     */
    createHeaderHTML() {
        return this.options.columns.map(column => `
            <th class="${column.sortable !== false ? 'sortable' : ''}" data-column="${column.key}">
                ${column.title}
                ${column.sortable !== false ? '<span class="sort-icon"></span>' : ''}
            </th>
        `).join('');
    }

    /**
     * HTML da paginação
     */
    createPaginationHTML() {
        return `
            <div class="datatable-pagination d-flex justify-content-between align-items-center mt-3">
                <div class="pagination-info"></div>
                <div class="pagination-controls"></div>
            </div>
        `;
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Busca
        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce(() => {
                this.handleSearch();
            }, 300));

            const clearBtn = this.container.querySelector('#clear-search');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.searchInput.value = '';
                    this.handleSearch();
                });
            }
        }

        // Ordenação
        if (this.options.sortable) {
            this.container.addEventListener('click', (e) => {
                if (e.target.closest('.sortable')) {
                    const th = e.target.closest('.sortable');
                    const column = th.dataset.column;
                    this.handleSort(column);
                }
            });
        }
    }

    /**
     * Renderiza a tabela
     */
    render() {
        this.showLoading();

        setTimeout(() => {
            const dataToRender = this.getPaginatedData();
            
            if (dataToRender.length === 0) {
                this.showEmpty();
            } else {
                this.showTable();
                this.renderRows(dataToRender);
                this.updatePagination();
            }

            this.hideLoading();
        }, 100);
    }

    /**
     * Renderiza linhas da tabela
     */
    renderRows(data) {
        this.tableBody.innerHTML = data.map((row, index) => {
            const rowIndex = (this.currentPage - 1) * this.options.pageSize + index;
            return this.createRowHTML(row, rowIndex);
        }).join('');
    }

    /**
     * HTML de uma linha
     */
    createRowHTML(row, index) {
        const cells = this.options.columns.map(column => {
            const value = this.getCellValue(row, column);
            const formattedValue = column.formatter ? column.formatter(value, row, index) : value;
            
            return `<td class="${column.className || ''}">${formattedValue}</td>`;
        }).join('');

        const rowClassName = this.options.rowClassName ? 
            this.options.rowClassName(row, index) : '';

        return `<tr class="${rowClassName}" data-index="${index}">${cells}</tr>`;
    }

    /**
     * Obtém valor formatado da célula
     */
    getCellValue(row, column) {
        if (typeof column.key === 'function') {
            return column.key(row);
        }
        
        const keys = column.key.split('.');
        let value = row;
        
        for (const key of keys) {
            value = value?.[key];
        }
        
        return value !== undefined ? value : column.default || '';
    }

    /**
     * Manipula busca
     */
    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredData = [...this.options.data];
        } else {
            this.filteredData = this.options.data.filter(row => {
                return this.options.columns.some(column => {
                    const value = this.getCellValue(row, column);
                    return String(value).toLowerCase().includes(searchTerm);
                });
            });
        }

        this.currentPage = 1;
        this.render();
    }

    /**
     * Manipula ordenação
     */
    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.updateSortIcons();
        this.sortData();
        this.render();
    }

    /**
     * Ordena dados
     */
    sortData() {
        if (!this.sortColumn) return;

        const column = this.options.columns.find(col => col.key === this.sortColumn);
        if (!column) return;

        this.filteredData.sort((a, b) => {
            const valueA = this.getCellValue(a, column);
            const valueB = this.getCellValue(b, column);

            let comparison = 0;
            
            if (typeof column.compare === 'function') {
                comparison = column.compare(valueA, valueB);
            } else {
                comparison = String(valueA).localeCompare(String(valueB));
            }

            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * Atualiza ícones de ordenação
     */
    updateSortIcons() {
        this.container.querySelectorAll('.sort-icon').forEach(icon => {
            icon.className = 'sort-icon';
        });

        const activeHeader = this.container.querySelector(`[data-column="${this.sortColumn}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.className = `sort-icon fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
        }
    }

    /**
     * Obtém dados paginados
     */
    getPaginatedData() {
        if (!this.options.pagination) {
            return this.filteredData;
        }

        const start = (this.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        return this.filteredData.slice(start, end);
    }

    /**
     * Atualiza paginação
     */
    updatePagination() {
        if (!this.options.pagination) return;

        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        const startRecord = (this.currentPage - 1) * this.options.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.options.pageSize, this.filteredData.length);

        // Informações
        const infoElement = this.container.querySelector('.pagination-info');
        if (infoElement) {
            infoElement.textContent = `Mostrando ${startRecord}-${endRecord} de ${this.filteredData.length} registros`;
        }

        // Controles
        const controlsElement = this.container.querySelector('.pagination-controls');
        if (controlsElement) {
            controlsElement.innerHTML = this.createPaginationControls(totalPages);
        }
    }

    /**
     * HTML dos controles de paginação
     */
    createPaginationControls(totalPages) {
        if (totalPages <= 1) return '';

        let html = '<div class="btn-group">';

        // Botão anterior
        html += `
            <button class="btn btn-outline-secondary ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="dataTable.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Páginas
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : 'btn-outline-secondary'}" 
                        onclick="dataTable.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Botão próximo
        html += `
            <button class="btn btn-outline-secondary ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="dataTable.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += '</div>';
        return html;
    }

    /**
     * Vai para página específica
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        if (page < 1 || page > totalPages) return;

        this.currentPage = page;
        this.render();
    }

    /**
     * Define dados
     */
    setData(data) {
        this.options.data = data;
        this.filteredData = [...data];
        this.currentPage = 1;
        this.render();
    }

    /**
     * Adiciona dados
     */
    addData(data) {
        this.options.data.push(...data);
        this.setData(this.options.data);
    }

    /**
     * Remove dados
     */
    removeData(predicate) {
        this.options.data = this.options.data.filter(predicate);
        this.setData(this.options.data);
    }

    /**
     * Atualiza dados
     */
    updateData(predicate, updater) {
        this.options.data = this.options.data.map(item => {
            if (predicate(item)) {
                return updater(item);
            }
            return item;
        });
        this.setData(this.options.data);
    }

    /**
     * Mostra loading
     */
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        if (this.tableWrapper) {
            this.tableWrapper.style.display = 'none';
        }
        if (this.emptyElement) {
            this.emptyElement.style.display = 'none';
        }
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    /**
     * Mostra tabela
     */
    showTable() {
        if (this.tableWrapper) {
            this.tableWrapper.style.display = 'block';
        }
        if (this.emptyElement) {
            this.emptyElement.style.display = 'none';
        }
    }

    /**
     * Mostra mensagem de vazio
     */
    showEmpty() {
        if (this.tableWrapper) {
            this.tableWrapper.style.display = 'none';
        }
        if (this.emptyElement) {
            this.emptyElement.style.display = 'block';
        }
        if (this.paginationContainer) {
            this.paginationContainer.style.display = 'none';
        }
    }

    /**
     * Destroi componente
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Exportar para uso global
window.DataTable = DataTable;
