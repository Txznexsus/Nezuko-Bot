// 💫 by dv.shadow - https://github.com/Yuji-XDev
import { proto } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn }) => {
  const name = 'sһᥲძ᥆ᥕ-᥊ᥡz | ᥆𝖿𝖿іᥴіᥲᥩ'
  const numCreador = '51919199620'
  const empresa = 'ᴋᴀɴᴇᴋɪ ʙᴏᴛ ɪɴɪᴄ.'
  const about = '🍃 𝑫𝒆𝒔𝒂𝒓𝒓𝒐𝒍𝒍𝒂𝒅𝒐𝒓 𝒐𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝒅𝒆 𝑲𝒂𝒏𝒆𝒌𝒊-𝑩𝒐𝒕 𝑽3'
  const correo = 'shadowcore.xyz@gmail.com'
  const web = 'https://shadow-xyz.vercel.app/'
  const direccion = 'Tokyo, Japón 🇯🇵'
  const fotoPerfil = 'https://qu.ax/tAWKZ.jpg'

  await m.react('🌿')

  const product = {
    productImage: {
      mimetype: 'image/jpeg',
      jpegThumbnail: await (await conn.getFile(fotoPerfil)).data
    },
    title: name,
    description: `${about}\n\n📞 +${numCreador}\n🌐 ${web}\n✉️ ${correo}\n📍 ${direccion}`,
    currencyCode: 'USD',
    priceAmount1000: 1000000,
    retailerId: 'shadow-xyz',
    productImageCount: 1
  }

  const message = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      ...(m.chat ? { remoteJid: m.chat } : {})
    },
    message: {
      productMessage: {
        product,
        businessOwnerJid: `${numCreador}@s.whatsapp.net`
      }
    }
  }

  await conn.relayMessage(m.chat, message.message, { quoted: m })
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['creador', 'creator', 'owner']
export default handler