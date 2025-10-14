
function togglePassword(id) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

function validarSenhas() {
  const senha = document.getElementById("senha").value;
  const confirma = document.getElementById("confirmaSenha").value;
  if (senha !== confirma) {
    alert("As senhas não coincidem!");
    return false;
  }
  alert("Cadastro realizado com sucesso! (simulação)");
  return true;
}


function simularEnvio() {
  const email = document.getElementById("email").value;
  alert(`Um link de recuperação foi enviado para ${email} (simulação).`);
  return false;
}
