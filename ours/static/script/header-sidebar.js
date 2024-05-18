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

    // 
    var profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function () {
            toggleSidebar();
        });
    }

    // Hide sidebar
    document.getElementById('sidebar').addEventListener('mouseleave', function () {  
        toggleSidebar();
    });
    document.addEventListener('mousemove', function(event) {
        var mouseX = event.clientX;
        var windowWidth = window.innerWidth;
        const sidebar = document.getElementById('sidebar');
    
        if (mouseX < windowWidth - 220) {
            sidebar.classList.add('hidden');
        }
    });
});


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
    usernameLabel.innerHTML = username;
    userProfile.classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}
