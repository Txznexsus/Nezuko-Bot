import fs from 'fs'
import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const detectarPais = (numero) => {
    const codigos = {
      "1": "🇺🇸 EE.UU / 🇨🇦 Canadá", "7": "🇷🇺 Rusia / 🇰🇿 Kazajistán",
      "20": "🇪🇬 Egipto", "27": "🇿🇦 Sudáfrica", "30": "🇬🇷 Grecia",
      "31": "🇳🇱 Países Bajos", "32": "🇧🇪 Bélgica", "33": "🇫🇷 Francia",
      "34": "🇪🇸 España", "36": "🇭🇺 Hungría", "39": "🇮🇹 Italia",
      "40": "🇷🇴 Rumania", "44": "🇬🇧 Reino Unido", "49": "🇩🇪 Alemania",
      "51": "🇵🇪 Perú", "52": "🇲🇽 México", "53": "🇨🇺 Cuba",
      "54": "🇦🇷 Argentina", "55": "🇧🇷 Brasil", "56": "🇨🇱 Chile",
      "57": "🇨🇴 Colombia", "58": "🇻🇪 Venezuela", "591": "🇧🇴 Bolivia",
      "593": "🇪🇨 Ecuador", "595": "🇵🇾 Paraguay", "598": "🇺🇾 Uruguay",
      "502": "🇬🇹 Guatemala", "503": "🇸🇻 El Salvador",
      "504": "🇭🇳 Honduras", "505": "🇳🇮 Nicaragua",
      "506": "🇨🇷 Costa Rica", "507": "🇵🇦 Panamá",
      "60": "🇲🇾 Malasia", "61": "🇦🇺 Australia", "62": "🇮🇩 Indonesia",
      "63": "🇵🇭 Filipinas", "64": "🇳🇿 Nueva Zelanda",
      "65": "🇸🇬 Singapur", "66": "🇹🇭 Tailandia",
      "81": "🇯🇵 Japón", "82": "🇰🇷 Corea del Sur", "84": "🇻🇳 Vietnam",
      "86": "🇨🇳 China", "90": "🇹🇷 Turquía", "91": "🇮🇳 India",
      "212": "🇲🇦 Marruecos", "213": "🇩🇿 Argelia",
      "216": "🇹🇳 Túnez", "218": "🇱🇾 Libia",
      "234": "🇳🇬 Nigeria", "254": "🇰🇪 Kenia",
      "255": "🇹🇿 Tanzania", "256": "🇺🇬 Uganda",
      "258": "🇲🇿 Mozambique", "260": "🇿🇲 Zambia",
      "263": "🇿🇼 Zimbabue"
    }

    for (const code in codigos) {
      if (numero.startsWith(code)) return codigos[code]
    }
    return "Desconocido"
  }

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() =>
    'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
  )

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString("es-ES", { timeZone: "America/Lima", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: "numeric", minute: "numeric", hour12: true })

  const numero = userId.split("@")[0]
  const nacionalidad = detectarPais(numero)
  const groupSize = groupMetadata.participants.length + 1
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'
  const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"')
    .replace(/{usuario}/g, `${username}`)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, `${desc}`)

  const caption = `🪵 ʜᴏʟᴀ, ${username} 🍂
 𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍@ 𝚊𝚕 𝚐𝚛𝚞𝚙𝚘 *${groupMetadata.subject}* 🍁

🍃 ᴅɪsғʀᴜᴛᴀ ʟᴀ ᴇsᴛᴀᴅɪ́ᴀ ᴅᴇ ᴇsᴛᴇ ɢʀᴜᴘᴏ
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🪴 *「 ɪɴғᴏ ɢʀᴏᴜᴘ 」*
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🌴 ᴍɪᴇᴍʙʀᴏꜱ: ${groupSize}
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🧃 ᴘᴀíꜱ: ${nacionalidad}
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🌾 ʜᴏʀᴀ: ${hora}
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🪸 ғᴇᴄʜᴀ: ${fechaTexto}
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🌳 ᴅᴇꜱᴄʀɪᴘᴄɪóɴ: ${mensaje}`

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
  const hora = fecha.toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: "numeric", minute: "numeric", hour12: true })

  const numero = userId.split("@")[0]
  const nacionalidad = detectarPais(numero)
  const groupSize = groupMetadata.participants.length - 1
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'
  const mensaje = (chat.sBye || 'Edita con el comando "setbye"')
    .replace(/{usuario}/g, `${username}`)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, `*${desc}*`)

  const caption = `🍁 ʟᴏs ʀᴇᴄᴜᴇʀᴅᴏs ᴏ̨ᴜᴇᴅᴀɴ ${username} ᴀʙᴀɴᴅᴏɴᴏ́ ᴇʟ ɢʀᴜᴘᴏ *${groupMetadata.subject}* 🍂

🌾 ${mensaje}

🧃 *「 ᴇsᴛᴀᴅᴏ ᴀᴄᴛᴜᴀʟ ᴅᴇʟ ɢʀᴜᴘᴏ 」*
🌴 ᴍɪᴇᴍʙʀᴏꜱ: ${groupSize}
🌱 ᴘᴀíꜱ: ${nacionalidad}
☘️ ʜᴏʀᴀ: ${hora}
🪴 ғᴇᴄʜᴀ: ${fechaTexto}`

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
    message: { locationMessage: { name: 'ɴᴇᴢᴜᴋᴏ-ʙᴏᴛ 🍃', jpegThumbnail: thumbBuffer } },
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
          title: '✧┆ 𝑊𝑒𝑙𝑐𝑜𝑚𝑒┆𝑁𝑒𝑧𝑢𝑘𝑜 ┆✧',
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