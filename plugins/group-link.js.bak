import baileys from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    await m.react('🕓')

    const metadata = await conn.groupMetadata(m.chat)
    const ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
    const invite = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
    const owner = metadata.owner ? '@' + metadata.owner.split('@')[0] : 'No disponible'

    const info = `
🌿 𝙂𝙍𝙐𝙋𝙊 - 𝙄𝙉𝙁𝙊 ✨

📛 *Nombre:* ${metadata.subject}
🧩 *ID:* ${metadata.id}
👑 *Creador:* ${owner}
👥 *Miembros:* ${metadata.participants.length}
🔗 *Link:* ${invite}
`.trim()

    const template = {
      image: { url: ppUrl },
      caption: info,
      footer: '✨ Información del grupo',
      templateButtons: [
        { urlButton: { displayText: '🌍 Abrir Grupo', url: invite } },
        { quickReplyButton: { displayText: '📋 Copiar Link', id: 'copy_link' } },
        { urlButton: { displayText: '🩵 Canal Oficial', url: channel } }
      ]
    }

    await conn.sendMessage(m.chat, template, { quoted: m })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ Error al obtener la información del grupo.')
  }
}

handler.help = ['link', 'enlace']
handler.tags = ['group']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

export default handler