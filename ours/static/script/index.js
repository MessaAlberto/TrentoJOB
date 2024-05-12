document.addEventListener('DOMContentLoaded', function () {
    // Check if user ID is present in localStorage
    var userId = localStorage.getItem('userId');
    if (userId) {
        var username = localStorage.getItem('username');
        if (username) {
            displayUserProfile(username);
        }
    }


    var usernameLabel = document.getElementById('usernameLabel');
    if (usernameLabel) {
        usernameLabel.addEventListener('click', function () {
            window.location.href = "/me.html"; // Redirect to /me page
        });
    }
    var profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function () {
            toggleSidebar();
        });
    }

    document.body.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebar');
        const profileIcon = document.getElementById('profileIcon');
    
        // Check if the clicked element is not the sidebar or profile icon
        if (!sidebar.contains(event.target) && !profileIcon.contains(event.target)) {
            sidebar.classList.add('hidden');
        }
    });
    
});

// Importa Leaflet
import L from 'leaflet';

// URL dell'API per ottenere gli eventi dal backend
const eventsAPI = '/event';

// Funzione per ottenere gli eventi dal backend e visualizzarli sulla mappa
async function fetchAndDisplayEvents() {
    try {
        // Ottieni gli eventi dal backend
        const response = await fetch(eventsAPI);
        const events = await response.json();

        // Inizializza la mappa Leaflet
        const map = L.map('map').setView([51.505, -0.09], 13);

        // Aggiungi layer di mappe di base
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Itera sugli eventi e aggiungi marker alla mappa per ciascun evento
        events.forEach(event => {
            const { latitude, longitude, title } = event;
            L.marker([latitude, longitude]).addTo(map).bindPopup(title);
        });
    } catch (error) {
        console.error('Errore durante il recupero degli eventi:', error);
    }
}

// Chiama la funzione per ottenere ed visualizzare gli eventi sulla mappa
fetchAndDisplayEvents();


function signUp() {
    window.location.href = "registration.html";
}

function login() {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');

    // Call the delete /auth
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/auth", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = "/index.html";
        } else {
            alert("Si è verificato un errore durante il logout.");
        }
    };
    xhr.send();
}


function displayUserProfile(username) {
    const singInUp = document.getElementById('sign-in-up');
    const userProfile = document.getElementById('profile-icon');
    const usernameLabel = document.getElementById('usernameLabel');

    singInUp.classList.add('hidden');
    usernameLabel.textContent = username;
    userProfile.classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}
