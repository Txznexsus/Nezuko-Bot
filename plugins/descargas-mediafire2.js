import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender] || {}
  
  if (user.coin < 20) {
    return conn.reply(m.chat, `💮 No tienes suficientes *${currency}*.\nNecesitas *20* para usar este comando.`, m)
  }

  if (!text) return m.reply(`✨ *Ingresa un enlace válido de Mediafire.*`)

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

  m.reply(`*Descargando archivo...* 🔍\n> Esto puede tardar unos segundos.`)

  try {

    let res1 = await fetch(`https://api.zenzxz.my.id/api/downloader/mediafire?url=${encodeURIComponent(text)}`)
    let json1 = await res1.json()

    if (json1.success && json1.data?.download_url) {

      let d = json1.data

      let msg = `📥 *MEDIAFIRE - DESCARGA LISTA*\n\n` +
      `📝 *Nombre:* ${d.filename}\n` +
      `📦 *Tamaño:* ${d.filesize}\n` +
      `📄 *Tipo:* ${d.mimetype}\n\n` +
      `🔗 *Enlace directo:* ${d.download_url}\n\n` +
      `➡️ Descargando y enviando archivo...`

      await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
      await conn.sendFile(m.chat, d.download_url, d.filename, '', m)

      user.coin -= 20
      conn.reply(m.chat, `✅ Se descontaron *20 ${currency}*`, m)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return
    }
 
    let res2 = await fetch(`https://api.stellarwa.xyz/dl/mediafire?url=${encodeURIComponent(text)}&key=stellar-3j2706f1`)
    let json2 = await res2.json()

    if (!json2.status || !json2.data?.dl) throw `No se pudo descargar desde ninguna API.`

    let { title, mimeType, dl } = json2.data

    await conn.sendFile(m.chat, dl, title, `📥 *Descarga completa:* ${title}`, m)

    user.coin -= 20
    conn.reply(m.chat, `✅ Se descontaron *20 ${currency}*`, m)
    await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Error al procesar la descarga.*\n> ${e.message}`)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.help = ['mediafire2']
handler.tags = ['download']
handler.command = ['mf2', 'mediafire2']
handler.group = true

export default handler