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
const shadowXD '```',
let system = `*「☕」Estado del Sistema 7w7 🌿*

ৎּٜ̊🌿ꨩ໋〪̥〭*\`Comandos ejecutados:\`* ${shadowXD}${toNum(totalCommands)}${shadowXD}
ৎּٜ̊❄️ꨩ〪̥〭 *\`Usuarios registrados:\`* ${shadowXD}${totalUsers.toLocaleString()}${shadowXD}
ৎּٜ̊☕ꨩ໋〪̥〭*\`Grupos registrados:\`* ${shadowXD}${totalChats.toLocaleString()}${shadowXD}
ৎּٜ̊🍃ꨩ໋〪̥〭*\`Plugins:\`* ${shadowXD}${totalPlugins}${shadowXD}
ৎּٜ̊🍵ꨩ໋〪̥〭*\`Bots Activos:\`* ${shadowXD}${totalBots}${shadowXD}

꒰꒰ ݊ᩞ *🌳 Estado del Servidor 🍃 ᗝᗝ*

ৎּٜ̊🍄ꨩ〪̥〭*\`Sistema:\`* ${shadowXD}${platform()}${shadowXD}
ৎּٜ̊✨ꨩ〭 *\`CPU:\`* ${shadowXD}${_cpus().length} cores${shadowXD}
ৎּٜ̊🎍ꨩ〭 *\`RAM:\`* ${shadowXD}${format(totalmem())}${shadowXD}
ৎּٜ̊🌳ꨩ〭 *\`RAM Usado:\`* ${shadowXD}${format(totalmem() - freemem())}${shadowXD}
ৎּٜ̊🚀ꨩ〪̥〭*\`Arquitectura:\`* ${shadowXD}${process.arch}${shadowXD}
ৎּٜ̊🥥ꨩ〪̥〭*\`Host ID:\`* ${shadowXD}${hostname().slice(0, 8)}...${shadowXD}

꒰꒰ ݊ᩞ *❑ 🎍 Uso de Memoria NODEJS 🥥 ᗝᗝ*

ৎּٜ̊💐ꨩ〪̥〭*\`Ram Utilizada:\`* ${shadowXD}${format(process.memoryUsage().rss)}${shadowXD}
ৎּٜ̊⭐ꨩ〪̥〭*\`Heap Reservado:\`* ${shadowXD}${format(process.memoryUsage().heapTotal)}${shadowXD}
ৎּٜ̊🌴ꨩ〪̥〭*\`Heap Usado:\`* ${shadowXD}${format(process.memoryUsage().heapUsed)}${shadowXD}
ৎּٜ̊💮ꨩ〪̥〭*\`Módulos Nativos:\`* ${shadowXD}${format(process.memoryUsage().external)}${shadowXD}
ৎּٜ̊🍰ꨩ〪̥〭*\`Buffers de Datos:\`* ${shadowXD}${format(process.memoryUsage().arrayBuffers)}${shadowXD}`
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
