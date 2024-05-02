// Call setParagraphHeights when window is resized
window.addEventListener('resize', setParagraphHeights);

function fetchEvents() {
    fetch('../admin/events')
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
                valueDate.innerHTML = event.date;
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

function fetchAnnouncements() {
    // to do
}

function fetchUsers() {
    //to do
}

function fetchOrganisations() {
    // to do
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