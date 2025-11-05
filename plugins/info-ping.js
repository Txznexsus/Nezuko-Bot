import speed from 'performance-now'
import { exec, execSync } from 'child_process'
import moment from 'moment-timezone'
import os from 'os'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const start = Date.now()
  await m.react('📡').catch(() => {})
  await conn.sendMessage(m.chat, { text: `🍃 *Calculando el ping...*` }, { quoted: m })
  const ping = Date.now() - start

  const t0 = speed()
  await new Promise(resolve => setImmediate(resolve))
  const latency = speed() - t0

  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`
  
  const startTime = new Date(Date.now() - uptime * 1000)
  const startAt = moment(startTime).tz('America/Lima').format('YYYY/MM/DD HH:mm:ss')

  const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2)
  const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
  const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
  const cores = os.cpus().length
  const cpu = os.cpus()[0] || { model: 'unknown', speed: 0 }
  const cpuModel = cpu.model.split('@')[0].trim()
  const cpuSpeed = (cpu.speed / 1000).toFixed(2)
  const arch = os.arch()
  const platform = os.platform().toUpperCase()
  const nodeVer = process.version
  const hostname = os.hostname()
  const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(', ')
  const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm:ss A')
  const region = moment.tz.guess() || Intl.DateTimeFormat().resolvedOptions().timeZone

  let netPing = 'N/A'
  try {
    const startNet = Date.now()
    await fetch('https://www.google.com', { method: 'HEAD', timeout: 5000 })
    netPing = `${Date.now() - startNet} ms`
  } catch {
    netPing = 'falló (timeout)'
  }

  let hostLocation = 'Desconocido'
  try {
    const res = await fetch('https://ipapi.co/json')
    const data = await res.json()
    hostLocation = `${data.city || 'Desconocido'}, ${data.country_name || '??'}`
  } catch {
    hostLocation = 'No detectado'
  }

  // 🔹 CPU y Disco
  const cpuUsage = (os.loadavg()[0] / Math.max(1, cores) * 100)
  let totalDisk = 'N/A', usedDisk = 'N/A', freeDisk = 'N/A'
  try {
    const dfRaw = execSync('df -h /').toString()
    const lines = dfRaw.split('\n').filter(Boolean)
    if (lines.length >= 2) {
      const parts = lines[1].trim().split(/\s+/)
      totalDisk = parts[1]
      usedDisk = parts[2]
      freeDisk = parts[3]
    }
  } catch {}

  let thumb = null
  try {
    const r = await fetch('https://files.catbox.moe/ge2vz7.jpg')
    thumb = Buffer.from(await r.arrayBuffer())
  } catch {}

  exec('neofetch --stdout', async (error, stdout) => {
    const sysInfo = !error && stdout
      ? stdout.toString('utf-8').replace(/Memory:/i, 'Ram:')
      : `Platform: ${platform}\nArch: ${arch}\nHost: ${hostname}`

    const response = `\`╔═══ STATUS DEL SISTEMA ═══╗\`
\`║\` ╭─  𝙸𝙵 / 𝙿𝙸𝙽𝙶
\`║\` │🚀 Ping: ${ping} ms
\`║\` │💫 Latencia: ${latency.toFixed(2)} ms
\`║\` │🌐 Ping de red: ${netPing}
\`║\` │🌿 Uptime: ${uptimeFormatted}
\`║\` │⚡ CPU: ${cpuUsage.toFixed(1)}%
\`║\` │💾 RAM: ${usedRAM}/${totalRAM} GB
\`║\` ╰───────────────
\`║\`
\`║\` ╭─ 𝚁𝙴𝙲𝚄𝚁𝚂𝙾𝚂 
\`║\` │ 🍉 RAM usada: ${usedRAM} GB
\`║\` │ 💮 RAM libre: ${freeRAM} GB
\`║\` │ 💾 RAM total: ${totalRAM} GB
\`║\` │ 🌾 Carga promedio: ${loadAvg}
\`║\` │ ⚡ Uso CPU: ${cpuUsage.toFixed(1)}%
\`║\` ╰───────────────
\`║\` 
\`║\` ╭─ 𝙲𝙿𝚄
\`║\` │ ⚙️ Modelo: ${cpuModel}
\`║\` │ 🔧 Velocidad: ${cpuSpeed} GHz
\`║\` │ 📡 Núcleos: (${cores})
\`║\` ╰───────────────
\`║\` 
\`║\` ╭─ 𝚂𝙸𝚂𝚃𝙴𝙼𝙰
\`║\` │ 🖥️ Arquitectura: ${arch}
\`║\` │ 🌲 Plataforma: ${platform}
\`║\` │ 🧠 NodeJS: ${nodeVer}
\`║\` │ 🔐 V8: ${process.versions.v8}
\`║\` │ 🔒 OpenSSL: ${process.versions.openssl}
\`║\` │ 🟢 Host: ${hostname}
\`║\` │ 🌎 Ubicación Host: ${hostLocation}
\`║\` ╰───────────────
\`║\` 
\`║\` ╭─ 𝙳𝙸𝚂𝙲𝙾
\`║\` │ 💿 Total: ${totalDisk}
\`║\` │ 📦 Usado: ${usedDisk}
\`║\` │ 📭 Libre: ${freeDisk}
\`║\` ╰───────────────
\`║\` 
\`║\`  📚 process.versions:
\`║\` \`\`\`${JSON.stringify(process.versions, null, 2)}\`\`\`
\`║\`
\`║\` \`\`\`${sysInfo.trim()}\`\`\`
\`╚═══════\`

> ✨ *Estado del sistema estable y funcionando correctamente!* ⚙️🔥`

    const msgOpts = {
      text: response,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: ' ˚  ᕱ⑅ᕱ ♡  ‧₊˚ ✩👑 𝐊𝐚𝐧𝐞𝐤𝐢 𝐁𝐨𝐭 𝐕3 💫',
          body: '',
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    await conn.sendMessage(m.chat, msgOpts, { quoted: fkontak })
  })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler