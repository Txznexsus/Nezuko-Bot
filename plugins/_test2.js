// file: plugins/business_contact.js
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  // imagen miniatura
  const img = await (await fetch('https://files.catbox.moe/llzuyw.jpg')).buffer()

  // estructura de mensaje tipo Business
  const businessContact = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      ...(m.chat ? { remoteJid: m.chat } : {})
    },
    message: {
      businessMessage: {
        message: {
          extendedTextMessage: {
            text: '🌴 KANEKI-BOT ALLMENU 🌴',
            matchedText: 'Meta AI • Contacto',
            canonicalUrl: 'https://www.whatsapp.com/business/',
            description: 'KANEKI-BOT V3 - WhatsApp Business Profile',
            title: 'KANEKI-BOT V3',
            jpegThumbnail: img,
            previewType: 2
          }
        },
        messageMetadata: {
          bizOwnerJid: '0@s.whatsapp.net'
        }
      }
    },
    participant: { jid: '0@s.whatsapp.net', name: 'KANEKI-BOT V3' },
    pushName: 'KANEKI-BOT V3'
  }

  await conn.relayMessage(m.chat, businessContact.message, { messageId: m.key.id })
}

handler.help = ['kanekiemp']
handler.tags = ['info']
handler.command = /^kanekiemp$/i

export default handler