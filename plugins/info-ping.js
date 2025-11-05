import speed from 'performance-now'
import { exec, execSync } from 'child_process'
import moment from 'moment-timezone'
import os from 'os'
import fetch from 'node-fetch'
import pkg from '../package.json' assert { type: 'json' }

let handler = async (m, { conn }) => {
  const start = new Date().getTime()
  await m.react('📡')
  await conn.sendMessage(m.chat, { text: `⏳ *Calculando el ping...*` }, { quoted: m })
  const end = new Date().getTime()
  const ping = end - start

  const timestamp = speed()
  const latency = speed() - timestamp

  // Tiempo activo
  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`

  // Inicio del bot
  const startTime = new Date(Date.now() - uptime * 1000)
  const startAt = moment(startTime).tz('America/Lima').format('YYYY/MM/DD HH:mm:ss')

  // Información del sistema
  const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2)
  const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
  const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
  const cpu = os.cpus()[0]
  const cpuModel = cpu.model.split('@')[0].trim()
  const cpuSpeed = (cpu.speed / 1000).toFixed(2)
  const cores = os.cpus().length
  const arch = os.arch()
  const platform = os.platform().toUpperCase()
  const nodeVer = process.version
  const hostname = os.hostname()
  const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(', ')
  const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm:ss A')
  const region = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Test red (latencia real)
  const startNet = Date.now()
  await fetch('https://www.google.com')
  const endNet = Date.now()
  const netPing = endNet - startNet

  // CPU usage aproximado
  const cpuUsage = os.loadavg()[0] / cores * 100

  // Info disco
  let disk = execSync('df -h /').toString().split('\n')[1].split(/\s+/)
  let totalDisk = disk[1]
  let usedDisk = disk[2]
  let freeDisk = disk[3]

  // Miniatura
  const thumb = Buffer.from(await (await fetch('https://files.catbox.moe/ge2vz7.jpg')).arrayBuffer())

  exec('neofetch --stdout', async (error, stdout) => {
    let sysInfo = stdout.toString('utf-8').replace(/Memory:/, 'Ram:')
    let response = `=============================
  🍬  🆂🆃🅰🆃🆄🆂 / 🅿🅸🅽🅶 🍃
=============================

━━━━━━━━━━━━━━━━━━━━━━
          ⬣ ᴘ ɪ ɴ ɢ ⬣
> 🚀 *Ping:* ${ping} ms
> 💫 *Latencia:* ${latency.toFixed(2)} ms
> 🌐 *Ping de red:* ${netPing} ms
> 🌿 *Uptime:* ${uptimeFormatted}
> 🕐 *Iniciado desde:* ${startAt}
> 🗓️ *Fecha/Hora:* ${fechaHora}
> 🌍 *Zona horaria:* ${region}

━━━━━━━━━━━━━━━━━━━━━━
     ⬣ ʀ ᴇ ᴄ ᴜ ʀ s ᴏ s ⬣
> 🍉 *RAM usada:* ${usedRAM} GB
> 💮 *RAM libre:* ${freeRAM} GB
> 💾 *RAM total:* ${totalRAM} GB
> 🌾 *Carga promedio:* ${loadAvg}
> ⚡ *Uso CPU:* ${cpuUsage.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━
          ⬣ ᴄ ᴘ ᴜ ⬣
> ⚙️ *Modelo:* ${cpuModel}
> 🔧 *Velocidad:* ${cpuSpeed} GHz
> 📡 *Núcleos:* ${cores}

━━━━━━━━━━━━━━━━━━━━━━
       ⬣ s ɪ s ᴛ ᴇ ᴍ ᴀ⬣
> 🖥️ *Arquitectura:* ${arch}
> 🌲 *Plataforma:* ${platform}
> 🧠 *NodeJS:* ${nodeVer}
> 🟢 *Host:* ${hostname}

━━━━━━━━━━━━━━━━━━━━━━
       ⬣ ᴅ ɪ s ᴄ ᴏ ⬣
> 💿 *Total:* ${totalDisk}
> 📦 *Usado:* ${usedDisk}
> 📭 *Libre:* ${freeDisk}

━━━━━━━━━━━━━━━━━━━━━━
     ⬣ ᴅ ᴇᴘᴇɴᴅᴇɴᴄɪᴀs ⬣
> 📦 *Baileys:* ${pkg.dependencies['@whiskeysockets/baileys']}
> 📚 *Node-fetch:* ${pkg.dependencies['node-fetch']}

\`\`\`${sysInfo.trim()}\`\`\`
━━━━━━━━━━━━━━━━━━━━━━

> ✨ *Estado del sistema estable y funcionando correctamente!* ⚙️🔥`

    await conn.sendMessage(m.chat, {
      text: response,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: '👑 𝐊𝐚𝐧𝐞𝐤𝐢 𝐁𝐨𝐭 𝐕3 💫',
          body: '',
          thumbnail: thumb,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak })
  })
}

handler.help = ['ping', 'status', 'info']
handler.tags = ['info']
handler.command = ['ping', 'p', 'status']

export default handler