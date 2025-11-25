import db from '../lib/database.js'
import fs from 'fs'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'
import baileys from '@whiskeysockets/baileys'

const { proto } = baileys
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
    ? conn.user.jid
    : m.sender

  const user = global.db.data.users[m.sender]
  const name2 = await conn.getName(m.sender)
  const pp = await conn.profilePictureUrl(who, 'image').catch(() => banner)

  let bio
  try {
    const info = await conn.fetchStatus(who)
    bio = info?.status?.trim() || "Sin descripción personal..."
  } catch {
    bio = "Sin descripción personal..."
  }

  const thumbBuffer = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    .then(v => v.arrayBuffer())
    .then(v => Buffer.from(v))
    .catch(() => null)

  const fkontak = {
    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: '🧣' },
    message: { locationMessage: { name: '🍁 ʀᴇɢɪsᴛʀᴏ ɴᴇᴢᴜᴋᴏ', jpegThumbnail: thumbBuffer } },
    participant: '0@s.whatsapp.net'
  }

  if (user.registered) {
    const caption = `🌴 *Ya estás registrado* 🧃

ɴᴏ ɴᴇᴄᴇsɪᴛᴀs ʜᴀᴄᴇʀʟᴏ 🎋

Si deseas borrar tu registro:
> *${usedPrefix}unreg*

ᴜ.ᴜ ɴᴇᴢᴜᴋᴏ - ʙᴏᴛ 🍃`
    
    const productMessage = {
      product: {
        productImage: { url: pp },
        productId: '8888888888888',
        title: '🪵 ʀᴇɢɪsᴛʀᴏ ᴇxɪsᴛᴇɴᴛᴇ 🌳',
        description: global.textbot,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 2001,
        url: `https://wa.me/${who.split('@')[0]}`,
        productImageCount: 1
      },
      businessOwnerJid: who,
      footer: caption,
      mentions: [m.sender]
    }
    return await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
  }

  if (!Reg.test(text)) {
    const caption = `🍂 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ ᴅᴇʟ ʀᴇɢɪsᴛʀᴏ* 🌱

🪸 *${usedPrefix + command} nombre.edad*

Ejemplo:
> *${usedPrefix + command} ${name2}.18*

🌾 ᴇsᴄʀɪʙᴇ ᴛᴜ ɴᴏᴍʙʀᴇ, ʟᴜᴇɢᴏ ᴜɴ ᴘᴜɴᴛᴏ, ʏ ᴛᴜ ᴇᴅᴀᴅ.`
    
    const productMessage = {
      product: {
        productImage: { url: 'https://files.catbox.moe/xp9d85.jpg' },
        productId: '9999999999999',
        title: '🌿 ғᴏʀᴍᴀᴛᴏ ɪɴᴄᴏʀʀᴇᴄᴛᴏ 🪴',
        description: global.textbot,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 2002,
        productImageCount: 1
      },
      businessOwnerJid: who,
      footer: caption,
      mentions: [m.sender]
    }
    return await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
  }
  
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) return m.reply("🌿 ᴇʟ ɴᴏᴍʙʀᴇ ɴᴏ ᴘᴜᴇᴅᴇ ᴇsᴛᴀʀ ᴠᴀᴄɪᴏ.")
  if (!age) return m.reply("🍃 La edad es necesaria.")
  if (name.length >= 100) return m.reply("🦋 ᴇʟ ɴᴏᴍʙʀᴇ ᴇs ᴅᴇᴍᴀsɪᴀᴅᴏ ʟᴀʀɢᴏ.")
  age = parseInt(age)
  if (age > 100) return m.reply("🎅 Ajá papá Noel inmortal? 😭")
  if (age < 15) return m.reply("🍼 Muy pequeñ@ para registrarte.")

  user.name = `${name} ✓`
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  const hora = new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
  const fechaObj = new Date()
  const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
  const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })
  const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  const texto1 = `
 ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ❀ 🍃*ʀᴇɢɪsᴛʀᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ*🍃
 ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ

✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 🎋 ᴜsᴇʀ: ${name2}
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 🍁 ɴᴜᴍᴇʀᴏ: ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
 ◉꙰   ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 🌹 ɴᴏᴍʙʀᴇ ➪ \`\`\`${name}\`\`\`
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 🌳 ᴇᴅᴀᴅ ➪ \`\`\`${age} años\`\`\`
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 🪻 ʙɪᴏ ➪ \`\`\`${bio}\`\`\`
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 💐 ɴs ➪ \`\`\`${sn}\`\`\`
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
 ◉꙰ 🧃 ғᴇᴄʜᴀ ➪ \`\`\`${hora}, ${dia}, ${fecha}
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ


> ✧ 🪸 *ʙɪᴇɴᴠᴇɴɪᴅᴏ(a) ᴛᴜ ʀᴇɢɪsᴛʀᴏ ᴀ sɪᴅᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ*
`

  await m.react?.('🍃')

  const productMessage = {
    product: {
      productImage: { url: pp },
      productId: '51919199620',
      title: `🍂 ʀᴇɢɪsᴛʀᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ 🪴`,
      description: global.textbot,
      currencyCode: 'USD',
      priceAmount1000: '100000',
      retailerId: 2025,
      productImageCount: 1,
    },
    footer: `${texto1}`,
    headerType: 1,
    viewOnce: true,
    businessOwnerJid: m.sender,
  }

  await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler