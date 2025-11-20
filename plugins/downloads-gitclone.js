import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(
      m.chat, 
      `🍃 *Debes enviar un enlace de un repositorio de GitHub.*\nEjemplo:\n${usedPrefix + command} https://github.com/usuario/repositorio`,
      m
    )
  }

  let regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/i
  let match = args[0].match(regex)

  if (!match) {
    await m.react('⚠️')
    return conn.reply(
      m.chat,
      `🌱 *El enlace no es válido o no pertenece a GitHub.*`,
      m
    )
  }

  let user = match[1]
  let repo = match[2].replace(/\.git$/, "")
  let apiURL = `https://api.github.com/repos/${user}/${repo}`
  let zipURL = `https://api.github.com/repos/${user}/${repo}/zipball`

  await m.react('⌛')

  try {
    conn.reply(m.chat, `🌿 *Consultando API de GitHub...*`, m)

  
    let repoResp = await fetch(apiURL)
    if (!repoResp.ok) throw new Error("No se encontró el repo")

    let repoData = await repoResp.json()


    let zipResp = await fetch(zipURL)
    if (!zipResp.ok) throw new Error("Error descargando ZIP")

    let buffer = await zipResp.arrayBuffer()
    buffer = Buffer.from(buffer)

    let filename = `${repo}-main.zip`

    let previewImg = "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763675568213_152926.jpeg"

    let text = `*🌿 DESCARGA DE REPOSITORIO*

🍂 *Proyecto:* ${repo}
🌱 *Propietario:* ${user}
🌾 *Creador real:* ${repoData?.owner?.login}
🍀 *Descripción:* ${repoData?.description || "Sin descripción"}
🪴 *Repositorio:* ${args[0]}

> 🌳 *Descargando archivo...*`

    // Envío de preview
    await conn.sendFile(m.chat, previewImg, "git.jpg", text, m)

    // Envío del ZIP
    await conn.sendFile(m.chat, buffer, filename, "", m)

    await m.react('✔️')

  } catch (e) {
    console.log(e)
    await m.react('❌')
    return conn.reply(
      m.chat,
      `🍁 *Error descargando el repositorio.*\nAsegúrate de que exista y sea público.`,
      m
    )
  }
}

handler.help = ['gitclone *<url>*']
handler.tags = ['download']
handler.command = ['gitclone']
handler.group = true

export default handler