// Trivia simple por letras A / B / C
// Autor: ChatGPT

let triviaData = {} // almacenamiento temporal

const handler = async (m, { conn, text, command, usedPrefix }) => {

  // -------------------------------
  // INICIAR TRIVIA
  // -------------------------------

  if (command === "trivia") {

    // Preguntas básicas (puedes añadir más)
    const preguntas = [
      {
        pregunta: "¿Cuál es el país más grande del mundo?",
        opciones: {
          A: "China",
          B: "Rusia",
          C: "Canadá"
        },
        correcta: "B"
      },
      {
        pregunta: "¿Cuántos planetas hay en el sistema solar?",
        opciones: {
          A: "7",
          B: "8",
          C: "9"
        },
        correcta: "B"
      },
      {
        pregunta: "¿Quién creó Minecraft?",
        opciones: {
          A: "Notch",
          B: "ElRubius",
          C: "Jeff Bezos"
        },
        correcta: "A"
      }
    ]

    // Escoger random
    let q = preguntas[Math.floor(Math.random() * preguntas.length)]

    // Guardar la trivia activa del usuario
    triviaData[m.sender] = {
      pregunta: q.pregunta,
      correcta: q.correcta,
    }

    let message = `
🎮 *TRIVIA TIME*

❓ *Pregunta:* ${q.pregunta}

A) ${q.opciones.A}
B) ${q.opciones.B}
C) ${q.opciones.C}

👉 Responde con: *A*, *B* o *C*
`

    return conn.reply(m.chat, message, m)
  }

  // -------------------------------
  // REVISAR RESPUESTA
  // -------------------------------

  if (/^(a|b|c)$/i.test(text)) {
    let active = triviaData[m.sender]

    if (!active) return // No hay trivia activa

    let answer = text.trim().toUpperCase()

    if (answer === active.correcta) {
      await conn.reply(m.chat, `✅ *¡Correcto!*`, m)
    } else {
      await conn.reply(m.chat, `❌ *Incorrecto.*\nLa respuesta correcta era: *${active.correcta}*`, m)
    }

    // borrar trivia del usuario
    delete triviaData[m.sender]
  }
}

handler.help = ["trivia"]
handler.tags = ["games"]
handler.command = ["trivia"]

export default handler