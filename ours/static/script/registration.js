document.addEventListener('DOMContentLoaded', function () {
  const switchers = [...document.querySelectorAll('.switcher')]

  switchers.forEach(item => {
    item.addEventListener('click', function () {
      switchers.forEach(item => item.parentElement.classList.remove('is-active'))
      this.parentElement.classList.add('is-active')
      const bottomButton = document.querySelector('.bottom-button-list')
      bottomButton.classList.toggle('organisation');
    })
  })
});

function goBack() {
  window.location.href = "/index.html";
}

function goToLogin() {
  // redirect to registration page
  window.location.href = "/login.html";
}

function signUp() {
  var formData = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  // Effettua una richiesta HTTP POST per inviare i dati al server
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/auth/register", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  // Gestisci la risposta dalla richiesta
  xhr.onload = function () {
    if (xhr.status === 200) {
      alert("Registrazione completata con successo!");
    } else {
      alert("Si è verificato un errore durante la registrazione.");
    }
  };

  console.log(JSON.stringify(formData));
  xhr.send(JSON.stringify(formData));
}