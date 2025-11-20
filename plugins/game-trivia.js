import fetch from "node-fetch"

const triviaImages = [
  'https://cdn.yupra.my.id/yp/o720p39m.jpg',
  'https://cdn.yupra.my.id/yp/ey5l5cct.jpg',
  'https://i.pinimg.com/originals/b3/67/d5/b367d513d861de468305c32c6cd22756.jpg'
]

const questions = [
  { question: "¿Quién fue el padre de Melquisedec?", options: ["Abraham", "Noé", "Ninguno, Melquisedec no tenía padre"], answer: "C" },
  { question: "¿Cuál es el nombre del rey que pidió que se escribieran los Salmos?", options: ["David", "Salomón", "Ezequías"], answer: "A" },
  { question: "¿Qué emperador romano ordenó la construcción del Muro de Adriano?", options: ["Nerón", "Trajano", "Adriano"], answer: "C" },
  { question: "¿Cuál es el metal más abundante en la corteza terrestre?", options: ["Hierro", "Aluminio", "Cobre"], answer: "B" }
]

let triviaSessions = new Map()
let userScores = new Map()

const handler = async (m, { conn, command, args }) => {
  try {
    
    if (command === "trivia") {
      let session = triviaSessions.get(m.chat)
      let available = [...questions]
      if (session?.asked?.length)
        available = available.filter((_, i) => !session.asked.includes(i))
      if (available.length === 0) {
        triviaSessions.delete(m.chat)
        return m.reply("🎉 Ya no hay más preguntas! Usa !trivia para reiniciar.")
      }

      const random = Math.floor(Math.random() * available.length)
      const index = questions.indexOf(available[random])
      const q = questions[index]
      const img = triviaImages[Math.floor(Math.random() * triviaImages.length)]

      const caption = `
❓ *Pregunta:*
A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}

✍️ Responde al mensaje del bot con A, B o C
`.trim()

      const sent = await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption },
        { quoted: m }
      )

      triviaSessions.set(m.chat, {
        index,
        asked: session?.asked ? [...session.asked, index] : [index],
        answered: false,
        key: sent.key
      })

      return await m.react("🧠")
    }

  
    if (command === "triviascore") {
      if (userScores.size === 0) return m.reply("📭 Nadie ha jugado todavía.")
      const sorted = [...userScores.entries()].sort((a,b)=>b[1]-a[1])
      const top = sorted.slice(0,10)
      const mentions = top.map(([u])=>u)
      const ranking = top.map(([user,score],i)=>`*${i+1}.* @${user.split("@")[0]} — *${score} pts*`).join("\n")
      return await conn.sendMessage(
        m.chat,
        { text: `🏆 *Ranking de Trivia:*\n${ranking}`, mentions },
        { quoted: m }
      )
    }


    const session = triviaSessions.get(m.chat)
    if (session && !session.answered) {
      const quotedId = m.quoted?.key?.id
      if (!quotedId || quotedId !== session.key.id) return

      const text = m.text.trim().toUpperCase()
      if (!["A","B","C"].includes(text)) return

      const correct = questions[session.index].answer
      const isCorrect = text === correct
      const user = m.sender
      if (!userScores.has(user)) userScores.set(user,0)
      if (isCorrect) userScores.set(user, userScores.get(user)+1)

      await m.reply(`
🧠 *Resultado*
Tu respuesta: ${text}
Correcta: ${correct}
${isCorrect ? "🎉 ¡Correcto!" : "❌ Incorrecto."}
🏅 *Puntaje:* ${userScores.get(user)} pts
`.trim())

      triviaSessions.set(m.chat,{ ...session, answered:true })
      return await m.react(isCorrect ? "✅" : "❌")
    }

  } catch(err) {
    console.error(err)
    m.reply("⚠️ Error en trivia.")
  }
}

handler.help = ["trivia","triviascore"]
handler.tags = ["game"]
handler.command = ["trivia","triviascore"]

export default handler