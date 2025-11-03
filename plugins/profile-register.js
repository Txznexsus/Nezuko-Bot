import db from '../lib/database.js'
import fs from 'fs'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'
import baileys, { WAMessageStubType } from '@whiskeysockets/baileys'

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
  const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://i.postimg.cc/Z5VtjKrz/kaneki-ai.jpg')

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
    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
    message: { locationMessage: { name: textbot, jpegThumbnail: thumbBuffer } },
    participant: '0@s.whatsapp.net'
  }

  if (user.registered) {
    const caption = `     ⚠️ 𝐀 𝐕 𝐈 𝐒 𝐎 ⚠️
Ya estás registrado en el sistema.

Si deseas reiniciar tu registro, usa:
> *${usedPrefix}unreg*

✧ No es necesario volver a registrarte.`

    const productMessage = {
      product: {
        productImage: { url: pp },
        productId: '8888888888888',
        title: '🕷️ Registro Existente',
        description: caption,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 2001,
        url: `https://wa.me/${who.split('@')[0]}`,
        productImageCount: 1
      },
      businessOwnerJid: who,
      footer: "🚀 Ya estás registrado en el sistema.",
      mentions: [m.sender]
    }

    return await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
  }

  if (!Reg.test(text)) {
    const caption = `Usa el comando correctamente:

🌿 *${usedPrefix + command} nombre.edad*

Ejemplo:
> *${usedPrefix + command} ${name2}.18*

💮 Consejo: Escribe tu nombre seguido de un punto y tu edad.`

    const productMessage = {
      product: {
        productImage: { url: 'https://i.pinimg.com/originals/b3/67/d5/b367d513d861de468305c32c6cd22756.jpg' },
        productId: '9999999999999',
        title: '🍓 Error de Formato',
        description: caption,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 2002,
        url: 'https://github.com/Shadow-nex',
        productImageCount: 1
      },
      businessOwnerJid: who,
      footer: "⛔ 𝐄𝐑𝐑𝐎𝐑 𝐃𝐄 𝐅𝐎𝐑𝐌𝐀𝐓𝐎 ⛔",
      mentions: [m.sender]
    }

    return await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
  }

  let [_, name, splitter, age] = text.match(Reg)
  if (!name) return m.reply("☄️ El nombre no puede estar vacío.")
  if (!age) return m.reply("🍃 La edad no puede estar vacía.")
  if (name.length >= 100) return m.reply("🍬 El nombre es demasiado largo.")
  age = parseInt(age)
  if (age > 100) return m.reply("⭐ ¿Más de 100 años? Inmortal detected.")
  if (age < 5) return m.reply("💐 Demasiado joven para registrarte.")

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
 ׄ 🎋 ׅ 𝙍𝙀𝙂𝙄𝙎𝙏𝙍𝙊 𝙀𝙓𝙄𝙏𝙊𝙎𝙊 🍃

🌾 *Nombre:* ${name}
🧩 *Usuario:* ${name2}
🌿 *Número:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
🧢 *Edad:* ${age} años
💊 *Bio:* ${bio}
📆 *Fecha:* ${fecha}
🧬 *Hora:* ${hora}
🌙 *Día:* ${dia}
🔥 *ID:* ${sn}`

  const texto2 = `
🩸 *Bienvenido(a) al sistema, ${name2}!*
Tu registro ha sido completado exitosamente por *${botname}* 🕷️
──────────────────────────⬣
`

  await m.react?.('🩸')

  const productMessage = {
    product: {
      productImage: { url: pp },
      productId: '51919199620',
      title: `🍃 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 - 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙾 ⚡`,
      description: `${texto1}\n──────────────────────\n${texto2}`,
      currencyCode: 'USD',
      priceAmount1000: '100000',
      retailerId: 2025,
      productImageCount: 1,
    },
    footer: `2025 ${botname}`,
    headerType: 1,
    viewOnce: true,
    document: fs.readFileSync('./package.json'),
    fileName: `「 🍟 𝐊𝐀𝐍𝐄𝐊𝐈 ⚡ 」`,
    mimetype: 'application/vnd.ms-excel',
    fileLength: 99999999,
    businessOwnerJid: m.sender,
    caption: '✨ Registro completado exitosamente.',
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        title: '🍁 Registro Kaneki AI',
        body: 'Completa tu registro ahora mismo 💫',
        thumbnailUrl: 'https://i.postimg.cc/Z5VtjKrz/kaneki-ai.jpg',
        sourceUrl: 'https://wa.me/0',
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  }

  await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler