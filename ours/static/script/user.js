document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const role = params.get('role'); 
    
    if (userId) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/' + role + '/' + userId, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const user = JSON.parse(xhr.responseText);
                    const container = document.getElementById('container');

                    if(role === 'user') {
                        buildUserProfile(container, user, user.username);
                        document.getElementById('username').textContent = user.username || 'Unknown';
                        document.getElementById('email').textContent = user.email || 'Unknown';
            
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
            
                        document.getElementById('phone').textContent = user.phone || 'Unknown';
                        document.getElementById('sex').textContent = user.sex || 'Unknown';
                        document.getElementById('taxIdCode').textContent = user.taxIdCode || 'Unknown';
                        document.getElementById('bio').textContent = user.bio || 'Unknown';
                    } else if(role === 'organisation') {
                        buildOrganisationProfile(container, user, user.username);
                        document.getElementById('username').textContent = user.username || 'Unknown';
                        document.getElementById('email').textContent = user.email || 'Unknown';
                        document.getElementById('taxIdCode').textContent = user.taxIdCode || 'Unknown';
                        document.getElementById('bio').textContent = user.bio || 'Unknown';
                    }
                } else {
                    console.error('Error fetching user profile:', xhr.statusText);
                }
            }
        };
        xhr.send();
    } else {
        console.error('User ID not found in URL');
    }
});

function buildUserProfile(container, user, username) {
    container.innerHTML = `
        <h3>Profile of ${username}</h3>
        <form id="profileForm">
            ${createCommonFields(user)}
            <div class="form-group">
                <label for="birthday">Date of Birth:</label>
                <input type="date" class="form-control" id="birthday" name="birthday" autocomplete="bday" disabled>
            </div>
            <div class="form-group">
                <label for="phone">Phone:</label>
                <input type="number" class="form-control" id="phone" name="phone" autocomplete="phone" disabled>
            </div>
            <div class="form-group">
                <label for="sex">Sex:</label>
                <input type="text" class="form-control" id="sex" name="sex" autocomplete="sex" disabled>
            </div>
            <div class="form-group">
                <label for="taxIdCode">Tax ID Code:</label>
                <input type="text" class="form-control" id="taxIdCode" name="taxIdCode" autocomplete="taxIdCode" disabled>
            </div>
            <div class="form-group">
                <label for="bio">Description:</label>
                <input type="text" class="form-control" id="bio" name="bio" autocomplete="bio" disabled>
            </div>
        </form>
    `;
}

function buildOrganisationProfile(container, user, username) {
    container.innerHTML = `
        <h3>Profile of ${username}</h3>
        <form id="profileForm">
            ${createCommonFields(user)}
            <div class="form-group">
                <label for="taxIdCode">Tax ID Code:</label>
                <input type="text" class="form-control" id="taxIdCode" name="taxIdCode" autocomplete="taxIdCode" disabled>
            </div>
            <div class="form-group">
                <label for="bio">Description:</label>
                <input type="text" class="form-control" id="bio" name="bio" autocomplete="bio" disabled>
            </div>
            </form>
    `;
}

function createCommonFields(user) {
    return `
        <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" class="form-control" id="username" name="username" value="${user.username}" autocomplete="username" disabled>
        </div>
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" class="form-control" id="email" name="email" value="${user.email}" autocomplete="email" disabled>
        </div>
    `;
}
