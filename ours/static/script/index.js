let map;
let radioButtonsValue = 'event';
let jsonQuery = {};

document.addEventListener('DOMContentLoaded', function () {

    const filterForm = document.getElementById('filterForm');
    filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
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
        // clean the map
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
        } else
            return;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        items.forEach(async item => {
            const location = item.location;
            const coordinates = await getCoordinatesFromLocation(location);
            if (coordinates) {
                const [longitude, latitude] = coordinates;
                const { title } = item;
                L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(title);
            }
        });
    } catch (error) {
        console.error('Error during items fetch:', error);
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

        console.log(jsonQuery);

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
    console.log(jsonQuery);
}




function displayCreateButton() {
    // Only logged in users can create notices
    var userId = localStorage.getItem('userId');
    if (userId) {
        var createButton = document.getElementById('createNotice');
        createButton.classList.remove('hidden');
    }
}

function createActivity() {
    // Check if it is logged in
    var userId = localStorage.getItem('userId');
    if (!userId) {
        alert("You must be logged in to create a notice.");
        return;
    }

    // Send user to the correct page
    // User --> createAnnouncement
    // Organisation --> createEvent
    var userRole = localStorage.role;
    if (userRole === 'user')
        window.location.href = "/createAnnouncement.html";
    else if (userRole === 'organisation')
        window.location.href = "/createEvent.html";
    else
        alert("You must be logged in to create a notice.");

}



function createItemList(model, item) {
    const elementContainer = document.createElement('div');
    elementContainer.classList.add('element-container');

    const titleElement = document.createElement('h3');
    titleElement.classList.add('title-container');
    elementContainer.appendChild(titleElement);

    const titleText = document.createElement('div');
    titleElement.appendChild(titleText);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');
    elementContainer.appendChild(infoContainer);

    const mainInfo = document.createElement('div');
    mainInfo.classList.add('main-info');
    infoContainer.appendChild(mainInfo);

    const description = document.createElement('div');
    description.classList.add('description');
    infoContainer.appendChild(description);

    if (model === 'event' || model === 'announcement') {
        const expiredText = document.createElement('div');
        expiredText.classList.add('expired');
        titleElement.appendChild(expiredText);

        titleText.innerHTML = item.title || 'No title';
        if (item.expired) expiredText.innerHTML = 'Expired';

        const descriptionKey = document.createElement('div');
        descriptionKey.classList.add('key');
        descriptionKey.innerHTML = 'Description:';
        const descriptionValue = document.createElement('div');
        descriptionValue.classList.add('value');
        descriptionValue.innerHTML = item.description || 'No description available';
        description.appendChild(descriptionKey);
        description.appendChild(descriptionValue);

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
                fecthObject('User', item.owner.id);
            });

            if (item.date_begin) {
                const dateBegin = document.createElement('div');
                mainInfo.appendChild(dateBegin);
                const dateBeginKey = document.createElement('div');
                dateBeginKey.classList.add('key');
                dateBeginKey.innerHTML = 'Starts:';
                const dateBeginValue = document.createElement('div');
                dateBeginValue.classList.add('value');
                dateBeginValue.innerHTML = item.date_begin.split('T')[0];
                dateBegin.appendChild(dateBeginKey);
                dateBegin.appendChild(dateBeginValue);

                const hourBegin = document.createElement('div');
                mainInfo.appendChild(hourBegin);
                const hourBeginKey = document.createElement('div');
                hourBeginKey.classList.add('key');
                hourBeginKey.innerHTML = 'At:';
                const hourBeginValue = document.createElement('div');
                hourBeginValue.classList.add('value');
                hourBeginValue.innerHTML = item.date_begin.split('T')[1].split('.')[0].slice(0, 5);
                hourBegin.appendChild(hourBeginKey);
                hourBegin.appendChild(hourBeginValue);
            }
            if (item.date_stop) {
                const dateEnd = document.createElement('div');
                mainInfo.appendChild(dateEnd);
                const dateEndKey = document.createElement('div');
                dateEndKey.classList.add('key');
                dateEndKey.innerHTML = 'Ends:';
                const dateEndValue = document.createElement('div');
                dateEndValue.classList.add('value');
                dateEndValue.innerHTML = item.date_stop.split('T')[0];
                dateEnd.appendChild(dateEndKey);
                dateEnd.appendChild(dateEndValue);

                const hourEnd = document.createElement('div');
                mainInfo.appendChild(hourEnd);
                const hourEndKey = document.createElement('div');
                hourEndKey.classList.add('key');
                hourEndKey.innerHTML = 'At:';
                const hourEndValue = document.createElement('div');
                hourEndValue.classList.add('value');
                hourEndValue.innerHTML = item.date_stop.split('T')[1].split('.')[0].slice(0, 5);
                hourEnd.appendChild(hourEndKey);
                hourEnd.appendChild(hourEndValue);
            }
        } else {
            ownerValue.addEventListener('click', function (event) {
                event.preventDefault();
                fecthObject('Organisation', item.owner.id);
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

    options.push({ value: 'score:asc', text: 'Score: Low to High' });
    options.push({ value: 'score:desc', text: 'Score: High to Low' });

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

    // Create the score filter with star score
    const score = document.createElement('div');
    const scoreLabel = document.createElement('label');
    scoreLabel.innerHTML = 'Score:';
    score.appendChild(scoreLabel);

    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('score');

    for (let i = 5; i >= 1; i--) {
        const starLabel = document.createElement('label');
        const starInput = document.createElement('input');
        starInput.setAttribute('type', 'radio');
        starInput.setAttribute('name', 'score');
        starInput.setAttribute('value', i);
        starInput.setAttribute('title', `${i} stars`);
        starLabel.appendChild(starInput);
        starLabel.appendChild(document.createTextNode(` ${i} `));
        scoreDiv.appendChild(starLabel);
    }

    score.appendChild(scoreDiv);
    filterContainer.appendChild(score);

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
            dateInput.setAttribute('type', 'date');
            dateInput.setAttribute('name', 'date');
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
    // score
    $('.score input').change(function () {
        var $radio = $(this);
        $('.score .selected').removeClass('selected');
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
    $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
    });

    // Clear the input value on cancel event
    $('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
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



async function fecthObject(model, ownerId) {
    const url = '/' + model + '/' + ownerId;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const item = await response.json();
        const itemContainer = document.getElementById('showObject');

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
