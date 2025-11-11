import fetch from 'node-fetch'
import { lookup } from 'mime-types'

let handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender] || {}

  if (user.coin < 20) {
    return conn.reply(m.chat, `💮 No tienes suficientes *${currency}*.\nNecesitas *20* para usar este comando.`, m)
  }

  if (!text) return m.reply(`✨ *Ingresa un enlace válido de Mediafire.*`)

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
  m.reply(`*Descargando archivo...* 🔍\n> Esto puede tardar unos segundos.`)

  try {

    let res = await fetch(`https://api-nv.ultraplus.click/api/download/mediafire?url=${encodeURIComponent(text)}&key=hYSK8YrJpKRc9jSE`)
    let json = await res.json()

    if (!json.status || !json.result?.url) throw "API Principal falló"

    let d = json.result
    let mimetype = lookup(d.fileName.split('.').pop()) || 'application/octet-stream'

    let msg = `🍰 *MEDIAFIRE - DESCARGA LISTA*\n\n` +
    `✨ *Nombre:* ${d.fileName}\n` +
    `☕ *Tamaño:* ${d.fileSize}\n` +
    `❄️ *Tipo:* ${d.fileType}\n` +
    `🚀 *Subido:* ${d.uploaded}\n\n` +
    `🎇 *Enviando archivo...*`

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    await conn.sendFile(m.chat, d.url, d.fileName, '', m, false, { mimetype })

    user.coin -= 20
    conn.reply(m.chat, `🥥 Se descontaron *20 ${currency}*`, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    return

  } catch (e) {
    console.log("API Principal falló → Usamos respaldo")

    try {
      // API RESPALDO 🥵
      let res2 = await fetch(`https://api.stellarwa.xyz/dl/mediafire?url=${encodeURIComponent(text)}&key=stellar-3j2706f1`)
      let json2 = await res2.json()

      if (!json2.status || !json2.data?.dl) throw `No se pudo descargar desde ninguna API.`

      let { dl, title, mimeType } = json2.data
      let mimetype = mimeType || lookup(title.split('.').pop()) || 'application/octet-stream'

      await conn.sendFile(m.chat, dl, title, `🍰 *Descarga completa:* ${title}`, m, false, { mimetype })

      user.coin -= 20
      conn.reply(m.chat, `🎄 Se descontaron *20 ${currency}*`, m)
      await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } })

    } catch (err) {
      console.error(err)
      m.reply(`❌ *Error al procesar la descarga.*`)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
  }
}

handler.help = ['mediafire2']
handler.tags = ['download']
handler.command = ['mf2', 'mediafire2']
handler.group = true

export default handler