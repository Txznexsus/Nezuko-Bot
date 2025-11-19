import fetch from 'node-fetch'

let handler = async (m, { conn, text, participants, groupMetadata }) => {
  await m.react('🕒')

  const participantList = groupMetadata?.participants || []
  let rawTargets = []

  if (m.mentionedJid?.length) rawTargets.push(...m.mentionedJid)
  if (m.quoted) rawTargets.push(m.quoted.sender)

  if (text) {
    const cleaned = text
      .split(/\s+/)
      .map(v => v.replace(/[^0-9@]/g, '').trim())
      .filter(v => v.length > 5)

    for (let v of cleaned) {
      if (v.includes('@s.whatsapp.net')) rawTargets.push(v)
      else if (/^\d+$/.test(v)) rawTargets.push(v + '@s.whatsapp.net')
    }
  }

  if (!rawTargets.length) rawTargets.push(m.sender)

  const targets = [...new Set(rawTargets)]
  let totalConLid = 0
  let totalSinLid = 0

  let info = `╭━━━〔 ☕ *INFORMACIÓN DE USUARIOS DETECTADOS* 〕━━⬣\n`
  let count = 1

  for (const userId of targets) {
    try {
      const number = userId.replace(/[^0-9]/g, '')
      const participant = participantList.find(p => p.id === userId)
      const userName = await conn.getName(userId).catch(() => 'Sin nombre')
      const isAdmin = participant?.admin ? '✅ Sí' : '❌ No'
      const isInGroup = participant ? '✅ Sí' : '❌ No'
      let lid = '—'
      if (userId.includes(':')) {
        lid = userId.split(':')[1].split('@')[0] || '—'
      }

      if (lid !== '—') totalConLid++
      else totalSinLid++

      info += `│ 🧩 *${count}.* @${number}\n`
      info += `│ ┣ 👤 *Nombre:* ${userName}\n`
      info += `│ ┣ 💠 *LID:* ${lid}\n`
      info += `│ ┣ 👑 *Admin:* ${isAdmin}\n`
      info += `│ ┗ 👥 *En grupo:* ${isInGroup}\n│\n`
      count++
    } catch (err) {
      info += `│ ⚠️ *${count}.* Error al procesar un usuario.\n│\n`
      count++
    }
  }

  info += `╰━━━━━━━━━━━━━━━━━━━━━━⬣\n`
  info += `🧮 *Total detectados:* ${targets.length} ${targets.length === 1 ? 'usuario' : 'usuarios'}\n`
  info += `💠 *Con LID:* ${totalConLid}\n`
  info += `🌀 *Sin LID:* ${totalSinLid}`

  await conn.sendMessage(m.chat, { text: info, mentions: targets }, { quoted: m })
  await m.react('✔️')
}

handler.command = ['lid', 'mylid']
handler.help = ['lid', 'mylid']
handler.tags = ['tools']
handler.group = true

export default handler