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

    // Prevent the default form submission behavior
    document.getElementById('user-sign-up').addEventListener('click', function (event) {
        event.preventDefault();
        signUp('user');
    });

    // Prevent the default form submission behavior
    document.getElementById('org-sign-up').addEventListener('click', function (event) {
        event.preventDefault();
        signUp('organisation');
    });

    document.getElementById('homeTitle').addEventListener('click', function () {
        window.location.href = "/index.html";
    });
});


function signUp(role) {
    if (role === 'user') {
        var username = document.getElementById('user-username').value;
        var email = document.getElementById('user-email').value;
        var password = document.getElementById('user-password').value;
        var repeatPassword = document.getElementById('user-repeat-password').value;
    } else if (role === 'organisation') {
        var username = document.getElementById('org-username').value;
        var email = document.getElementById('org-email').value;
        var password = document.getElementById('org-password').value;
        var repeatPassword = document.getElementById('org-repeat-password').value;
        var taxIdCode = document.getElementById('tax-id').value;
    }

    if (username === '' || email === '' || password === '' || repeatPassword === '' || (role === 'organisation' && taxIdCode === '')) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== repeatPassword) {
        alert("Passwords do not match.");
        return;
    }

    var formData = {
        username: username,
        email: email,
        password: password
    };

    if (role === 'organisation') {
        formData.taxIdCode = taxIdCode;
    }

    // Make a new XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/" + role, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Manage the response
    xhr.onload = function () {
        if (xhr.status === 201) {
            document.getElementById('successPage').classList.remove('hidden');
        } else if (xhr.status === 400) {
            var response = JSON.parse(xhr.responseText);
            alert(response.message);
        } else if (xhr.status === 401) {
            var response = JSON.parse(xhr.responseText);
            alert(response.error.details.map(detail => detail.message).join('\n'));
        } else {
            alert("An error occurred during registration.")
        }
    };

    console.log(JSON.stringify(formData));
    xhr.send(JSON.stringify(formData));
}

function goBack() {
    window.location.href = "/index.html";
}

function goToLogin() {
    window.location.href = "/logIn.html";
}