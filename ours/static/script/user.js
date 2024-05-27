document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    console.log('userId:', userId);

    if (userId) {
        fetchUser(userId);
    }
});

async function fetchUser(userId) {
    try {
        const response = await fetch(`/user/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const user = await response.json();

        // Popola la pagina HTML con i dati dell'utente
        document.getElementById('username').textContent = user.username || 'Unknown';
        document.getElementById('email').textContent = user.email || 'Unknown';
        // Aggiungi altri campi dell'utente qui, come birthday, phone, bio, ecc.

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}
