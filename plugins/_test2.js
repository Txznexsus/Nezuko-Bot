import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`⚡ Uso correcto:
${usedPrefix + command} <link_post> <emoji1,emoji2,emoji3,emoji4>

Ejemplo:
${usedPrefix + command} https://whatsapp.com/channel/0029Vb6D6ogBVJl60Yr8YL31/473 😨,🤣,👾,😳`)
  }

  await m.react('⏳')

  try {
    const parts = args.join(' ').split(' ')
    const postLink = parts[0]
    const reacts = parts.slice(1).join(' ')

    if (!postLink || !reacts) {
      return m.reply(`⚠️ Formato incorrecto. Uso:
${usedPrefix + command} <link> <emoji1,emoji2,emoji3,emoji4>`)
    }

    if (!postLink.includes('whatsapp.com/channel/')) {
      return m.reply('❌ El link debe ser de una publicación de canal de WhatsApp.')
    }

    const emojiArray = reacts.split(',').map(e => e.trim()).filter(e => e)
    if (emojiArray.length > 4) {
      return m.reply('⚠️ Solo se permiten hasta 4 emojis.')
    }

    // 👉 Coloca tu API key obtenida en https://asitha.top
    const apiKey = 'TU_KEY_AQUI'

    const requestData = {
      post_link: postLink,
      reacts: emojiArray.join(',')
    }

    const response = await fetch('https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0',
        'Referer': 'https://asitha.top/channel-manager'
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json()

    if (response.ok && result.message) {
      await m.react('✅')
      await m.reply('✅ Reacciones enviadas con éxito.')
    } else {
      await m.react('❌')
      await m.reply('❌ Error al enviar las reacciones.')
    }

  } catch (error) {
    console.error(error)
    await m.react('❌')
    await m.reply('💀 Error al procesar la solicitud.')
  }
}

handler.help = ['react', 'reaccionar', 'channelreact']
handler.tags = ['tools']
handler.command = /^react|reaccionar|channelreact$/i
handler.register = false

export default handler