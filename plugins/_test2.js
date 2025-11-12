import fetch from "node-fetch";

const API_KEY = "f82247b784042145c16a2f98200ac8cc";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODIyNDdiNzg0MDQyMTQ1YzE2YTJmOTgyMDBhYzhjYyIsIm5iZiI6MTc2MjkwNzI1MS4zMTQsInN1YiI6IjY5MTNkNDczYjFmZmYzNzhlMzNhMzkzMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.C1iMRTXgKmVCiOPocw2-pRXdo60pnOcFlEgSblK7CQI";

const tmdbSearch = async (query) => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return await res.json();
};

const tmdbDetail = async (id) => {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES&append_to_response=videos,images,credits`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return await res.json();
};

const iaSearch = async (title) => {
  const q = encodeURIComponent(`title:("${title}") AND mediatype:movies`);
  const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,creator,mediatype,format,publicdate,rights&rows=10&page=1&output=json`;
  const res = await fetch(url);
  const j = await res.json();
  return j.response?.docs || [];
};

const iaFiles = async (identifier) => {
  const res = await fetch(`https://archive.org/metadata/${identifier}`);
  const j = await res.json();
  return j.files || [];
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎬 Usa: ${usedPrefix + command} <título>\nEjemplo: ${usedPrefix + command} Matrix`);

  try {
    await m.react("🔍");
    const search = await tmdbSearch(text);
    const items = search.results?.slice(0, 5) || [];
    if (!items.length) return m.reply("❌ No se encontró esa película.");

    let txt = `🎬 *Resultados para:* ${text}\n\n`;
    txt += items.map((v, i) => `*${i + 1}.* ${v.title} (${v.release_date?.slice(0, 4) || "?"})\n⭐ ${v.vote_average}/10\nid:${v.id}`).join("\n\n");

    const sent = await conn.sendMessage(
      m.chat,
      {
        text: txt + "\n\n📩 *Responde con el número para ver detalles.*",
      },
      { quoted: m }
    );

    conn.peliSessions = conn.peliSessions || {};
    conn.peliSessions[m.sender] = {
      stage: "CHOOSING_MOVIE",
      choices: items,
      key: sent.key,
      timeout: setTimeout(() => delete conn.peliSessions[m.sender], 600_000)
    };

    await m.react("🎥");
  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error: " + e.message);
  }
};

handler.before = async (m, { conn }) => {
  conn.peliSessions = conn.peliSessions || {};
  const s = conn.peliSessions[m.sender];
  if (!s || !m.quoted || m.quoted.id !== s.key.id) return;

  if (s.stage === "CHOOSING_MOVIE") {
    const i = parseInt(m.text);
    if (isNaN(i) || i < 1 || i > s.choices.length) return m.reply("❌ Número inválido.");

    const movie = s.choices[i - 1];
    await m.react("⌛");

    const d = await tmdbDetail(movie.id);
    const poster = d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null;
    const genres = d.genres?.map(g => g.name).join(", ") || "Sin datos";
    const runtime = d.runtime ? `${d.runtime} min` : "Desconocido";
    const rating = d.vote_average ? `${d.vote_average}/10` : "N/A";

    let caption = `🎬 *${d.title}*\n\n`;
    caption += `🗓️ Año: ${d.release_date?.slice(0, 4) || "?"}\n`;
    caption += `📏 Duración: ${runtime}\n`;
    caption += `⭐ Puntuación: ${rating}\n`;
    caption += `🎭 Géneros: ${genres}\n\n`;
    caption += `📝 ${d.overview || "Sin descripción disponible."}\n\n`;

    caption += `🔗 [Ver en TMDb](https://www.themoviedb.org/movie/${d.id})\n\n`;

    const iaItems = await iaSearch(d.title);
    const legal = iaItems.filter(it => /public domain|creative commons/i.test(it.rights || ""));

    if (legal.length) {
      caption += `✅ *Copias legales disponibles:*\n`;
      caption += legal.map((v, n) => `*${n + 1}.* ${v.title} — ${v.rights}`).join("\n");
      caption += `\n\n📩 *Responde con el número para ver los archivos.*`;
    } else {
      caption += `⚠️ No hay copias públicas en Internet Archive.`;
    }

    const sent = await conn.sendMessage(
      m.chat,
      poster
        ? {
            image: { url: poster },
            caption,
          }
        : { text: caption },
      { quoted: m }
    );

    s.stage = "CHOOSING_IA_ITEM";
    s.movie = d;
    s.legalItems = legal;
    s.key = sent.key;
    return;
  }

 
  if (s.stage === "CHOOSING_IA_ITEM") {
    const i = parseInt(m.text);
    if (isNaN(i) || i < 1 || i > s.legalItems.length) return m.reply("❌ Número inválido.");

    const item = s.legalItems[i - 1];
    await m.react("📦");

    const files = await iaFiles(item.identifier);
    const vids = files.filter(f => /\.(mp4|ogv|webm|mpeg)$/i.test(f.name || ""));

    if (!vids.length) {
      await m.reply("❌ No hay archivos de video.");
      delete conn.peliSessions[m.sender];
      return;
    }

    let cap = `📂 *Archivos de:* ${item.title}\n\n`;
    vids.forEach((v, i) => {
      cap += `🎞️ *${i + 1}.* ${v.name} — ${(v.size / 1024 / 1024).toFixed(2)} MB\n`;
    });

    cap += `\n📩 *Responde con el número para descargar.*`;

    const sent = await conn.sendMessage(m.chat, { text: cap }, { quoted: m });

    s.stage = "CHOOSING_FILE";
    s.files = vids;
    s.item = item;
    s.key = sent.key;
    return;
  }

  // elegir archivo
  if (s.stage === "CHOOSING_FILE") {
    const i = parseInt(m.text);
    if (isNaN(i) || i < 1 || i > s.files.length) return m.reply("❌ Número inválido.");

    const file = s.files[i - 1];
    const url = `https://archive.org/download/${s.item.identifier}/${encodeURIComponent(file.name)}`;
    await m.reply(`📥 Descargando *${file.name}*...`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();

      await conn.sendMessage(
        m.chat,
        { document: Buffer.from(buf), fileName: file.name, mimetype: "video/mp4" },
        { quoted: m }
      );

      await m.react("✅");
    } catch (err) {
      console.error(err);
      await m.reply("⚠️ Error al descargar: " + err.message);
    }

    clearTimeout(s.timeout);
    delete conn.peliSessions[m.sender];
  }
};

handler.command = ["peli", "pelicula", "pelidownload"];
handler.tags = ["download"];
handler.help = ["peli <título>"];
handler.premium = false;

export default handler;