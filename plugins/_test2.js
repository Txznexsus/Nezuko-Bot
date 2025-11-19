import baileys from '@whiskeysockets/baileys'
const { proto } = baileys

let handler = async (m, { conn, args }) => {
  try {
    if (args.length < 2)
      return m.reply(`Uso:\n>reactcanal <jid_del_canal> <emoji>\n\nEjemplo:\n>reactcanal 120363299999999999@broadcast 😈`)
    
    let canal = args[0]            // el canal donde quieres mandar
    let emoji = args[1]            // emoji a mandar

    // Verifica JID correcto
    if (!canal.includes("@broadcast"))
      return m.reply("⚠️ Ese no parece un JID de canal válido.")

    // Para reaccionar se necesita un mensaje
    // así que creamos un mensaje "dummy" para reaccionarle
    let dummy = await conn.sendMessage(canal, { text: "🌀" })
    let msgId = dummy.key.id

    m.reply(`🔥 Enviando reacciones al canal:\n${canal}`)

    for (let i = 0; i < 1000; i++) {

      await conn.sendMessage(canal, {
        react: {
          text: emoji,
          key: {
            remoteJid: canal,
            id: msgId
          }
        }
      })

      await new Promise(res => setTimeout(res, 60))
    }

    m.reply("✔️ *Listo mano, se mandaron 1000 reacciones al canal seleccionado.*")

  } catch (e) {
    console.error(e)
    m.reply("❌ Error:\n" + e)
  }
}

handler.command = ['reactcanal', 'reaccionacanal', 'reacttochannel']
export default handler