import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  try {
    await m.react('🍓')

    const user = global.db.data.users[m.sender] || {}
    const name = await conn.getName(m.sender)
    const premium = user.premium ? '✔️ Sí' : '❌ No'
    const limit = user.limit || 0
    const totalreg = Object.keys(global.db.data.users).length
    const groupUserCount = m.isGroup ? participants.length : '-'
    const groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length
    const uptime = clockString(process.uptime() * 1000)
    const fecha = new Date(Date.now())
    const locale = 'es-PE'
    const dia = fecha.toLocaleDateString(locale, { weekday: 'long' })
    const fechaTxt = fecha.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const hora = fecha.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

    const totalCommands = Object.keys(global.plugins).length

    const userId = m.sender.split('@')[0]
    const phone = PhoneNumber('+' + userId)
    const pais = phone.getRegionCode() || 'Desconocido 🌐'
    
    const perfil = await conn.profilePictureUrl(conn.user.jid, 'image')
      .catch(() => 'https://qu.ax/MjAzQ.jpg')

    const channelRD = { 
      id: '120363401983007420@newsletter', 
      name: '=͟͟͞𝗡𝗲𝘇𝘂𝗸𝗼 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗻𝗲𝗹⏤͟͟͞͞★'
    }

    const metaMsg = {
      quoted: global.fakeMetaMsg,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        },
        externalAdReply: {
          title: '🧃ᥒᥱzᥙk᥆🍃',
          body: '🌱 ᥒᥱ᥊zᥙs.ᥴ᥆m 🍂',
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: perfil,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }

    let tags = {
      'info': '✎Ꮺ  `ᴍᴇɴᴜ ɪɴғᴏ` 🪵ೄྀ',
      'main': '✎Ꮺ  `ᴍᴇɴᴜ ᴍᴀɪɴ` 🌳 ೄྀ',
      'fun': '✎Ꮺ  `ᴍᴇɴᴜ ғᴜɴ` 💐 ೄྀ',
      'rpg': '✎Ꮺ  `ᴍᴇɴᴜ ʀᴘɢ` 🌷 ೄྀ',
      'anime': '✎Ꮺ  `ᴍᴇɴᴜ ᴀɴɪᴍᴇ` 🌴 ೄྀ',
      'search': '✎Ꮺ  `ᴍᴇɴᴜ sᴇᴀʀᴄʜ` 🌱 ೄྀ',
      'download': '✎Ꮺ  `ᴍᴇɴᴜ ᴅᴏᴡɴʟᴏᴀᴅ` 🌿 ೄྀ',
      'gacha': '✎Ꮺ  `ᴍᴇɴᴜ ɢᴀᴄʜᴀ` 🍁 ೄྀ',
      'rg': '✎Ꮺ  `ᴍᴇɴᴜ ᴘᴇʀғɪʟ` 🍄 ೄྀ',
      'game': '✎Ꮺ  `ᴍᴇɴᴜ ɢᴀᴍᴇ` 🪻 ೄྀ',
      'group': '✎Ꮺ  `ᴍᴇɴᴜ ɢʀᴜᴘᴏs` 🌺 ೄྀ',
      'nable': '✎Ꮺ  `ᴍᴇɴᴜ ɴᴀʙʟᴇ` 🍃 ೄྀ',
      'ia': '✎Ꮺ  `ᴍᴇɴᴜ ɪᴀ` 🍂 ೄྀ',
      'stalk': '✎Ꮺ  `ᴍᴇɴᴜ stalk` 🌾 ೄྀ',
      'tools': '✎Ꮺ  `ᴍᴇɴᴜ ᴛᴏᴏʟs` 🌹 ೄྀ',
      'sticker': '✎Ꮺ  `ᴍᴇɴᴜ sᴛɪᴄᴋᴇʀs` ☘️ ೄྀ',
      'owner': '✎Ꮺ  `ᴍᴇɴᴜ ᴏᴡɴᴇʀ` 🪴 ೄྀ',
      'socket': '✎Ꮺ  `ᴍᴇɴᴜ ᴊᴀᴅɪ-ʙᴏᴛ` 🪸 ೄྀ',
      'nsfw': '✎Ꮺ  `ᴍᴇɴᴜ ɴsғᴡ` 🪾 ೄྀ',
    }

    let commands = Object.values(global.plugins)
      .filter(v => v.help && v.tags)
      .map(v => {
        return {
          help: Array.isArray(v.help) ? v.help : [v.help],
          tags: Array.isArray(v.tags) ? v.tags : [v.tags]
        }
      })

    let menuTexto = ''
    for (let tag in tags) {
      let comandos = commands
        .filter(cmd => cmd.tags.includes(tag))
        .map(cmd => cmd.help.map(e => `> ✿ 🦋  ${usedPrefix}${e}`).join('\n'))
        .join('\n')
      if (comandos) {
        menuTexto += `\n\n*${tags[tag]}*\n${comandos}`
      }
    }

    const infoUser = `
  🍃┆һ᥆ᥣᥲ s᥆ᥡ ᥒᥱzᥙk᥆-ᑲ᥆𝗍 mძ┆🍂 
·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·

︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶  ︶ ︶
🧃 *Usuario:* @${userId}
🍂 *Premium:* ${premium}
🪴 *País:* ${pais}
🌿 *Límite:* ${limit}
🌱 *Usuarios totales:* ${totalreg}
🍃 *Grupos activos:* ${groupsCount}
🍁 *Tiempo activo:* ${uptime}
·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·

︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶  ︶ ︶
💐 *Bot:* ${(conn.user.jid == global.conn.user.jid ? 'ρɾιɳƈιραʅ 🌷' : 'ɳҽȥυƙσ ʂυႦ-Ⴆσƚ 🍃')}
🎋 *Comandos:* ${totalCommands}
🌹 *Versión:* ${vs}
🪵 *Librería:* ${libreria}
🌸 *Fecha:* \`${hora}, ${dia}, ${fechaTxt}\`
·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·

︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶ ︶

*🧃 mᥱᥒᥙ ძіs⍴᥆ᥒіᑲᥣᥱ 🍁`.trim()

    const imgs = [
      'https://files.catbox.moe/l4l40l.jpg',
      'https://files.catbox.moe/l4l40l.jpg'
    ]
    let imageUrl = imgs[Math.floor(Math.random() * imgs.length)]

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      /*document: fs.readFileSync('./README.md'),
      fileName: '🍂 ᥒᥱzᥙk᥆-ᑲ᥆𝗍 mძ┆mᥱᥒᥙ 🌾',
      mimetype: 'application/pdf',*/
      caption: infoUser + menuTexto.trim(),
      fileName: '🌷 ᥒᥱzᥙk᥆-ᑲ᥆𝗍 mძ┆mᥱᥒᥙ 🍃',
      mimetype: 'image/jpeg',
      mentions: [m.sender],
      ...metaMsg
    })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { 
      text: `✘ Error al enviar el menú: ${e.message}`,
      mentions: [m.sender] 
    })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu','help','menú','allmenu','menucompleto']

export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}