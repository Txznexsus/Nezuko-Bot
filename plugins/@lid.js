let handler = async function (m, { conn, args, groupMetadata }) {
  if (!m.isGroup) return m.reply('🚫 Este comando solo funciona en *grupos*.')  

  const participantes = groupMetadata?.participants || []

  participantes.sort((a, b) => (a.id > b.id ? 1 : -1))

  const porPagina = 20
  const paginaSolicitada = Number(args[0]) || 1
  const totalPaginas = Math.ceil(participantes.length / porPagina)

  if (paginaSolicitada < 1 || paginaSolicitada > totalPaginas) {
    return m.reply(`❗ Página inválida.\n\n📄 Páginas disponibles: *1 - ${totalPaginas}*`)
  }

  const inicio = (paginaSolicitada - 1) * porPagina
  const fin = inicio + porPagina
  const paginaActual = participantes.slice(inicio, fin)

  const tarjetas = paginaActual.map((p, index) => {
    const jid = p.id
    const username = '@' + jid.split('@')[0]

    const rol = p.admin === 'superadmin'
      ? '👑 *Fundador*'
      : p.admin === 'admin'
      ? '🛡️ *Administrador*'
      : '👤 *Miembro*'

    return [
      `╭───〔 *Usuario #${inicio + index + 1}* 〕`,
      `│ 👤 *Nombre:* ${username}`,
      `│ 🆔 *JID:* ${jid}`,
      `│ 🏅 *Rol:* ${rol}`,
      `╰────────────────────`
    ].join('\n')
  }).join('\n')

  const mencionados = paginaActual.map(p => p.id)

  const totalAdmins = participantes.filter(p => p.admin).length
  const totalMiembros = participantes.length - totalAdmins

  const imagenPersonal = {
    url: "https://i.imgur.com/H7WZ1j0.jpeg"
  }

  const texto = `
╔═══〔 📋 *PARTICIPANTES DEL GRUPO* 〕═══╗
║ 📛 *Grupo:* ${groupMetadata.subject}
║ 👥 *Total:* ${participantes.length}
║ 👑 *Admins:* ${totalAdmins}
║ 👤 *Miembros:* ${totalMiembros}
║ 📄 *Página:* ${paginaSolicitada}/${totalPaginas}
╚══════════════════════════════════╝

${tarjetas}

🪴 Usa: *.lids 2* para ir a la siguiente página.
`

  // Enviar imagen + texto
  return await conn.sendMessage(m.chat, {
    image: imagenPersonal,
    caption: texto,
    mentions: mencionados
  })
}

handler.command = ['lids']
handler.help = ['lids']
handler.tags = ['group']
handler.group = true

export default handler