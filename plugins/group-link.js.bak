import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

let handler = async (m, { conn }) => {
  try {
    await m.react('🕓')

    const channel = 'https://whatsapp.com/channel/0029Va2R5TRG7f0fMlMZQ32M' // tu canal

    const group = m.chat
    const metadata = await conn.groupMetadata(group)
    const ppUrl = await conn.profilePictureUrl(group, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
    const invite = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
    const owner = metadata.owner ? '@' + metadata.owner.split('@')[0] : 'No disponible'

    const info = `🍃 *Nombre:* ${metadata.subject}
🌱 *ID:* ${metadata.id}
👑 *Creador:* ${owner}
☃️ *Miembros:* ${metadata.participants.length}
🌿 *Link:* ${invite}`.trim()

    // 1) Enviamos el PRODUCTO primero
    const product = {
      productMessage: {
        product: {
          productImage: { url: ppUrl },
          productId: '999999',
          title: `${metadata.subject}`,
          description: `☃️ 𝐆𝐫𝐨𝐮𝐩 -- 𝐢𝐧𝐟𝐨 🍃`,
          currencyCode: 'PEN',
          priceAmount1000: '100000',
          retailerId: '0',
          productImageCount: 1
        },
        businessOwnerJid: m.chat
      }
    }

    let sent = await conn.sendMessage(m.chat, product, { quoted: m })

    // 2) Luego enviamos el PANEL con botones, citando el producto
    const { imageMessage } = await generateWAMessageContent(
      { image: { url: ppUrl } },
      { upload: conn.waUploadToServer }
    )

    const panel = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            header: proto.Message.InteractiveMessage.Header.fromObject({
              hasMediaAttachment: true,
              imageMessage
            }),
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: info
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copiar Link",
                    copy_code: invite
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: "🩵 Canal Oficial",
                    url: channel
                  })
                }
              ]
            })
          })
        }
      }
    }, { quoted: sent }) // <--- citamos el producto

    await conn.relayMessage(m.chat, panel.message, { messageId: panel.key.id })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.reply('⚠️ Error al mostrar el grupo.')
  }
}

handler.help = ['link', 'enlace']
handler.tags = ['group']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

export default handler