'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const loginForm = document.querySelector('#login-form');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let username = null;
let password = null;
let selectedUserId = null;
let subscription = null;
let subscriptionMess = null;

async function connect(event) {
    username = document.querySelector('#username').value.trim();
    password = document.querySelector('#password').value.trim();

    if (username && password) {
        await login(username, password, event);
        // let req = new XMLHttpRequest();
        // req.open('POST', "mycar.html");
        // req.onload = function() {
        //     if (req.status == 200) {
        //         usernamePage.classList.add('hidden');
        //         chatPage.classList.remove('hidden');
        //         const socket = new SockJS('/ws');
        //         stompClient = Stomp.over(socket);
        //         stompClient.connect({}, onConnected, onError);
        //         event.preventDefault();
        //     } else {
        //         console.log("Error: " + req.status);
        //     }
        // }
        // req.send();
    }
}


function login(username, password, event)  {
    // return fetch('http://localhost:8080/login', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         username:username, password:password
    //     }),
    //     headers: {
    //         'Content-type': 'application/json; charset=UTF-8',
    //     },
    // })
    //     .then((res) => res.json())
    //     .then((d) => {
    //         console.log(d)
    //         usernamePage.classList.add('hidden');
    //         chatPage.classList.remove('hidden');
    //         const socket = new SockJS('/ws');
    //         stompClient = Stomp.over(socket);
    //         stompClient.connect({}, onConnected, onError);
    //         event.preventDefault();
    //     })
    //     .catch((error) => {
    //         console.log(error.message);
    //     })

    fetch(`?username=${username}&password=${password}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(()=>{
            event.preventDefault();
            console.log('login success');
            usernamePage.classList.add('hidden');
            chatPage.classList.remove('hidden');
            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, onConnected, onError);

        })
        .catch(error => {
            console.error('Error:', error);
            alert(error);
        });
    event.preventDefault();
}


function onConnected() {
    subscription = stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);
    subscriptionMess = stompClient.subscribe(`/user/public`, onMessageReceived);

    // register the connected user
    // stompClient.send("/app/user.addUser",
    //     {},
    //     JSON.stringify({userName: username, password: password, status: 'ONLINE'})
    // );
    document.querySelector('#connected-user-fullname').textContent = username;
    findAndDisplayConnectedUsers().then();
    findAndDisplayConversions().then();
}

async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/users');
    let connectedUsers = await connectedUsersResponse.json();
    connectedUsers = connectedUsers.filter(user => user.username !== username);
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList);
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

async function findAndDisplayConversions() {
    const conversionsResponse = await fetch(`/conversions/${username}`);
    let conversions = await conversionsResponse.json();
    console.log(conversions);
    conversions = conversions.filter(user => user.username !== username);
    const conversionsList = document.getElementById('conversions');
    conversionsList.innerHTML = '';

    conversions.forEach(user => {
        appendUserElement(user, conversionsList);
        if (conversions.indexOf(user) < conversions.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            conversionsList.appendChild(separator);
        }
    });
}


function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.username;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.password;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.username;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

//click to conversion
function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
    console.log('userclick')
    // stompClient.send("/app/read", {}, JSON.stringify({
    //     senderId: username,
    //     recipientId: selectedUserId,
    // }));

}

function displayMessage(senderId, content, timesend) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === username) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    const time = document.createElement('p');
    time.textContent = new Date(timesend).toISOString().replace("T"," ").substring(0, 19);
    message.textContent = content;
    messageContainer.appendChild(message);
    messageContainer.appendChild(time);
    chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${username}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content, chat.timestamp);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}


function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    const timestamp = new Date();
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: username,
            recipientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        displayMessage(username, messageInput.value.trim(), timestamp);
        messageInput.value = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}


async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    console.log('Message received', payload);
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content, message.timestamp);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

function onLogout() {
    // stompClient.send("/app/user.disconnectUser",
    //     {},
    //     JSON.stringify({username: username, password: password, status: 'OFFLINE'})
    // );
    // window.location.reload();
    subscription.unsubscribe();
    subscriptionMess.unsubscribe();
}

loginForm.addEventListener('submit', connect, true); // step 1
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();
