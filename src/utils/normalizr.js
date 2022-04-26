const { normalize, schema } = require("normalizr");
const { v4: uuid } = require("uuid");
const util = require("util");

function print(object) {
  console.log(util.inspect(object, false, 12, true));
}

//Entity de Author que pone como id al mail
const authorSchema = new schema.Entity("author");

// Entity de Mensajes basado en la id de author (mail)

const messageSchema = new schema.Entity("message", {
  id: uuid(),
  author: authorSchema,
});

const chat = new schema.Entity("chat", {
  author: authorSchema,
  msg: [messageSchema],
});

const normalizeChat = (data) => {
  const jsonData = JSON.parse(data);
  return normalize({ ...jsonData, id: "content" }, chat);
};

module.exports = { normalizeChat };
