let clickedMenu = 'event';
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
            case 'event':
                await fetchEvents(searchInput);
                break;
            case 'announcement':
                await fetchAnnouncements(searchInput);
                break;
            case 'user':
                await fetchUsers(searchInput);
                break;
            case 'organisation':
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
        case 'event':
            fetchEvents();
            break;
        case 'announcement':
            fetchAnnouncements();
            break;
        case 'users':
            fetchUsers();
            break;
        case 'organisation':
            fetchOrganisations();
            break;
        // case 'eventById':
        //     fetchEventById(backId);
        //     break;
        // case 'announcementsById':
        //     fetchAnnouncementById(backId);
        //     break;
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


async function createKeyValueClickableElement(keyText, profileList, baseURL, backUrl, backId) {
    const paragraph = document.createElement('p');
    const keySpan = document.createElement('span');
    keySpan.textContent = `${keyText}:`;
    paragraph.appendChild(keySpan);

    const valueSpan = document.createElement('span');
    valueSpan.classList.add('value');
    profileList.forEach(idUsername => {
        const span = document.createElement('span');
        span.textContent = idUsername.username;

        // Add class to make the span clickable
        span.classList.add('clickable-span-list');
        span.addEventListener('click', () => {
            // Push the current page to the backPage array
            backPage.push([backUrl, backId]);
            switch (baseURL) {
                case 'organisation':
                    fetchOrganisationById(idUsername.id);
                    break;
                case 'user':
                    fetchUserById(idUsername.id);
                    break;
                // case 'eventById':
                //     fetchEventById(idUsername.id);
                //     break;
                // case 'announcementById':
                //     fetchAnnouncementById(idUsername.id);
                //     break;
                default:
                    console.error('Invalid action.');
            }
        });

        valueSpan.appendChild(span);

        // Add a comma after each username except the last one
        if (idUsername !== profileList[profileList.length - 1]) {
            valueSpan.appendChild(document.createTextNode(', '));
        }
    });
    paragraph.appendChild(valueSpan);
    return paragraph;
}


// Fetch events from the server
async function fetchEvents(title = '') {
    // Construct the URL with optional query parameters
    const url = `../event${title ? `?title=${title}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
            eventElement.appendChild(await createKeyValueClickableElement('Organizer', [event.owner], 'organisation', 'event'));
            eventElement.appendChild(createKeyValueElement('Max Participants', event.maxNumberParticipants));
            if (event.participants.length !== 0) {
                eventElement.appendChild(await createKeyValueClickableElement('Participants', event.participants, 'user', 'event'));
            } else
                eventElement.appendChild(createKeyValueElement('Participants', ''));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetchDeleteButton('/event', event._id);
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
    const url = `../announcement${title ? `?title=${title}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
            announcementElement.appendChild(await createKeyValueClickableElement('Owner', [announcement.owner], 'organisation', 'announcement'));
            announcementElement.appendChild(createKeyValueElement('Max Participants', announcement.maxNumberParticipants));
            if (announcement.participants.length !== 0)
                announcementElement.appendChild(await createKeyValueClickableElement('Participants', announcement.participants, 'user', 'announcement'));
            else
                announcementElement.appendChild(createKeyValueElement('Participants', ''));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetchDeleteButton('/announcement', announcement._id);
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
    const url = `../user${username ? `?username=${username}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
            userElement.appendChild(createKeyValueElement('Role', user.role));
            userElement.appendChild(createKeyValueElement('Birthday', new Date(user.birthday).toLocaleDateString()));
            userElement.appendChild(createKeyValueElement('Phone', user.phone));
            userElement.appendChild(createKeyValueElement('Sex', user.sex));
            userElement.appendChild(createKeyValueElement('Tax ID Code', user.taxIdCode));
            userElement.appendChild(createKeyValueElement('Bio', user.bio));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetchDeleteButton('/user', user._id);
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
    const url = `../organisation${username ? `?username=${username}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
            organisationElement.appendChild(createKeyValueElement('Role', organisation.role));
            organisationElement.appendChild(createKeyValueElement('Tax ID Code', organisation.taxIdCode));
            organisationElement.appendChild(createKeyValueElement('Bio', organisation.bio));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetchDeleteButton('/organisation', organisation._id);
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

async function fetchVerification() {
    try {
        const response = await fetch('/verification/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch verification requests');
        }
        const verificationRequests = await response.json();

        const verificationContainer = document.getElementById('listContainer');
        verificationContainer.innerHTML = '';

        for (const verification of verificationRequests) {
            const verificationElement = document.createElement('div');
            verificationElement.classList.add('verification-element');

            const usernameElement = document.createElement('h2');
            usernameElement.textContent = verification.organisation.username;
            verificationElement.appendChild(usernameElement);

            verificationElement.appendChild(createKeyValueElement('Date', new Date(verification.date).toLocaleDateString()));

            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.addEventListener('click', () => {
                fetch('/verification/' + verification._id, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.token}`
                    },
                    body: JSON.stringify({ action: 'accept' })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to accept verification');
                    }
                    console.log('Accepted verification');
                    fetchVerification();
                }).catch(error => {
                    console.error('Error accepting verification:', error);
                });
            });

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.addEventListener('click', () => {
                fetch('/verification/' + verification._id, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.token}`
                    },
                    body: JSON.stringify({ action: 'reject' })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to reject verification');
                    }
                    console.log('Rejected verification');
                    fetchVerification();
                }).catch(error => {
                    console.error('Error rejecting verification:', error);
                });
            });

            const buttonList = document.createElement('div');
            buttonList.classList.add('button-list');
            buttonList.appendChild(acceptButton);
            buttonList.appendChild(rejectButton);

            const container = document.createElement('span');
            container.classList.add('container');
            container.appendChild(verificationElement);
            container.appendChild(buttonList);

            verificationContainer.appendChild(container);
        }
    } catch (error) {
        console.error('Error fetching verification requests:', error);
    }
}




