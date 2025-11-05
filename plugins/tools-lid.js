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

  // 🔹 Si no hay nada, usar el propio usuario
  targets = [...new Set(targets.length ? targets : [m.sender])]

  let info = `╭━━━〔 👥 *INFORMACIÓN DE USUARIOS DETECTADOS* 〕━━⬣\n`
  let count = 1

  for (const userId of targets) {
    const participant = participantList.find(p => p.id === userId)
    const userName = await conn.getName(userId)
    const number = userId.split('@')[0]
    const isAdmin = participant?.admin ? '✅ Sí' : '❌ No'
    const lid = participant?.lid || 'No disponible'
    const isInGroup = participant ? '✅ Sí' : '❌ No'

    // 🧩 Detectar si es Business o normal
    let isBusiness = '❌ Desconocido'
    try {
      const waInfo = await conn.onWhatsApp(userId)
      if (waInfo?.length > 0) {
        isBusiness = waInfo[0]?.biz ? '💼 Business' : '📱 Oficial'
      }
    } catch {
      isBusiness = '❌ No detectado'
    }

    info += `│ 🧩 *${count}.* @${number}\n`
    info += `│ ┣ 👤 *Nombre:* ${userName}\n`
    info += `│ ┣ 💠 *LID:* ${lid}\n`
    info += `│ ┣ 👑 *Admin:* ${isAdmin}\n`
    info += `│ ┣ 👥 *En grupo:* ${isInGroup}\n`
    info += `│ ┗ 🔹 *Tipo de cuenta:* ${isBusiness}\n`
    count++
  }

  info += '╰━━━━━━━━━━━━━━━━━━━━━━⬣'

  await conn.sendMessage(m.chat, { 
    text: info,
    mentions: targets
  }, { quoted: m })

  await m.react('✔️')
}

handler.command = ['lid', 'mylid']
handler.help = ['lid', 'mylid']
handler.tags = ['tools']
handler.group = true

export default handler