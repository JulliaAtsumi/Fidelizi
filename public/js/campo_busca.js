function buscar() {
      const termo = document.getElementById("search").value.toLowerCase();
      if (termo.trim() === "") {
        alert("Digite um termo para buscar.");
        return;
      }

      let texto = document.body.innerText.toLowerCase();
      if (texto.includes(termo)) {
        alert(`Resultados encontrados para "${termo}".`);
      } else {
        alert(`Nenhum resultado encontrado para "${termo}".`);
      }
    }

    // Envio do formulário simulado
    document.getElementById("contato").addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("msg-sucesso").style.display = "block";
      this.reset();
    });