const socket = io();

socket.on("server:all_messages", (data) => {
  renderMessages(data);
});

const renderMessages = (data) => {
  document.querySelector("#messagesChat").innerHTML = data
    .map((msg) => {
      return `<div class="messageContainer"><div class="messageEmail">${msg.author.email}</div><div class="messageDate">&nbsp;&nbsp;&nbsp;[${msg.author.date}]&nbsp;&nbsp;&nbsp;</div><div class="messageText">${msg.mensaje}</div></div>`;
    })
    .join(" ");
};

const chatForm = document.querySelector("#myFormChat");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = {
    author: {
      email: document.querySelector("#email").value,
      name: document.querySelector("#name").value,
      lastname: document.querySelector("#lastname").value,
      age: document.querySelector("#age").value,
      avatar: document.querySelector("#avatar").value,
      date: new Date().toLocaleString(),
    },
    mensaje: document.querySelector("#texto").value,
  };

  socket.emit("client:new_message", msg);
});