// baseURL is the URL to send the DELETE request to
function fetchDeleteButton(baseURL, objectId) {
    fetch(`${baseURL}/${objectId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.token}`
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
        const response = await fetch(`../${baseUrl}/${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
        const response = await fetch(`../${baseURL}/${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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


// async function fetchEventById(eventId) {
//     try {
//         const response = await fetch(`../event/${eventId}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.token}`
//             }
//         });
//         if (!response.ok) {
//             throw new Error('Failed to fetch event');
//         }

//         // Call toggleSearchContainer() function to hide the search container
//         searchContainerHidden = true;
//         toggleSearchContainer();

//         const eventData = await response.json();
//         const eventContainer = document.getElementById('listContainer');
//         eventContainer.innerHTML = '';

//         const eventElement = document.createElement('div');
//         eventElement.classList.add('event-element');

//         const titleElement = document.createElement('h2');
//         titleElement.textContent = eventData.title;
//         eventElement.appendChild(titleElement);

//         eventElement.appendChild(createKeyValueElement('Description', eventData.description));
//         eventElement.appendChild(createKeyValueElement('Date', new Date(eventData.date).toLocaleDateString()));
//         eventElement.appendChild(createKeyValueElement('Time', eventData.time));
//         eventElement.appendChild(createKeyValueElement('Location', eventData.location));
//         eventElement.appendChild(createKeyValueElement('Expired', eventData.expired));
//         eventElement.appendChild(await createKeyValueClickableElement('Organizer', [eventData.organizerId], 'organisation', 'eventById', eventId));
//         eventElement.appendChild(createKeyValueElement('Max Participants', eventData.maxNumberParticipants));
//         if (eventData.participants.length !== 0)
//             eventElement.appendChild(await createKeyValueClickableElement('Participants', eventData.participants, 'user', 'eventById', eventId));
//         else
//             eventElement.appendChild(createKeyValueElement('Participants', ''));

//         const deleteButton = document.createElement('button');
//         deleteButton.textContent = 'Delete';
//         deleteButton.addEventListener('click', () => {
//             fetchDeleteButton('/event', eventData._id);
//         });

//         const backButton = document.createElement('button');
//         backButton.textContent = 'Back';
//         backButton.addEventListener('click', () => {
//             backButtonFunction();
//         });

//         const buttonList = document.createElement('div');
//         buttonList.classList.add('button-list');
//         buttonList.appendChild(deleteButton);
//         buttonList.appendChild(backButton);

//         const container = document.createElement('span');
//         container.classList.add('container');
//         container.appendChild(eventElement);
//         container.appendChild(buttonList);
//         eventContainer.appendChild(container);
//     } catch (error) {
//         console.error('Error fetching event:', error);
//     }
// }

// async function fetchAnnouncementById(announcementId) {
//     try {
//         const response = await fetch(`../announcement/${announcementId}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.token}`
//             }
//         });
//         if (!response.ok) {
//             throw new Error('Failed to fetch announcement');
//         }

//         // Call toggleSearchContainer() function to hide the search container
//         searchContainerHidden = true;
//         toggleSearchContainer();

//         const announcementData = await response.json();
//         const announcementContainer = document.getElementById('listContainer');
//         announcementContainer.innerHTML = '';

//         const announcementElement = document.createElement('div');
//         announcementElement.classList.add('announcement-element');

//         const titleElement = document.createElement('h2');
//         titleElement.textContent = announcementData.title;
//         announcementElement.appendChild(titleElement);

//         announcementElement.appendChild(createKeyValueElement('Description', announcementData.description));
//         announcementElement.appendChild(createKeyValueElement('Date Begin', new Date(announcementData.date_begin).toLocaleDateString()));
//         announcementElement.appendChild(createKeyValueElement('Date Stop', new Date(announcementData.date_stop).toLocaleDateString()));
//         announcementElement.appendChild(createKeyValueElement('Time Begin', announcementData.time_begin));
//         announcementElement.appendChild(createKeyValueElement('Time Stop', announcementData.time_stop));
//         announcementElement.appendChild(createKeyValueElement('Location', announcementData.location));
//         announcementElement.appendChild(await createKeyValueClickableElement('Owner', [announcementData.owner], 'organisation', 'announcementById', announcementId));
//         announcementElement.appendChild(createKeyValueElement('Max Participants', announcementData.maxNumberParticipants));
//         if (announcementData.participants.length !== 0)
//             announcementElement.appendChild(await createKeyValueClickableElement('Participants', announcementData.participants, 'user', 'announcementById', announcementId));
//         else
//             announcementElement.appendChild(createKeyValueElement('Participants', ''));

//         const deleteButton = document.createElement('button');
//         deleteButton.textContent = 'Delete';
//         deleteButton.addEventListener('click', () => {
//             fetchDeleteButton('/announcement', announcementData._id);
//         });

//         const backButton = document.createElement('button');
//         backButton.textContent = 'Back';
//         backButton.addEventListener('click', () => {
//             backButtonFunction();
//         });

//         const buttonList = document.createElement('div');
//         buttonList.classList.add('button-list');
//         buttonList.appendChild(deleteButton);
//         buttonList.appendChild(backButton);

//         const container = document.createElement('span');
//         container.classList.add('container');
//         container.appendChild(announcementElement);
//         container.appendChild(buttonList);
//         announcementContainer.appendChild(container);

//     } catch (error) {
//         console.error('Error fetching announcement:', error);
//     }
// }


// Function to fetch organization by ID
async function fetchOrganisationById(organizationId) {
    try {
        const response = await fetch(`../organisation/${organizationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
        organisationElement.appendChild(createKeyValueElement('Role', organisationData.role));
        organisationElement.appendChild(createKeyValueElement('Tax ID Code', organisationData.taxIdCode));
        organisationElement.appendChild(createKeyValueElement('Bio', organisationData.bio));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/organisation', organisationData._id);
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
        const response = await fetch(`../user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
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
        userElement.appendChild(createKeyValueElement('Role', userData.role));
        userElement.appendChild(createKeyValueElement('Birthday', new Date(userData.birthday).toLocaleDateString()));
        userElement.appendChild(createKeyValueElement('Phone', userData.phone));
        userElement.appendChild(createKeyValueElement('Sex', userData.sex));
        userElement.appendChild(createKeyValueElement('Tax ID Code', userData.taxIdCode));
        userElement.appendChild(createKeyValueElement('Bio', userData.bio));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            fetchDeleteButton('/user', userData._id);
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
