let clickedMenu = 'events';

// Call setParagraphHeights when window is resized
window.addEventListener('resize', setParagraphHeights);

function toggleActive(button) {
    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });

    // Add 'active' class to the clicked button
    button.classList.add('active');
}

function toggleSearchContainer() {
    const searchContainer = document.getElementById('searchContainer');
    const listContainer = document.getElementById('listContainer');
    // Toggle the 'hidden' class on the search container
    if (searchContainer.classList.contains('hidden')) {
        searchContainer.classList.remove('hidden');
        listContainer.classList.remove('center-page');
    } else {
        searchContainer.classList.add('hidden');
        listContainer.classList.add('center-page');
    }
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

// Call fetch with search bar input
async function searchButtonFunction() {
    const searchInput = document.getElementById('searchInput').value;
    try {
        switch (clickedMenu) {
            case 'events':
                await fetchEvents(searchInput);
                break;
            case 'announcements':
                await fetchAnnouncements(searchInput);
                break;
            case 'users':
                await fetchUsers(searchInput);
                break;
            case 'organisations':
                await fetchOrganisations(searchInput);
                break;
            default:
                console.error('Invalid action:', clickedMenu);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch events from the server
async function fetchEvents(title = '') {
    clickedMenu = 'events';
    // Construct the URL with optional query parameters
    const url = `../events${title ? `?title=${title}` : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();

        const eventsContainer = document.getElementById('listContainer');
        // Clear the eventsContainer before adding new elements
        eventsContainer.innerHTML = '';

        for (const event of events) {
            const eventElement = document.createElement('div');
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


            // Fetch and set organizer username
            const organizerUsername = await fetchIdUsername('profiles/organisations', event.organizerID);
            const organizerElement = document.createElement('p');
            const keyOrganizer = document.createElement('span');
            const valueOrganizer = document.createElement('span'); // Changed to anchor tag
            keyOrganizer.innerHTML = `Organizer:`;
            valueOrganizer.innerHTML = organizerUsername.username;
            valueOrganizer.className = 'value';
            organizerElement.appendChild(keyOrganizer);
            organizerElement.appendChild(valueOrganizer);
            eventElement.appendChild(organizerElement);

            // Add click event listener to valueOrganizer
            valueOrganizer.addEventListener('click', () => {
                // Send fetch request with organization ID
                fetchOrganisationById(organizerUsername.id, 'events');
            });

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
        }
        // Adjust the height of the paragraphs
        setParagraphHeights();
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}


async function fetchAnnouncements(title = '') {
    clickedMenu = 'announcements';
    // Construct the URL with optional query parameters
    const url = `../announcements${title ? `?title=${title}` : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch announcements');
        }
        const announcements = await response.json();

        const announcementsContainer = document.getElementById('listContainer');
        announcementsContainer.innerHTML = '';

        announcements.forEach(announcement => {
            // Handle each announcement data
            // Here you can create elements and append them to announcementsContainer
        });

        // Adjust the height of the paragraphs
        setParagraphHeights();
    } catch (error) {
        console.error('Error fetching announcements:', error);
    }
}

async function fetchUsers(username = '') {
    clickedMenu = 'users';
    // Construct the URL with optional query parameters
    const url = `../profiles/users${username ? `?username=${username}` : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();

        const usersContainer = document.getElementById('listContainer');
        // Clear the usersContainer before adding new elements
        usersContainer.innerHTML = '';

        for (const user of users) {
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
        }

        // Adjust the height of the paragraphs
        setParagraphHeights();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function fetchOrganisations(username = '') {
    clickedMenu = 'organisations';
    // Construct the URL with optional query parameters
    const url = `../profiles/organisations${username ? `?username=${username}` : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch organisations');
        }
        const organisations = await response.json();

        const organisationsContainer = document.getElementById('listContainer');
        organisationsContainer.innerHTML = '';

        for (const organisation of organisations) {
            const organisationElement = document.createElement('div');
            organisationElement.classList.add('organisation-element');

            const usernameElement = document.createElement('h2');
            usernameElement.textContent = organisation.username;
            organisationElement.appendChild(usernameElement);

            const emailElement = document.createElement('p');
            const keyEmail = document.createElement('span');
            const valueEmail = document.createElement('span');
            keyEmail.innerHTML = `Email:`;
            valueEmail.innerHTML = organisation.email;
            valueEmail.className = 'value';
            emailElement.appendChild(keyEmail);
            emailElement.appendChild(valueEmail);
            organisationElement.appendChild(emailElement);

            const passwordElement = document.createElement('p');
            const keyPassword = document.createElement('span');
            const valuePassword = document.createElement('span');
            keyPassword.innerHTML = `Password:`;
            valuePassword.innerHTML = organisation.password;
            valuePassword.className = 'value';
            passwordElement.appendChild(keyPassword);
            passwordElement.appendChild(valuePassword);
            organisationElement.appendChild(passwordElement);

            const roleElement = document.createElement('p');
            const keyRole = document.createElement('span');
            const valueRole = document.createElement('span');
            keyRole.innerHTML = `Role:`;
            valueRole.innerHTML = organisation.role;
            valueRole.className = 'value';
            roleElement.appendChild(keyRole);
            roleElement.appendChild(valueRole);
            organisationElement.appendChild(roleElement);

            const birthdayElement = document.createElement('p');
            const keyBirthday = document.createElement('span');
            const valueBirthday = document.createElement('span');
            keyBirthday.innerHTML = `Birthday:`;
            valueBirthday.innerHTML = new Date(organisation.birthday).toLocaleDateString();
            valueBirthday.className = 'value';
            birthdayElement.appendChild(keyBirthday);
            birthdayElement.appendChild(valueBirthday);
            organisationElement.appendChild(birthdayElement);

            const phoneElement = document.createElement('p');
            const keyPhone = document.createElement('span');
            const valuePhone = document.createElement('span');
            keyPhone.innerHTML = `Phone:`;
            valuePhone.innerHTML = organisation.phone;
            valuePhone.className = 'value';
            phoneElement.appendChild(keyPhone);
            phoneElement.appendChild(valuePhone);
            organisationElement.appendChild(phoneElement);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetchDeleteButton('/organisations', organisation._id);
            });

            const buttonList = document.createElement('div');
            buttonList.classList.add('button-list');
            buttonList.appendChild(deleteButton);

            const container = document.createElement('span');
            container.classList.add('container');
            container.appendChild(organisationElement);
            container.appendChild(buttonList);
            organisationsContainer.appendChild(container);
        }

        // Adjust the height of the paragraphs
        setParagraphHeights();
    } catch (error) {
        console.error('Error fetching organisations:', error);
    }
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

async function fetchIdUsername(baseUrl, userID) {
    try {
        const response = await fetch(`../${baseUrl}/${userID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch username');
        }
        const user = await response.json();
        return { id: user._id, username: user.username }; // Return username and ID as an object
    } catch (error) {
        console.error('Object fetching username:', error);
        return { id: null, username: null }; // Return null values if an error occurs
    }
}


// Function to fetch organization by ID
async function fetchOrganisationById(organizationId, backUrl) {
    try {
        const response = await fetch(`../profiles/organisations/${organizationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch organization');
        }

        // Call toggleSearchContainer() function to hide the search container
        toggleSearchContainer();

        const organisationData = await response.json();
        const organisationContainer = document.getElementById('listContainer');
        organisationContainer.innerHTML = '';

        const organisationElement = document.createElement('div');
        organisationElement.classList.add('organisation-element');

        const usernameElement = document.createElement('h2');
        usernameElement.textContent = organisationData.username;
        organisationElement.appendChild(usernameElement);

        const emailElement = document.createElement('p');
        const keyEmail = document.createElement('span');
        const valueEmail = document.createElement('span');
        keyEmail.innerHTML = `Email:`;
        valueEmail.innerHTML = organisationData.email;
        valueEmail.className = 'value';
        emailElement.appendChild(keyEmail);
        emailElement.appendChild(valueEmail);
        organisationElement.appendChild(emailElement);

        const passwordElement = document.createElement('p');
        const keyPassword = document.createElement('span');
        const valuePassword = document.createElement('span');
        keyPassword.innerHTML = `Password:`;
        valuePassword.innerHTML = organisationData.password;
        valuePassword.className = 'value';
        passwordElement.appendChild(keyPassword);
        passwordElement.appendChild(valuePassword);
        organisationElement.appendChild(passwordElement);

        const roleElement = document.createElement('p');
        const keyRole = document.createElement('span');
        const valueRole = document.createElement('span');
        keyRole.innerHTML = `Role:`;
        valueRole.innerHTML = organisationData.role;
        valueRole.className = 'value';
        roleElement.appendChild(keyRole);
        roleElement.appendChild(valueRole);
        organisationElement.appendChild(roleElement);

        const birthdayElement = document.createElement('p');
        const keyBirthday = document.createElement('span');
        const valueBirthday = document.createElement('span');
        keyBirthday.innerHTML = `Birthday:`;
        valueBirthday.innerHTML = new Date(organisationData.birthday).toLocaleDateString();
        valueBirthday.className = 'value';
        birthdayElement.appendChild(keyBirthday);
        birthdayElement.appendChild(valueBirthday);
        organisationElement.appendChild(birthdayElement);

        const phoneElement = document.createElement('p');
        const keyPhone = document.createElement('span');
        const valuePhone = document.createElement('span');
        keyPhone.innerHTML = `Phone:`;
        valuePhone.innerHTML = organisationData.phone;
        valuePhone.className = 'value';
        phoneElement.appendChild(keyPhone);
        phoneElement.appendChild(valuePhone);
        organisationElement.appendChild(phoneElement);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/organisations', organisationData._id);
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => {
            toggleSearchContainer();
            switch (backUrl) {
                case 'events':
                    fetchEvents();
                    break;
                case 'announcements':
                    fetchAnnouncements();
                    break;
                case 'users':
                    fetchUsers();
                    break;
                case 'organisations':
                    fetchOrganisations();
                    break;
                default:
                    console.error('Invalid action:', backUrl);
            }
        });

        const buttonList = document.createElement('div');
        buttonList.classList.add('button-list');
        buttonList.appendChild(deleteButton);
        buttonList.appendChild(backButton);

        const container = document.createElement('span');
        container.classList.add('container');
        container.appendChild(organisationElement);
        container.appendChild(buttonList);
        organisationContainer.appendChild(container);

    } catch (error) {
        console.error('Error fetching organization:', error);
    }
}

