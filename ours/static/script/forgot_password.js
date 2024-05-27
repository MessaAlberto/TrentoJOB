document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('forgot_password_form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var email = document.getElementById('email').value;
        console.log(email);  // DEBUG
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/password', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('Success:', xhr.responseText);
                    alert('A reset link has been sent to your email address');
                } else if (xhr.status === 404) {
                    console.error('Error:', xhr.statusText);
                    alert('The email address does not exist. Please enter a valid email.');
                    document.getElementById('forgot_password_form').reset();  // Reset the form
                } else {
                    console.error('Error:', xhr.statusText);
                    alert('An error occurred. Please try again later.');
                }
            }
        };
        
        xhr.send(JSON.stringify({ email: email }));
    });
});
