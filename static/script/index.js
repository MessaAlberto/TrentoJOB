let map;
let radioButtonsValue = 'event';
let jsonQuery = {};

document.addEventListener('DOMContentLoaded', function () {

    const filterForm = document.getElementById('filterForm');
    filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
    });

    var createNoticeButton = document.getElementById('createNotice');

    // Check if the click was outside the menu and the button
    document.addEventListener('click', function (event) {
        if (event.target !== createNoticeButton && event.target !== createNoticeButton.firstElementChild) {
            var createNoticeMenu = document.getElementById('createNoticeMenu');
            createNoticeMenu.classList.add('hidden');
        }
    });

    // show Trento on the map
    map = L.map('map').setView([46.066422, 11.125760], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    // Add the event listener to the radio buttons
    const radioButtons = document.querySelectorAll('.tabs input[type="radio"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('click', function () {
            radioButtonsValue = this.value;
            createFilterForm();
            createOrderingOption();
            fetchList(radioButtonsValue);

            document.getElementById('searchInput').value = '';
        });
    });

    displayCreateButton();
    createFilterForm();
    createOrderingOption();

    fetchList('event');
    fetchNewMessages();
});


async function getCoordinatesFromLocation(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const data = await response.json();
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);

        return [longitude, latitude];
    } catch (error) {
        console.error('Error during coordinates fetch:', error);
        return null;
    }
}

async function displayItemsOnMap(model, items) {
    try {
        // Clean the map
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        let icon;
        if (model === 'event') {
            icon = new L.AwesomeMarkers.icon({
                icon: 'group',
                markerColor: 'blue',
                prefix: 'fa'
            });
        } else if (model === 'announcement') {
            icon = new L.AwesomeMarkers.icon({
                icon: 'handshake-o',
                markerColor: 'green',
                prefix: 'fa'
            });
        } else {
            return;
        }

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        items.forEach(async item => {
            const location = item.location;
            const user = item.owner.id;
            const role = item.owner.role;
            const title = item.title;
            const owner = item.owner;
            const coordinates = await getCoordinatesFromLocation(location);
            if (coordinates) {
                const [longitude, latitude] = coordinates;
                const titleLink = `<a href="/displayEvent-Announcement.html?id=${item._id}&model=${model}" class="title-link">${title}</a>`;
                const ownerLink = `<a href="/user.html?id=${user}&role=${role}" class="owner-link">${owner.username || 'Unknown owner'}</a>`;
                const popupContent = `
                    <div>
                        <h3>${titleLink}</h3>
                        <h6><strong>Location:</strong> ${location}</h6>
                        <h6><strong>Owner:</strong> ${ownerLink}</h6>
                    </div>`;
                L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(popupContent);
            }
        });
    } catch (err) {
        console.error('Error during items fetch:', err);
    }
}


function searchInputBar(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        fetchList(radioButtonsValue);
    }
}

function searchButton() {
    fetchList(radioButtonsValue);
}

function orderBy() {
    fetchList(radioButtonsValue);
}

function resetFilters() {
    jsonQuery = {};
    createFilterForm();
}



async function fetchList(model) {
    try {
        jsonQuery = {};
        addOrderToQuery();
        addInputToQuery();
        addFiltersToQuery();

        const queryString = new URLSearchParams(jsonQuery).toString();
        const url = '/' + model + '?' + queryString;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const items = await response.json();
        const itemsContainer = document.getElementById('dynamicList');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemElement = createItemList(model, item);
            itemsContainer.appendChild(itemElement);
        });

        // show markers on the map
        displayItemsOnMap(model, items);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}



function addInputToQuery() {
    const title = document.getElementById('searchInput').value.trim();
    if (title) {
        jsonQuery = { ...jsonQuery, input: title };
    }
}

function addOrderToQuery() {
    const ordering = document.getElementById('orderBy');
    const selected = ordering.options[ordering.selectedIndex].value;
    const [field, order] = selected.split(':');
    jsonQuery.sortBy = `${field}:${order}`;
}

function addFiltersToQuery() {
    const form = document.getElementById('filterForm');
    const formData = new FormData(form);

    formData.forEach((value, key) => {
        if (value) {
            jsonQuery[key] = value;
        }
    });
}


