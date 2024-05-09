let clickedMenu = 'events';
let searchContainerHidden = true;
// back page array of pair <backUrl, id>
let backPage = [];


// Call setParagraphHeights when window is resized
window.addEventListener('resize', setParagraphHeights);

function toggleActive(button) {
    searchContainerHidden = false;
    toggleSearchContainer();
    // Clear the backPage array
    backPage = [];
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

    if (searchContainerHidden) {
        searchContainer.classList.add('hidden');
        listContainer.classList.add('center-page');
    } else {
        searchContainer.classList.remove('hidden');
        listContainer.classList.remove('center-page');
    }
}

// Function to set paragraph heights
function setParagraphHeights() {
    const paragraphs = document.querySelectorAll('p');
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


// back switch button
function backButtonFunction() {
    // Get the last element from the backPage array
    const [backUrl, backId] = backPage.pop();

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
        case 'eventById':
            fetchEventById(backId);
            break;
        case 'announcementsById':
            fetchAnnouncementById(backId);
            break;
        case 'userById':
            fetchUserById(backId);
            break;
        case 'organisationById':
            fetchOrganisationById(backId);
            break;
        default:
            console.error('Invalid action:', backUrl);
    }
}


function createKeyValueElement(keyText, valueText) {
    const paragraph = document.createElement('p');
    const keySpan = document.createElement('span');
    const valueSpan = document.createElement('span');
    keySpan.textContent = `${keyText}:`;
    valueSpan.textContent = valueText;
    valueSpan.classList.add('value');
    paragraph.appendChild(keySpan);
    paragraph.appendChild(valueSpan);
    return paragraph;
}


async function createKeyValueClickableElement(keyText, valueText, baseURL, backUrl, backId) {
    const listIdUsername = [];
    if (baseURL === 'organisations' || baseURL === 'users') {
        for (const id of valueText) {
            const idUsername = await fetchIdUsername(baseURL, id);
            listIdUsername.push({ id: idUsername.id, username: idUsername.username });
        }
    } else if (baseURL === 'events' || baseURL === 'announcements') {
        for (const id of valueText) {
            const idUsername = await fetchIdTitle(baseURL, id);
            listIdUsername.push({ id: idUsername.id, username: idUsername.title });
        }
    }

    const paragraph = document.createElement('p');
    const keySpan = document.createElement('span');
    keySpan.textContent = `${keyText}:`;
    paragraph.appendChild(keySpan);

    const valueSpan = document.createElement('span');
    valueSpan.classList.add('value');
    listIdUsername.forEach(idUsername => {
        const span = document.createElement('span');
        span.textContent = idUsername.username;

        // Add class to make the span clickable
        span.classList.add('clickable-span-list');
        span.addEventListener('click', () => {
            // Push the current page to the backPage array
            backPage.push([backUrl, backId]);
            switch (baseURL) {
                case 'organisations':
                    fetchOrganisationById(idUsername.id);
                    break;
                case 'users':
                    fetchUserById(idUsername.id);
                    break;
                case 'events':
                    fetchEventById(idUsername.id);
                    break;
                case 'announcements':
                    fetchAnnouncementById(idUsername.id);
                    break;
                default:
                    console.error('Invalid action.');
            }
        });

        valueSpan.appendChild(span);

        // Add a comma after each username except the last one
        if (idUsername !== listIdUsername[listIdUsername.length - 1]) {
            valueSpan.appendChild(document.createTextNode(', '));
        }
    });
    paragraph.appendChild(valueSpan);
    return paragraph;
}


