import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `⚡ Usa el formato:\n\n${usedPrefix + command} 12 👻 14 🙂 288 🥵 400 🌿 hola buenas tardes xd | https://whatsapp.com/channel/XXXX`, m)
  }

  const [reaccionesTexto, canalInfo] = text.split('|').map(v => v.trim())
  if (!reaccionesTexto || !canalInfo) {
    return conn.reply(m.chat, `⚠️ Debes separar las reacciones y el canal con "|"\nEjemplo:\n${usedPrefix + command} 12 👻 14 🙂 288 🥵 hola buenas tardes xd | https://whatsapp.com/channel/XXXX`, m)
  }

  const regex = /(\d+)\s*([\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+)/gu
  const reacciones = [...reaccionesTexto.matchAll(regex)].map(r => ({
    cantidad: parseInt(r[1]),
    emoji: r[2]
  }))

  const mensajeCanal = reaccionesTexto.replace(regex, '').trim() || 'Mensaje del canal sin texto'

  const msg = await conn.sendMessage(m.chat, {
    text: `💬 *Canal simulado*\n📢: ${canalInfo}\n\n🗨️ ${mensajeCanal}`,
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalInfo.includes('@newsletter') ? canalInfo : null,
        newsletterName: 'Canal simulado 💫'
      }
    }
  }, { quoted: m })

  let total = 0
  for (const r of reacciones) {
    total += r.cantidad
    let cadena = ''
    for (let i = 0; i < r.cantidad; i++) cadena += r.emoji
    await conn.sendMessage(m.chat, { text: cadena.slice(0, 4000), quoted: msg })
  }

  await m.react('💥')
  await conn.reply(m.chat, `✅ Se enviaron ${total} reacciones simuladas visualmente.`, m)
}

handler.help = ['rch']
handler.tags = ['fun']
handler.command = /^rch$/i
handler.owner = true  // solo owner, puedes quitar si quieres

export default handler