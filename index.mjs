import * as line from '@line/bot-sdk'
import express from 'express'
import { users } from './db.mjs';
(await import('dotenv')).config()

const { CHANNELSECRET, CHANNELACCESSTOKEN, PASSWORD, HOSTNAME, PORT } = process.env;

const config = {
  channelAccessToken: CHANNELACCESSTOKEN,
  channelSecret: CHANNELSECRET
}

const app = express()
app.post('/webhook', line.middleware(config), async (req, res) => res.json(await Promise.all(req.body.events.map(handleEvent))))

const client = new line.Client(config)

const reply = async (token, text) => await client.replyMessage(token, {
  type: 'text', text
})

const isAuth = (userId) => !!users[userId];

const handleEvent = async (event) => {
  if (event.type !== 'message' || event.message.type !== 'text' || event.source.type !== 'user') return null;
  if (event.message.text === PASSWORD) {
    if (isAuth(event.source.userId)) return await reply(event.replyToken, "Already has access!");
    users[event.source.userId] = true;
    return await reply(event.replyToken, "Welcome to UTC Network IOT");
  }

  const [command, arg] = event.message.text.trim().toLowerCase().split(/ +/g);

  if (!isAuth(event.source.userId)) return await reply(event.replyToken, "You do not have access.");

  if (command === 'toggle') {
    try {
      const result = await (await fetch(`http://${HOSTNAME}.local/trigger`)).text()
      if (result === "success") return await reply(event.replyToken, result)
      if (result === "rate limited") return await reply(event.replyToken, result)
      return await reply(event.replyToken, "Error")
    } catch (error) {
      return await reply(event.replyToken, "Error")
    }
  }

  return await reply(event.replyToken, 'Command\r\nToggle - Toggle garage door\r\nBy UTC NETWORK')
}

app.listen(PORT)