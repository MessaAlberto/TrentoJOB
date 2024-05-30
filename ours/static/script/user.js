document.addEventListener('DOMContentLoaded', function () {
    // Ottenere l'ID utente dall'URL
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id'); // Ottieni l'ID utente dal parametro 'id' nella URL

    console.log('User profile:', userId);
    if (userId) {
        // Creare una nuova richiesta XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/user/${userId}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const user = JSON.parse(xhr.responseText);
                    console.log('User profile:', user);
                
                    document.getElementById('username').textContent = user.username || 'Unknown';
                    document.getElementById('email').textContent = user.email || 'Unknown';
                    document.getElementById('birthday').textContent = user.birthday || 'Unknown';
                    document.getElementById('phone').textContent = user.phone || 'Unknown';
                    document.getElementById('sex').textContent = user.sex || 'Unknown';
                    document.getElementById('taxIdCode').textContent = user.taxIdCode || 'Unknown';
                    document.getElementById('bio').textContent = user.bio || 'Unknown';

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
