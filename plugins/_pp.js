import { extractGroupInviteLink, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return m.reply('⛔ Solo el Owner puede usar esto.');

  if (!args[0]) return m.reply(`📡 *Pasa el link del canal*\n\nEj:\n.reactspam https://whatsapp.com/channel/123 500`);

  let link = args[0];
  let cantidad = parseInt(args[1]) || 300;

  // Lista de emojis random 😈🔥
  let emojis = ['🔥', '💀', '👻', '😈', '😂', '🤡', '❤️', '💘', '💫', '😱', '🥵', '✨', '🧨', '🪽'];

  try {
    let code = link.split('/').pop();
    await conn({}).waSocket.groupAcceptInvite(code).catch(() => {})
  } catch {}

  m.reply(`✅ *MODO DEMONIO ACTIVADO* 😈🔥\nReacciones: *${cantidad}*\nCanal: ${link}`);

  let channelJid = link.split('/').pop() + '@broadcast';
  let lastMsg = (await conn.loadMessages(channelJid, 1))[0];

  if (!lastMsg) return m.reply('❌ No encontré mensajes en el canal.');

  for (let i = 0; i < cantidad; i++) {
    let emoji = emojis[Math.floor(Math.random() * emojis.length)];
    await conn.sendMessage(channelJid, {
      react: { text: emoji, key: lastMsg.key }
    });
    await new Promise(r => setTimeout(r, 150)); // Velocidad
  }

  m.reply(`✅ *Listo papu* 😭🔥\nSe enviaron *${cantidad}* reacciones `);
}

handler.command = /^rc$/i;
export default handler;