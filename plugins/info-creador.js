// 💫 by dv.shadow - https://github.com/Yuji-XDev
import { proto } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn }) => {
  try {
    const name = 'sһᥲძ᥆ᥕ-᥊ᥡz | ᥆𝖿𝖿іᥴіᥲᥩ'
    const numCreador = '51919199620'
    const empresa = 'ᴋᴀɴᴇᴋɪ ʙᴏᴛ ɪɴɪᴄ.'
    const about = '🍃 𝑫𝒆𝒔𝒂𝒓𝒓𝒐𝒍𝒍𝒂𝒅𝒐𝒓 𝒐𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝒅𝒆 𝑲𝒂𝒏𝒆𝒌𝒊-𝑩𝒐𝒕 𝑽3'
    const correo = 'shadowcore.xyz@gmail.com'
    const web = 'https://shadow-xyz.vercel.app/'
    const direccion = 'Tokyo, Japón 🇯🇵'
    const fotoPerfil = 'https://qu.ax/tAWKZ.jpg'

    const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa}
TITLE:CEO & Fundador
TEL;waid=${numCreador}:${new PhoneNumber('+' + numCreador).getNumber('international')}
EMAIL:${correo}
URL:${web}
NOTE:${about}
ADR:;;${direccion};;;;
X-ABADR:ES
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim()

    const contact = {
      displayName: name,
      vcard
    }

    // 👇 Reacción y envío del contacto
    await m.react('🌿')

    await conn.sendMessage(m.chat, {
      contacts: {
        displayName: name,
        contacts: [contact]
      },
      contextInfo: {
        mentionedJid: [m.sender],
        businessOwnerJid: numCreador + '@s.whatsapp.net',
        mediaType: 1,
        thumbnailUrl: fotoPerfil,
        renderLargerThumbnail: true,
        sourceUrl: web,
        product: {
          productImage: { url: fotoPerfil },
          productId: '7777777777',
          title: `${name}`,
          description: `🌿 ${about}`,
          currencyCode: 'USD',
          priceAmount1000: '100000',
          retailerId: 666,
          url: `https://wa.me/${numCreador}`,
          productImageCount: 1,
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.reply('⚠️ Ocurrió un error al enviar el contacto del creador.')
  }
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['creador', 'creator', 'owner']

export default handler