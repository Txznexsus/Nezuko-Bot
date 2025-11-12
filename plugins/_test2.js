// file: kaneki_fkontak.js
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    // texto que quieres que aparezca en el mensaje del bot
    const replyText = args.join(' ') || '🌴 KANEKI-BOT ALLMENU 🌴\n\n• ✦ Comando 1\n• ✦ Comando 2\n• ✦ ...'

    // thumbnail (imagen de perfil a la derecha)
    const thumbUrl = 'https://files.catbox.moe/llzuyw.jpg'
    const thumbBuffer = await (await fetch(thumbUrl)).buffer()

    // fake quoted "contact-like" message (estilo casita / business header)
    const fkontak = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        ...(m.chat ? { remoteJid: m.chat } : {})
      },
      message: {
        // conversation sirve como el texto principal del mensaje citado
        conversation: 'Meta Al • Estado'
      },
      // campos extras que ayudan a que WhatsApp muestre la miniatura y nombre
      participant: '0@s.whatsapp.net',
      pushName: 'KANEKI-BOT V3'
    }

    // Agregamos la imagenMessage para forzar la miniatura a la derecha (como en la captura)
    fkontak.message.imageMessage = {
      mimetype: 'image/jpeg',
      caption: 'KANEKI-BOT ALLMENU 🌴',
      jpegThumbnail: thumbBuffer
    }

    // Enviamos el mensaje normal pero citado como fkontak
    await conn.sendMessage(m.chat, { text: replyText }, { quoted: fkontak })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el contacto falso.' }, { quoted: m })
  }
}

handler.help = ['kaneki <texto opcional>']
handler.tags = ['main', 'info']
handler.command = /^(kaneki|kaneki-bot|kanekiv3)$/i

export default handler