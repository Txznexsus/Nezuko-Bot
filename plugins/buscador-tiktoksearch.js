import axios from "axios";
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} = (await import("@whiskeysockets/baileys")).default;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🌿 *Ingresa un texto para buscar en TikTok.*\n\n📌 Ejemplo:\n> ${usedPrefix + command} edits de Kaiser`,
      m,
      rcanal
    );

  const createVideoMessage = async (url) => {
    try {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(data);
      const { videoMessage } = await generateWAMessageContent(
        { video: buffer },
        { upload: conn.waUploadToServer }
      );
      return videoMessage;
    } catch {
      return null;
    }
  };

  try {
    m.react("⏳");

    const apiUrl = `https://api.starlights.uk/api/search/tiktok?text=${encodeURIComponent(
      text
    )}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data?.status || !data?.result?.data?.length)
      throw new Error("❌ No se encontraron resultados en TikTok.");

    let results = data.result.data.slice(0, 6);
    let cards = [];

    for (let v of results) {
      let info = `
╔═══❖•ೋ° °ೋ•❖═══╗
║ 
║ \`${v.title || "Sin título"}\`
║ ᴄʀᴇᴀᴅᴏʀ: ${v.creator || "Desconocido"}
║ ʀᴇɢɪᴏɴ: ${v.region || "N/A"}
║ ᴅᴜʀᴀᴄɪᴏɴ: ${v.duration || 0} seg
║ ᴘᴜʙʟɪᴄᴀᴅᴏ: ${v.create_time || "N/A"}
║ 
║ ᴠɪsᴛᴀs: ${v.views?.toLocaleString() || 0}
║ ʟɪᴋᴇs: ${v.likes?.toLocaleString() || 0}
║ ᴄᴏᴍᴇɴᴛᴀʀɪᴏs: ${v.comments?.toLocaleString() || 0}
║ ᴄᴏᴍᴘᴀʀᴛɪᴅᴏs: ${v.share?.toLocaleString() || 0}
║ ᴅᴇsᴄᴀʀɢᴀs: ${v.download?.toLocaleString() || 0}
║ 
║ ʟɪɴᴋ: ${v.url || "No disponible"}
║ 
╚═══❖•ೋ° °ೋ•❖═══╝`;

      let videoMsg = await createVideoMessage(v.nowm);
      if (!videoMsg) continue;

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: info }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: "",
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: v.title || "Video TikTok",
          hasMediaAttachment: true,
          videoMessage: videoMsg,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
          {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "🍉 𝐕𝐞𝐫 𝐞𝐧 𝐓𝐢𝐤𝐓𝐨𝐤",
                  url: v.url || v.nowm,
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "🕸️ 𝐜𝐚𝐧𝐚𝐥 𝐨𝐟𝐢𝐜𝐢𝐚𝐥",
                  url: 'https://whatsapp.com/channel/0029VbBPa8EFsn0aLfyZl23j',
                }),
              },
            ],
          }
        ),
      });
    }

    if (cards.length === 0)
      throw new Error("⚠️ No se pudo procesar ningún video.");

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `🌺 *Resultados de TikTok para:* ${text}`,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "🌿 Kaneki Bot - AI • 𝐒𝐡𝐚𝐝𝐨𝐰.𝐱𝐲𝐳 ✨",
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject(
                { cards }
              ),
            }),
          },
        },
      },
      { quoted: m }
    );

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    m.react("✔️");
  } catch (e) {
    console.error(e);
    conn.reply(
      m.chat,
      `*Error al buscar en TikTok:*\n${e.message}`,
      m
    );
  }
};

handler.help = ["tiktoksearch <texto>"];
handler.tags = ["search"];
handler.command = ["tiktoksearch", "ttsearch", "tiktoks"];
handler.group = true;

export default handler;