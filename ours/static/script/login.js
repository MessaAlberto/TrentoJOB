function goBack() {
    window.location.href = "/index.html";
}

function goToRegistration() {
    // redirect to registration page
    window.location.href = "/registration.html";
}


// Handle form submission
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    console.log(loginForm);
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const url = loginForm.getAttribute('action');

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            console.log(formData);
            if (response.ok) {
                window.location.href = "/index.html";
            } else {
                alert('Login failed. Please check your credentials and try again.');
            }
        } catch (error) {
            // Handle network errors or other issues
            console.error('Error occurred:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});