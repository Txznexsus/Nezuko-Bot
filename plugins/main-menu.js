import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  try {
    await m.react('🚀')

    const user = global.db.data.users[m.sender] || {}
    const name = await conn.getName(m.sender)
    const premium = user.premium ? '✔️ Sí' : 'free'
    const limit = user.limit || 10
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
      .catch(() => 'https://i.pinimg.com/originals/b3/67/d5/b367d513d861de468305c32c6cd22756.jpg')

    const channelRD = { 
      id: '120363422142340004@newsletter', 
      name: '𝐊𝐚𝐧𝐞𝐤𝐢 𝐁𝐨𝐭 𝐀𝐈 : 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐎𝐟𝐢𝐜𝐢𝐚𝐥 ꒰͡•*゜・。 ͡꒱ֽ ׄ< '
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
          title: '꒰͡•*゜🩸 Kaneki Bot AI 🌿꒰͡•*゜・。 ͡꒱ֽ ׄ',
          body: '· · • • • ☕ ძᥱ᥎: sһᥲძ᥆ᥕ_᥊ᥡz ❄️ • • • · ·',
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
      'info': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɪɴғᴏ` 🍂࿆⸼꩒',
      'main': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴍᴀɪɴ` 🍓࿆⸼꩒',
      'fun': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ғᴜɴ` 🎭࿆⸼꩒',
      'rpg': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ʀᴘɢ` 🍂࿆⸼꩒',
      'anime': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴀɴɪᴍᴇ` 🌸࿆⸼꩒',
      'search': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ sᴇᴀʀᴄʜ` 🧬࿆⸼꩒',
      'download': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴅᴏᴡɴʟᴏᴀᴅ` 🎧࿆⸼꩒',
      'gacha': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɢᴀᴄʜᴀ` 🌀࿆⸼꩒',
      'rg': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴘᴇʀғɪʟ` 🍃࿆⸼꩒',
      'game': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɢᴀᴍᴇ` 🎮࿆⸼꩒',
      'group': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɢʀᴜᴘᴏs` 🏮࿆⸼꩒',
      'nable': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɴᴀʙʟᴇ` ⚙️࿆⸼꩒',
      'ia': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɪᴀ` ☁️࿆⸼꩒',
      'stalk': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ stalk` 🌹࿆⸼꩒',
      'maker': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `mᥱᥒᥙ ᥣ᥆g᥆𝗍і⍴᥆s` 🌿࿆⸼꩒',
      'tools': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴛᴏᴏʟs` 🧩࿆⸼꩒',
      'sticker': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ sᴛɪᴄᴋᴇʀs` ✨࿆⸼꩒',
      'owner': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴏᴡɴᴇʀ` 💙࿆⸼꩒',
      'socket': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ᴊᴀᴅɪ-ʙᴏᴛ` 🍰࿆⸼꩒',
      'nsfw': '.*𐔌 ͜͡𐂂ᩙᩝּ࣭࣪ `ᴍᴇɴᴜ ɴsғᴡ` 🍑࿆⸼꩒',
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
        .map(cmd => cmd.help.map(e => `ര ׄ 🍃 ׅ  ${usedPrefix}${e}`).join('\n'))
        .join('\n')
      if (comandos) {
        menuTexto += `\n\n*${tags[tag]}*\n\`\`\`${comandos}\`\`\``
      }
    }

    const infoUser = `. ︶⏝͜━ִ──꯭ׂ─꯭─ׅ─ׂ꩒ ⃞ ྀིׅ──꯭ׂ─꯭─ׅ─ׂ━͜⏝︶ .

·°᮫ׂ ⃝꥓࣭🍃ᩙ꫶ׅ ๋  ★  .. һ᥆ᥣᥲ ᑲіᥱᥒ᥎ᥱᥒіძ@ s᥆ᥡ • kᥲᥒᥱkі ᑲ᥆𝗍 ᥲі ̥ ᎒⃟ໍ🎁୭ୃּּּּּּּּּּ 
°•°•°•°•°•°•°•°•°•°•°•°•°∞°•°•°•°•°•°•°•°•°•°•°•°
    •°.: ㅤ⪧⣋𐧷 \`⦅ 🧃 𝐈𝐍ᩨ𝐅𝐎ິ 𝐁𝐎̼𝐓͡ 🌠 ⦆\` 𐧸⢹ ⵿𑇛
 ᨳꨩ🍃⿻𝅄 \`ᴜsᴇʀ:\` @${userId}
 ᨳꨩ🪹⿻𝅄 \`ᴘʀᴇᴍɪᴜᴍ:\` ${premium}
 ᨳꨩ🪴⿻𝅄 \`ᴘᴀɪs:\` ${pais}
 ᨳꨩ🪵⿻𝅄 \`ʟɪᴍɪᴛᴇ:\` ${limit}
 ᨳꨩ🌿⿻𝅄 \`ᴜsᴇʀ ʀᴇɢɪsᴛʀᴀᴅᴏs:\` ${totalreg}
 ᨳꨩ🍄⿻𝅄 \`ɢʀᴜᴘᴏs ᴀᴄᴛɪᴠᴏs:\` ${groupsCount}
 ᨳꨩ🌟⿻𝅄 \`ʀᴜɴᴛɪᴍᴇ:\` ${uptime}

─────────────────────

 ᨫ᤻፝᳹🥞᳕၇ \`ʙᴏᴛ:\` ${(conn.user.jid == global.conn.user.jid ? '𝙋𝙧𝙞𝙣𝙘𝙞𝙥𝙖𝙡 🌱' : '𝙆𝙖𝙣𝙚𝙠𝙞 𝙎𝙪𝙗-𝘽𝙤𝙩 💮')}
 ᨫ᤻፝᳹🎋᳕၇ \`ᴄᴏᴍᴀɴᴅᴏs: ${totalCommands}
 ᨫ᤻፝᳹🥥᳕၇ \`ᴠs:\` ${vs}
 ᨫ᤻፝᳹☕᳕၇ \`ʟɪʙʀᴇʀɪᴀ:\` ${libreria}
 ᨫ᤻፝᳹🎍᳕၇ \`ғᴇᴄʜᴀ:\` \`\`\`${hora}, ${dia}, ${fechaTxt}\`\`\`

─────────────────────

𐔌𐔌 *な🎅🎄 Mᴇɴú ᴅɪsᴘᴏɴɪʙʟᴇ: 🦌🎇な* ꒱꒱`.trim()

    const menu_xyz = infoUser + `\n\n${menuTexto}`.trim()

    const imgs = [
      'https://i.pinimg.com/originals/b3/67/d5/b367d513d861de468305c32c6cd22756.jpg',
      'https://i.pinimg.com/originals/90/c8/58/90c858c65f0b3b2fca9a226fa369aa2b.png'
    ]
    let imageUrl = imgs[Math.floor(Math.random() * imgs.length)]

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: menu_xyz,
      fileName: '🩸 Kaneki Bot AI | Menu ☯',
      mimetype: 'image/jpeg',
      mentions: [m.sender],
      ...metaMsg
    })
    /*
await conn.sendMessage(
  m.chat,
  {
    video: { url: 'https://qu.ax/WQnwi.mp4' },
    caption: menu_xyz,
    gifPlayback: true,
    gifAttribution: 0,
    contextInfo: {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: 100,
        newsletterName: channelRD.name
      },
      externalAdReply: {
        title: '꒰͡•*゜🩸 Kaneki Bot AI 🌿꒰͡•*゜・。 ͡꒱ֽ ׄ',
        body: '· · • • • 💮 Dev: Shadow_xyz ☁️ • • • · ·',
        thumbnailUrl: banner,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  },
  { quoted: fkontak }
)
*/
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
handler.register = true;

export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}