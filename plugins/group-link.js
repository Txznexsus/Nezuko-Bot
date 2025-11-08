import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

let handler = async (m, { conn }) => {
  try {
    await m.react('🕓')

    const metadata = await conn.groupMetadata(m.chat)
    const ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
    const invite = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)

    const info = `📛 *Nombre:* ${metadata.subject}
🧩 *ID:* ${metadata.id}
👥 *Miembros:* ${metadata.participants.length}
🔗 *Link:* ${invite}
`

    const { imageMessage } = await generateWAMessageContent(
      { image: { url: ppUrl } },
      { upload: conn.waUploadToServer }
    )

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          productMessage: {
            product: {
              productImage: { url: ppUrl },
              productId: '12345',
              title: metadata.subject,
              description: `🍃 Información del Grupo`,
              currencyCode: 'PEN',
              priceAmount1000: '100000',
              retailerId: '0',
              productImageCount: 1
            },
            businessOwnerJid: m.chat
          },
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
                    display_text: '📋 Copiar Link',
                    copy_code: invite
                  })
                }
              ]
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.reply('⚠️ No pude enviar el mensaje interactivo.')
  }
}

handler.command = ['link', 'enlace', 'infogp', 'infogrupo']
handler.group = true
handler.botAdmin = false
export default handler