// Fetch events from the server
async function fetchEvents(title = '') {
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

            eventElement.appendChild(createKeyValueElement('Description', event.description));
            eventElement.appendChild(createKeyValueElement('Date', new Date(event.date).toLocaleDateString()));
            eventElement.appendChild(createKeyValueElement('Time', event.time));
            eventElement.appendChild(createKeyValueElement('Location', event.location));
            eventElement.appendChild(createKeyValueElement('Expired', event.expired));
            eventElement.appendChild(await createKeyValueClickableElement('Organizer', [event.organizerId], 'organisations', 'events'));
            eventElement.appendChild(createKeyValueElement('Max Participants', event.maxNumberParticipants));
            if (event.participantsId.length !== 0) {
                eventElement.appendChild(await createKeyValueClickableElement('Participants', event.participantsId, 'users', 'events'));
            } else
                eventElement.appendChild(createKeyValueElement('Participants', ''));

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

        for (const announcement of announcements) {
            const announcementElement = document.createElement('div');
            announcementElement.classList.add('announcement-element');

            const titleElement = document.createElement('h2');
            titleElement.textContent = announcement.title;
            announcementElement.appendChild(titleElement);

            announcementElement.appendChild(createKeyValueElement('Description', announcement.description));
            announcementElement.appendChild(createKeyValueElement('Date Begin', new Date(announcement.date_begin).toLocaleDateString()));
            announcementElement.appendChild(createKeyValueElement('Date Stop', new Date(announcement.date_stop).toLocaleDateString()));
            announcementElement.appendChild(createKeyValueElement('Time Begin', announcement.time_begin));
            announcementElement.appendChild(createKeyValueElement('Time Stop', announcement.time_stop));
            announcementElement.appendChild(createKeyValueElement('Location', announcement.location));
            announcementElement.appendChild(await createKeyValueClickableElement('Owner', [announcement.ownerId], 'organisations', 'announcements'));
            announcementElement.appendChild(createKeyValueElement('Max Participants', announcement.maxNumberParticipants));
            if (announcement.participantsID.length !== 0)
                announcementElement.appendChild(await createKeyValueClickableElement('Participants', announcement.participantsID, 'users', 'announcements'));
            else
                announcementElement.appendChild(createKeyValueElement('Participants', ''));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetchDeleteButton('/announcements', announcement._id);
            });

            const buttonList = document.createElement('div');
            buttonList.classList.add('button-list');
            buttonList.appendChild(deleteButton);

            const container = document.createElement('span');
            container.classList.add('container');
            container.appendChild(announcementElement);
            container.appendChild(buttonList);
            announcementsContainer.appendChild(container);
        }

        // Adjust the height of the paragraphs
        setParagraphHeights();
    } catch (error) {
        console.error('Error fetching announcements:', error);
    }
}