function addJoinLeaveButton(item, buttonContainer, elementContainer) {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    // only logged users can join events and announcements
    if (userId && username && role === 'user') {
        const joinButton = document.createElement('button');
        joinButton.classList.add('bottom-label-button');

        const isParticipant = item.participants.some(participant => String(participant.id) === userId);

        if (isParticipant) {
            joinButton.innerHTML = 'Leave';
            joinButton.addEventListener('click', function () {
                fetch('/' + radioButtonsValue + '/' + item._id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.token,
                    },
                    body: JSON.stringify({ userId: userId, username: username, action: 'leave' }),
                }).then(response => {
                    if (response.ok) {
                        // reload the element
                        fetch('/' + radioButtonsValue + '/' + item._id).then(response => response.json()).then(item => {
                            const newElement = createItemList(radioButtonsValue, item);
                            elementContainer.replaceWith(newElement);
                        });
                    }
                });
            });
        } else if (item.maxNumberParticipants && item.participants.length >= item.maxNumberParticipants) {
            joinButton.innerHTML = 'Full';
            joinButton.disabled = true;
        } else {
            radioButtonsValue === 'event' ? joinButton.innerHTML = 'Join and create chat' : joinButton.innerHTML = 'Apply and create chat';
            joinButton.addEventListener('click', function () {
                // update the notice
                fetch('/' + radioButtonsValue + '/' + item._id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.token,
                    },
                    body: JSON.stringify({ userId: userId, username: username, action: 'join' }),
                }).then(response => {
                    if (response.ok) {
                        // reload the element
                        fetch('/' + radioButtonsValue + '/' + item._id).then(response => response.json()).then(item => {
                            const newElement = createItemList(radioButtonsValue, item);
                            elementContainer.replaceWith(newElement);
                        });
                    }
                }).catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
                // create a chat
                fetch('/chat/' + item.owner.id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.token,
                    }
                }).catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            });
        }
        buttonContainer.appendChild(joinButton);
    }
}




function displayCreateButton() {
    // Only logged in users can create notices
    var userId = localStorage.getItem('userId');
    if (userId) {
        var createButton = document.getElementById('createNotice');
        createButton.classList.remove('hidden');
    }
}

function createActivityButton() {
    // Check if it is logged in
    var userId = localStorage.getItem('userId');
    var userRole = localStorage.role;

    if (!userId) {
        alert("You must be logged in to create a notice.");
        return;
    }

    // Send user to the correct page
    // User --> createAnnouncement
    // Organisation --> createEvent or createAnnouncement
    if (userRole === 'user')
        window.location.href = "/createAnnouncement.html";
    else if (userRole === 'organisation') {
        toggleCreateNoticeMenu();
    } else
        alert("You must be logged in to create a notice.");
}

function toggleCreateNoticeMenu() {
    var createNoticeMenu = document.getElementById('createNoticeMenu');
    createNoticeMenu.classList.toggle('hidden');
}

function createActivity(noticeType = '') {
    var userId = localStorage.getItem('userId');
    var userRole = localStorage.role;
    toggleCreateNoticeMenu();
    if (userId && noticeType === 'event' && userRole === 'organisation') {
        window.location.href = "/createEvent.html";
    } else if (userId && noticeType === 'announcement') {
        window.location.href = "/createAnnouncement.html";
    } else {
        alert("You must be logged in as an organisation to create an event.");
    }
}

