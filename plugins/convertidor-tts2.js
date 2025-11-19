import axios from "axios"
import fetch from "node-fetch"

const handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    let voiceList = await getVoiceList()

    if (!text) {
      if (!Array.isArray(voiceList.resultado) || voiceList.resultado.length === 0)
        return conn.reply(m.chat, `🍃 No se pudo obtener la lista de voces.`, m)

      let responseText = `🦌 *Debes ingresar un efecto de voz.*\n\n`
      responseText += `🎍 *Lista de voces disponibles:*\n\n`

      for (let entry of voiceList.resultado.slice(0, 80)) {
        responseText += `◉ *${usedPrefix + command} ${entry.ID}* hola mundo\n`
      }

      return conn.sendMessage(m.chat, { text: responseText }, { quoted: m })
    }

    // separar efecto + texto
    const [efecto, ...textoArray] = text.split(" ")
    const texto = textoArray.join(" ").trim()

    // validar voz
    const vozExiste = voiceList.resultado.some(v => v.ID === efecto)
    if (!vozExiste)
      return conn.reply(
        m.chat,
        `🎍 *El efecto '${efecto}' no existe.*\nUsa: *${usedPrefix + command}* para ver la lista.`,
        m
      )

    if (!texto)
      return conn.reply(
        m.chat,
        `🦌 Ingresa el texto que quieras convertir.\nEjemplo:\n*${usedPrefix + command} ${efecto} Hola mundo*`,
        m
      )

    let audio = await makeTTSRequest(texto, efecto)

    if (!audio.resultado.startsWith("http"))
      return conn.reply(m.chat, audio.resultado, m)

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audio.resultado },
        fileName: "voz.mp3",
        mimetype: "audio/mpeg",
        ptt: true
      },
      { quoted: m }
    )

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, "🍃 Error interno.", m)
  }
}

handler.command = ["tts2"]
export default handler

// ======================================================
// 🟣 API KEYS
// ======================================================
const secretKey = "fe2ee40099494579af0ecf871b5af266"
const userId = "SrgwcKcLzSY63IdsAxd1PzscFjL2"

// ======================================================
// ✔ Obtener lista de voces (con fallback + anime voices)
// ======================================================
async function getVoiceList() {
  try {
    const res = await fetch("https://play.ht/api/v2/voices", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${secretKey}`,
        "X-User-Id": userId
      }
    })

    const data = await res.json()

    // si data no es array → convertirlo
    const vocesAPI = Array.isArray(data) ? data : (data.voices || [])

    let unique = []
    let ids = new Set()

    for (let v of vocesAPI) {
      if (!ids.has(v.id)) {
        ids.add(v.id)
        unique.push({
          ID: v.id,
          name: v.name || "Desconocido",
          lenguaje: v.language || "N/A"
        })
      }
    }

    // 🚀 VOCES ANIME PERSONALIZADAS AÑADIDAS
    const vocesAnime = [
      { ID: "anime-loli", name: "Anime Loli", lenguaje: "jp" },
      { ID: "anime-kawaii", name: "Anime Kawaii", lenguaje: "jp" },
      { ID: "anime-soft", name: "Anime Soft Girl", lenguaje: "jp" },
      { ID: "anime-angel", name: "Anime Angel", lenguaje: "jp" },
      { ID: "anime-owa", name: "Anime Owa~", lenguaje: "jp" },
      { ID: "anime-chibi", name: "Anime Chibi", lenguaje: "jp" },
      { ID: "anime-luna", name: "Anime Luna", lenguaje: "jp" },
      { ID: "alya-san", name: "Alya Anime San", lenguaje: "jp" }
    ]

    for (let v of vocesAnime) {
      if (!unique.some(x => x.ID === v.ID)) unique.push(v)
    }

    return { resultado: unique }

  } catch (err) {
    console.log(err)
    return { resultado: [] }
  }
}

// ======================================================
// ✔ Generar audio
// ======================================================
async function makeTTSRequest(texto, efecto) {
  try {
    const res = await axios.post(
      "https://play.ht/api/v2/tts",
      {
        text: texto,
        voice: efecto
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "X-User-Id": userId,
          accept: "text/event-stream",
          "content-type": "application/json"
        }
      }
    )

    let events = res.data.split("\n\n")
    let complete = events.find(e => e.includes('"stage":"complete"'))

    if (!complete) return { resultado: "🍃 Error en la conversión TTS." }

    let url = complete.match(/"url":"([^"]+)"/)

    return { resultado: url ? url[1] : "🎍 No se encontró URL del audio." }

  } catch (err) {
    console.log(err)
    return { resultado: "🍃 Error generando audio." }
  }
}