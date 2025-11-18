let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let user = global.db.data.users[m.sender]
    if (!user) return m.reply("❗ Tu usuario no existe en la base de datos.")

    if (!global.battleCD) global.battleCD = {}
    let now = Date.now()
    let wait = 7000
    if (global.battleCD[m.sender] && now - global.battleCD[m.sender] < wait) {
      let faltan = ((global.battleCD[m.sender] + wait) - now) / 1000
      return m.reply(`⏳ Debes esperar *${faltan.toFixed(1)}s* para volver a pelear.`)
    }
    global.battleCD[m.sender] = now

    let mentioned = m.mentionedJid?.[0]
    let enemy

    if (mentioned) {
      if (!global.db.data.users[mentioned])
        return m.reply("❌ Ese usuario no está registrado en la base de datos.")
      if (mentioned === m.sender)
        return m.reply("😹 No puedes pelear contigo mismo.")

      let tagUser = '@' + mentioned.split('@')[0]

      await conn.reply(
        m.chat,
        `⚔️ *SOLICITUD DE PVP*\n\n${m.name} quiere pelear contigo.\n\n` +
        `🕐 Responde *si* o *no* en menos de *1 minuto*.\n\n` +
        `👤 Retador: @${m.sender.split('@')[0]}`,
        m,
        { mentions: [mentioned, m.sender] }
      )



      let aceptado = await new Promise(resolve => {
        conn.pvpRequest = conn.pvpRequest || {}

        conn.pvpRequest[mentioned] = {
          from: m.sender,
          resolve
        }

        setTimeout(() => {
          if (conn.pvpRequest[mentioned]) {
            delete conn.pvpRequest[mentioned]
            resolve(false)
          }
        }, 60000)
      })

      if (!aceptado) {
        return m.reply(`❌ *PVP cancelado.* El usuario no aceptó la batalla.`)
      }

      // Usuario aceptó → preparar enemigo
      enemy = {
        jid: mentioned,
        name: conn.getName(mentioned),
        hp: global.db.data.users[mentioned].health || 100,
        atk: 20
      }

    } else {
      const monsters = [
        { name: "Slime", hp: 50, atk: 10 },
        { name: "Goblin", hp: 80, atk: 18 },
        { name: "Lobo Salvaje", hp: 110, atk: 22 },
        { name: "Esqueleto", hp: 140, atk: 28 },
      ]
      enemy = monsters[Math.floor(Math.random() * monsters.length)]
    }

    let playerAtk = Math.floor(Math.random() * 30) + 10
    if (Math.random() < 0.15) playerAtk *= 2

    let enemyAtk = Math.floor(Math.random() * enemy.atk) + 5
    if (Math.random() < 0.10) enemyAtk *= 2

    user.health -= enemyAtk
    if (user.health < 0) user.health = 0

    if (mentioned) {
      let ene = global.db.data.users[enemy.jid]
      ene.health -= playerAtk
      if (ene.health < 0) ene.health = 0
    }

    let coins = mentioned ? 0 : Math.floor(Math.random() * 70) + 30
    let exp   = mentioned ? 0 : Math.floor(Math.random() * 50) + 15

    if (!mentioned) {
      user.coin += coins
      user.exp  += exp
    }

    setTimeout(() => {
      try {
        let u = global.db.data.users[m.sender]
        if (!u) return
        u.health += 40
        if (u.health > 100) u.health = 100
      } catch {}
    }, 300000)

    let ganador
    if (mentioned) {
      let pHP = user.health
      let eHP = global.db.data.users[enemy.jid].health

      ganador =
        pHP > eHP ? `🏆 *Ganador:* ${m.name}` :
        eHP > pHP ? `🏆 *Ganador:* @${enemy.jid.split('@')[0]}` :
        `🤝 *Empate*`
    }

    let txt = `⚔️ *B A T A L L A* ⚔️

👤 *Jugador:* ${m.name}
❤️ Vida: ${user.health}

${mentioned
  ? `🤺 *Enemigo:* @${enemy.jid.split('@')[0]}\n❤️ Vida enemigo: ${global.db.data.users[enemy.jid].health}`
  : `👹 *Monstruo:* ${enemy.name}`
}

🗡️ Tu daño: ${playerAtk}
💥 Daño enemigo: ${enemyAtk}

${mentioned ? ganador : `🎁 Recompensas:\n💰 +${coins} coins\n⭐ +${exp} exp`}

⏳ Vida se regenerará en 5 minutos…
`

    await conn.reply(m.chat, txt, m, {
      mentions: mentioned ? [enemy.jid] : []
    })

    await m.react('✔️')

  } catch (e) {
    await m.react('✖️')
    console.error(e)
    m.reply(`❌ Ocurrió un error inesperado.\n\n${e}`)
  }
}

handler.before = async (m, { conn }) => {
  if (!conn.pvpRequest) return

  let req = conn.pvpRequest[m.sender]
  if (!req) return

  let text = m.text.toLowerCase()

  if (text === "si" || text === "sí") {
    req.resolve(true)
    delete conn.pvpRequest[m.sender]
    return m.reply("✅ *Has aceptado el PVP!*")
  }

  if (text === "no") {
    req.resolve(false)
    delete conn.pvpRequest[m.sender]
    return m.reply("❌ *PVP rechazado.*")
  }
}

handler.help = ['batalla', 'pelea']
handler.command = ['batalla', 'pelea']
handler.tags = ['games']
handler.group = true

export default handler