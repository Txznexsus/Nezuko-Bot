// file: pelicula_dl.js
import fetch from "node-fetch";

// 🔑 Credenciales TMDB
const API_KEY = "f82247b784042145c16a2f98200ac8cc";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODIyNDdiNzg0MDQyMTQ1YzE2YTJmOTgyMDBhYzhjYyIsIm5iZiI6MTc2MjkwNzI1MS4zMTQsInN1YiI6IjY5MTNkNDczYjFmZmYzNzhlMzNhMzkzMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.C1iMRTXgKmVCiOPocw2-pRXdo60pnOcFlEgSblK7CQI";

// Buscar películas en TMDb
const tmdbSearch = async (query) => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return await res.json();
};

// Detalles de una película
const tmdbDetail = async (id) => {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return await res.json();
};

// Buscar en Internet Archive (solo películas)
const iaSearch = async (title) => {
  const q = encodeURIComponent(`title:("${title}") AND (format:(MPEG4) OR format:(Ogg) OR mediatype:movies)`);
  const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,creator,mediatype,format,publicdate,rights&rows=10&page=1&output=json`;
  const res = await fetch(url);
  const j = await res.json();
  return j.response?.docs || [];
};

// Obtener archivos de un item
const iaFiles = async (identifier) => {
  const url = `https://archive.org/metadata/${identifier}`;
  const res = await fetch(url);
  const j = await res.json();
  return j.files || [];
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎬 Usa: ${usedPrefix + command} <título>\nEjemplo: ${usedPrefix + command} Metropolis`);

  try {
    await m.react("🔍");
    const results = await tmdbSearch(text);
    const items = results.results || [];
    if (!items.length) return m.reply("❌ No se encontró esa película.");

    const list = items.slice(0, 10).map((it, i) => `\`${i + 1}\` • ${it.title} (${it.release_date?.slice(0, 4) || "?"}) — id:${it.id}`).join("\n");

    const sent = await conn.sendMessage(
      m.chat,
      { text: `乂 *PELICULAS - SEARCH*\n\n${list}\n\nResponde con el número para ver más detalles.` },
      { quoted: m }
    );

    conn.peliSessions = conn.peliSessions || {};
    conn.peliSessions[m.sender] = {
      stage: "CHOOSING_MOVIE",
      choices: items.slice(0, 10),
      key: sent.key,
      timeout: setTimeout(() => delete conn.peliSessions[m.sender], 600_000)
    };

    await m.react("🎥");
  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error al buscar película: " + e.message);
  }
};

handler.before = async (m, { conn }) => {
  conn.peliSessions = conn.peliSessions || {};
  const session = conn.peliSessions[m.sender];
  if (!session || !m.quoted || m.quoted.id !== session.key.id) return;

  if (session.stage === "CHOOSING_MOVIE") {
    const sel = parseInt(m.text.trim());
    if (isNaN(sel) || sel < 1 || sel > session.choices.length)
      return m.reply("❌ Envía un número válido.");

    const movie = session.choices[sel - 1];
    await m.react("⌛");
    const details = await tmdbDetail(movie.id);
    const title = details.title;
    const overview = details.overview || "Sin descripción disponible.";

    const iaItems = await iaSearch(title);

    let caption = `🎬 *${title}*\n\n${overview}\n\n`;
    if (!iaItems.length) {
      caption += `❌ No hay copias legales en Internet Archive.\nAbre TMDb para ver plataformas oficiales:\nhttps://www.themoviedb.org/movie/${movie.id}`;
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
      clearTimeout(session.timeout);
      delete conn.peliSessions[m.sender];
      return;
    }

    const legal = iaItems.filter(it => {
      const r = (it.rights || "").toLowerCase();
      return r.includes("public domain") || r.includes("creative commons");
    });

    if (!legal.length) {
      caption += `⚠️ Se encontraron items pero no son de dominio público ni CC.`;
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
      clearTimeout(session.timeout);
      delete conn.peliSessions[m.sender];
      return;
    }

    caption += `✅ Copias legales encontradas:\n\n`;
    legal.forEach((it, i) => {
      caption += `\`${i + 1}\` • ${it.title} — ${it.rights || "N/A"}\n`;
    });
    caption += `\nResponde con el número del item para ver los archivos.`;

    const sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    session.stage = "CHOOSING_IA_ITEM";
    session.movie = details;
    session.legalItems = legal;
    session.key = sent.key;
    return;
  }

  if (session.stage === "CHOOSING_IA_ITEM") {
    const sel = parseInt(m.text.trim());
    if (isNaN(sel) || sel < 1 || sel > session.legalItems.length)
      return m.reply("❌ Número inválido.");

    const item = session.legalItems[sel - 1];
    await m.react("⌛");

    const files = await iaFiles(item.identifier);
    const vids = (files || []).filter(f => {
      const name = (f.name || "").toLowerCase();
      return name.endsWith(".mp4") || name.endsWith(".ogv") || name.endsWith(".webm") || name.endsWith(".mpeg");
    });

    if (!vids.length) {
      await conn.sendMessage(m.chat, { text: "❌ No hay archivos de video disponibles." }, { quoted: m });
      clearTimeout(session.timeout);
      delete conn.peliSessions[m.sender];
      return;
    }

    let cap = `📦 Archivos de: ${item.title}\n\n`;
    vids.forEach((v, i) => {
      cap += `\`${i + 1}\` • ${v.name} — ${(v.size / 1024 / 1024).toFixed(2)} MB\n`;
    });
    cap += `\nResponde con el número para descargar.`;

    const sent = await conn.sendMessage(m.chat, { text: cap }, { quoted: m });

    session.stage = "CHOOSING_FILE";
    session.files = vids;
    session.item = item;
    session.key = sent.key;
    return;
  }

  if (session.stage === "CHOOSING_FILE") {
    const sel = parseInt(m.text.trim());
    if (isNaN(sel) || sel < 1 || sel > session.files.length)
      return m.reply("❌ Número inválido.");

    const file = session.files[sel - 1];
    const url = `https://archive.org/download/${session.item.identifier}/${encodeURIComponent(file.name)}`;

    await m.reply(`📥 Descargando *${file.name}* desde Internet Archive...`);
    await m.react("📥");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();

      await conn.sendMessage(
        m.chat,
        { document: Buffer.from(buffer), fileName: file.name, mimetype: "video/mp4" },
        { quoted: m }
      );
      await m.react("✅");
    } catch (err) {
      console.error(err);
      await m.reply("⚠️ Error al descargar: " + err.message);
    }

    clearTimeout(session.timeout);
    delete conn.peliSessions[m.sender];
  }
};

handler.command = ["peli", "pelicula", "pelidownload"];
handler.tags = ["download"];
handler.help = ["peli <título>"];
handler.premium = false;

export default handler;