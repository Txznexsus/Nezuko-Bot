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

let system = `*「☕」Estado del Sistema 7w7 🌿*

ৎּٜ̊🌿ꨩ໋〪̥〭 \`Comandos ejecutados:\` \`\`\`${toNum(totalCommands)}\`\`\`
ৎּٜ̊❄️ꨩ〪̥〭 \`Usuarios registrados:\` \`\`\`${totalUsers.toLocaleString()}\`\`\`
ৎּٜ̊☕ꨩ໋〪̥〭 \`Grupos registrados:\` \`\`\`${totalChats.toLocaleString()}\`\`\`
ৎּٜ̊🍃ꨩ໋〪̥〭 \`Plugins:\` \`\`\`${totalPlugins}\`\`\`
ৎּٜ̊🍵ꨩ໋〪̥〭 \`Bots Activos:\` \`\`\`${totalBots}\`\`\`

꒰꒰ ݊ᩞ *🌳 Estado del Servidor 🍃 ᗝᗝ*

ৎּٜ̊🍄ꨩ〪̥〭 \`Sistema:\` \`\`\`${platform()}\`\`\`
ৎּٜ̊✨ꨩ〭  \`CPU:\` \`\`\`${_cpus().length} cores\`\`\`
ৎּٜ̊🎍ꨩ〭  \`RAM:\` \`\`\`${format(totalmem())}\`\`\`
ৎּٜ̊🌳ꨩ〭  \`RAM Usado:\` \`\`\`${format(totalmem() - freemem())}\`\`\`
ৎּٜ̊🚀ꨩ〪̥〭 \`Arquitectura:\` \`\`\`${process.arch}\`\`\`
ৎּٜ̊🥥ꨩ〪̥〭 \`Host ID:\` \`\`\`${hostname().slice(0, 8)}...\`\`\`

꒰꒰ ݊ᩞ *❑ 🎍 Uso de Memoria NODEJS 🥥 ᗝᗝ*

ৎּٜ̊💐ꨩ〪̥〭 \`Ram Utilizada:\` \`\`\`${format(process.memoryUsage().rss)}\`\`\`
ৎּٜ̊⭐ꨩ〪̥〭 \`Heap Reservado:\` \`\`\`${format(process.memoryUsage().heapTotal)}\`\`\`
ৎּٜ̊🌴ꨩ〪̥〭 \`Heap Usado:\` \`\`\`${format(process.memoryUsage().heapUsed)}\`\`\`
ৎּٜ̊💮ꨩ〪̥〭 \`Módulos Nativos:\` \`\`\`${format(process.memoryUsage().external)}\`\`\`
ৎּٜ̊🍰ꨩ〪̥〭 \`Buffers de Datos:\` \`\`\`${format(process.memoryUsage().arrayBuffers)}\`\`\``
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
