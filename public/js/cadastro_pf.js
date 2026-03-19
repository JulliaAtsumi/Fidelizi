// js/cadastro_pf.js
// Cadastro de Pessoa Física com Firebase

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form_cad');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            cadastrarPF();
        });
    }
});

function cadastrarPF() {
    const inputs = document.querySelectorAll('#form_cad input');
    const nome = inputs[0].value.trim();
    const cpf = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const password = inputs[3].value;

    // Validação
    if (!nome || !email || !password) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    // Criar usuário no Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Preparar dados para Firestore
            const userData = {
                email: email,
                perfil: 'usuario', // Por padrão, usuário comum
                tipo: 'pf',
                nome: nome,
                cpf: cpf,
                dataCadastro: firebase.firestore.Timestamp.now(),
                ativo: true
            };

            // Salvar no Firestore
            return db.collection('users').doc(user.uid).set(userData);
        })
        .then(() => {
            alert('Cadastro realizado com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        })
        .catch((error) => {
            console.error('Erro ao cadastrar:', error);
            let errorMessage = 'Erro ao cadastrar usuário.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este e-mail já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
                    break;
                default:
                    errorMessage = 'Erro ao cadastrar: ' + error.message;
            }

            alert(errorMessage);
        });
}
