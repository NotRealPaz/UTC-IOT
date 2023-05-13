import richmenu from './richmenu.json' assert { type: 'json' };
import { readFile } from 'node:fs/promises';
(await import('dotenv')).config()
const channelAccessToken = process.env.CHANNELACCESSTOKEN

// create rich menu
const richid = (await (await fetch("https://api.line.me/v2/bot/richmenu", {
  method: "POST",
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${channelAccessToken}`
  },
  body: JSON.stringify(richmenu),
})).json()).richMenuId;
// Upload image to rich menu
await fetch(`https://api-data.line.me/v2/bot/richmenu/${richid}/content`, {
  method: "POST",
  headers: {
    'Content-Type': 'image/jpeg',
    'Authorization': `Bearer ${channelAccessToken}`
  },
  body: await readFile('./button.jpg')
})
// set rich menu to default
await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richid}`, {
  method: "POST",
  headers: {
    'Authorization': `Bearer ${channelAccessToken}`
  }
})