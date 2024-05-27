function goBack() {
    window.location.href = "/index.html";
}

function goToRegistration() {
    // Redirect to registration page
    window.location.href = "/registration.html";
}

function goToForgotPassword(){
    // Redirect to forgot password page
    window.location.href = "/forgot_password.html";
}

document.addEventListener('DOMContentLoaded', function () {
    // Prevent the default form submission behavior
    document.getElementById('loginButton').addEventListener('click', function (event) {
        event.preventDefault();
        login();
    });
});


function login() {
    var formData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };
    
    // Create a new XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/auth", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Manage the response
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Parse the response JSON
            var response = JSON.parse(xhr.responseText);

            // Store user ID and token in local storage
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('username', response.username);
            localStorage.setItem('role', response.role);
            localStorage.setItem('token', response.token);
            window.location.href = "/index.html";
        } else {
            alert("An error occurred during login.");
        }
    };

    xhr.send(JSON.stringify(formData));
}