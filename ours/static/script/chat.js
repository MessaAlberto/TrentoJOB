var canvas = '';
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('nokey'),

        can_w = parseInt(canvas.getAttribute('width')),
        can_h = parseInt(canvas.getAttribute('height')),
        ctx = canvas.getContext('2d');
    goMovie();

    fetchList();
    // evry 20 seconds fetch list
    setInterval(() => {
        fetchList();
    }, 20000);

});


async function fetchList() {
    const url = '/' + localStorage.getItem('role') + '/' + localStorage.getItem('userId');

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.token,
        }
    }).then(async response => {
        if (response.ok) {
            const entity = await response.json();
            displayList(entity.chats);
        } else {
            throw new Error('Failed to fetch');
        }
    });
}


function displayList(data) {
    const list = document.getElementById('dynamicList');
    list.innerHTML = '';

    data.forEach(item => {
        const chat = createChatContainer(item);
        list.appendChild(chat);
    });
}

function createChatContainer(item) {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'list-chat-container';

    const chatBody = document.createElement('div');
    chatBody.className = 'list-chat-body';
    chatContainer.appendChild(chatBody);

    const chatHeader = document.createElement('div');
    chatHeader.className = 'list-chat-header';
    chatBody.appendChild(chatHeader);

    const otherUsername = document.createElement('h3');
    otherUsername.className = 'list-other-username';
    otherUsername.innerHTML = item.other.username;
    chatHeader.appendChild(otherUsername);

    const date = document.createElement('p');
    date.className = 'list-date';
    const today = new Date();
    const lastDate = new Date(item.lastDate);
    if (today.getDate() === lastDate.getDate() && today.getMonth() === lastDate.getMonth() && today.getFullYear() === lastDate.getFullYear()) {
        date.innerHTML = lastDate.getHours() + ':' + lastDate.getMinutes();
    } else {
        date.innerHTML = lastDate.getDate() + '/' + (lastDate.getMonth() + 1) + '/' + lastDate.getFullYear();
    }
    chatHeader.appendChild(date);

    const lastMessageContainer = document.createElement('div');
    lastMessageContainer.className = 'last-message-container';
    chatBody.appendChild(lastMessageContainer);

    const lastMessage = document.createElement('p');
    lastMessage.className = 'last-message';
    if (item.myTurn) {
        // other name + last message
        lastMessage.innerHTML = item.other.username + ': ' + item.lastMessage;
    } else {
        lastMessage.innerHTML = 'You: ' + item.lastMessage;
    }
    lastMessageContainer.appendChild(lastMessage);

    if (item.new) {
        const newMessages = document.createElement('p');
        newMessages.className = 'new-messages';
        newMessages.innerHTML = item.new;
        lastMessageContainer.appendChild(newMessages);

        lastMessage.style.fontWeight = 'bold';
    }

    const chatButtons = document.createElement('div');
    chatButtons.className = 'list-chat-buttons';
    chatContainer.appendChild(chatButtons);

    const reportButton = document.createElement('button');
    reportButton.className = 'report-button';
    reportButton.innerHTML = 'Report';
    chatButtons.appendChild(reportButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = 'Delete';
    chatButtons.appendChild(deleteButton);

    chatContainer.addEventListener('click', () => {
        openChat(item.id);
    });

    reportButton.addEventListener('click', (e) => {
        e.stopPropagation();
        alert('/* Reported TODO */');
    });

    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        alert('/* Deleted TODO */');
    });


    return chatContainer;
}


async function openChat(chatId) {
    // Clear new messages from element chat list
    const chat = document.querySelector('.list-chat-container');
    const newMessages = chat.querySelector('.new-messages');
    if (newMessages) {
        chat.querySelector('.last-message').style.fontWeight = 'normal';
        chat.querySelector('.last-message-container').removeChild(newMessages);
    }

    const url = '/chat/' + chatId;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.token,
        }
    }).then(async response => {
        if (response.ok) {
            const chat = await response.json();
            displayChat(chat);
        } else {
            throw new Error('Failed to fetch');
        }
    });
}


