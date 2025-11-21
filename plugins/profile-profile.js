import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

async function sendOrderMsg(m, conn, texto, imgBuffer) {
  try {

    if (!imgBuffer || imgBuffer.length < 1000) { 
      imgBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAA...', 
        'base64'
      )
    }

    const order = {
      orderId: 'FAKE-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: 1,
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: 'Perfil Bot :v',
      totalAmount1000: 0,       
      totalCurrencyCode: 'GTQ',
      contextInfo: {
        externalAdReply: {
          title: botname || 'BOT',
          body: '',
          thumbnail: imgBuffer,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "https://whatsapp.com"
        }
      }
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      { orderMessage: order },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (err) {
    console.log(err)
    m.reply('⚠ Error enviando el mensaje.')
  }
}

async function formatTime(ms) {
  let s = Math.floor(ms / 1000),
    m = Math.floor(s / 60),
    h = Math.floor(m / 60),
    d = Math.floor(h / 24)

  let months = Math.floor(d / 30),
    weeks = Math.floor((d % 30) / 7)
  s %= 60; m %= 60; h %= 24; d %= 7

  let t = months
    ? [`${months} mes${months > 1 ? 'es' : ''}`]
    : weeks
      ? [`${weeks} semana${weeks > 1 ? 's' : ''}`]
      : d
        ? [`${d} día${d > 1 ? 's' : ''}`]
        : []

  if (h) t.push(`${h} hora${h > 1 ? 's' : ''}`)
  if (m) t.push(`${m} minuto${m > 1 ? 's' : ''}`)
  if (s) t.push(`${s} segundo${s > 1 ? 's' : ''}`)

  return t.length > 1 ? t.slice(0, -1).join(' ') + ' y ' + t.slice(-1) : t[0]
}

let handler = async (m, { conn, args }) => {
  try {

    let mentions = await m.mentionedJid
    let userId = mentions.length > 0 ? mentions[0] : (m.quoted ? m.quoted.sender : m.sender)

    if (!global.db.data.users[userId]) 
      return sendOrderMsg(m, conn, '⚠ No hay registro del usuario.')

    let user = global.db.data.users[userId]

    let name = user.name || ''
    if (!name.trim()) {
      try {
        const n = await conn.getName(userId)
        name = (typeof n === 'string' && n.trim()) ? n : userId.split('@')[0]
      } catch {
        name = userId.split('@')[0]
      }
    }

    const cumpleanos = user.birth || 'Sin especificar :< (#setbirth)'
    const genero = user.genre || 'Sin especificar'
    const pareja = user.marry

    const casado = pareja 
      ? (global.db.data.users[pareja]?.name?.trim() 
          || await conn.getName(pareja).catch(() => pareja.split('@')[0])) 
      : 'Nadie'

    const description = user.description || 'Sin descripción :v'
    const exp = user.exp || 0
    const nivel = user.level || 0
    const coin = user.coin || 0
    const bank = user.bank || 0
    const total = coin + bank

    const sorted = Object.entries(global.db.data.users)
      .map(([jid, data]) => ({ ...data, jid }))
      .sort((a, b) => (b.level || 0) - (a.level || 0))

    const rank = sorted.findIndex(u => u.jid === userId) + 1

    const { min, xp } = xpRange(nivel, global.multiplier)
    const progreso = `${exp - min} => ${xp} (_${Math.floor(((exp - min) / xp) * 100)}%_)`
    
    const premium = user.premium || global.prems.includes(userId.split('@')[0])
    const restante = premium
      ? (user.premiumTime ? await formatTime(user.premiumTime - Date.now()) : 'Permanente')
      : '—'

    const ownedIDs = Object.entries(global.db.data.characters)
      .filter(([, c]) => c.user === userId)
      .map(([id]) => id)

    const haremCount = ownedIDs.length
    const haremValue = ownedIDs.reduce((acc, id) => {
      const char = global.db.data.characters[id] || {}
      return acc + (char.value || 0)
    }, 0)

    const fav = user.favorite
    const favLine = fav && global.db.data.characters[fav]
      ? `• Favorito: ${global.db.data.characters[fav].name}`
      : ''
      
    const pp = await conn.profilePictureUrl(userId, 'image')
      .catch(_ => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

    const getPP = await fetch(pp)
    const imgBuffer = await getPP.buffer()

    const text = `
. 𑈜| ͜͝⩃̫۪۪۪֟፝᷼⩃͜͝ |ᅟꉹꠥ۪۪۪፝֟͡🌿۪۪۪፝֟۫͡ꉹꠥㅤ| ͜͝⩃̫۪۪۪֟፝᷼⩃͜͝ |ᰫ\`.

🌴 𝐏𝐄𝐑𝐅𝐈𝐋 𝐃𝐄 - ${name}

${description}

> ✿ ╭───〔 \`🄳🄰🅃🄾🅂\` 〕
> ✿┆. 🌳 *ᴄᴜᴍᴘʟᴇᴀɴ̃ᴏs:* ${cumpleanos}
> ✿┆. 🌿 *ɢᴇɴᴇʀᴏ:* ${genero}
> ✿┆. ❄️ *ᴘᴀʀᴇᴊᴀ:* ${casado}
> ✿╰──────────────⬣

> ✿╭───〔 \`🄿🅁🄾🄶🅁🄴🅂🄾\` 〕
> ✿┆. 🎍 *ᴇxᴘ:* ${exp.toLocaleString()}
> ✿┆. ☕ *ɴɪᴠᴇʟ:* ${nivel}
> ✿┆. 🥥 *ʀᴀɴᴋɪɴɢ:* #${rank}
> ✿┆. 🎇 *ᴀᴠᴀɴᴄᴇ:* ${progreso}
> ✿┆. 🍄 *ᴘʀᴇᴍɪᴜᴍ:* ${premium ? `Activo (${restante})` : 'No'}
> ✿╰──────────────⬣

> ✿╭───〔 \`🄲🄾🄻🄴🄲🄲🄸🄾🄽\`  〕
> ✿┆. 🌷 *ᴘᴇʀsᴏɴᴀᴊᴇs:* ${haremCount}  
> ✿┆. 🌾 *ᴠᴀʟᴏʀ ᴛᴏᴛᴀʟ:* ${haremValue.toLocaleString()}
> ✿┆. ⚡ ${favLine}
> ✿╰──────────────⬣

> ✿╭───〔 \`🄴🄲🄾🄽🄾🄼🄸🄰\` 〕
> ✿┆. ✨ *${currency}:* ${total.toLocaleString()} ${currency}
> ✿┆. ☃️ *ᴄᴏᴍᴀɴᴅᴏs ᴜsᴀᴅᴏs:* ${user.commands || 0}
> ✿╰──────────────⬣
`

    await sendOrderMsg(m, conn, text, imgBuffer)

  } catch (e) {
    console.error(e)
    return sendOrderMsg(m, conn, `⚠ Ocurrió un error:\n${e.message}`)
  }
}

handler.help = ['profile']
handler.tags = ['rg']
handler.command = ['profile', 'perfil', 'perfíl']
handler.group = true
export default handler