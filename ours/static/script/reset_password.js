document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('reset-password-form').addEventListener('submit', function (e) {
        e.preventDefault();

        var token = new URLSearchParams(window.location.search).get('token');
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        console.log('Token:', token);
        console.log('Password:', password);

        var xhr = new XMLHttpRequest();
        xhr.open('PATCH', `/password/${token}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Password changed successfully');
                } else {
                    console.error('Errore durante il cambio della password:', xhr.statusText);
                }
            }
        };

        xhr.send(JSON.stringify({ password: password }));
    });
});
