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
  await m.react('🎄')

  const caption = `✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ
🍁 *ʀᴇɢɪsᴛʀᴏ ᴇʟɪᴍɪɴᴀᴅᴏ* 🦋
✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ

🎍 *ɴᴏᴍʙʀᴇ:* ${nombre}
🌴 *ᴇᴅᴀᴅ:* ${edad} años
☘️ *ᴇsᴛᴀᴅᴏ:* Eliminado correctamente

🪾 ᴘᴜᴇᴅᴇs ᴠᴏʟᴠᴇʀ ᴀ ʀᴇɢɪsᴛʀᴀʀᴛᴇ ᴄᴜᴀɴᴅᴏ ᴅᴇsᴇᴇs:
> *#reg ${nombre}.18*

🪵 *ɴᴇᴢᴜᴋᴏ-ʙᴏᴛ* ᴜ.ᴜ.`

  const productMessage = {
    product: {
      productImage: { url: pp },
      productId: '7777777777',
      title: '🍁 ʀᴇɢɪsᴛʀᴏ ᴇʟɪᴍɪɴᴀᴅᴏ ᴄᴏʀʀᴇᴄᴛᴀᴍᴇɴᴛᴇ 🌱',
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
        title: '🍂 ʀᴇɢɪsᴛʀᴏ ᴇʟɪᴍɪɴᴀᴅᴏ 🌿',
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