import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  try {
    await m.react('🚀')

    const user = global.db.data.users[m.sender] || {}
    const name = await conn.getName(m.sender)
    const premium = user.premium ? '✔️ Sí' : 'free'
    const limit = user.limit || 10
    const totalreg = Object.keys(global.db.data.users).length
    const groupUserCount = m.isGroup ? participants.length : '-'
    const groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length
    const uptime = clockString(process.uptime() * 1000)
    const fecha = new Date(Date.now())
    const locale = 'es-PE'
    const dia = fecha.toLocaleDateString(locale, { weekday: 'long' })
    const fechaTxt = fecha.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const hora = fecha.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

    const totalCommands = Object.keys(global.plugins).length

    const userId = m.sender.split('@')[0]
    const phone = PhoneNumber('+' + userId)
    const pais = phone.getRegionCode() || 'Desconocido 🌐'
 
    let tags = {
      'info': ' ׅ🪹ׁ᷒ᮬ ׅ 𝐈𝐍𝐅𝐎 ❐*̥₊',
      'main': ' ׅ🍥ׁ᷒ᮬ ׅ 𝐌𝐀𝐈𝐍 ❐*̥₊',
      'anime': ' ׅ🧃ׁ᷒ᮬ ׅ 𝐀𝐍𝐈𝐌𝐄 ❐*̥₊',
      'menu': ' ׅ🦋ׁ᷒ᮬ ׅ 𝐌𝐄𝐍𝐔𝐒 ❐*̥₊',
      'search': ' ׅ🍧ׁ᷒ᮬ ׅ 𝐁𝐔𝐒𝐐𝐔𝐄𝐃𝐀𝐒 ❐*̥₊',
      'download': ' ׅ 🍃ׁ᷒ᮬ ׅ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 ❐*̥₊',
      'socket': ' ׅ 🧊ׁ᷒ᮬ ׅ 𝐉𝐀𝐃𝐈-𝐁𝐎𝐓𝐒 ❐*̥₊',
      'rg': ' ׅ 🪵ׁ᷒ᮬ ׅ 𝐏𝐄𝐑𝐅𝐈𝐋 ❐*̥₊',
      'fun': ' ׅ 🪴ׁ᷒ᮬ ׅ  𝐅𝐔𝐍 ❐*̥₊',
      'rpg': ' ׅ 🪸ׁ᷒ᮬ ׅ 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀 ❐*̥₊',
      'gacha': ' ׅ 🪷ׁ᷒ᮬ ׅ 𝐆𝐀𝐂𝐇𝐀 ❐*̥₊',
      'game': ' ׅ 🪺ׁ᷒ᮬ ׅ 𝐆𝐀𝐌𝐄 ❐*̥₊',
      'group': ' ׅ 🕸️ׁ᷒ᮬ ׅ 𝐆𝐑𝐔𝐏𝐎 ❐*̥₊',
      'nable': ' ׅ 💫ׁ᷒ᮬ ׅ 𝐎𝐍 / 𝐎𝐅𝐅 ❐*̥₊',
      'ia': ' ׅ 🌿ׁ᷒ᮬ ׅ  𝐈𝐍𝐓𝐄𝐋𝐈𝐆𝐄𝐍𝐂𝐈𝐀 ❐*̥₊',
      'stalk': ' ׅ 💐ׁ᷒ᮬ ׅ 𝐒𝐓𝐀𝐋𝐊  ❐*̥₊',
      'maker': ' ׅ🎋ׁ᷒ᮬ ׅ 𝐋𝐎𝐆𝐎𝐓𝐈𝐏𝐎𝐒 ❐*̥₊',
      'tools': ' ׅ🍬ׁ᷒ᮬ ׅ 𝐓𝐎𝐎𝐋𝐒 ❐*̥₊',
      'sticker': ' ׅ👾🪼ׁ᷒ᮬ ׅ 𝐒𝐓𝐈𝐂𝐊𝐄𝐒 ❐*̥₊',
      'owner': ' ׅ🐦‍🔥ׁ᷒ᮬ ׅ 𝐎𝐖𝐍𝐄𝐑 ❐*̥₊',
      'nsfw': ' ׅ👾ׁ᷒ᮬ ׅ 𝐍𝐒𝐅𝐖 ❐*̥₊',
    }

    let commands = Object.values(global.plugins)
      .filter(v => v.help && v.tags)
      .map(v => {
        return {
          help: Array.isArray(v.help) ? v.help : [v.help],
          tags: Array.isArray(v.tags) ? v.tags : [v.tags]
        }
      })

    let menuTexto = ''
    for (let tag in tags) {
      let comandos = commands
        .filter(cmd => cmd.tags.includes(tag))
        .map(cmd => cmd.help.map(e => `*│ ➩ ${usedPrefix}${e}*`).join('\n'))
        .join('\n')
      if (comandos) {
        menuTexto += `\n*╭──꒰* ${tags[tag]} *꒱𔖲𔖮𔖭*
${comandos}
*╰─────────────┈┄╌*\n\n`
      }
    }

    const infoUser = `> · ────────꒰𖥸꒱──────── ·
> ·°᮫ׂ🌿. һ᥆ᥣᥲ ᑲіᥱᥒ᥎ᥱᥒіძ@ s᥆ᥡ • kᥲᥒᥱkі ᑲ᥆𝗍 ᥲі ̥❄️
> *  °𓃉𐇽ܳ𓏸🍃ᮬᩬִּ〫᪲۟. ${ucapan()} ୭ୃּּּּּּּּּּ *
> *   ׅ ෫ @${userId} ಒ *
> · ────────꒰𖥸꒱──────── ·

> .    •°⪧ \`⦅ 🧃 𝐈𝐍𝐅𝐎 𝐁𝐎̼𝐓 🌠 ⦆\` 𑇛
> *🪹⿻𝅄 \`ᴘʀᴇᴍɪᴜᴍ:\`* *${premium}*
> *🪴⿻𝅄 \`ᴘᴀɪs:\`* *${pais}*
> *🪵⿻𝅄 \`ʟɪᴍɪᴛᴇ:\`* *${limit}*
> *🌿⿻𝅄 \`ᴜsᴇʀ ʀᴇɢɪsᴛʀᴀᴅᴏs:\`* *${totalreg}*
> *🍄⿻𝅄 \`ɢʀᴜᴘᴏs ᴀᴄᴛɪᴠᴏs:\`* *${groupsCount}*
> *🌟⿻𝅄 \`ʀᴜɴᴛɪᴍᴇ:\`* *${uptime}*

> *꒷꒦︶︶︶︶︶︶︶︶︶︶︶︶꒦꒷* 

> *🥞⿻𝅄 \`ʙᴏᴛ:\`* *${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-Bot')}*
> *🎋⿻𝅄 \`ᴄᴏᴍᴀɴᴅᴏs:\`* *${totalCommands}*
> *🥥⿻𝅄 \`ᴠs:\`* *${vs}*
> *☕⿻𝅄 \`ʟɪʙʀᴇʀɪᴀ:\`* *${libreria}*
> *🎍⿻𝅄 \`ғᴇᴄʜᴀ:\`* *${hora}, ${dia}, ${fechaTxt}*
> *꒷꒦︶︶︶︶︶︶︶︶︶︶︶︶꒦꒷* 

𐔌𐔌 *🎅🎄 Mᴇɴú ᴅɪsᴘᴏɴɪʙʟᴇ: 🦌🎇* ꒱꒱

`.trim()

    const imgs = [
      'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763404449889_268409.jpeg',
      'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763404456592_385271.jpeg'
    ]
    let imageUrl = imgs[Math.floor(Math.random() * imgs.length)]

  await conn.sendMessage(m.chat, {
       image: { url: imageUrl },
       //gifPlayback: true,
       caption: infoUser + menuTexto.trim(),
       ...rcanalw
  }, { quoted: m })
 
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { 
      text: `✘ Error al enviar el menú: ${e.message}`,
      mentions: [m.sender] 
    })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu','help','menú','allmenu','menucompleto']
handler.register = true;

export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function ucapan() {
  const time = moment.tz('America/Lima').format('HH')
  let res = "Ｂ𝖚𝖊𝖓𝖆𝖘 ɴᴏᴄʜᴇ𝓢 🌙"
  
  if (time >= 5 && time < 12)
    res = "Ｂ𝖚𝖊𝖓𝖔𝖘 𝒟í𝖆𝓢 ☀️"
  else if (time >= 12 && time < 18)
    res = "Ｂ𝖚𝖊𝖓𝖆𝖘 Ŧ𝖆𝖗𝖉𝖊𝓢 🌤️"
  else if (time >= 18)
    res = "Ｂ𝖚𝖊𝖓𝖆𝖘 ɴᴏᴄʜᴇ𝓢 🌙"

  return res
}