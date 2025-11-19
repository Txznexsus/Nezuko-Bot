import fs from 'fs'
import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const prefijosPais = {
  // (tus prefijos intactos)
  '1': '🇺🇸 Estados Unidos / 🇨🇦 Canadá',
  '7': '🇷🇺 Rusia / 🇰🇿 Kazajistán',
  '20': '🇪🇬 Egipto',
  '27': '🇿🇦 Sudáfrica',
  '30': '🇬🇷 Grecia',
  '31': '🇳🇱 Países Bajos',
  '32': '🇧🇪 Bélgica',
  '33': '🇫🇷 Francia',
  '34': '🇪🇸 España',
  '39': '🇮🇹 Italia',
  // ... etc
  '263': '🇿🇼 Zimbabue'
}

function detectarPais(jid) {
  const num = jid.split('@')[0]
  for (const [prefijo, pais] of Object.entries(prefijosPais)) {
    if (num.startsWith(prefijo)) return pais
  }
  return '🌍 Desconocido'
}

// ⚠️ FUNCION QUE DESCARGA LA FOTO → BUFFER (necesario para productMessage)
async function toBuffer(url) {
  try {
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return Buffer.from([])
  }
}

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {

  const username = `@${userId.split('@')[0]}`
  const profileUrl = await conn.profilePictureUrl(userId, 'image')
    .catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

  const pp = await toBuffer(profileUrl)

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString("es-ES", { timeZone: "America/Mexico_City", hour: '2-digit', minute: '2-digit' })

  const pais = detectarPais(userId)

  // FIX descripción
  const desc = groupMetadata.desc?.text || "Sin descripción"

  const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"')
    .replace(/{usuario}/g, username)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, desc)

  const caption = `🌸✨ 𝑯𝒐𝒍𝒂, ${username} ✨🌸
╰┈► 𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍@ 𝚊𝚕 𝚐𝚛𝚞𝚙𝚘 *${groupMetadata.subject}* 💞

🍃 ʟ𝚒𝚗𝚍𝚘 𝚝𝚎𝚗𝚎𝚛𝚝𝚎 𝚙𝚘𝚛 𝚊𝚚𝚞í, 𝚎𝚜𝚙𝚎𝚛𝚊𝚖𝚘𝚜 𝚚𝚞𝚎 𝚍𝚒𝚜𝚏𝚛𝚞𝚝𝚎𝚜 𝚝𝚞 𝚎𝚜𝚝𝚊𝚍í𝚊 💚
🍬 𝚂𝚒é𝚗𝚝𝚎𝚝𝚎 𝚌𝚘𝚖𝚘 𝚎𝚗 𝚌𝚊𝚜𝚒𝚝𝚊 UwU

🌿 *「 Info del Grupo 」*
┆👥 Miembros: ${groupMetadata.participants.length + 1}
┆🌍 País: ${pais}
┆⏰ Hora: ${hora}
┆📅 Fecha: ${fechaTexto}
┆📝 Descripción: ${mensaje}
╰───────────────✿`

  return { pp, caption }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {

  const username = `@${userId.split('@')[0]}`
  const profileUrl = await conn.profilePictureUrl(userId, 'image')
    .catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

  const pp = await toBuffer(profileUrl)

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString("es-ES", { timeZone: "America/Mexico_City", hour: '2-digit', minute: '2-digit' })

  const pais = detectarPais(userId)

  const desc = groupMetadata.desc?.text || "Sin descripción"

  const mensaje = (chat.sBye || 'Edita con el comando "setbye"')
    .replace(/{usuario}/g, username)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, desc)

  const caption = `🌸💫 El viento cambia…
╰┈► ${username} ha dejado el grupo *${groupMetadata.subject}* 💐

🌾 ${mensaje}

📉 *「 Estado Actual 」*
┆👥 Miembros: ${groupMetadata.participants.length - 1}
┆🌍 País: ${pais}
┆⏰ Hora: ${hora}
┆📅 Fecha: ${fechaTexto}
╰───────────────✿`

  return { pp, caption }
}

// HANDLER
let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return
  if (!m.messageStubType) return

  const chat = global.db.data.chats[m.chat]

  // 🔧 fix: evitar crash cuando no hay parámetros
  const userId = m.messageStubParameters?.[0]
  if (!userId) return

  const who = userId

  // Thumbnail del contacto
  let thumb
  try {
    thumb = await fetch("https://i.postimg.cc/rFfVL8Ps/image.jpg")
      .then(v => v.arrayBuffer())
      .then(v => Buffer.from(v))
  } catch {
    thumb = Buffer.from([])
  }

  const fake = {
    key: { participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: { locationMessage: { name: "🍓 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 - 𝙆𝙖𝙣𝙚𝙠𝙞 𝙈𝘿 🍟", jpegThumbnail: thumb } }
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {

    const { pp, caption } = await generarBienvenida({ conn, userId, groupMetadata, chat })

    await conn.sendMessage(
      m.chat,
      {
        productMessage: {
          product: {
            productId: "24529689176623820",
            title: "WELCOME ☆彡",
            description: caption,
            productImage: { jpegThumbnail: pp }, // 🔧 FIX REAL
            currencyCode: "USD",
            priceAmount1000: "100000"
          },
          businessOwnerJid: who
        },
        mentions: [userId]
      },
      { quoted: fake }
    )
  }

  if (chat.welcome &&
    (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
     m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {

    const { pp, caption } = await generarDespedida({ conn, userId, groupMetadata, chat })

    await conn.sendMessage(
      m.chat,
      {
        productMessage: {
          product: {
            productId: "24529689176623820",
            title: "BYE ☆彡",
            description: caption,
            productImage: { jpegThumbnail: pp },
            currencyCode: "USD",
            priceAmount1000: "100000"
          },
          businessOwnerJid: who
        },
        mentions: [userId]
      },
      { quoted: fake }
    )
  }
}

export { generarBienvenida, generarDespedida }
export default handler