function createItemList(model, item) {
    const elementContainer = document.createElement('div');
    elementContainer.classList.add('element-container');

    const titleElement = document.createElement('h3');
    titleElement.classList.add('title-container');
    elementContainer.appendChild(titleElement);

    const titleText = document.createElement('div');
    titleText.classList.add('title-text');
    titleElement.appendChild(titleText);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');
    elementContainer.appendChild(infoContainer);

    const mainInfo = document.createElement('div');
    mainInfo.classList.add('main-info');
    infoContainer.appendChild(mainInfo);

    const bodyBox = document.createElement('div');
    bodyBox.classList.add('body-box');
    infoContainer.appendChild(bodyBox);

    const description = document.createElement('div');
    description.classList.add('description');
    bodyBox.appendChild(description);

    if (model === 'event' || model === 'announcement') {
        const bottomLabels = document.createElement('div');
        bottomLabels.classList.add('bottom-labels');
        bodyBox.appendChild(bottomLabels);

        const participants = document.createElement('div');
        bottomLabels.appendChild(participants);
        const participantsKey = document.createElement('div');
        participantsKey.classList.add('key');
        participantsKey.innerHTML = 'Num participants:';
        const participantsValue = document.createElement('div');
        participantsValue.classList.add('value');
        participantsValue.innerHTML = (item.participants.length + '/' + item.maxNumberParticipants) || 'Unlimited';
        participants.appendChild(participantsKey);
        participants.appendChild(participantsValue);

        const expiredText = document.createElement('div');
        expiredText.classList.add('expired');
        titleElement.appendChild(expiredText);

        const descriptionKey = document.createElement('div');
        descriptionKey.classList.add('key');
        descriptionKey.innerHTML = 'Description:';
        const descriptionValue = document.createElement('div');
        descriptionValue.classList.add('value');
        descriptionValue.innerHTML = item.description || 'No description available';
        description.appendChild(descriptionKey);
        description.appendChild(descriptionValue);

        titleText.innerHTML = item.title || 'No title';
        titleText.addEventListener('click', function () {
            window.location.href = '/displayEvent-Announcement.html?id=' + item._id + '&model=' + model;
        });

        if (item.expired) {
            expiredText.innerHTML = 'Expired';

            const rating = document.createElement('div');
            bottomLabels.appendChild(rating);
            const ratingKey = document.createElement('div');
            ratingKey.classList.add('key');
            ratingKey.innerHTML = 'Rating:';
            const ratingValue = document.createElement('div');
            ratingValue.classList.add('value');
            ratingValue.innerHTML = (item.rating + '/5') || 'No rating';
            rating.appendChild(ratingKey);
            rating.appendChild(ratingValue);
        } else {
            addJoinLeaveButton(item, bottomLabels, elementContainer);
        }

        const location = document.createElement('div');
        mainInfo.appendChild(location);
        const locationKey = document.createElement('div');
        locationKey.classList.add('key');
        locationKey.innerHTML = 'Location:';
        const locationValue = document.createElement('div');
        locationValue.classList.add('value');
        locationValue.innerHTML = item.location || 'Unknown location';
        location.appendChild(locationKey);
        location.appendChild(locationValue);

        const owner = document.createElement('div');
        mainInfo.appendChild(owner);
        const ownerKey = document.createElement('div');
        ownerKey.classList.add('key');
        ownerKey.innerHTML = 'Owner:';
        const ownerValue = document.createElement('div');
        ownerValue.classList.add('value');
        ownerValue.classList.add('clickable');
        ownerValue.innerHTML = item.owner?.username || 'Unknown owner';
        owner.appendChild(ownerKey);
        owner.appendChild(ownerValue);

        if (model === 'announcement') {
            ownerValue.addEventListener('click', function (event) {
                event.preventDefault();
                fecthOwner(item.owner.role, item.owner.id);
            });


            const dateBegin = document.createElement('div');
            const dateBeginKey = document.createElement('div');
            dateBeginKey.classList.add('key');
            dateBeginKey.innerHTML = 'Starts:';
            const dateBeginValue = document.createElement('div');
            dateBeginValue.classList.add('value');
            dateBeginValue.innerHTML = item.date_begin.split('T')[0];
            dateBegin.appendChild(dateBeginKey);
            dateBegin.appendChild(dateBeginValue);

            const hourBegin = document.createElement('div');
            const hourBeginKey = document.createElement('div');
            hourBeginKey.classList.add('key');
            hourBeginKey.innerHTML = 'At:';
            const hourBeginValue = document.createElement('div');
            hourBeginValue.classList.add('value');
            hourBeginValue.innerHTML = item.date_begin.split('T')[1].split('.')[0].slice(0, 5);
            hourBegin.appendChild(hourBeginKey);
            hourBegin.appendChild(hourBeginValue);


            const dateEnd = document.createElement('div');
            const dateEndKey = document.createElement('div');
            dateEndKey.classList.add('key');
            dateEndKey.innerHTML = 'Ends:';
            const dateEndValue = document.createElement('div');
            dateEndValue.classList.add('value');
            dateEndValue.innerHTML = item.date_stop.split('T')[0];
            dateEnd.appendChild(dateEndKey);
            dateEnd.appendChild(dateEndValue);

            const hourEnd = document.createElement('div');
            const hourEndKey = document.createElement('div');
            hourEndKey.classList.add('key');
            hourEndKey.innerHTML = 'At:';
            const hourEndValue = document.createElement('div');
            hourEndValue.classList.add('value');
            hourEndValue.innerHTML = item.date_stop.split('T')[1].split('.')[0].slice(0, 5);
            hourEnd.appendChild(hourEndKey);
            hourEnd.appendChild(hourEndValue);

            mainInfo.appendChild(dateBegin);
            mainInfo.appendChild(dateEnd);
            mainInfo.appendChild(hourBegin);
            mainInfo.appendChild(hourEnd);
        } else {
            ownerValue.addEventListener('click', function (event) {
                event.preventDefault();
                fecthOwner(item.owner.role, item.owner.id);
            });

            const comments = document.createElement('button');
            comments.classList.add('bottom-label-button');
            comments.innerHTML = 'Comments';
            bottomLabels.appendChild(comments);

            comments.addEventListener('click', function () {
                fetchComments(item._id);
            });

            const dateBegin = document.createElement('div');
            mainInfo.appendChild(dateBegin);
            const dateBeginKey = document.createElement('div');
            dateBeginKey.classList.add('key');
            dateBeginKey.innerHTML = 'On:';
            const dateBeginValue = document.createElement('div');
            dateBeginValue.classList.add('value');
            dateBeginValue.innerHTML = item.date.split('T')[0];
            dateBegin.appendChild(dateBeginKey);
            dateBegin.appendChild(dateBeginValue);

            const hourBegin = document.createElement('div');
            mainInfo.appendChild(hourBegin);
            const hourBeginKey = document.createElement('div');
            hourBeginKey.classList.add('key');
            hourBeginKey.innerHTML = 'At:';
            const hourBeginValue = document.createElement('div');
            hourBeginValue.classList.add('value');
            hourBeginValue.innerHTML = item.date.split('T')[1].split('.')[0].slice(0, 5);
            hourBegin.appendChild(hourBeginKey);
            hourBegin.appendChild(hourBeginValue);
        }

    } else if (model === 'user' || model === 'organisation') {
        titleText.innerHTML = item.username || 'No username';
        titleText.addEventListener('click', function () {
            window.location.href = '/user.html?id=' + item._id + '&role=' + item.role;
        });

        const email = document.createElement('div');
        mainInfo.appendChild(email);
        const emailKey = document.createElement('div');
        emailKey.classList.add('key');
        emailKey.innerHTML = 'Email:';
        const emailValue = document.createElement('div');
        emailValue.classList.add('value');
        emailValue.innerHTML = item.email || 'No email';
        email.appendChild(emailKey);
        email.appendChild(emailValue);

        const phone = document.createElement('div');
        mainInfo.appendChild(phone);
        const phoneKey = document.createElement('div');
        phoneKey.classList.add('key');
        phoneKey.innerHTML = 'Phone:';
        const phoneValue = document.createElement('div');
        phoneValue.classList.add('value');
        phoneValue.innerHTML = item.phone || 'No phone';
        phone.appendChild(phoneKey);
        phone.appendChild(phoneValue);

        if (item.bio !== undefined) {
            // add to description
            const bioKey = document.createElement('div');
            bioKey.classList.add('key');
            bioKey.innerHTML = 'Bio:';
            const bioValue = document.createElement('div');
            bioValue.classList.add('value');
            bioValue.innerHTML = item.bio;
            description.appendChild(bioKey);
            description.appendChild(bioValue);
        }
    }

    return elementContainer;
}

function createOrderingOption() {
    const ordering = document.getElementById('orderBy');
    ordering.innerHTML = '';

    const options = [];

    if (radioButtonsValue === 'user' || radioButtonsValue === 'organisation') {
        options.push({ value: 'username:asc', text: 'Username: A-Z' });
        options.push({ value: 'username:desc', text: 'Username: Z-A' });
    }

    if (radioButtonsValue === 'event' || radioButtonsValue === 'announcement') {
        options.push({ value: 'title:asc', text: 'Title: A-Z' });
        options.push({ value: 'title:desc', text: 'Title: Z-A' });
        options.push({ value: 'date:asc', text: 'Date: Soonest first' });
        options.push({ value: 'date:desc', text: 'Date: Latest first' });
    }

    if (radioButtonsValue === 'user') {
        options.push({ value: 'birthday:asc', text: 'Age: Youngest first' });
        options.push({ value: 'birthday:desc', text: 'Age: Oldest first' });
    }

    options.push({ value: 'rating:asc', text: 'Rating: Low to High' });
    options.push({ value: 'rating:desc', text: 'Rating: High to Low' });

    options.forEach((option, index) => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.innerHTML = option.text;

        // Set the first option as selected by default
        if (index === 0) {
            opt.selected = true;
        }

        ordering.appendChild(opt);
    });
}

