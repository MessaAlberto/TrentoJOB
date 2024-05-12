function signUp() {
    window.location.href = "registration.html"; // Modifica questo URL con il percorso del tuo file HTML di registrazione
}

function logIn() {
  window.location.href = "logIn.html"; // Modifica questo URL con il percorso del tuo file HTML di registrazione
}
  
function toggleActive(button) {
    // Qui puoi aggiungere il codice per attivare/disattivare lo stato del pulsante se necessario
}

var map = L.map('map').setView([46.06685578571241, 11.118635547295556], 12,8); // Imposta la vista della mappa su una certa posizione e livello di zoom
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Aggiunge un layer di mappe di OpenStreetMap
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