async function displayChat(chat) {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = '';

    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatContainer.appendChild(chatHeader);

    const username = document.createElement('h3');
    username.className = 'other-username';
    if (chat.memberA.username === localStorage.username)
        username.innerHTML = chat.memberB.username;
    else
        username.innerHTML = chat.memberA.username;
    chatHeader.appendChild(username);

    const chatButtons = document.createElement('div');
    chatButtons.className = 'chat-buttons';
    chatHeader.appendChild(chatButtons);

    const reportButton = document.createElement('button');
    reportButton.className = 'report-button';
    reportButton.innerHTML = 'Report';
    chatButtons.appendChild(reportButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = 'Delete';
    chatButtons.appendChild(deleteButton);

    const chatBody = document.createElement('div');
    chatBody.className = 'chat-body';
    chatContainer.appendChild(chatBody);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    chatContainer.appendChild(inputContainer);

    const documentButton = document.createElement('button');
    documentButton.className = 'document-button';
    documentButton.innerHTML = '&#128206;';
    inputContainer.appendChild(documentButton);

    const inputText = document.createElement('input');
    inputText.className = 'input-text';
    inputText.placeholder = 'Type a message...';
    inputContainer.appendChild(inputText);

    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.innerHTML = 'Send';
    inputContainer.appendChild(sendButton);

    chat.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        // if it's not my message add classList 'not-mine'
        if (message.sender.username !== localStorage.username)
            messageElement.classList.add('not-mine');
        else
            messageElement.classList.add('mine');

        const textElement = document.createElement('span');
        textElement.className = 'text';
        textElement.textContent = message.text;
        messageElement.appendChild(textElement);

        const dateElement = document.createElement('span');
        dateElement.className = 'date';
        // if today show only hours and minutes
        const today = new Date();
        const lastDate = new Date(message.date);
        if (today.getDate() === lastDate.getDate() && today.getMonth() === lastDate.getMonth() && today.getFullYear() === lastDate.getFullYear()) {
            lastDate.setSeconds(0);
            dateElement.textContent = 'Today ' + lastDate.getHours() + ':' + lastDate.getMinutes();
        } else {
            lastDate.setSeconds(0);
            dateElement.textContent = lastDate.getDate() + '/' + (lastDate.getMonth() + 1) + '/' + lastDate.getFullYear() + ' ' + lastDate.getHours() + ':' + lastDate.getMinutes();
        }
        messageElement.appendChild(dateElement);

        chatBody.appendChild(messageElement);
    });

    // Scroll to the bottom of the chat body
    chatBody.scrollTop = chatBody.scrollHeight;

    const sendMessage = () => {
        const messageText = inputText.value.trim();
        if (messageText === '') return;
        
        inputText.value = '';

        // Add new message to chat body
        const messageElement = document.createElement('div');
        messageElement.className = 'message mine';

        const textElement = document.createElement('span');
        textElement.className = 'text';
        textElement.textContent = messageText;
        messageElement.appendChild(textElement);

        const dateElement = document.createElement('span');
        dateElement.className = 'date';
        const today = new Date();
        dateElement.textContent = 'Today ' + today.getHours() + ':' + today.getMinutes();
        messageElement.appendChild(dateElement);

        chatBody.appendChild(messageElement);

        // Scroll to the bottom of the chat body
        chatBody.scrollTop = chatBody.scrollHeight;

        // Send message to server
        const url = '/chat/message/' + chat._id;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token,
            },
            body: JSON.stringify({ text: messageText })
        }).then(async response => {
            if (response.ok) {
                const data = await response.json();
                console.log(data);
            } else {
                throw new Error('Failed to fetch');
            }
        }).catch(error => {
            console.error('Error:', error);
        });

        // Upload last message to user.chatStatus
        const myLastMessage = '/' + localStorage.getItem('role') + '/' + localStorage.getItem('userId');

        fetch(myLastMessage, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token,
            },
            body: JSON.stringify({
                action: 'addMessage',
                chatId: chat._id,
                lastMessage: messageText,
                lastDate: new Date().toISOString(),
                new: 0,
                myTurn: false,
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to update chat status');
            }
            return response.json();
        }).then(data => {
            console.log('Chat status updated', data);
        }).catch(error => {
            console.error('Error:', error);
        });

        if (chat.memberA.id === localStorage.userId)
            otherId = chat.memberB.id;
        else
            otherId = chat.memberA.id;
        const otherLastMessage = '/' + localStorage.getItem('role') + '/' + otherId;

        fetch(otherLastMessage, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token,
            },
            body: JSON.stringify({
                action: 'addMessage',
                chatId: chat._id,
                lastMessage: messageText,
                lastDate: new Date().toISOString(),
                new: 1,
                myTurn: true,
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to update chat status');
            }
            return response.json();
        }
        ).then(data => {
            console.log('Chat status updated', data);
        }).catch(error => {
            console.error('Error:', error);
        });

        fetchList();
    };

    sendButton.addEventListener('click', sendMessage);
    
    inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });


    reportButton.addEventListener('click', () => {
        alert('/* Reported TODO */');
    });

    deleteButton.addEventListener('click', () => {
        alert('/* Deleted TODO */');
    });

    return chatContainer;
}











var BALL_NUM = 30;

var ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 0,
    alpha: 1,
    phase: 0
},
    ball_color = {
        r: 207,
        g: 255,
        b: 4
    },
    R = 2,
    balls = [],
    alpha_f = 0.03,
    alpha_phase = 0,

    // Line
    link_line_width = 0.8,
    dis_limit = 260,
    add_mouse_point = true,
    mouse_in = false,
    mouse_ball = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 0,
        type: 'mouse'
    };