function createFilterForm() {
    const filterContainer = document.getElementById('filterContainer');
    filterContainer.innerHTML = '';

    // Create the rating filter with star rating
    const rating = document.createElement('div');
    const ratingLabel = document.createElement('label');
    ratingLabel.innerHTML = 'Rating:';
    rating.appendChild(ratingLabel);

    const ratingDiv = document.createElement('div');
    ratingDiv.classList.add('rating');

    for (let i = 5; i >= 1; i--) {
        const starLabel = document.createElement('label');
        const starInput = document.createElement('input');
        starInput.setAttribute('type', 'radio');
        starInput.setAttribute('name', 'rating');
        starInput.setAttribute('value', i);
        starInput.setAttribute('title', `${i} stars`);
        starLabel.appendChild(starInput);
        starLabel.appendChild(document.createTextNode(` ${i} `));
        ratingDiv.appendChild(starLabel);
    }

    rating.appendChild(ratingDiv);
    filterContainer.appendChild(rating);

    if (radioButtonsValue === 'user') {
        // Create user age filter
        const age = document.createElement('div');
        const ageLabel = document.createElement('label');
        ageLabel.setAttribute('for', 'age');
        ageLabel.innerHTML = 'Age:';
        age.appendChild(ageLabel);

        const minAgeInput = document.createElement('input');
        minAgeInput.setAttribute('type', 'number');
        minAgeInput.setAttribute('id', 'minAge');
        minAgeInput.setAttribute('name', 'minAge');
        minAgeInput.setAttribute('placeholder', 'Min');
        minAgeInput.setAttribute('min', '0');
        minAgeInput.setAttribute('max', '120');
        age.appendChild(minAgeInput);

        const maxAgeInput = document.createElement('input');
        maxAgeInput.setAttribute('type', 'number');
        maxAgeInput.setAttribute('id', 'maxAge');
        maxAgeInput.setAttribute('name', 'maxAge');
        maxAgeInput.setAttribute('placeholder', 'Max');
        maxAgeInput.setAttribute('min', '0');
        maxAgeInput.setAttribute('max', '120');
        age.appendChild(maxAgeInput);

        filterContainer.appendChild(age);

        minAgeInput.addEventListener('change', function () {
            if (parseInt(minAgeInput.value) > parseInt(maxAgeInput.value)) {
                minAgeInput.value = maxAgeInput.value;
            }
        });

        maxAgeInput.addEventListener('change', function () {
            if (parseInt(maxAgeInput.value) < parseInt(minAgeInput.value)) {
                maxAgeInput.value = minAgeInput.value;
            }
        });

        // Create sex filter
        const sex = document.createElement('div');
        const sexLabel = document.createElement('label');
        sexLabel.setAttribute('for', 'sex');
        sexLabel.innerHTML = 'Sex: ';
        sex.appendChild(sexLabel);

        // Create selcet dropdown
        const sexSelect = document.createElement('select');
        sexSelect.setAttribute('id', 'sex');
        sexSelect.setAttribute('name', 'sex');

        // Create options for "All", "Male", and "Female"
        const sexOption = document.createElement('option');
        sexOption.setAttribute('value', '');
        sexOption.textContent = 'All';
        sexSelect.appendChild(sexOption);

        const optionMale = document.createElement('option');
        optionMale.setAttribute('value', 'male');
        optionMale.textContent = 'Male';
        sexSelect.appendChild(optionMale);

        const optionFemale = document.createElement('option');
        optionFemale.setAttribute('value', 'female');
        optionFemale.textContent = 'Female';
        sexSelect.appendChild(optionFemale);

        sex.appendChild(sexSelect);
        filterContainer.appendChild(sex);
    } else if (radioButtonsValue === 'event' || radioButtonsValue === 'announcement') {
        const expired = document.createElement('div');
        const expiredLabel = document.createElement('label');
        expiredLabel.setAttribute('for', 'expired');
        expiredLabel.innerHTML = 'Expired:';
        expired.appendChild(expiredLabel);

        // Create select dropdown
        const expiredSelect = document.createElement('select');
        expiredSelect.setAttribute('id', 'expired');
        expiredSelect.setAttribute('name', 'expired');

        // Create options for "Yes" and "No"
        const expiredOption = document.createElement('option');
        expiredOption.setAttribute('value', '');
        expiredOption.textContent = 'All';
        expiredSelect.appendChild(expiredOption);

        const optionYes = document.createElement('option');
        optionYes.setAttribute('value', 'true');
        optionYes.textContent = 'Yes';
        expiredSelect.appendChild(optionYes);

        const optionNo = document.createElement('option');
        optionNo.setAttribute('value', 'false');
        optionNo.textContent = 'No';
        expiredSelect.appendChild(optionNo);

        expired.appendChild(expiredSelect);
        filterContainer.appendChild(expired);

        // Create the max number of participants filter
        const maxNumberParticipants = document.createElement('div');
        const maxNumberParticipantsLabel = document.createElement('label');
        maxNumberParticipantsLabel.setAttribute('for', 'maxNumberParticipants');
        maxNumberParticipantsLabel.innerHTML = 'Max num. participants:';
        maxNumberParticipants.appendChild(maxNumberParticipantsLabel);
        const maxNumberParticipantsInput = document.createElement('input');
        maxNumberParticipantsInput.setAttribute('type', 'number');
        maxNumberParticipantsInput.setAttribute('id', 'maxNumberParticipants');
        maxNumberParticipantsInput.setAttribute('name', 'maxNumberParticipants');
        maxNumberParticipantsInput.setAttribute('min', '0');
        maxNumberParticipants.appendChild(maxNumberParticipantsInput);
        filterContainer.appendChild(maxNumberParticipants);

        if (radioButtonsValue === 'event') {
            // Create single date picker
            const date = document.createElement('div');
            const dateLabel = document.createElement('label');
            dateLabel.innerHTML = 'Date:';
            date.appendChild(dateLabel);

            const dateInput = document.createElement('input');
            dateInput.setAttribute('type', 'text');
            dateInput.setAttribute('name', 'date');
            dateInput.setAttribute('autocomplete', 'off');
            date.appendChild(dateInput);
            filterContainer.appendChild(date);
        } else {
            // Create the date range picker
            const dateRangePicker = document.createElement('div');
            const dateRangeLabel = document.createElement('label');
            dateRangeLabel.innerHTML = 'Date Range:';
            dateRangePicker.appendChild(dateRangeLabel);

            const dateRangeInput = document.createElement('input');
            dateRangeInput.setAttribute('type', 'text');
            dateRangeInput.setAttribute('name', 'daterange');
            dateRangePicker.appendChild(dateRangeInput);
            filterContainer.appendChild(dateRangePicker);
        }
    }

    // jQuery
    // rating
    $('.rating input').change(function () {
        var $radio = $(this);
        $('.rating .selected').removeClass('selected');
        $radio.closest('label').addClass('selected');
    });

    // date range
    $('input[name="daterange"]').daterangepicker({
        autoUpdateInput: false,
        locale: {
            format: 'MM/DD/YYYY - MM/DD/YYYY',
        }
    });

    // Update the input value on apply event
    $('input[name="daterange"]').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
    });

    // Clear the input value on cancel event
    $('input[name="daterange"]').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
    });


    // single date
    $('input[name="date"]').daterangepicker({
        autoUpdateInput: false,
        locale: {
            format: 'YYYY-MM-DD',
        },
        singleDatePicker: true,
        showDropdowns: true,
    },
        function (start, end, label) {
            $('input[name="date"]').val(start.format('YYYY-MM-DD'));
            $(this).val(start.format('YYYY-MM-DD'));
        });
}



