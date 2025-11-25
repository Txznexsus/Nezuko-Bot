
// by dv.shadow - https://github.com/Yuji-XDev
import PhoneNumber from 'awesome-phonenumber';

const handler = async (m, { conn }) => {
  const name = 'і𝗍z.ᥒᥱ᥊zᥙs'
  const numCreador = '51939260696'
  const empresa = 'ᥒᥱzᥙk᥆-ᑲ᥆𝗍 ɪɴɪᴄ.'
  const about = '🍃 ʜᴏʟᴀ ᴘᴇɴᴅᴇᴊᴏ ǫᴜᴇ ᴅᴇsᴇᴀs.'
  const correo = 'ᥒ᥆𝗍ᥱᥒg᥆@gmail.com'
  const web = 'https://itz.nexzus.vercel.app/'
  const direccion = 'Tokyo, Japón 🇯🇵'
  const fotoPerfil = 'https://files.catbox.moe/s9lvnz.jpg'

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa}
TITLE:CEO & Fundador
TEL;waid=${numCreador}:${new PhoneNumber('+' + numCreador).getNumber('international')}
EMAIL:${correo}
URL:${web}
NOTE:${about}
ADR:;;${direccion};;;;
X-ABADR:ES
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim();

  const contactMessage = {
    displayName: name,
    vcard
  };
  m.react('🪵');
  conn.reply(m.chat, `*\`✧ ᴀᴄᴀ ᴛɪᴇɴᴇs....\`*`, m)
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: name,
      contacts: [contactMessage]
    },
    contextInfo: {
    mentionedJid: [m.sender],
    isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: 100,
        newsletterName: channelRD.name
      },
      externalAdReply: {
        title: ' ',
        body: '',
        mediaType: 1,
        thumbnailUrl: fotoPerfil,
        renderLargerThumbnail: true,
        sourceUrl: web
      }
    }
  }, { quoted: fkontak });
};

handler.help = ['creador'];
handler.tags = ['info'];
handler.command = ['creador', 'creator', 'owner'];
export default handler;