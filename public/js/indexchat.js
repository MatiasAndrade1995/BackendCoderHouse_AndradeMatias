const socket = io()

socket.on('Welcome', (data) => {
    console.log(data)
})

function handleSubmit(event) {
    event.preventDefault()
    const messageUser = event.target.messageUser.value
    const user = event.target.user.value
    socket.emit('SendMessage', { messageUser, user })
}

socket.on('refreshmessages', (data) => {
    renderUpdateMessages(data)
})

function renderUpdateMessages(data) {
    const chat = document.getElementById('chat')
    let htmlmessages = data.map(obj =>
        `<h3 class="userChatView">${obj.user}</h3> <div class="msjChatView"><h4>${obj.messageUser}</h4></div>`).join(' ')
    chat.innerHTML = htmlmessages
    chat.scrollTop = chat.scrollHeight
}

document.addEventListener('DOMContentLoaded', event => {
    const chat = document.getElementById('chat')
    chat.scrollTop = chat.scrollHeight
})


//Data para horario de msj
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;
const day = currentDate.getDate();
const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();
const seconds = currentDate.getSeconds();