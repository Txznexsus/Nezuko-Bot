// file: plugins/kaneki-business.js
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // Imagen miniatura del bot (la que sale al lado derecho)
    const thumb = await (await fetch('https://files.catbox.moe/llzuyw.jpg')).buffer()

    // 💬 Mensaje falso estilo cuenta Business (casita / maletín)
    const fkontak = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        ...(m.chat ? { remoteJid: m.chat } : {})
      },
      message: {
        conversation: '🌴 KANEKI-BOT ALLMENU 🌴'
      },
      pushName: 'KANEKI-BOT V3',
      participant: '0@s.whatsapp.net',
      messageContextInfo: {
        // 🔥 Este campo es el que hace aparecer la "casita" de empresa
        businessMessageForwardInfo: { businessOwnerJid: '0@s.whatsapp.net' }
      },
      messageTimestamp: Date.now(),
    }

    // Añadimos imagen pequeña (miniatura)
    fkontak.message.imageMessage = {
      mimetype: 'image/jpeg',
      jpegThumbnail: thumb,
      caption: '🌴 KANEKI-BOT ALLMENU 🌴'
    }

    // Enviar mensaje con fkontak citado
    await conn.sendMessage(
      m.chat,
      { text: '👾 Hola soy *KANEKI-BOT V3*\n🌴 Bienvenido al menú empresarial.' },
      { quoted: fkontak }
    )

  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al generar el fkontak estilo empresa.')
  }
}

handler.help = ['kaneki']
handler.tags = ['info']
handler.command = /^kaneki$/i

export default handler