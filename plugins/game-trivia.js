import fetch from "node-fetch"

const triviaImages = [
  'https://cdn.yupra.my.id/yp/o720p39m.jpg',
  'https://cdn.yupra.my.id/yp/ey5l5cct.jpg',
  'https://i.pinimg.com/originals/b3/67/d5/b367d513d861de468305c32c6cd22756.jpg'
]

const questions = [
  {
    question: "¿Quién fue el padre de Melquisedec?",
    options: ["Abraham", "Noé", "Ninguno, Melquisedec no tenía padre"],
    answer: "C"
  },
  {
    question: "¿Cuál es el nombre del rey que pidió que se escribieran los Salmos?",
    options: ["David", "Salomón", "Ezequías"],
    answer: "A"
  },
  {
    question: "¿Qué emperador romano ordenó la construcción del Muro de Adriano?",
    options: ["Nerón", "Trajano", "Adriano"],
    answer: "C"
  },
  {
    question: "¿Cuál es el metal más abundante en la corteza terrestre?",
    options: ["Hierro", "Aluminio", "Cobre"],
    answer: "B"
  }
]

let triviaSessions = new Map()
let userScores = new Map()

const handler = async (m, { conn, command, args, usedPrefix }) => {
  try {
    // 📌 Comando principal: enviar nueva pregunta
    if (command === "trivia") {
      let current = triviaSessions.get(m.chat)
      let available = [...questions]

      if (current?.asked?.length)
        available = available.filter((_, i) => !current.asked.includes(i))

      if (available.length === 0) {
        triviaSessions.delete(m.chat)
        return m.reply("🎉 *Ya respondiste todas las preguntas!* Usa nuevamente *!trivia* para reiniciar.")
      }

      const random = Math.floor(Math.random() * available.length)
      const index = questions.indexOf(available[random])
      const q = questions[index]
      const img = triviaImages[Math.floor(Math.random() * triviaImages.length)]

      triviaSessions.set(m.chat, {
        index,
        answered: false,
        asked: current?.asked ? [...current.asked, index] : [index]
      })

      const caption = `
╭━━━〔 🎓 𝐓𝐑𝐈𝐕𝐈𝐀 𝐃𝐄 𝐂𝐔𝐋𝐓𝐔𝐑𝐀 〕━━⬣
┃ 🧩 *Pregunta:* ${q.question}
┃
┃ 🌿 *Opciones:*
┃   A) ${q.options[0]}
┃   B) ${q.options[1]}
┃   C) ${q.options[2]}
┃
┃ ✍️ *Responde con A, B o C*
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

      await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption },
        { quoted: m }
      )

      await m.react("🧠")
      return
    }

    // 📌 Comando para puntaje
    if (command === "triviascore") {
      if (userScores.size === 0) return m.reply("📭 Nadie ha jugado la trivia aún.")

      const sorted = [...userScores.entries()].sort((a, b) => b[1] - a[1])
      const top = sorted.slice(0, 10)
      const mentions = top.map(([u]) => u)

      const ranking = top
        .map(([user, score], i) => `*${i + 1}.* @${user.split("@")[0]} — 🏅 *${score} pts*`)
        .join("\n")

      const caption = `
╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐓𝐑𝐈𝐕𝐈𝐀 〕━━⬣
${ranking}
╰━━━━━━━━━━━━━━━━━━⬣
🎯 ¡Sigue participando para subir de puesto!
`.trim()

      await conn.sendMessage(
        m.chat,
        {
          image: { url: triviaImages[Math.floor(Math.random() * triviaImages.length)] },
          caption,
          mentions
        },
        { quoted: m }
      )

      await m.react("🏆")
      return
    }

    // 📌 RESPUESTA DEL USUARIO: (A/B/C)
    const session = triviaSessions.get(m.chat)

    if (session && !session.answered) {
      const text = m.text.trim().toUpperCase()

      if (!["A", "B", "C"].includes(text)) return   // ignora lo que no sea respuesta

      const correct = questions[session.index].answer
      const isCorrect = text === correct

      const user = m.sender
      if (!userScores.has(user)) userScores.set(user, 0)
      if (isCorrect) userScores.set(user, userScores.get(user) + 1)

      const emoji = isCorrect ? "🎉" : "💔"
      const msg = isCorrect
        ? "✨ ¡Respuesta correcta!"
        : `❌ Incorrecto. La respuesta correcta era *${correct}*`

      const caption = `
╭━━━〔 🧠 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 〕━━⬣
┃ ✍️ *Tu respuesta:* ${text}
┃ 🎯 *Correcta:* ${correct}
┃
┃ ${emoji} ${msg}
┃
┃ 🏅 *Puntaje actual:* ${userScores.get(user)} pts
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

      await m.reply(caption)
      triviaSessions.set(m.chat, { ...session, answered: true })
      await m.react(isCorrect ? "✅" : "❌")

      return
    }

  } catch (err) {
    console.error(err)
    m.reply("⚠️ Error en la trivia.")
  }
}

handler.help = ["trivia", "triviascore"]
handler.tags = ["game"]
handler.command = ["trivia", "triviascore"]

export default handler