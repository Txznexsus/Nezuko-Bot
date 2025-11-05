import fetch from 'node-fetch'

let handler = async (m, { conn, text, participants, groupMetadata }) => {
  await m.react('🕒')
  
  const participantList = groupMetadata?.participants || []
  let targets = []

  // 🔹 Menciones
  if (m.mentionedJid?.length) {
    targets.push(...m.mentionedJid)
  }
  // 🔹 Respuesta a mensaje
  if (m.quoted) {
    targets.push(m.quoted.sender)
  }
  // 🔹 Números escritos manualmente
  if (text) {
    const numbers = text
      .split(/\s+/)
      .filter(v => v.match(/\d{5,}/))
      .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    targets.push(...numbers)
  }

  // 🔹 Evita duplicados
  targets = [...new Set(targets.length ? targets : [m.sender])]

  let resumen = `╭━━━〔 👥 *INFORME DE USUARIOS DETECTADOS* 〕━━⬣\n`
  let i = 1

  for (const userId of targets) {
    const participant = participantList.find(p => p.id === userId)
    const userName = await conn.getName(userId)
    const number = userId.split('@')[0]
    const isAdmin = participant?.admin ? '✅ Sí' : '❌ No'
    const lid = participant?.lid || 'No disponible'
    const isInGroup = participant ? '✅ Sí' : '❌ No'
    const joinDate = participant?.since
      ? new Date(participant.since * 1000).toLocaleString('es-PE', { timeZone: 'America/Lima' })
      : 'Desconocida'

    let pp
    try {
      pp = await conn.profilePictureUrl(userId, 'image')
    } catch {
      pp = 'https://telegra.ph/file/3e48f8f1e1df9f6122e98.jpg'
    }

    // 🔸 Enviar imagen + info individual
    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: `╭━━━〔 👤 *Usuario ${i}* 〕━━⬣
┃ 🧩 *Nombre:* ${userName}
┃ ☎️ *Número:* ${number}
┃ 💠 *LID:* ${lid}
┃ 🧭 *ID:* ${userId}
┃ 👑 *Admin:* ${isAdmin}
┃ 👥 *En grupo:* ${isInGroup}
┃ 🕒 *Se unió:* ${joinDate}
╰━━━━━━━━━━━━━━⬣`,
      mentions: [userId]
    }, { quoted: m })

    resumen += `│ 🧩 *${i}.* @${number}\n`
    resumen += `│ ┣ 💠 LID: ${lid}\n`
    resumen += `│ ┣ 👑 Admin: ${isAdmin}\n`
    resumen += `│ ┣ 👥 En grupo: ${isInGroup}\n`
    resumen += `│ ┗ 🕒 Ingreso: ${joinDate}\n`
    i++
  }

  resumen += '╰━━━━━━━━━━━━━━━━━━━━━━⬣'

  // 🔸 Enviar resumen general decorado
  await conn.sendMessage(m.chat, { 
    text: resumen,
    mentions: targets
  }, { quoted: m })

  await m.react('✔️')
}

handler.command = ['lid', 'mylid']
handler.help = ['lid', 'mylid']
handler.tags = ['tools']
handler.group = true

export default handler