const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
let userName = "UnKnown"; // it will store only the current user name.
let totalUsers = 0;
let usersNames = [] // It will store all the connected users name who all connected to the server at a moment
// Connect to the WebSocket server
const ws = new WebSocket('wss://kabilan-websocket-server.glitch.me/');

ws.onopen = () => {
    console.log('Connected to WebSocket server.');
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
};


function sendMessage() {
    const clientMessage = messageInput.value.trim();
    if (clientMessage) {
        displayMessage(clientMessage, userName); // Display on UI
        const userDetails = {
            "username": userName,
            "message": clientMessage
        }
        ws.send(JSON.stringify(userDetails)); // Send to server
        messageInput.value = ''; // Clear input field
    }
}

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    const nameContainer = document.createElement('div');
    const dataContainer = document.createElement('div');
    nameContainer.classList.add('nameContainer');
    dataContainer.classList.add('dataContainer');
    messageDiv.classList.add('client', 'message', sender); // Apply styles based on sender
    if (sender != userName) {

        nameContainer.textContent = sender;
        messageDiv.classList.add('server');
    }
    dataContainer.textContent = message // Add message text
    messageDiv.appendChild(nameContainer);
    messageDiv.appendChild(dataContainer);
    chatBox.appendChild(messageDiv); // Add to chat box
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

function submitName() {
    const username = document.getElementById('username').value;
    userName = username;
    if (username) {
        document.getElementById('nameModal').style.display = 'none'; // Hide the modal
        document.getElementById('mainContent').style.display = 'block'; // Show main content
    } else {
        alert('Please enter your name.');
    }
}

