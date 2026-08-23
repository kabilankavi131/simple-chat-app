const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');
const emojiToggle = document.getElementById('emoji-toggle');
const emojiPicker = document.getElementById('emoji-picker');
const connectionStatus = document.getElementById('connectionStatus');
let userName = "UnKnown"; // it will store only the current user name.
let totalUsers = 0;
let usersNames = [] // It will store all the connected users name who all connected to the server at a moment
// Connect to the WebSocket server
const ws = new WebSocket('https://websocket-server-1-k9xu.onrender.com/');

ws.onopen = () => {
    console.log('Connected to WebSocket server.');
    connectionStatus.textContent = 'Live now';
};

ws.onmessage = (event) => {
    const serverMessage = JSON.parse(event.data);

    console.log(serverMessage);

    // Destructure the message and username from the server response
    const { username, message, userCount, users } = serverMessage;
    usersNames = users;
    document.getElementById("userCounts").innerText = userCount;
    let dummy = "";
    for (let i = 0; i < usersNames.length; i++) {
        if (i < 3) {
            dummy += usersNames[i] + ",";
        }
        if (i == 3) {
            dummy += usersNames[i] + ", ...";
        }
    }
    document.getElementById("fetchUsersNames").innerText = dummy;
    if (userCount >= 4) {
        document.getElementById("moreUsers").innerText = `+ ${userCount - 4} more`;
    }

    // Display the message in the UI
    displayMessage(message, username || 'server');
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server.');
    connectionStatus.textContent = 'Reconnecting…';
};


function sendMessage() {
    const clientMessage = messageInput.value.trim();
    if (clientMessage) {
        displayMessage(clientMessage, userName); // Display on UI
        const userDetails = {
            "username": userName,
            "message": clientMessage
        }
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(userDetails)); // Send to server
        }
        messageInput.value = ''; // Clear input field
    }
}

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    const nameContainer = document.createElement('div');
    const dataContainer = document.createElement('div');
    const metaContainer = document.createElement('div');
    const isOwnMessage = sender === userName;
    nameContainer.classList.add('nameContainer');
    dataContainer.classList.add('dataContainer');
    messageDiv.classList.add('message', isOwnMessage ? 'client' : 'server');
    if (!isOwnMessage) {

        nameContainer.textContent = sender;
    }
    dataContainer.textContent = message // Add message text
    metaContainer.classList.add('message-meta');
    metaContainer.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    messageDiv.appendChild(nameContainer);
    messageDiv.appendChild(dataContainer);
    messageDiv.appendChild(metaContainer);
    chatBox.appendChild(messageDiv); // Add to chat box
    document.getElementById('chatWelcome')?.remove();
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    themeToggle.querySelector('span').textContent = isDark ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    localStorage.setItem('chat-theme', theme);
}

themeToggle.addEventListener('click', () => {
    applyTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
});

emojiToggle.addEventListener('click', () => {
    emojiPicker.hidden = !emojiPicker.hidden;
});

emojiPicker.addEventListener('click', (event) => {
    if (event.target.tagName !== 'BUTTON') return;
    messageInput.value += event.target.textContent;
    emojiPicker.hidden = true;
    messageInput.focus();
});

document.addEventListener('click', (event) => {
    if (!emojiPicker.contains(event.target) && event.target !== emojiToggle) {
        emojiPicker.hidden = true;
    }
});

applyTheme(localStorage.getItem('chat-theme') || 'light');

function submitName() {
    const username = document.getElementById('username').value.replace(/\s+/g, '');
    userName = username;
    if (username) {
        document.getElementById('nameModal').style.display = 'none'; // Hide the modal
        document.getElementById('mainContent').style.display = 'block'; // Show main content
    } else {
        alert('Please enter your name.');
    }
}

document.getElementById('username').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitName();
});
