function showHideTaxCodeField() {
  var checkBox = document.getElementById("isEntity");
  var taxCodeField = document.getElementById("taxCodeField");

  // Se il checkbox è spuntato, mostra il campo del codice fiscale, altrimenti nascondilo
  taxCodeField.style.display = checkBox.checked ? "block" : "none";
}

function signUp() {
  // Ottenere i dati del modulo
  var formData = {
      // Supponiamo di avere campi come name, email, password, ecc.
      // Qui puoi recuperare i dati dai campi del modulo HTML
      // Ad esempio:
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
      // Aggiungi altri campi se necessario
  };

  // Effettua una richiesta HTTP POST per inviare i dati al server
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/auth/register", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  // Gestisci la risposta dalla richiesta
  xhr.onload = function() {
      if (xhr.status === 200) {
          // Successo, fai qualcosa come mostrare un messaggio di conferma
          alert("Registrazione completata con successo!");
      } else {
          // Qualcosa è andato storto, gestisci l'errore
          alert("Si è verificato un errore durante la registrazione.");
      }
  };
  
 console.log(JSON.stringify(formData));
  // Converti i dati del modulo in formato JSON e inviali con la richiesta
  xhr.send(JSON.stringify(formData));
}

// Funzione per attivare o disattivare la classe 'active' su un elemento
function toggleActive(element) {
  element.classList.toggle('active');
}