async function fecthOwner(model, ownerId) {
    const url = '/' + model + '/' + ownerId;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const item = await response.json();
        const itemContainer = document.getElementById('showPopUpObject');

        const itemElement = createItemList(model, item);
        itemElement.classList.add('single-item-container');

        const closeButton = document.createElement('button');
        closeButton.classList.add('close-button');
        closeButton.innerHTML = 'Close';

        closeButton.addEventListener('click', function () {
            itemContainer.classList.add('hidden');
        });
        itemContainer.addEventListener('click', function (event) {
            if (event.target === itemContainer) {
                itemContainer.classList.add('hidden');
            }
        });

        itemContainer.appendChild(itemElement);
        itemContainer.appendChild(closeButton);

        itemContainer.classList.remove('hidden');

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function fetchComments(noticeId) {
    // disable sroll in the body
    document.body.classList.add('no-scroll');
    const url = '/comment/' + noticeId;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token,
            }
        });
        if (!response.ok) {
            if (response.status === 403) {
                alert('You must be logged in to see the comments');
                document.body.classList.remove('no-scroll');
            }
            throw new Error('Network response was not ok');
        }
        const item = await response.json();
        console.log(item);
        const itemContainer = document.getElementById('showPopUpObject');
        itemContainer.innerHTML = '';
        itemContainer.classList.remove('hidden');

        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('popUp-comments-container');
        itemContainer.appendChild(commentsContainer);

        const title = document.createElement('h3');
        title.classList.add('title-container');
        title.innerHTML = 'Comment';
        commentsContainer.appendChild(title);

        const comments = document.createElement('div');
        comments.classList.add('comments-container');
        if (item.comments.length === 0) {
            comments.innerHTML = 'No comments';
        } else {
            item.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');

                const username = document.createElement('div');
                username.classList.add('comment-username');
                username.innerHTML = comment.user.username + ': ';
                commentElement.appendChild(username);

                const text = document.createElement('div');
                text.classList.add('comment-text');
                text.innerHTML = comment.text;
                commentElement.appendChild(text);

                const date = document.createElement('div');
                date.classList.add('comment-date');
                date.innerHTML = comment.date.split('T')[0] + ' ' + comment.date.split('T')[1].split('.')[0].slice(0, 5);
                commentElement.appendChild(date);

                if (comment.user.id === item.owner.id) {
                    username.innerHTML += ' (Owner)';
                }

                if (comment.user.id === localStorage.userId) {
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-button');
                    deleteButton.innerHTML = 'Delete';
                    deleteButton.addEventListener('click', function () {
                        const data = { eventId: noticeId };
                        fetch('/comment/' + comment._id, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.token,
                            },
                            body: JSON.stringify(data),
                        }).then(response => {
                            if (response.ok) {
                                fetchComments(noticeId);
                            }
                        }).catch(error => {
                            console.error('There has been a problem with your fetch operation:', error);
                        });
                    });
                    commentElement.appendChild(deleteButton);
                }
                // add the comment to the top of the list
                comments.insertBefore(commentElement, comments.firstChild);
            });
        }
        commentsContainer.appendChild(comments);

        const inputContainer = document.createElement('div');
        inputContainer.classList.add('comment-input-container');
        commentsContainer.appendChild(inputContainer);

        const input = document.createElement('input');
        input.classList.add('comment-input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', 'Write a comment...');
        inputContainer.appendChild(input);

        const button = document.createElement('button');
        button.classList.add('comment-button');
        button.innerHTML = 'Send';
        inputContainer.appendChild(button);

        const publishComment = async () => {
            const text = input.value.trim();
            if (text === '') return;

            fetch('/comment/' + item._id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.token,
                },
                body: JSON.stringify({ text }),
            }).then(response => {
                if (response.ok) {
                    fetchComments(item._id);
                }
            }).catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
        }

        button.addEventListener('click', publishComment);

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                publishComment();
            }
        });

        const closeButton = document.createElement('button');
        closeButton.classList.add('close-button');
        closeButton.innerHTML = 'Close';

        closeButton.addEventListener('click', function () {
            itemContainer.innerHTML = '';
            itemContainer.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        });

        itemContainer.addEventListener('click', function (event) {
            if (event.target === itemContainer) {
                itemContainer.innerHTML = '';
                itemContainer.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }
        });

        itemContainer.appendChild(closeButton);

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}


fetchNewMessages = async () => {
    var userId = localStorage.getItem('userId');
    if (userId) {
        const url = '/' + localStorage.getItem('role') + '/' + userId;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.token,
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const item = await response.json();
            let contNotifications = 0;
            item.chats.forEach(item => {
                if (item.new) {
                    contNotifications += item.new;
                }
            });

            if (contNotifications) {
                const profileHeader = document.getElementById('profile-icon');

                const notification = document.createElement('div');
                notification.classList.add('notification');
                notification.id = 'notification';
                if (contNotifications == 1) {
                    notification.innerHTML = contNotifications + ' new message';
                } else {
                    notification.innerHTML = contNotifications + ' new messages';
                }
                // put it as first element
                profileHeader.insertBefore(notification, profileHeader.firstChild);

                notification.addEventListener('click', function () {
                    window.location.href = "/chat.html";
                });
            }

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }
}