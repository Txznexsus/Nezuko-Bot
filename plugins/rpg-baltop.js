import fetch from 'node-fetch'
import moment from 'moment-timezone'

let handler = async (m, { conn, args, participants, usedPrefix }) => {
  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.economy && m.isGroup) {
    return m.reply(`🍃 *Los comandos de economía están desactivados en este grupo.*\n\nUn administrador puede activarlos con:\n> ${usedPrefix}economy on`)
  }

  const groupUsers = participants.map(p => p.id)
  const users = groupUsers
    .map(jid => ({ jid, ...(global.db.data.users[jid] || {}) }))
    .filter(u => u && (u.coin || u.bank))

  if (!users.length) return m.reply('🌿 No hay usuarios con datos económicos en este grupo.')

  const sorted = users.sort((a, b) => ((b.coin || 0) + (b.bank || 0)) - ((a.coin || 0) + (a.bank || 0)))
  const totalPages = Math.ceil(sorted.length / 10)
  const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10
  const slice = sorted.slice(startIndex, endIndex)

  const richest = (sorted[0].coin || 0) + (sorted[0].bank || 0)
 
  let text = `
╔══《 💰 ᴛᴏᴘ ᴇᴄᴏɴᴏᴍɪ́ᴀ 💰 》══╗
║  🌍 *Grupo:* ${m.isGroup ? (await conn.groupMetadata(m.chat)).subject : 'Privado'}
║  📄 *Página:* ${page}/${totalPages}
║──────────────────────║
`

  for (let i = 0; i < slice.length; i++) {
    const { jid, coin = 0, bank = 0, lastplay } = slice[i]
    const total = coin + bank
    let name

    try {
      name = await conn.getName(jid)
    } catch {
      name = jid.split('@')[0]
    }

    const percent = Math.min(100, Math.floor((total / richest) * 100))
    const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10))

    let lastPlayed = ':v'
    if (lastplay) {
      const diff = Date.now() - lastplay
      const mins = Math.floor(diff / 60000)
      const hrs = Math.floor(mins / 60)
      const days = Math.floor(hrs / 24)
      if (days > 0) lastPlayed = `${days}d ${hrs % 24}h`
      else if (hrs > 0) lastPlayed = `${hrs}h ${mins % 60}m`
      else lastPlayed = `${mins}m`
    }

    text += `║ ${i + 1 + startIndex}. *${name}*
║    💴 Total: ${currency}${total.toLocaleString()}
║    📊 Progreso: [${bar}] ${percent}%
║    ⏰ Último juego: ${lastPlayed}
║──────────────────────║
`
  }

  text += `╚═════════════════════════╝`

  await conn.reply(m.chat, text.trim(), m)
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard']
handler.group = true

export default handler