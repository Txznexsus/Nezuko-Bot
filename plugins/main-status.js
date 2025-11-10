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
let xD '```'
let system = `*「☕」Estado del Sistema 7w7 🌿*

ৎּٜ̊🌿ꨩ໋〪̥〭*\`Comandos ejecutados:\`* ${xD}${toNum(totalCommands)}${xD}
ৎּٜ̊❄️ꨩ〪̥〭 *\`Usuarios registrados:\`* ${xD}${totalUsers.toLocaleString()}${xD}
ৎּٜ̊☕ꨩ໋〪̥〭*\`Grupos registrados:\`* ${xD}${totalChats.toLocaleString()}${xD}
ৎּٜ̊🍃ꨩ໋〪̥〭*\`Plugins:\`* ${xD}${totalPlugins}${xD}
ৎּٜ̊🍵ꨩ໋〪̥〭*\`Bots Activos:\`* ${xD}${totalBots}${xD}

꒰꒰ ݊ᩞ *🌳 Estado del Servidor 🍃 ᗝᗝ*

ৎּٜ̊🍄ꨩ〪̥〭*\`Sistema:\`* ${xD}${platform()}${xD}
ৎּٜ̊✨ꨩ〭 *\`CPU:\`* ${xD}${_cpus().length} cores${xD}
ৎּٜ̊🎍ꨩ〭 *\`RAM:\`* ${xD}${format(totalmem())}${xD}
ৎּٜ̊🌳ꨩ〭 *\`RAM Usado:\`* ${xD}${format(totalmem() - freemem())}${xD}
ৎּٜ̊🚀ꨩ〪̥〭*\`Arquitectura:\`* ${xD}${process.arch}${xD}
ৎּٜ̊🥥ꨩ〪̥〭*\`Host ID:\`* ${xD}${hostname().slice(0, 8)}...${xD}

꒰꒰ ݊ᩞ *❑ 🎍 Uso de Memoria NODEJS 🥥 ᗝᗝ*

ৎּٜ̊💐ꨩ〪̥〭*\`Ram Utilizada:\`* ${xD}${format(process.memoryUsage().rss)}${xD}
ৎּٜ̊⭐ꨩ〪̥〭*\`Heap Reservado:\`* ${xD}${format(process.memoryUsage().heapTotal)}${xD}
ৎּٜ̊🌴ꨩ〪̥〭*\`Heap Usado:\`* ${xD}${format(process.memoryUsage().heapUsed)}${xD}
ৎּٜ̊💮ꨩ〪̥〭*\`Módulos Nativos:\`* ${xD}${format(process.memoryUsage().external)}${xD}
ৎּٜ̊🍰ꨩ〪̥〭*\`Buffers de Datos:\`* ${xD}${format(process.memoryUsage().arrayBuffers)}${xD}`
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