// Random speed
function getRandomSpeed(pos) {
    var min = -1,
        max = 1;
    switch (pos) {
        case 'top':
            return [randomNumFrom(min, max), randomNumFrom(0.1, max)];
            break;
        case 'right':
            return [randomNumFrom(min, -0.1), randomNumFrom(min, max)];
            break;
        case 'bottom':
            return [randomNumFrom(min, max), randomNumFrom(min, -0.1)];
            break;
        case 'left':
            return [randomNumFrom(0.1, max), randomNumFrom(min, max)];
            break;
        default:
            return;
            break;
    }
}
function randomArrayItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumFrom(min, max) {
    return Math.random() * (max - min) + min;
}

// Random Ball
function getRandomBall() {
    var pos = randomArrayItem(['top', 'right', 'bottom', 'left']);
    switch (pos) {
        case 'top':
            return {
                x: randomSidePos(can_w),
                y: -R,
                vx: getRandomSpeed('top')[0],
                vy: getRandomSpeed('top')[1],
                r: R,
                alpha: 1,
                phase: randomNumFrom(0, 10)
            }
            break;
        case 'right':
            return {
                x: can_w + R,
                y: randomSidePos(can_h),
                vx: getRandomSpeed('right')[0],
                vy: getRandomSpeed('right')[1],
                r: R,
                alpha: 1,
                phase: randomNumFrom(0, 10)
            }
            break;
        case 'bottom':
            return {
                x: randomSidePos(can_w),
                y: can_h + R,
                vx: getRandomSpeed('bottom')[0],
                vy: getRandomSpeed('bottom')[1],
                r: R,
                alpha: 1,
                phase: randomNumFrom(0, 10)
            }
            break;
        case 'left':
            return {
                x: -R,
                y: randomSidePos(can_h),
                vx: getRandomSpeed('left')[0],
                vy: getRandomSpeed('left')[1],
                r: R,
                alpha: 1,
                phase: randomNumFrom(0, 10)
            }
            break;
    }
}
function randomSidePos(length) {
    return Math.ceil(Math.random() * length);
}

// Draw Ball
function renderBalls() {
    Array.prototype.forEach.call(balls, function (b) {
        if (!b.hasOwnProperty('type')) {
            ctx.fillStyle = 'rgba(' + ball_color.r + ',' + ball_color.g + ',' + ball_color.b + ',' + b.alpha + ')';
            ctx.beginPath();
            ctx.arc(b.x, b.y, R, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    });
}

// Update balls
function updateBalls() {
    var new_balls = [];
    Array.prototype.forEach.call(balls, function (b) {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x > -(50) && b.x < (can_w + 50) && b.y > -(50) && b.y < (can_h + 50)) {
            new_balls.push(b);
        }

        // alpha change
        b.phase += alpha_f;
        b.alpha = Math.abs(Math.cos(b.phase));
    });

    balls = new_balls.slice(0);
}

// Draw lines
function renderLines() {
    var fraction, alpha;
    for (var i = 0; i < balls.length; i++) {
        for (var j = i + 1; j < balls.length; j++) {

            fraction = getDisOf(balls[i], balls[j]) / dis_limit;

            if (fraction < 1) {
                alpha = (1 - fraction).toString();

                ctx.strokeStyle = 'rgba(150,150,150,' + alpha + ')';
                ctx.lineWidth = link_line_width;

                ctx.beginPath();
                ctx.moveTo(balls[i].x, balls[i].y);
                ctx.lineTo(balls[j].x, balls[j].y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// calculate distance between two points
function getDisOf(b1, b2) {
    var delta_x = Math.abs(b1.x - b2.x),
        delta_y = Math.abs(b1.y - b2.y);

    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
}

// add balls if there a little balls
function addBallIfy() {
    if (balls.length < BALL_NUM) {
        balls.push(getRandomBall());
    }
}

// Render
function render() {
    ctx.clearRect(0, 0, can_w, can_h);

    renderBalls();

    renderLines();

    updateBalls();

    addBallIfy();

    window.requestAnimationFrame(render);
}

// Init Balls
function initBalls(num) {
    for (var i = 1; i <= num; i++) {
        balls.push({
            x: randomSidePos(can_w),
            y: randomSidePos(can_h),
            vx: getRandomSpeed('top')[0],
            vy: getRandomSpeed('top')[1],
            r: R,
            alpha: 1,
            phase: randomNumFrom(0, 10)
        });
    }
}
// Init Canvas
function initCanvas() {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);

    can_w = parseInt(canvas.getAttribute('width'));
    can_h = parseInt(canvas.getAttribute('height'));
}
window.addEventListener('resize', function (e) {
    initCanvas();
});

function goMovie() {
    initCanvas();
    initBalls(BALL_NUM);
    window.requestAnimationFrame(render);
}






