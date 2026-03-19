// Função para alternar para Pessoa Física
function form_pf() {
    const formPF = document.getElementById('form_pf');
    const formPJ = document.getElementById('form_pj');
    const btnPF = document.getElementById('pf');
    const btnPJ = document.getElementById('pj');
    
    // Mostrar formulário PF e esconder PJ
    formPF.style.display = 'block';
    formPJ.style.display = 'none';
    
    // Atualizar classes dos botões para mostrar qual está ativo
    btnPF.classList.add('botao-principal');
    btnPF.classList.remove('botao-pessoa');
    btnPJ.classList.remove('botao-principal');
    btnPJ.classList.add('botao-pessoa');
}

// Função para alternar para Pessoa Jurídica
function form_pj() {
    const formPF = document.getElementById('form_pf');
    const formPJ = document.getElementById('form_pj');
    const btnPF = document.getElementById('pf');
    const btnPJ = document.getElementById('pj');
    
    // Mostrar formulário PJ e esconder PF
    formPF.style.display = 'none';
    formPJ.style.display = 'block';
    
    // Atualizar classes dos botões para mostrar qual está ativo
    btnPJ.classList.add('botao-principal');
    btnPJ.classList.remove('botao-pessoa');
    btnPF.classList.remove('botao-principal');
    btnPF.classList.add('botao-pessoa');
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de clique no botão PJ
    document.getElementById('pj').addEventListener('click', form_pj);
    
    // Iniciar com Pessoa Física como padrão
    form_pf();
});