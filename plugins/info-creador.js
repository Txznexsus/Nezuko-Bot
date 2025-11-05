
// by dv.shadow - https://github.com/Yuji-XDev

import { proto } from '@whiskeysockets/baileys';
import PhoneNumber from 'awesome-phonenumber';

const handler = async (m, { conn }) => {
  const name = 'sһᥲძ᥆ᥕ-᥊ᥡz | ᥆𝖿𝖿іᥴіᥲᥩ'
  const numCreador = '51919199620'
  const empresa = 'ᴋᴀɴᴇᴋɪ ʙᴏᴛ ɪɴɪᴄ.'
  const about = '🍃 𝑫𝒆𝒔𝒂𝒓𝒓𝒐𝒍𝒍𝒂𝒅𝒐𝒓 𝒐𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝒅𝒆 𝑲𝒂𝒏𝒆𝒌𝒊-𝑩𝒐𝒕 𝑽3'
  const correo = 'shadowcore.xyz@gmail.com'
  const web = 'https://shadow-xyz.vercel.app/'
  const direccion = 'Tokyo, Japón 🇯🇵'
  const fotoPerfil = 'https://qu.ax/tAWKZ.jpg'

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
  m.react('🌿');
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: name,
      contacts: [contactMessage]
    },
    contextInfo: {
    mentionedJid: [m.sender],
      externalAdReply: {
        title: '🍃 ᴄᴏɴᴛᴀᴄᴛᴏ ᴅᴇ ᴍɪ ᴄʀᴇᴀᴅᴏʀ ᴜᴡᴜ 🍉',
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