async function fetchUsers(username = '') {
    // Construct the URL with optional query parameters
    const url = `../users${username ? `?username=${username}` : ''}`;

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

            userElement.appendChild(createKeyValueElement('Email', user.email));
            userElement.appendChild(createKeyValueElement('Password', user.password));
            userElement.appendChild(createKeyValueElement('Role', user.role));
            userElement.appendChild(createKeyValueElement('Birthday', new Date(user.birthday).toLocaleDateString()));
            userElement.appendChild(createKeyValueElement('Phone', user.phone));
            userElement.appendChild(createKeyValueElement('Sex', user.sex));
            userElement.appendChild(createKeyValueElement('Tax ID Code', user.taxIdCode));
            userElement.appendChild(createKeyValueElement('Bio', user.bio));
            if (user.subscribedEventsId.length !== 0)
                userElement.appendChild(await createKeyValueClickableElement('Subscribed Events', user.subscribedEventsId, 'events', 'users'));
            else
                userElement.appendChild(createKeyValueElement('Subscribed Events', ''));

            if (user.subscribedExpiredEventsId.length !== 0)
                userElement.appendChild(await createKeyValueClickableElement('Subscribed Expired Events', user.subscribedExpiredEventsId, 'events', 'users'));
            else
                userElement.appendChild(createKeyValueElement('Subscribed Expired Events', ''));

            if (user.activeAnnouncementsId.length !== 0)
                userElement.appendChild(await createKeyValueClickableElement('Active Announcements', user.activeAnnouncementsId, 'announcements', 'users'));
            else
                userElement.appendChild(createKeyValueElement('Active Announcements', ''));

            if (user.expiredAnnouncementsId.length !== 0)
                userElement.appendChild(await createKeyValueClickableElement('Expired Announcements', user.expiredAnnouncementsId, 'announcements', 'users'));
            else
                userElement.appendChild(createKeyValueElement('Expired Announcements', ''));


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
    // Construct the URL with optional query parameters
    const url = `../organisations${username ? `?username=${username}` : ''}`;

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

            organisationElement.appendChild(createKeyValueElement('Email', organisation.email));
            organisationElement.appendChild(createKeyValueElement('Password', organisation.password));
            organisationElement.appendChild(createKeyValueElement('Role', organisation.role));
            organisationElement.appendChild(createKeyValueElement('Tax ID Code', organisation.taxIdCode));
            organisationElement.appendChild(createKeyValueElement('Bio', organisation.bio));
            if (organisation.activeEventsId.length !== 0)
                organisationElement.appendChild(await createKeyValueClickableElement('Active Events', organisation.activeEventsId, 'events', 'organisations'));
            else
                organisationElement.appendChild(createKeyValueElement('Active Events', ''));

            if (organisation.expiredEventsId.length !== 0)
                organisationElement.appendChild(await createKeyValueClickableElement('Expired Events', organisation.expiredEventsId, 'events', 'organisations'));
            else
                organisationElement.appendChild(createKeyValueElement('Expired Events', ''));


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
function fetchDeleteButton(baseURL, objectId) {
    fetch(`${baseURL}/${objectId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objectId: objectId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete');
            }
            console.log('Deleted successfully');
            fetchEvents();
        })
        .catch(error => {
            console.error('Error deleting:', error);
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

async function fetchIdTitle(baseURL, userID) {
    try {
        const response = await fetch(`../${baseURL}/${userID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch title');
        }
        const user = await response.json();
        return { id: user._id, title: user.title }; // Return title and ID as an object
    } catch (error) {
        console.error('Object fetching title:', error);
        return { id: null, title: null }; // Return null values if an error occurs
    }
}


async function fetchEventById(eventId) {
    try {
        const response = await fetch(`../events/${eventId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch event');
        }

        // Call toggleSearchContainer() function to hide the search container
        searchContainerHidden = true;
        toggleSearchContainer();

        const eventData = await response.json();
        const eventContainer = document.getElementById('listContainer');
        eventContainer.innerHTML = '';

        const eventElement = document.createElement('div');
        eventElement.classList.add('event-element');

        const titleElement = document.createElement('h2');
        titleElement.textContent = eventData.title;
        eventElement.appendChild(titleElement);

        eventElement.appendChild(createKeyValueElement('Description', eventData.description));
        eventElement.appendChild(createKeyValueElement('Date', new Date(eventData.date).toLocaleDateString()));
        eventElement.appendChild(createKeyValueElement('Time', eventData.time));
        eventElement.appendChild(createKeyValueElement('Location', eventData.location));
        eventElement.appendChild(createKeyValueElement('Expired', eventData.expired));
        eventElement.appendChild(await createKeyValueClickableElement('Organizer', [eventData.organizerId], 'organisations', 'eventById', eventId));
        eventElement.appendChild(createKeyValueElement('Max Participants', eventData.maxNumberParticipants));
        if (eventData.participantsId.length !== 0)
            eventElement.appendChild(await createKeyValueClickableElement('Participants', eventData.participantsId, 'users', 'eventById', eventId));
        else
            eventElement.appendChild(createKeyValueElement('Participants', ''));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/events', eventData._id);
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => {
            backButtonFunction();
        });

        const buttonList = document.createElement('div');
        buttonList.classList.add('button-list');
        buttonList.appendChild(deleteButton);
        buttonList.appendChild(backButton);

        const container = document.createElement('span');
        container.classList.add('container');
        container.appendChild(eventElement);
        container.appendChild(buttonList);
        eventContainer.appendChild(container);
    } catch (error) {
        console.error('Error fetching event:', error);
    }
}

async function fetchAnnouncementById(announcementId) {
    try {
        const response = await fetch(`../announcements/${announcementId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch announcement');
        }

        // Call toggleSearchContainer() function to hide the search container
        searchContainerHidden = true;
        toggleSearchContainer();

        const announcementData = await response.json();
        const announcementContainer = document.getElementById('listContainer');
        announcementContainer.innerHTML = '';

        const announcementElement = document.createElement('div');
        announcementElement.classList.add('announcement-element');

        const titleElement = document.createElement('h2');
        titleElement.textContent = announcementData.title;
        announcementElement.appendChild(titleElement);

        announcementElement.appendChild(createKeyValueElement('Description', announcementData.description));
        announcementElement.appendChild(createKeyValueElement('Date Begin', new Date(announcementData.date_begin).toLocaleDateString()));
        announcementElement.appendChild(createKeyValueElement('Date Stop', new Date(announcementData.date_stop).toLocaleDateString()));
        announcementElement.appendChild(createKeyValueElement('Time Begin', announcementData.time_begin));
        announcementElement.appendChild(createKeyValueElement('Time Stop', announcementData.time_stop));
        announcementElement.appendChild(createKeyValueElement('Location', announcementData.location));
        announcementElement.appendChild(await createKeyValueClickableElement('Owner', [announcementData.ownerId], 'organisations', 'announcementById', announcementId));
        announcementElement.appendChild(createKeyValueElement('Max Participants', announcementData.maxNumberParticipants));
        if (announcementData.participantsID.length !== 0)
            announcementElement.appendChild(await createKeyValueClickableElement('Participants', announcementData.participantsID, 'users', 'announcementById', announcementId));
        else
            announcementElement.appendChild(createKeyValueElement('Participants', ''));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/announcements', announcementData._id);
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => {
            backButtonFunction();
        });

        const buttonList = document.createElement('div');
        buttonList.classList.add('button-list');
        buttonList.appendChild(deleteButton);
        buttonList.appendChild(backButton);

        const container = document.createElement('span');
        container.classList.add('container');
        container.appendChild(announcementElement);
        container.appendChild(buttonList);
        announcementContainer.appendChild(container);

    } catch (error) {
        console.error('Error fetching announcement:', error);
    }
}


// Function to fetch organization by ID
async function fetchOrganisationById(organizationId) {
    try {
        const response = await fetch(`../organisations/${organizationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch organization');
        }

        // Call toggleSearchContainer() function to hide the search container
        searchContainerHidden = true;
        toggleSearchContainer();

        const organisationData = await response.json();
        const organisationContainer = document.getElementById('listContainer');
        organisationContainer.innerHTML = '';

        const organisationElement = document.createElement('div');
        organisationElement.classList.add('organisation-element');

        const usernameElement = document.createElement('h2');
        usernameElement.textContent = organisationData.username;
        organisationElement.appendChild(usernameElement);

        organisationElement.appendChild(createKeyValueElement('Email', organisationData.email));
        organisationElement.appendChild(createKeyValueElement('Password', organisationData.password));
        organisationElement.appendChild(createKeyValueElement('Role', organisationData.role));
        organisationElement.appendChild(createKeyValueElement('Tax ID Code', organisationData.taxIdCode));
        organisationElement.appendChild(createKeyValueElement('Bio', organisationData.bio));
        if (organisationData.activeEventsId.length !== 0)
            organisationElement.appendChild(await createKeyValueClickableElement('Active Events', organisationData.activeEventsId, 'events', 'organisationById', organizationId));
        else
            organisationElement.appendChild(createKeyValueElement('Active Events', ''));

        if (organisationData.expiredEventsId.length !== 0)
            organisationElement.appendChild(await createKeyValueClickableElement('Expired Events', organisationData.expiredEventsId, 'events', 'organisationById', organizationId));
        else
            organisationElement.appendChild(createKeyValueElement('Expired Events', ''));


        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/organisations', organisationData._id);
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => {
            backButtonFunction();
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

async function fetchUserById(userId) {
    try {
        const response = await fetch(`../users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        // Call toggleSearchContainer() function to hide the search container
        searchContainerHidden = true;
        toggleSearchContainer();

        const userData = await response.json();
        const userContainer = document.getElementById('listContainer');
        userContainer.innerHTML = '';

        const userElement = document.createElement('div');
        userElement.classList.add('user-element');

        const usernameElement = document.createElement('h2');
        usernameElement.textContent = userData.username;
        userElement.appendChild(usernameElement);

        userElement.appendChild(createKeyValueElement('Email', userData.email));
        userElement.appendChild(createKeyValueElement('Password', userData.password));
        userElement.appendChild(createKeyValueElement('Role', userData.role));
        userElement.appendChild(createKeyValueElement('Birthday', new Date(userData.birthday).toLocaleDateString()));
        userElement.appendChild(createKeyValueElement('Phone', userData.phone));
        userElement.appendChild(createKeyValueElement('Sex', userData.sex));
        userElement.appendChild(createKeyValueElement('Tax ID Code', userData.taxIdCode));
        userElement.appendChild(createKeyValueElement('Bio', userData.bio));
        if (userData.subscribedEventsId.length !== 0)
            userElement.appendChild(await createKeyValueClickableElement('Subscribed Events', userData.subscribedEventsId, 'events', 'userById', userId));
        else
            userElement.appendChild(createKeyValueElement('Subscribed Events', ''));

        if (userData.subscribedExpiredEventsId.length !== 0)
            userElement.appendChild(await createKeyValueClickableElement('Subscribed Expired Events', userData.subscribedExpiredEventsId, 'events', 'userById', userId));
        else
            userElement.appendChild(createKeyValueElement('Subscribed Expired Events', ''));

        if (userData.activeAnnouncementsId.length !== 0)
            userElement.appendChild(await createKeyValueClickableElement('Active Announcements', userData.activeAnnouncementsId, 'announcements', 'userById', userId));
        else
            userElement.appendChild(createKeyValueElement('Active Announcements', ''));

        if (userData.expiredAnnouncementsId.length !== 0)
            userElement.appendChild(await createKeyValueClickableElement('Expired Announcements', userData.expiredAnnouncementsId, 'announcements', 'userById', userId));
        else
            userElement.appendChild(createKeyValueElement('Expired Announcements', ''));


        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/users', userData._id);
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => {
            backButtonFunction();
        });

        const buttonList = document.createElement('div');
        buttonList.classList.add('button-list');
        buttonList.appendChild(deleteButton);
        buttonList.appendChild(backButton);

        const container = document.createElement('span');
        container.classList.add('container');
        container.appendChild(userElement);
        container.appendChild(buttonList);
        userContainer.appendChild(container);

    } catch (error) {
        console.error('Error fetching user:', error);
    }
}
