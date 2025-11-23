import speed from 'performance-now'
import { execSync } from 'child_process'
import os from 'os'
import fetch from 'node-fetch'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

async function sendOrderPing(m, conn, texto, thumb) {
  const order = {
    orderId: 'PING-' + Date.now(),
    thumbnail: thumb,
    itemCount: 1,
    status: 1,
    surface: 1,
    message: texto,
    orderTitle: 'Estado del Sistema',
    token: null,
    sellerJid: null,
    totalAmount1000: '3',
    totalCurrencyCode: 'PEN',
    contextInfo: {
      externalAdReply: {
        title: '˚ ᕱ⑅ᕱ ♡ ‧₊˚ ✩👑 𝐊𝐚𝐧𝐞𝐤𝐢 𝐁𝐨𝐭 𝐕3 💫',
        body: '',
        thumbnail: thumb,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }

  const msg = generateWAMessageFromContent(
    m.chat,
    { orderMessage: order },
    { quoted: fkontak }
  )

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

let handler = async (m, { conn, usedPrefix }) => {
  await m.react('🍄').catch(() => {})
  await conn.sendMessage(m.chat, { text: `*🌳 Calculando ping y recursos...*` }, { quoted: m })
  const start = performance.now()
  await fetch('https://google.com').catch(() => {})
  const pingReal = (performance.now() - start).toFixed(2)

  const t0 = speed()
  await new Promise(res => setTimeout(res, 40))
  const latency = (speed() - t0).toFixed(2)

  const uptime = process.uptime()
  const h = Math.floor(uptime / 3600)
  const m2 = Math.floor((uptime % 3600) / 60)
  const s = Math.floor(uptime % 60)
  const uptimeFormatted = `${h}h ${m2}m ${s}s`

 
  const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(2)
  const freeRAM = (os.freemem() / 1024 / 1024).toFixed(2)

  const cores = os.cpus().length
  const cpu = os.cpus()[0]
  const cpuModel = cpu.model.split('@')[0].trim()
  const cpuSpeed = (cpu.speed / 1000).toFixed(2)
  const arch = os.arch()
  const platform = os.platform().toUpperCase()
  const hostname = os.hostname()
  const cpuUsage = (os.loadavg()[0] / Math.max(1, cores) * 100).toFixed(1)

  let totalDisk = 'N/A', usedDisk = 'N/A', freeDisk = 'N/A'
  try {
    const df = execSync('df -h /').toString().split('\n')[1].trim().split(/\s+/)
    totalDisk = df[1]
    usedDisk = df[2]
    freeDisk = df[3]
  } catch {}

  let thumb
  try {
    const img = await fetch('https://files.catbox.moe/ge2vz7.jpg')
    thumb = Buffer.from(await img.arrayBuffer())
  } catch {}

  const totalChats = Object.keys(conn.chats).length
  const groupChats = Object.values(conn.chats).filter(v => v.isGroup).length
  const privateChats = totalChats - groupChats
  const registeredUsers = Object.values(global.db.data.users).filter(u => u.registered).length
  const unregisteredUsers = Object.values(global.db.data.users).filter(u => !u.registered).length

  let sysInfo = ''
  try {
    sysInfo = execSync('neofetch --stdout').toString().replace(/Memory:/i, 'RAM:')
  } catch {
    sysInfo = `Platform: ${platform}\nArch: ${arch}\nHost: ${hostname}`
  }

  const msgPing = `
🌿✨ *🍄 𝙴𝚂𝚃𝙰𝙳𝙾 𝙳𝙴𝙻 𝚂𝚈𝚂𝚃𝙴𝙼𝙰 🍄* ✨🌿

🌱 *ᴘɪɴɢ ɪɴᴛᴇʀɴᴏ:* ${latency} ms
🌸 *ʟᴀᴛᴇɴᴄʏ:* ${pingReal} ms
🍃 *ᴜᴘᴛɪᴍᴇ:* ${uptimeFormatted}

🌷 *ᴄᴘᴜ:* ${cpuModel} @ ${cpuSpeed}GHz (${cores} núcleos)
🌼 *ᴜsᴏ ᴄᴘᴜ:* ${cpuUsage}%
🍁 *ʀᴀɴ ᴜsᴀᴅᴀ:* ${usedRAM} MB
🍀 *ʀᴀᴍ ʟɪʙʀᴇ:* ${freeRAM} MB
🌹 *ʀᴀɴ ᴛᴏᴛᴀʟ:* ${totalRAM} MB
🌺 *ᴅɪsᴄᴏ ᴛᴏᴛᴀʟ:* ${totalDisk}
🍂 *ᴅɪsᴄᴏ ᴜsᴀᴅᴏ:* ${usedDisk}
🌾 *ᴅɪsᴄᴏ ʟɪʙʀᴇ:* ${freeDisk}

🌸 *🄸🄽🄵🄾 / 🄱🄾🅃:*
✨ *ᴘʀᴇғɪx:* ${usedPrefix}
🌷 *ᴛᴏᴛᴀʟ ᴄʜᴀᴛs:* ${totalChats}
🌹 *ɢʀᴜᴘᴏs:* ${groupChats}
🌼 *ᴘʀɪᴠᴀᴅᴏs:* ${privateChats}
🌺 *ʀᴇɢɪsᴛʀᴀᴅᴏs:* ${registeredUsers}
🍀 *ɴᴏ ʀᴇɢɪsᴛʀᴀᴅᴏs:* ${unregisteredUsers}

\`\`\`${sysInfo.trim()}\`\`\`

🌸✨ *Sistema estable y funcionando correctamente!* 🌿🍀
`

  await sendOrderPing(m, conn, msgPing, thumb)
  await m.react('🚀')
}

handler.command = ['ping', 'p']
handler.tags = ['info']
handler.help = ['ping']
handler.register = true

export default handler