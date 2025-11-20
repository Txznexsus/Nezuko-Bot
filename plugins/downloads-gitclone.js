import fetch from 'node-fetch'

let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i

let handler = async (m, { args, usedPrefix, command }) => {

  if (!args[0]) {
    return conn.reply(
      m.chat, 
      `🍃 *Debes enviar un enlace de un repositorio de GitHub para descargarlo.*\n\nEjemplo:\n${usedPrefix + command} https://github.com/usuario/repositorio`,
      m
    )
  }

  if (!regex.test(args[0])) {
    return conn.reply(
      m.chat, 
      `🌱 *El enlace no pertenece a GitHub.*\nVerifícalo antes de intentarlo otra vez.`,
      m
    ).then(_ => m.react(error))
  }

  let [_, user, repo] = args[0].match(regex) || []
  let sanitizedRepo = repo.replace(/.git$/, '')
  let repoUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}`
  let zipUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}/zipball`

  await m.react(rwait)

  try {
    conn.reply(m.chat, wait, m)

    let [repoResponse, zipResponse] = await Promise.all([
      fetch(repoUrl),
      fetch(zipUrl),
    ])

    let repoData = await repoResponse.json()

    let filename = zipResponse.headers
      .get('content-disposition')
      .match(/attachment; filename=(.*)/)[1]

    let type = zipResponse.headers.get('content-type')
    let img = ''

    let txt = `*🌿  DESCARGA DE REPOSITORIO - GITHUB*\n\n`
    txt += `🌲 *Proyecto:* ${sanitizedRepo}\n`
    txt += `🍂 *Propietario:* ${user}\n`
    txt += `🌾 *Creador real:* ${repoData?.owner?.login || "Desconocido"}\n`
    txt += `🍀 *Descripción:* ${repoData.description || 'Sin descripción proporcionada'}\n`
    txt += `🪴 *Url original:* ${args[0]}\n\n`
    txt += `> 🌳 *Descargando archivo...*`

    await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
    await conn.sendFile(m.chat, await zipResponse.buffer(), filename, null, m)

    await m.react(done)

  } catch (e) {
    await m.react(error)
    return conn.reply(
      m.chat, 
      `🍁 *Ocurrió un problema al descargar el repositorio.*\nVuelve a intentarlo más tarde.`,
      m
    )
  }
}

handler.help = ['gitclone *<url>*']
handler.tags = ['download']
handler.command = ['gitclone']
handler.group = true
handler.register = true

export default handler