import fs from 'fs'
import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const prefijosPais = {
  '1': '🇺🇸 Estados Unidos',
  '51': '🇵🇪 Perú',
  '52': '🇲🇽 México',
  '53': '🇨🇺 Cuba',
  '54': '🇦🇷 Argentina',
  '55': '🇧🇷 Brasil',
  '56': '🇨🇱 Chile',
  '57': '🇨🇴 Colombia',
  '58': '🇻🇪 Venezuela',
  '591': '🇧🇴 Bolivia',
  '595': '🇵🇾 Paraguay',
  '598': '🇺🇾 Uruguay',
  '502': '🇬🇹 Guatemala',
  '503': '🇸🇻 El Salvador',
  '504': '🇭🇳 Honduras',
  '505': '🇳🇮 Nicaragua',
  '506': '🇨🇷 Costa Rica',
  '507': '🇵🇦 Panamá',
  '593': '🇪🇨 Ecuador',
  '809': '🇩🇴 República Dominicana'
}

function detectarPais(jid) {
  const num = jid.split('@')[0]
  const prefijosOrdenados = Object.keys(prefijosPais).sort((a, b) => b.length - a.length)
  for (const prefijo of prefijosOrdenados) {
    if (num.startsWith(prefijo)) return prefijosPais[prefijo]
  }
  return 'Desconocido ❄️'
}

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() =>
    'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
  )

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString("es-ES", { timeZone: "America/Lima", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString("es-ES", { timeZone: "America/Lima", hour: '2-digit', minute: '2-digit' })

  const pais = detectarPais(userId)
  const groupSize = groupMetadata.participants.length + 1
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'
  const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"')
    .replace(/{usuario}/g, `${username}`)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, `${desc}`)

  const caption = `🌸✨ 𝑯𝒐𝒍𝒂, ${username} ✨🌸
╰┈► 𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍@ 𝚊𝚕 𝚐𝚛𝚞𝚙𝚘 *${groupMetadata.subject}* 💞

🍃 ʟ𝚒𝚗𝚍𝚘 𝚝𝚎𝚗𝚎𝚛𝚝𝚎 𝚙𝚘𝚛 𝚊𝚚𝚞í 💚
🍬 𝚂𝚒é𝚗𝚝𝚎𝚝𝚎 𝚌𝚘𝚖𝚘 𝚎𝚗 𝚌𝚊𝚜𝚒𝚝𝚊 𝚄𝚠𝚄

🌿 *「 𝐈𝐧𝐟𝐨 𝐝𝐞𝐥 𝐆𝐫𝐮𝐩𝐨 」*
┆👥 ᴍɪᴇᴍʙʀᴏꜱ: ${groupSize}
┆🌍 ᴘᴀíꜱ: ${pais}
┆⏰ ʜᴏʀᴀ: ${hora}
┆📅 ғᴇᴄʜᴀ: ${fechaTexto}
┆📝 ᴅᴇꜱᴄʀɪᴘᴄɪóɴ: ${mensaje}
╰───────────────✿`

  const imgWelcome = `https://api.siputzx.my.id/api/canvas/welcomev5?username=${
    encodeURIComponent(userId.split('@')[0])
  }&guildName=${
    encodeURIComponent(groupMetadata.subject)
  }&memberCount=${
    groupSize
  }&avatar=${
    encodeURIComponent(pp)
  }&background=${
    encodeURIComponent("https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763585864348_780365.jpeg")
  }&quality=90`

  return { pp: imgWelcome, caption, username }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() =>
    'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
  )

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString("es-ES", { timeZone: "America/Lima", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString("es-ES", { timeZone: "America/Lima", hour: '2-digit', minute: '2-digit' })

  const pais = detectarPais(userId)
  const groupSize = groupMetadata.participants.length - 1
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'
  const mensaje = (chat.sBye || 'Edita con el comando "setbye"')
    .replace(/{usuario}/g, `${username}`)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, `*${desc}*`)

  const caption = `🌸💫 𝙴𝚕 𝚟𝚒𝚎𝚗𝚝𝚘 𝚌𝚊𝚖𝚋𝚒𝚊...
╰┈► ${username} 𝚑𝚊 𝚍𝚎𝚓𝚊𝚍𝚘 𝚎𝚕 𝚐𝚛𝚞𝚙𝚘 *${groupMetadata.subject}* 💐

🌾 ${mensaje}

📉 *「 𝐄𝐬𝐭𝐚𝐝𝐨 𝐀𝐜𝐭𝐮𝐚𝐥 」*
┆👥 ᴍɪᴇᴍʙʀᴏꜱ: ${groupSize}
┆🌍 ᴘᴀíꜱ: ${pais}
┆⏰ ʜᴏʀᴀ: ${hora}
┆📅 ғᴇᴄʜᴀ: ${fechaTexto}
╰───────────────✿`

  const imgGoodbye = `https://api.siputzx.my.id/api/canvas/goodbyev5?username=${
    encodeURIComponent(userId.split('@')[0])
  }&guildName=${
    encodeURIComponent(groupMetadata.subject)
  }&memberCount=${
    groupSize
  }&avatar=${
    encodeURIComponent(pp)
  }&background=${
    encodeURIComponent("https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763585864348_780365.jpeg")
  }&quality=90`

  return { pp: imgGoodbye, caption, username }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0
  const chat = global.db.data.chats[m.chat]
  const userId = m.messageStubParameters[0]
  const who = userId || '0@s.whatsapp.net'

  const meta = groupMetadata
  const totalMembers = meta.participants.length
  const groupSubject = meta.subject
  const date = new Date().toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' })

  let thumbBuffer
  try {
    const res = await fetch('https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763586769709_495967.jpeg')
    thumbBuffer = Buffer.from(await res.arrayBuffer())
  } catch {
    thumbBuffer = null
  }

  const fkontak = {
    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
    message: { locationMessage: { name: '🌳☃️✨   𝐊𝐀𝐍𝐄𝐊𝐈 - 𝐈𝐀   🎁🦌🛷', jpegThumbnail: thumbBuffer } },
    participant: '0@s.whatsapp.net'
  }

  if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const { pp, caption, username } = await generarBienvenida({ conn, userId, groupMetadata, chat })

/*    const productMessage = {
      product: {
        productImage: { url: pp },
        productId: '24529689176623820',
        title: ` ˗ˏˋ♡ˎˊ˗ ❏ ¡𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄! ᯤ ˗ˏˋ♡ˎˊ˗`,
        description: `👥 Miembros: ${totalMembers} • 📅 ${date}`,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 1677,
        url: `https://wa.me/${userId.split('@')[0]}`,
        productImageCount: 1
      },
      businessOwnerJid: who,
      caption: 'Bxdxdx xd ',
      footer: caption,
      mentions: [userId]
    }

    await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })*/
    await conn.sendMessage(m.chat, { 
      text: caption,
      contextInfo: {
        mentionedJid: [userId],
        externalAdReply: {                
          title: ' ˗ˏˋ♡ˎˊ˗ ❏ ¡𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄! ᯤ ˗ˏˋ♡ˎˊ˗',
          body: textbot,
          mediaType: 1,
          mediaUrl: redes,
          sourceUrl: redes,
          thumbnail: await (await fetch(pp)).buffer(),
          showAdAttribution: false,
          containsAutoReply: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak })
  }

  if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
    const { pp, caption, username } = await generarDespedida({ conn, userId, groupMetadata, chat })
/*
    const productMessage = {
      product: {
        productImage: { url: pp },
        productId: '24529689176623820',
        title: ` ˗ˏˋ♡ˎˊ˗ ❏ ¡𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄! ᯤ ˗ˏˋ♡ˎˊ˗`,
        description: `👥 Miembros: ${groupMetadata.participants.length} • 📅 ${date}`,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 1677,
        url: `https://wa.me/${userId.split('@')[0]}`,
        productImageCount: 1
      },
      businessOwnerJid: who,
      caption: dev,
      footer: caption,
      mentions: [userId]
    }

    await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })*/
    await conn.sendMessage(m.chat, { 
      text: caption,
      contextInfo: {
        mentionedJid: [userId],
        externalAdReply: {                
          title: ' ˗ˏˋ♡ˎˊ˗ ❏ ¡𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄! ᯤ ˗ˏˋ♡ˎˊ˗',
          body: textbot,
          mediaType: 1,
          mediaUrl: redes,
          sourceUrl: redes,
          thumbnail: await (await fetch(pp)).buffer(),
          showAdAttribution: false,
          containsAutoReply: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak })
  }
}

export { generarBienvenida, generarDespedida }
export default handler