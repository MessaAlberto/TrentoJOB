document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('homeTitle').addEventListener('click', function () {
        window.location.href = "/index.html";
    });

    fetchUserProfile();
});

function validateTaxIdCode(taxIdCode) {
    const cfRegex = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;
    return cfRegex.test(taxIdCode);
}


function fetchUserProfile() {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!userId) {
        alert("Utente non loggato.");
        window.location.href = "/index.html";
        return;
    }

    const url = "/" + role + "/" + userId;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token')); // Aggiungiamo l'header di autorizzazione
    xhr.onload = function () {
        if (xhr.status === 200) {
            const user = JSON.parse(xhr.responseText);

            const container = document.getElementById('container');

            if (role === 'user') {
                buildUserProfile(container, user);
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                // Format the date(dd-mm-yyyy to yyyy-mm-dd)
                if (user.birthday) {
                    const birthday = new Date(user.birthday);
                    if (!isNaN(birthday)) {
                        const formattedDate = birthday.toISOString().split('T')[0];
                        document.getElementById('birthday').value = formattedDate;
                    } else {
                        console.error("Invalid birthdate format:", user.birthday);
                    }
                }

                document.getElementById('phone').value = user.phone || '';
                document.getElementById('sex').value = user.sex || '';
                document.getElementById('taxIdCode').value = user.taxIdCode || '';
                document.getElementById('bio').value = user.bio || '';
            } else {
                buildOrganisationProfile(container, user);
                document.getElementById('taxIdCode').value = user.taxIdCode || '';
                document.getElementById('phone').value = user.phone || '';
                document.getElementById('bio').value = user.bio || '';
            }
        } else {
            alert("Errore nel caricamento del profilo.");
        }
    };
    xhr.send();
}

function updateProfile() {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!userId) {
        alert("User not logged in.");
        window.location.href = "/index.html";
        return;
    }

    const url = "/" + role + "/" + userId;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = "/me.html";
            alert("Profile updated successfully.");
        } else {
            alert("Error updating profile.");
        }
    };

    const userData = {};
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;

    if (role === 'user') {
        const birthday = document.getElementById('birthday').value;
        const phone = document.getElementById('phone').value;
        const sex = document.getElementById('sex').value;
        const taxIdCode = document.getElementById('taxIdCode').value;

        if (taxIdCode !== '' && !validateTaxIdCode(taxIdCode)) {
            alert("Invalid tax ID code.");
            return;
        }

        Object.assign(userData, {
            username: username,
            email: email,
            birthday: birthday,
            phone: phone,
            sex: sex,
            taxIdCode: taxIdCode,
            bio: bio
        });
    } else {
        Object.assign(userData, {
            username: username,
            email: email,
            bio: bio
        });
    }

    // Remove empty fields from userData
    for (const key in userData) {
        if (userData[key] === '') {
            delete userData[key];
        }
    }

    // Send userData if it's not empty
    if (Object.keys(userData).length > 0) {
        const data = JSON.stringify(userData);
        xhr.send(data);
    } else {
        console.error("No data to send.");
    }
}


function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');

    const xhr = new XMLHttpRequest();
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

function goToResetPassword() {
    window.location.href = "./resetPassword.html";
}

function buildUserProfile(container, user) {
    container.innerHTML = `
        <h3>Il tuo profilo</h3>
        <form id="profileForm">
            ${createCommonFields()}
            <div class="form-group">
                <label for="birthday">Data di nascita:</label>
                <input type="date" class="form-control" id="birthday" name="birthday" autocomplete="bday">
            </div>
            <div class="form-group">
                <label for="phone">Telefono:</label>
                <input type="text" class="form-control" id="phone" name="phone" autocomplete="phone">
            </div>
            <div class="form-group">
                <label for="sex">Sesso:</label>
                <input type="text" class="form-control" id="sex" name="sex" autocomplete="sex">
            </div>
            <div class="form-group">
                <label for="taxIdCode">Codice Fiscale:</label>
                <input type="text" class="form-control" id="taxIdCode" name="taxIdCode" autocomplete="taxIdCode">
            </div>
            <div class="form-group">
                <label for="bio">Descrizione:</label>
                <input type="text" class="form-control" id="bio" name="bio" autocomplete="bio">
            </div>
            <button type="button" class="btn btn-primary" onclick="updateProfile('user')">Update</button>
            <button type="button" class="btn btn-danger" onclick="goToResetPassword">Forgot Password?</button>
        </form>
    `;

    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
}

function buildOrganisationProfile(container, user) {
    container.innerHTML = `
        <h3>Profilo Organizzazione</h3>
        <form id="profileForm">
            ${createCommonFields()}
            <div class="form-group">
                <label for="taxIdCode">Codice Fiscale:</label>
                <input type="text" class="form-control" id="taxIdCode" name="taxIdCode" autocomplete="taxIdCode" disabled>
            </div>
            <div class="form-group">
                <label for="phone">Telefono:</label>
                <input type="text" class="form-control" id="phone" name="phone" autocomplete="phone">
            </div>
            <div class="form-group">
                <label for="bio">Descrizione:</label>
                <input type="text" class="form-control" id="bio" name="bio" autocomplete="bio">
            </div>
            <button type="button" class="btn btn-primary" onclick="updateProfile('user')">Update</button>
            <button type="button" class="btn btn-danger" onclick="goToResetPassword">Forgot Password?</button>
            </form>
    `;

    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
}

function createCommonFields() {
    return `
        <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" class="form-control" id="username" name="username" value="username" autocomplete="username">
        </div>
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" class="form-control" id="email" name="email" value="email" autocomplete="email">
        </div>
    `;
}

