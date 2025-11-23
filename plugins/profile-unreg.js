import fs from 'fs'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import baileys from '@whiskeysockets/baileys'
const { proto } = baileys

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const nombre = user.name || 'Sin nombre'
  const edad = user.age || 'Desconocida'
  const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  let pp
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    pp = 'https://i.postimg.cc/rFfVL8Ps/image.jpg'
  }

  user.registered = false
  await m.react('🎄')

  const caption = `╭─━━━━━━━━━━━━━━━━━─⊷
🎄 *𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗢 𝗘𝗟𝗜𝗠𝗜𝗡𝗔𝗗𝗢* 🎄
╰─━━━━━━━━━━━━━━━━━─⊷

🌿 *Nombre:* ${nombre}
🍃 *Edad:* ${edad} años
🕸️ *Estado:* Eliminado correctamente
${sn}

✨ Puedes volver a registrarte cuando desees:
> *#reg ${nombre}.18*

🌟 *Kaneki Bot* siempre estará contigo.`

  const productMessage = {
    product: {
      productImage: { url: pp },
      productId: '7777777777',
      title: '🎄 Registro Eliminado Correctamente 🎄',
      description: `🌿 Nombre: ${nombre} | 🍃 Edad: ${edad} años`,
      currencyCode: 'USD',
      priceAmount1000: '100000',
      retailerId: 666,
      url: 'https://wa.me/0',
      productImageCount: 1,
    },
    businessOwnerJid: m.sender,
    footer: caption,
    headerType: 1,
    viewOnce: true,
    contextInfo: {
      forwardingScore: 9999,
      isForwarded: true,
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🎄 Registro eliminado 💮',
        thumbnailUrl: pp,
        sourceUrl: 'https://github.com/Shadow-nex',
        mediaType: 1,
        renderLargerThumbnail: true,
      }
    }
  }

  await conn.sendMessage(m.chat, productMessage, { quoted: m })
}

handler.help = ['unreg']
handler.tags = ['rg']
handler.command = ['unreg']
handler.register = true

export default handler