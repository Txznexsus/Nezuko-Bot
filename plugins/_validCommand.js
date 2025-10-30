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
        name: `🍃 ᥒᥱzᥙk᥆-ᑲ᥆𝗍 🧃`,
        jpegThumbnail: thumbBuffer
      }
    },
    participant: "0@s.whatsapp.net"
  }

  const channelRD = { 
    id: '120363401983007420@newsletter', 
    name: '=͟͟͞𝗡𝗲𝘇𝘂𝗸𝗼 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗻𝗲𝗹⏤͟͟͞͞★'
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

  const texto = ` 🌿 El comando *"${command}"* no fue encontrado.
 🍃 Usa *${usedPrefix}menu* para ver la lista completa.

 *Posibles coincidencias:*
${sugerencias}`

  await conn.sendMessage(m.chat, {
    document: { url: 'https://files.catbox.moe/6fj9u7.jpg' },
    mimetype: 'application/pdf',
    fileName: '🍃 🄴🅁🅁🄾🅁 🍁.pdf',
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
        title: '   🍃 ᥒᥱzᥙk᥆ ᑲ᥆𝗍 - ᥲssіs𝗍ᥲᥒ𝗍 🦋',
        body: 'Asistente inteligente y multifunción.',
        thumbnailUrl: banner,
        mediaType: 1,
        renderLargerThumbnail: true
      },
      mentionedJid: null
    }
  }, { quoted: fkontak })
}