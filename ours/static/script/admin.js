let clickedMenu = 'events';

// Call setParagraphHeights when window is resized
window.addEventListener('resize', setParagraphHeights);


function toggleActive(button) {
    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(btn => {
        if (btn !== button) {
            console.log("btn remove active", btn);
            btn.classList.remove('active');
        }
    });
    
    // Add 'active' class to the clicked button
    button.classList.add('active');
    console.log("button add active", button);
}

// Function to set paragraph heights
function setParagraphHeights() {
    const paragraphs = document.querySelectorAll('.event-element p');
    paragraphs.forEach(paragraph => {
        const valueElements = paragraph.querySelectorAll('.value');
        let maxHeight = 0;
        valueElements.forEach(valueElement => {
            const height = valueElement.offsetHeight;
            maxHeight = Math.max(maxHeight, height);
        });
        paragraph.style.height = maxHeight + 'px';
    });
}

// Function to handle Enter key button on search input
function handleSearchKeyPress(event) {
    // Check if the pressed key is Enter (key code 13)
    if (event.keyCode === 13) {
        event.preventDefault();
        // Trigger the search function
        searchButtonFunction();
    }
}


// Call fetch whit search bar input
function searchButtonFunction() {
    const searchInput = document.getElementById('searchInput').value;
    switch (clickedMenu) {
        case 'events':
            fetchEvents(searchInput);
            break;
        case 'announcements':
            fetchAnnouncements(searchInput);
            break;
        case 'users':
            fetchUsers(searchInput);
            break;
        case 'organisations':
            fetchOrganisations(searchInput);
            break;
        default:
            console.error('Invalid action:', clickedMenu);
    }
}


// Fetch events from the server
function fetchEvents(title = '') {
    clickedMenu = 'events';
    // Construct the URL with optional query parameters
    const url = `../events${title ? `?title=${title}` : ''}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return response.json();
        })
        .then(events => {
            // Handle the events data and update the DOM
            const eventsContainer = document.getElementById('listContainer');

            // Clear the eventsContainer before adding new elements
            eventsContainer.innerHTML = '';

            events.forEach(event => {
                const eventElement = document.createElement('div');
                // it needs a class to run
                eventElement.classList.add('event-element');

                const titleElement = document.createElement('h2');
                titleElement.textContent = event.title;
                eventElement.appendChild(titleElement);

                const descriptionElement = document.createElement('p');
                const keyDesc = document.createElement('span');
                const valueDesc = document.createElement('span');
                keyDesc.innerHTML = `Description:`;
                valueDesc.innerHTML = event.description;
                valueDesc.className = 'value';
                descriptionElement.appendChild(keyDesc);
                descriptionElement.appendChild(valueDesc);
                eventElement.appendChild(descriptionElement);

                const dateElement = document.createElement('p');
                const keyDate = document.createElement('span');
                const valueDate = document.createElement('span');
                keyDate.innerHTML = `Date:`;
                valueDate.innerHTML = new Date(event.date).toLocaleDateString();
                valueDate.className = 'value';
                dateElement.appendChild(keyDate);
                dateElement.appendChild(valueDate);
                eventElement.appendChild(dateElement);

                const timeElement = document.createElement('p');
                const keyTime = document.createElement('span');
                const valueTime = document.createElement('span');
                keyTime.innerHTML = `Time:`;
                valueTime.innerHTML = event.time;
                valueTime.className = 'value';
                timeElement.appendChild(keyTime);
                timeElement.appendChild(valueTime);
                eventElement.appendChild(timeElement);

                const locationElement = document.createElement('p');
                const keyLocation = document.createElement('span');
                const valueLocation = document.createElement('span');
                keyLocation.innerHTML = `Location:`;
                valueLocation.innerHTML = event.location;
                valueLocation.className = 'value';
                locationElement.appendChild(keyLocation);
                locationElement.appendChild(valueLocation);
                eventElement.appendChild(locationElement);

                const organizerElement = document.createElement('p');
                const keyOrganizer = document.createElement('span');
                const valueOrganizer = document.createElement('span');
                keyOrganizer.innerHTML = `Organizer ID:`;
                valueOrganizer.innerHTML = event.organizerID;
                valueOrganizer.className = 'value';
                organizerElement.appendChild(keyOrganizer);
                organizerElement.appendChild(valueOrganizer);
                eventElement.appendChild(organizerElement);

                const participantsElement = document.createElement('p');
                const keyParticipants = document.createElement('span');
                const valueParticipants = document.createElement('span');
                keyParticipants.innerHTML = `Participants ID:`;
                valueParticipants.innerHTML = event.participantsID.join(', ');
                valueParticipants.className = 'value';
                participantsElement.appendChild(keyParticipants);
                participantsElement.appendChild(valueParticipants);
                eventElement.appendChild(participantsElement);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    fetchDeleteButton('/events', event._id);
                });

                const buttonList = document.createElement('div');
                buttonList.classList.add('button-list');
                buttonList.appendChild(deleteButton);

                const container = document.createElement('span');
                container.classList.add('container');
                container.appendChild(eventElement);
                container.appendChild(buttonList);
                eventsContainer.appendChild(container);
            })
            // Adjust the height of the paragraphs
            setParagraphHeights();
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

function fetchAnnouncements(title = '') {
    clickedMenu = 'announcements';
    // Construct the URL with optional query parameters
    const url = `../announcements${title ? `?title=${title}` : ''}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch announcements');
            }
            return response.json();
        })
        .then(announcements => {
            // Handle the announcements data and update the DOM
            const announcementsContainer = document.getElementById('listContainer');

            // Clear the announcementsContainer before adding new elements
            announcementsContainer.innerHTML = '';

            announcements.forEach(announcement => {
                // to do
            })
            // Adjust the height of the paragraphs
            setParagraphHeights();
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
        });
}


