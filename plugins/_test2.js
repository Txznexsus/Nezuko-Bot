import fetch from 'node-fetch'
import fs from 'fs'

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, text, quoted, command }) => {
  if (!text) return conn.reply(m.chat, `☕ Ejemplo:\n\n.rch 10 😈 15 🥵 20 👻 hola buenas tardes xd | https://whatsapp.com/channel/0029VchAGrYXXXX`, m)

  const [mensaje, canalRaw] = text.split('|').map(s => s.trim())
  if (!mensaje || !canalRaw) return conn.reply(m.chat, '❌ Usa: .rch <cantidades + emojis> <mensaje> | <link canal>', m)

  const channelID = canalRaw
    .replace('https://whatsapp.com/channel/', '')
    .replace('@newsletter', '')
    .trim()
  const newsletterJid = `${channelID}@newsletter`

  let channelInfo = {}
  try {
    const res = await fetch(`https://api.whatsapp.com/send/${channelID}`)
    channelInfo = {
      id: newsletterJid,
      name: 'Canal Desconocido 🌿',
      imageUrl: banner
    }
  } catch {
    channelInfo = {
      id: newsletterJid,
      name: 'Canal Desconocido 🌿',
      imageUrl: banner
    }
  }

  const regex = /(\d+)\s*([\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+)/gu
  const reactions = [...mensaje.matchAll(regex)].map(m => ({
    count: parseInt(m[1]),
    emoji: m[2]
  }))
  const msgReal = mensaje.replace(regex, '').trim()

  if (!reactions.length) return conn.reply(m.chat, '⚠️ No detecté emojis válidos.', m)
  if (!msgReal && !quoted?.mtype) return conn.reply(m.chat, '⚠️ Escribe un mensaje o responde a una imagen/video/sticker.', m)

  const fakeChannelContext = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelInfo.id,
      serverMessageId: 100,
      newsletterName: channelInfo.name
    },
    externalAdReply: {
      title: channelInfo.name,
      body: 'Publicación simulada del canal 📢',
      mediaType: 1,
      thumbnailUrl: channelInfo.imageUrl,
      renderLargerThumbnail: true,
      sourceUrl: `https://whatsapp.com/channel/${channelID}`
    }
  }

  let msgKey
  try {
    let sent
    if (quoted && /image|video|sticker/.test(quoted.mtype)) {
      const buffer = await quoted.download()
      sent = await conn.sendMessage(m.chat, {
        [quoted.mtype.includes('image') ? 'image' : quoted.mtype.includes('video') ? 'video' : 'sticker']: buffer,
        caption: msgReal || '',
        contextInfo: fakeChannelContext
      })
    } else {
      sent = await conn.sendMessage(m.chat, {
        text: msgReal,
        contextInfo: fakeChannelContext
      })
    }
    msgKey = sent.key
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Error al enviar el mensaje simulado.', m)
  }

  await sleep(500)

  try {
    for (const r of reactions) {
      for (let i = 0; i < r.count; i++) {
        await conn.sendMessage(m.chat, {
          reaction: {
            text: r.emoji,
            key: msgKey
          }
        })
        await sleep(100)
      }
    }
    await conn.reply(m.chat, `✅ Publicado como canal y enviadas las reacciones simuladas.`, m)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Error al enviar las reacciones.', m)
  }
}

handler.command = /^rch$/i
handler.rowner = true
export default handler