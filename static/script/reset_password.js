document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('reset-password-form').addEventListener('submit', function (e) {
        e.preventDefault();

        var urlParams = new URLSearchParams(window.location.search);
        var _id = urlParams.get('userId');
        var token = urlParams.get('token');
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        console.log('Token:', token);
        console.log('Password:', password);
        console.log('ID: ', _id);

        var xhr = new XMLHttpRequest();
        xhr.open('PATCH', `/password/${token}/${_id}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    window.location.href = './logIn.html';
                    alert('Password changed successfully');
                } else {

                    console.error('Errore durante il cambio della password:', xhr.statusText);
                }
            }
        };

        xhr.send(JSON.stringify({
            password: password
        }));
    });
});
