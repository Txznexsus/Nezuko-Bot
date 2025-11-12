import fetch from 'node-fetch'

export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return

  const usedPrefix = global.prefix.exec(m.text)[0]
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()

  if (!command || command === 'bot') return

  const thumbRes = await fetch("https://files.catbox.moe/ntt86y.jpg")
  const thumbBuffer = await thumbRes.buffer()

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "KanekiBot"
    },
    message: {
      locationMessage: {
        name: `🌿 𝐊𝐚𝐧𝐞𝐤𝐢 | 𝐁𝐨𝐭 𝐀𝐈 ⚙️`,
        jpegThumbnail: thumbBuffer
      }
    },
    participant: "0@s.whatsapp.net"
  }

  const channelRD = { 
    id: '120363422142340004@newsletter', 
    name: '🌸 𝗞𝗮𝗻𝗲𝗸𝗶 𝗕𝗼𝘁 | 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 🚀'
  }

  const similarity = (a, b) => {
    let matches = 0
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++
    }
    return Math.floor((matches / Math.max(a.length, b.length)) * 100)
  }

  const allCommands = Object.values(global.plugins)
    .flatMap(p => Array.isArray(p.command) ? p.command : [p.command])
    .filter(v => typeof v === 'string')

  if (allCommands.includes(command)) {
    let user = global.db.data.users[m.sender]
    if (!user.commands) user.commands = 0
    user.commands++
    return
  }

  const similares = allCommands
    .map(cmd => ({ cmd, score: similarity(command, cmd) }))
    .filter(o => o.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  let sugerencias = similares.length
    ? similares.map(s => `> 🪴 • .${s.cmd} (${s.score}%)`).join('\n')
    : '• No se encontraron coincidencias.'

  const texto = ` 🌿 ᴇʟ ᴄᴏᴍᴀɴᴅᴏ *"${command}"* ɴᴏ ғᴜᴇ ᴇᴄᴏɴᴛʀᴀᴅᴏ. :ᴅ
 🍃 ᴜsᴀ *${usedPrefix}ᴍᴇɴᴜ* ᴘᴀʀᴀ ᴠᴇʀ ʟᴀ ʟɪsᴛᴀ ᴄᴏᴍᴘʟᴇᴛᴀ.

*𝙿𝙾𝚂𝙸𝙱𝙴𝚂 𝙲𝙾𝙸𝙽𝙲𝙸𝙳𝙴𝙽𝙲𝙸𝙰𝚂: 🍂*
${sugerencias}`

  await conn.sendMessage(m.chat, {
    document: { url: 'https://files.catbox.moe/6fj9u7.jpg' },
    mimetype: 'application/pdf',
    fileName: '🍃 🄴🅁🅁🄾🅁 🚀.pdf',
    caption: texto.trim(),
    mentions: [m.sender],
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: '',
        newsletterName: channelRD.name
      },
      externalAdReply: {
        title: ' °   ⿻֟🎍 𝐊𝐚𝐧𝐞𝐤𝐢 𝐁𝐨𝐭 ܀ 𝐀𝐒𝐒𝐈𝐒𝐓𝐀𝐍𝐓 ☕፝֯۫︎۫۬',
        body: '  `͝દ࠭͜✎࣭〫𝆬ᨗઢ֒͝  ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏ x sʜᴀᴅᴏᴡ.xʏᴢ 籭᮫꫶ֹ۫𝆬𝆬ᨗ',
        thumbnailUrl: banner,
        mediaType: 1,
        renderLargerThumbnail: true
      },
      mentionedJid: null
    }
  }, { quoted: fkontak })
}