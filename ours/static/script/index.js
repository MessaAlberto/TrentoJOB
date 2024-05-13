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

    document.body.addEventListener('click', function (event) {
        const sidebar = document.getElementById('sidebar');
        const profileIcon = document.getElementById('profileIcon');

        // Check if the clicked element is not the sidebar or profile icon
        if (!sidebar.contains(event.target) && !profileIcon.contains(event.target)) {
            sidebar.classList.add('hidden');
        }
    });


    const radioButtons = document.querySelectorAll('.tabs input[type="radio"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('click', function () {
            const value = this.value;
            switch (value) {
                case 'Event':
                    fetchEvents();
                    break;
                case 'Announcement':
                    fetchAnnouncements();
                    break;
                case 'User':
                    fetchUsers();
                    break;
                case 'Organisation':
                    fetchOrganisations();
                    break;
                default:
                    // Default case
                    break;
            }
        });
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
    usernameLabel.textContent = username;
    userProfile.classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}





function fetchEvents() {

    console.log('Event tab selected');
}

function fetchAnnouncements() {
    // Your code for handling the announcement tab
    console.log('Announcement tab selected');
}

function fetchUsers() {
    // Your code for handling the user tab
    console.log('User tab selected');
}

function fetchOrganisations() {
    // Your code for handling the organisation tab
    console.log('Organisation tab selected');
}
