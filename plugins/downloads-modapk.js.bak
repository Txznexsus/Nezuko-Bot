import { search, download } from 'aptoide-scraper'
import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `🍃 Por favor, ingrese el nombre de la APK que desea descargar.`, m, rcanal)

  try {
    await m.react('🕒')

    let searchA = await search(text)
    if (!searchA.length) return m.reply(`⚠️ No se encontró ninguna APK con el nombre *${text}*.`)

    let data5 = await download(searchA[0].id)
    let txt = `*乂  APTOIDE - DESCARGAS 乂*\n\n`
    txt += `≡ 💐 *Nombre* : ${data5.name}\n`
    txt += `≡ 🌿 *Package* : ${data5.package}\n`
    txt += `≡ 🍃 *Update* : ${data5.lastup}\n`
    txt += `≡ 🚀 *Peso* : ${data5.size}`

    // Enviamos el mensaje con los datos y la imagen del ícono
    await conn.sendFile(m.chat, data5.icon, 'thumbnail.jpg', txt, m, null, rcanal)

    if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      return await conn.reply(m.chat, `⚠️ El archivo es demasiado pesado para enviarlo.`, m)
    }

    // Descargamos el ícono como buffer para usarlo como miniatura
    let thumb = await (await fetch(data5.icon)).buffer()

    // Envío del archivo APK con miniatura personalizada
    await conn.sendMessage(
      m.chat,
      {
        document: { url: data5.dllink },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${data5.name}.apk`,
        caption: `© powered by SHADOW°Core`,
        jpegThumbnail: thumb // ← 🔹 Miniatura del archivo
      },
      { quoted: m }
    )

    await m.react('✔️')
  } catch (error) {
    await m.react('✖️')
    return conn.reply(m.chat, `⚠️ Ocurrió un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
  }
}

handler.tags = ['download']
handler.help = ['apkmod']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true
handler.premium = false

export default handler