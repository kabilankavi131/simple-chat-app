const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');
const emojiToggle = document.getElementById('emoji-toggle');
const emojiPicker = document.getElementById('emoji-picker');
const connectionStatus = document.getElementById('connectionStatus');
const participantsToggle = document.getElementById('participants-toggle');
const participantsOverlay = document.getElementById('participants-overlay');
const participantsClose = document.getElementById('participants-close');
const participantsList = document.getElementById('participants-list');
const participantsCount = document.getElementById('participants-count');
const menuToggle = document.getElementById('menu-toggle');
const chatMenu = document.getElementById('chat-menu');
const menuMembers = document.getElementById('menu-members');
const menuTheme = document.getElementById('menu-theme');
const clearChatButton = document.getElementById('clear-chat');
const clearChatModal = document.getElementById('clearChatModal');
const cancelClearChat = document.getElementById('cancel-clear-chat');
const confirmClearChat = document.getElementById('confirm-clear-chat');
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
    const visibleUsers = usersNames.slice(0, 3);
    document.getElementById("fetchUsersNames").innerText = visibleUsers.join(", ") || "You";
    const remainingUsers = Math.max(0, userCount - visibleUsers.length);
    document.getElementById("moreUsers").innerText = remainingUsers ? ` + ${remainingUsers} more` : "";
    renderParticipants();

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

function renderParticipants() {
    const members = usersNames.length ? usersNames : [userName];
    participantsCount.textContent = members.length;
    participantsList.replaceChildren(...members.map((member) => {
        const item = document.createElement('div');
        const avatar = document.createElement('div');
        const name = document.createElement('span');
        const you = document.createElement('span');
        item.className = 'participant';
        avatar.className = 'participant-avatar';
        name.className = 'participant-name';
        avatar.textContent = member.slice(0, 1).toUpperCase();
        name.textContent = member;
        item.append(avatar, name);
        if (member === userName) {
            you.className = 'participant-you';
            you.textContent = 'You';
            item.appendChild(you);
        }
        return item;
    }));
}

function setParticipantsOpen(isOpen) {
    participantsOverlay.hidden = !isOpen;
    participantsToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) renderParticipants();
}

function setChatMenuOpen(isOpen) {
    chatMenu.hidden = !isOpen;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
}

function showWelcome() {
    const welcome = document.createElement('div');
    welcome.className = 'chat-welcome';
    welcome.id = 'chatWelcome';
    welcome.innerHTML = '<div class="welcome-orb">✦</div><strong>Welcome to Tech Buddies</strong><span>Say hello and start the conversation.</span>';
    chatBox.replaceChildren(welcome);
}

function setClearChatModalOpen(isOpen) {
    clearChatModal.hidden = !isOpen;
    if (isOpen) confirmClearChat.focus();
}

participantsToggle.addEventListener('click', () => setParticipantsOpen(participantsOverlay.hidden));
participantsClose.addEventListener('click', () => setParticipantsOpen(false));
participantsOverlay.addEventListener('click', (event) => {
    if (event.target === participantsOverlay) setParticipantsOpen(false);
});

menuToggle.addEventListener('click', () => setChatMenuOpen(chatMenu.hidden));
menuMembers.addEventListener('click', () => {
    setChatMenuOpen(false);
    setParticipantsOpen(true);
});
menuTheme.addEventListener('click', () => {
    setChatMenuOpen(false);
    themeToggle.click();
});
clearChatButton.addEventListener('click', () => {
    setChatMenuOpen(false);
    setClearChatModalOpen(true);
});
cancelClearChat.addEventListener('click', () => setClearChatModalOpen(false));
confirmClearChat.addEventListener('click', () => {
    showWelcome();
    setClearChatModalOpen(false);
});
clearChatModal.addEventListener('click', (event) => {
    if (event.target === clearChatModal) setClearChatModalOpen(false);
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !clearChatModal.hidden) setClearChatModalOpen(false);
});

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
    if (!chatMenu.contains(event.target) && event.target !== menuToggle) {
        setChatMenuOpen(false);
    }
});

applyTheme(localStorage.getItem('chat-theme') || 'light');

function submitName() {
    const username = document.getElementById('username').value.replace(/\s+/g, '');
    userName = username;
    if (username) {
        document.getElementById('nameModal').style.display = 'none'; // Hide the modal
        document.getElementById('mainContent').style.display = 'flex'; // Show main content
        messageInput.focus();
        renderParticipants();
    } else {
        alert('Please enter your name.');
    }
}

document.getElementById('username').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitName();
});
