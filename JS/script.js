import { Apinator } from 'https://esm.sh/@apinator/client';

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
let userName = 'UnKnown';
let usersNames = [];

const APINATOR_APP_KEY = 'your-app-key';
const APINATOR_CLUSTER = 'us';
const CHAT_CHANNEL = 'chat-room';

const client = new Apinator({
    appKey: APINATOR_APP_KEY,
    cluster: APINATOR_CLUSTER
});

const channel = client.connect().subscribe(CHAT_CHANNEL);

channel.bind('message', (payload) => {
    const data = normalizeMessagePayload(payload);
    handleIncomingMessage(data);
});

channel.bind('client-message', (payload) => {
    const data = normalizeMessagePayload(payload);
    handleIncomingMessage(data);
});

function normalizeMessagePayload(payload) {
    if (typeof payload === 'string') {
        try {
            return JSON.parse(payload);
        } catch {
            return { username: 'server', message: payload };
        }
    }

    if (payload && typeof payload === 'object') {
        return payload;
    }

    return { username: 'server', message: String(payload) };
}

function handleIncomingMessage(serverMessage) {
    const { username, message, users = [] } = serverMessage;

    usersNames = users;
    const userCount = usersNames.length || 1;

    document.getElementById('userCounts').innerText = String(userCount);

    let dummy = '';
    for (let i = 0; i < usersNames.length; i += 1) {
        if (i < 3) {
            dummy += `${usersNames[i]},`;
        }
        if (i === 3) {
            dummy += `${usersNames[i]}, ...`;
        }
    }

    document.getElementById('fetchUsersNames').innerText = dummy || 'You';
    document.getElementById('moreUsers').innerText = userCount >= 4 ? `+ ${userCount - 4} more` : '';

    displayMessage(message, username || 'server');
}

function sendMessage() {
    const clientMessage = messageInput.value.trim();
    if (!clientMessage) {
        return;
    }

    const userDetails = {
        username: userName,
        message: clientMessage,
        users: usersNames
    };

    displayMessage(clientMessage, userName);

    const result = channel.trigger?.('client-message', JSON.stringify(userDetails));
    if (result && typeof result.catch === 'function') {
        result.catch((error) => {
            console.error('Failed to publish message to Apinator. Ensure channel/event auth is configured.', error);
        });
    }

    messageInput.value = '';
}

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    const nameContainer = document.createElement('div');
    const dataContainer = document.createElement('div');

    nameContainer.classList.add('nameContainer');
    dataContainer.classList.add('dataContainer');
    messageDiv.classList.add('client', 'message', sender);

    if (sender !== userName) {
        nameContainer.textContent = sender;
        messageDiv.classList.add('server', 'message');
    }

    dataContainer.textContent = message;
    messageDiv.appendChild(nameContainer);
    messageDiv.appendChild(dataContainer);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function submitName() {
    const username = document.getElementById('username').value.replace(/\s+/g, '');
    userName = username;

    if (username) {
        document.getElementById('nameModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    } else {
        alert('Please enter your name.');
    }
}

window.sendMessage = sendMessage;
window.submitName = submitName;
