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
    // ======================================
    //         ENVIAR PREGUNTA
    // ======================================
    if (command === "trivia") {
      let session = triviaSessions.get(m.chat)
      let available = [...questions]

      if (session?.asked?.length)
        available = available.filter((_, i) => !session.asked.includes(i))

      if (available.length === 0) {
        triviaSessions.delete(m.chat)
        return m.reply("🎉 *Ya no hay más preguntas!* Usa !trivia para reiniciar.")
      }

      const random = Math.floor(Math.random() * available.length)
      const index = questions.indexOf(available[random])
      const q = questions[index]

      const img = triviaImages[Math.floor(Math.random() * triviaImages.length)]

      const caption = `
╭━━━〔 🎓 𝐓𝐑𝐈𝐕𝐈𝐀 〕━━⬣
┃ 🧩 *Pregunta:* ${q.question}
┃
┃ A) ${q.options[0]}
┃ B) ${q.options[1]}
┃ C) ${q.options[2]}
┃
┃ ✍️ *Responde con A, B o C*
┃ (Debes responder al mensaje del bot)
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

      // Enviar mensaje con imagen
      let sent = await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption },
        { quoted: m }
      )

      // Guardar sesión
      triviaSessions.set(m.chat, {
        index,
        asked: session?.asked ? [...session.asked, index] : [index],
        answered: false,
        msgId: sent.key.id   // <<<<<< GUARDAMOS EL ID CORRECTO
      })

      return await m.react("🧠")
    }

    // ======================================
    //            RANKING
    // ======================================
    if (command === "triviascore") {
      if (userScores.size === 0) return m.reply("📭 Nadie jugó todavía.")

      const sorted = [...userScores.entries()].sort((a, b) => b[1] - a[1])
      const top = sorted.slice(0, 10)
      const mentions = top.map(([u]) => u)

      const ranking = top
        .map(([user, score], i) =>
          `*${i + 1}.* @${user.split("@")[0]} — *${score} pts*`
        ).join("\n")

      return await conn.sendMessage(
        m.chat,
        { text: `🏆 *Ranking de Trivia:*\n${ranking}\n\n🎯 ¡Sigue jugando para subir!`, mentions },
        { quoted: m }
      )
    }

    // ======================================
    //       DETECTAR RESPUESTA A / B / C
    // ======================================
    const session = triviaSessions.get(m.chat)
    if (session && !session.answered) {

      // 🔥 VERIFICACIÓN UNIVERSAL (IGUAL QUE ANIME)
      const quotedId =
        m.quoted?.key?.id ||
        m.quoted?.id ||
        m.quoted?.stanzaId ||
        m.quoted?.messageId

      if (!quotedId || quotedId !== session.msgId) return

      const txt = m.text.trim().toUpperCase()
      if (!["A", "B", "C"].includes(txt)) return

      const correct = questions[session.index].answer
      const isCorrect = txt === correct

      const user = m.sender
      if (!userScores.has(user)) userScores.set(user, 0)
      if (isCorrect) userScores.set(user, userScores.get(user) + 1)

      await m.reply(`
🧠 *Resultado:*
Tu respuesta: ${txt}
Correcta: ${correct}

${isCorrect ? "🎉 ¡Correcto!" : "❌ Incorrecto."}

🏅 *Puntaje:* ${userScores.get(user)} pts
`.trim())

      triviaSessions.set(m.chat, { ...session, answered: true })
      return await m.react(isCorrect ? "✅" : "❌")
    }

  } catch (err) {
    console.error(err)
    m.reply("⚠️ Error en trivia.")
  }
}

handler.help = ["trivia", "triviascore"]
handler.tags = ["game"]
handler.command = ["trivia", "triviascore"]

export default handler