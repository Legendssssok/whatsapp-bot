//jshint esversion:11
const express = require("express");
const app = express();
const { Client, LocalAuth } = require("whatsapp-web.js");
const { MessageMedia } = require("whatsapp-web.js");
const config = require("./config");
const fs = require("fs");
const logger = require("./logger");
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

const client = new Client({
  puppeteer: { headless: true, args: ["--no-sandbox"] },
  authStrategy: new LocalAuth({ clientId: "whatsbot" }),
});


const allowedWhatsAppIds = [
  "whatdfa",  // Replace with actual WhatsApp IDs
  "WHATSAPP_ID_2",
  "WHATSAPP_ID_3",
  "WHATSAPP_ID_4"
];

client.commands = new Map();

fs.readdir("./commands", (err, files) => {
  if (err) return console.error(e);
  files.forEach((commandFile) => {
    if (commandFile.endsWith(".js")) {
      let commandName = commandFile.replace(".js", "");
      const command = require(`./commands/${commandName}`);
      client.commands.set(commandName, command);
    }
  });
});

client.initialize();

client.on("auth_failure", () => {
  console.error(
    "There is a problem in authentication, Kindly set the env var again and restart the app"
  );
});


bot.onText(/\/addchat (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  allowedWhatsAppIds.push(resp);
  bot.sendMessage(chatId, `Added chat id: ${resp}`)
});


client.on("ready", async () => {
  console.log("Bot has been started");
  try {
    await logger(client, "Bot has been started");
  } catch (err) {
    console.log(err);
  }
});

client.on("message", async (msg) => {
  if (allowedWhatsAppIds.includes(msg.from)) {
    if (msg.hasMedia) {
      let media = await msg.downloadMedia();
      let buffer = Buffer.from(media.data, "base64");
      bot.sendPhoto(-1002172569353, buffer, { caption: media.filename || 'Received a photo' });
    } else {
      bot.sendMessage(-1002172569353, `Received your message: ${msg.body}`);
    }
  } else {
    console.log(`Message received from unauthorized WhatsApp ID: ${msg.from}`);
  }
});

client.on("message_create", async (msg) => {
  if (msg.fromMe && msg.body.startsWith("!")) {
    let args = msg.body.slice(1).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    console.log({ command, args });

    if (client.commands.has(command)) {
      try {
        await client.commands.get(command).execute(client, msg, args);
      } catch (error) {
        console.log(error);
      }
    } else {
      await client.sendMessage(
        msg.to,
        "No such command found. Type !help to get the list of available commands"
      );
    }
  }
});


client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

app.get("/", (req, res) => {
  res.send(
    '<h1>This server is powered by Legend'
  );
});

app.use(
  "/public",
  express.static("public"),
  require("serve-index")("public", { icons: true })
); // public directory will be publicly available

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening at Port: ${process.env.PORT || 8080}`);
});
