// Handle form submission
document.addEventListener('DOMContentLoaded', function () {
    const eventRegistrationForm = document.getElementById('event-registration-form');

    eventRegistrationForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(eventRegistrationForm);
        const url = eventRegistrationForm.getAttribute('action');

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                console.log('Event registration successful.');
                // Reindirizza il cliente alla pagina index.html dopo una registrazione di successo
                window.location.href = "/index.html";
            } else {
                console.error('Event registration failed.');
                alert('Event registration failed. Please try again later.');
            }
        } catch (error) {
            // Gestisci errori di rete o altri problemi
            console.error('An error occurred:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
