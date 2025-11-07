import { cpus as _cpus, totalmem, freemem, platform, hostname } from 'os'
import { execSync } from 'child_process'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B` })
let handler = async (m, { conn }) => {
let totalUsers = Object.keys(global.db.data.users).length
let totalChats = Object.keys(global.db.data.chats).length
let totalPlugins = Object.values(global.plugins).filter((v) => v.help && v.tags).length
let totalBots = global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== 3).length
let totalCommands = Object.values(global.db.data.users).reduce((acc, user) => acc + (user.commands || 0), 0)
let system = `╔══⭒⃝🌿🌸🌙❄️💫🌿🌸🌙❄️💫⭒⃝══╗
        🌿 𝑬𝒔𝒕𝒂𝒅𝒐 𝒅𝒆𝒍 𝑩𝒐𝒕 🌿
╚══⭒⃝🌿🌸🌙❄️💫🌿🌸🌙❄️💫⭒⃝══╝

  🍃 *Actividad Viva del Sistema* 🌱
• 🍂 Comandos ejecutados: ${toNum(totalCommands)}
• 🌾 Usuarios en la red: ${totalUsers.toLocaleString()}
• 🌻 Comunidades activas: ${totalChats.toLocaleString()}
• 🍀 Plugins cargados: ${totalPlugins}
• 🌙 Conexiones establecidas: ${totalBots}

  ❄️ *Entorno del Servidor* 🌿
• 🌍 Sistema: ${platform()}
• 🌬 Núcleos CPU: ${_cpus().length}
• 🫧 RAM Total: ${format(totalmem())}
• 🔥 RAM en uso: ${format(totalmem() - freemem())}
• 🧬 Arquitectura: ${process.arch}
• 🪷 Host: ${hostname().slice(0, 8)}…

 ✨ *Memoria NodeJS* 🌸
• 💾 RSS: ${format(process.memoryUsage().rss)}
• 🌙 Heap usado: ${format(process.memoryUsage().heapUsed)}
• 🌿 Extensiones: ${format(process.memoryUsage().external)}
• 🫧 Buffers: ${format(process.memoryUsage().arrayBuffers)}`
await conn.reply(m.chat, system, m, rcanal)
}

handler.help = ['estado']
handler.tags = ['info']
handler.command = ['estado', 'status']

export default handler

function toNum(number) {
if (number >= 1000 && number < 1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number >= 1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else {
return number.toString()
}}
