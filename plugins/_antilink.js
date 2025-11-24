/* eslint-disable */
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
  if (!m.isGroup) return 

  let chat = global.db.data.chats[m.chat]
  if (!chat.antiLink) return
  if (isAdmin || isOwner || m.fromMe || isROwner) return

  const delet = m.key.participant
  const bang = m.key.id
  const user = `@${m.sender.split`@`[0]}`
  const groupAdmins = participants.filter(p => p.admin)
  const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text)

  if (m?.msg?.contextInfo?.forwardedNewsletterMessageInfo && !isAdmin) {
    try {
      await conn.sendMessage(m.chat, { 
        text: `*「 ENLACE DETECTADO 」*

🥗 ${user} Rompiste las reglas del 
Grupo serás eliminado...`, 
        mentions: [m.sender] 
      }, { quoted: m })

      if (!isBotAdmin) {
        await conn.sendMessage(m.chat, { 
          text: `🥗 El bot no tiene permisos de administrador para eliminar al usuario.`,
          mentions: groupAdmins.map(v => v.id) 
        }, { quoted: fkontak })
        return
      }

      await delay(300)
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
      await delay(700)
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    } catch (e) {
      if (e?.data === 429) {
        console.log('⚠️ Rate limit detectado, esperando 10s...')
        await delay(10000)
      } else {
        console.error('❌ Error en antilink canal:', e.message)
      }
    }
    return !0
  }

  if (isGroupLink && !isAdmin) {
    try {
      if (isBotAdmin) {
        const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (m.text.includes(linkThisGroup)) return !0
      }

      await conn.sendMessage(m.chat, { 
        text: ` *「 ENLACE DETECTADO 」*

🐥 ${user} Rompiste las reglas del 
Grupo serás eliminado...`,
        mentions: [m.sender] 
      }, { quoted: m })

      if (!isBotAdmin) {
        await conn.sendMessage(m.chat, { 
          text: `🥙 El antilink está activo pero no puedo eliminarte porque no soy admin.`,
          mentions: groupAdmins.map(v => v.id) 
        }, { quoted: fkontak })
        return
      }

      await delay(300)
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
      await delay(700)
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    } catch (e) {
      if (e?.data === 429) {
        console.log('⚠️ Rate limit detectado, esperando 10s...')
        await delay(10000)
      } else {
        console.error('❌ Error en antilink grupo:', e.message)
      }
    }
  }

  return !0
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))