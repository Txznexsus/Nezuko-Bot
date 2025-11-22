import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) 
    return conn.reply(
      m.chat, 
      `*⚡ Usa el comando así:*\n\n> ${usedPrefix + command} Dragon Ball`, 
      m, 
      rcanal
    )

  let carga = "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763839800526_997569.jpeg"

  await conn.sendMessage(m.chat, {
    image: { url: carga },
    caption: `🪴 *Buscando resultados para:* ${text}\n*🪻 Espera un momento...*`
  }, { quoted: m })

  await m.react('🕐')

  try {

    let res = await fetch(`https://api.stellarwa.xyz/search/mediafire?query=${encodeURIComponent(text)}&key=stellar-3j2706f1`)
    let json = await res.json()

    if (!json?.results?.length) {
      await m.react('❌')
      return conn.reply(m.chat, `⚠️ No se encontraron resultados para: *${text}*`, m)
    }

    let txt = `
╭━━━━━━ ⪻🦌⪼ ━━━━━━╮
   *RESULTADOS MEDiAFiRE*
   📌 *Búsqueda:* ${text}
╰━━━━━━ ⪻🎅⪼ ━━━━━━╯
    `.trim() + "\n\n"

    json.results.forEach((f, i) => {
      txt += `
*${i + 1}. ${f.filename || 'Archivo desconocido'}*
📦 *Tamaño:* ${f.filesize || 'Desconocido'}
🔗 *Link:* ${f.url || 'No disponible'}
🌐 *Fuente:* ${f.source_url || 'No disponible'}
📘 *Título:* ${f.source_title || 'Sin Título'}

──────────────────────
`
    })

    await m.react('✔️')

    await conn.reply(m.chat, txt, m, rcanal)

  } catch (e) {
    console.error(e)
    await m.react('💀')
    conn.reply(m.chat, `❌ *Error al consultar la API.*`, m)
  }
}

handler.help = ['mediafiresearch <texto>']
handler.tags = ['search']
handler.command = ['mediafiresearch', 'mfse', 'mfsearch']
handler.group = true

export default handler