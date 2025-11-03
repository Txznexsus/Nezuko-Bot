import fs from 'fs'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import baileys from '@whiskeysockets/baileys'

const { proto } = baileys

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const nombre = user.name || 'Sin nombre'
  const edad = user.age || 'Desconocida'

  let pp
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    pp = 'https://i.postimg.cc/rFfVL8Ps/image.jpg'
  }

  user.registered = false

  await m.react('☄️')

  const caption = `🚀 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 
──────────────────────────
🌿 *Nombre anterior:* ${nombre}
🍃 *Edad:* ${edad} años
🕸️ *Estado:* Eliminado del sistema

──────────────────────────
🩸 Si deseas registrarte de nuevo, usa:
> *#reg ${nombre}.18*
──────────────────────────
💮 *KanekiBot-V3* te esperará en tu próximo registro.`

  const productMessage = {
    product: {
      productImage: { url: pp },
      productId: '7777777777',
      title: '𝙍𝙚𝙜𝙞𝙨𝙩𝙧𝙤 𝙀𝙡𝙞𝙢𝙞𝙣𝙖𝙙𝙤 𝙘𝙤𝙧𝙧𝙚𝙘𝙩𝙖𝙢𝙚𝙣𝙩𝙚',
      description: `🌿 Nombre: ${nombre} • Edad: ${edad} años`,
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
    document: fs.readFileSync('./package.json'),
    fileName: `「 🌾 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎 ⚡ 」`,
    mimetype: 'application/vnd.ms-excel',
    fileLength: 99999999,
    caption,
    contextInfo: {
      forwardingScore: 9999,
      isForwarded: true,
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '⚡ Registro eliminado correctamente 🍃',
        body: ``,
        thumbnailUrl: pp,
        sourceUrl: 'https://github.com/Shadow-nex',
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  }

  await conn.sendMessage(m.chat, productMessage, { quoted: m })
}

handler.help = ['unreg']
handler.tags = ['rg']
handler.command = ['unreg']
handler.register = true

export default handler