function fetchUsers(username = '') {
    clickedMenu = 'users';
    // Construct the URL with optional query parameters
    const url = `../profiles/users${username ? `?username=${username}` : ''}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(users => {
            // Handle the users data and update the DOM
            const usersContainer = document.getElementById('listContainer');

            // Clear the usersContainer before adding new elements
            usersContainer.innerHTML = '';

            users.forEach(user => {
                const userElement = document.createElement('div');
                // it needs a class to run
                userElement.classList.add('user-element');

                const usernameElement = document.createElement('h2');
                usernameElement.textContent = user.username;
                userElement.appendChild(usernameElement);

                const emailElement = document.createElement('p');
                const keyEmail = document.createElement('span');
                const valueEmail = document.createElement('span');
                keyEmail.innerHTML = `Email:`;
                valueEmail.innerHTML = user.email;
                valueEmail.className = 'value';
                emailElement.appendChild(keyEmail);
                emailElement.appendChild(valueEmail);
                userElement.appendChild(emailElement);

                const passwordElement = document.createElement('p');
                const keyPassword = document.createElement('span');
                const valuePassword = document.createElement('span');
                keyPassword.innerHTML = `Password:`;
                valuePassword.innerHTML = user.password;
                valuePassword.className = 'value';
                passwordElement.appendChild(keyPassword);
                passwordElement.appendChild(valuePassword);
                userElement.appendChild(passwordElement);

                const roleElement = document.createElement('p');
                const keyRole = document.createElement('span');
                const valueRole = document.createElement('span');
                keyRole.innerHTML = `Role:`;
                valueRole.innerHTML = user.role;
                valueRole.className = 'value';
                roleElement.appendChild(keyRole);
                roleElement.appendChild(valueRole);
                userElement.appendChild(roleElement);

                const birthdayElement = document.createElement('p');
                const keyBirthday = document.createElement('span');
                const valueBirthday = document.createElement('span');
                keyBirthday.innerHTML = `Birthday:`;
                valueBirthday.innerHTML = new Date(user.birthday).toLocaleDateString();
                valueBirthday.className = 'value';
                birthdayElement.appendChild(keyBirthday);
                birthdayElement.appendChild(valueBirthday);
                userElement.appendChild(birthdayElement);

                const phoneElement = document.createElement('p');
                const keyPhone = document.createElement('span');
                const valuePhone = document.createElement('span');
                keyPhone.innerHTML = `Phone:`;
                valuePhone.innerHTML = user.phone;
                valuePhone.className = 'value';
                phoneElement.appendChild(keyPhone);
                phoneElement.appendChild(valuePhone);
                userElement.appendChild(phoneElement);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    fetchDeleteButton('/users', user._id);
                });

                const buttonList = document.createElement('div');
                buttonList.classList.add('button-list');
                buttonList.appendChild(deleteButton);

                const container = document.createElement('span');
                container.classList.add('container');
                container.appendChild(userElement);
                container.appendChild(buttonList);
                usersContainer.appendChild(container);
            })
            // Adjust the height of the paragraphs
            setParagraphHeights();
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}


// which url to use? the problem is on title
function fetchOrganisations(username = '') {
    clickedMenu = 'organisations';
    // Construct the URL with optional query parameters
    const url = `../profiles/organisations${username ? `?username=${username}` : ''}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch organisations');
            }
            return response.json();
        })
        .then(organisations => {
            // Handle the organisations data and update the DOM
            const organisationsContainer = document.getElementById('listContainer');

            // Clear the organisationsContainer before adding new elements
            organisationsContainer.innerHTML = '';

            organisations.forEach(organisation => {
                // to do
            })
            // Adjust the height of the paragraphs
            setParagraphHeights();
        })
        .catch(error => {
            console.error('Error fetching organisations:', error);
        });
}


// baseURL is the URL to send the DELETE request to
function fetchDeleteButton(baseURL, eventId) {
    fetch(`${baseURL}/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId: eventId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        console.log('Event deleted successfully');
        fetchEvents();
    })
    .catch(error => {
        console.error('Error deleting event:', error);
    });
}