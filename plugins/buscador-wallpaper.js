import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🪴 Por favor, ingresa lo que deseas buscar por Wallpaper.`)
  try {
    await m.react('🕒')

    const res = await axios.get(`https://xrljosedevapi.vercel.app/search/wallpaper?query=${encodeURIComponent(text)}`)
    const data = res.data

    if (!data.status || !data.data?.length)
      return conn.reply(m.chat, `ꕥ No se encontraron resultados para "${text}".`, m)

    const results = data.data.slice(0, 15)

    const medias = results.map(img => ({
      type: 'image',
      data: { url: img.previewUrl || img.imageUrl }
    }))

    await conn.sendSylphy(m.chat, medias, {
      caption: `🌲 Wallpaper - Search 🪺\n\n❄️ Búsqueda » "${text}"\n🌿 Resultados » ${medias.length}`,
      quoted: m
    })

    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    console.error(e)
    conn.reply(
      m.chat,
      `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e,
      m
    )
  }
}

handler.help = ['wallpaper']
handler.command = ['wallpaper', 'fondos', 'wall']
handler.tags = ['buscador']
handler.group = true

export default handler