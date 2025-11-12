import fetch from "node-fetch";

const API_KEY = "f82247b784042145c16a2f98200ac8cc";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODIyNDdiNzg0MDQyMTQ1YzE2YTJmOTgyMDBhYzhjYyIsIm5iZiI6MTc2MjkwNzI1MS4zMTQsInN1YiI6IjY5MTNkNDczYjFmZmYzNzhlMzNhMzkzMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.C1iMRTXgKmVCiOPocw2-pRXdo60pnOcFlEgSblK7CQI";

const tmdbSearch = async (query) => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return await res.json();
};

const tmdbDetail = async (id) => {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return await res.json();
};

const iaSearch = async (title) => {
  const q = encodeURIComponent(`title:("${title}") AND mediatype:movies`);
  const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,creator,rights,publicdate&rows=10&page=1&output=json`;
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
  if (!text) return m.reply(`🎬 Usa: ${usedPrefix + command} <título>\nEjemplo: ${usedPrefix + command} Iron Man`);

  try {
    await m.react("🔍");
    const search = await tmdbSearch(text);
    const results = search.results?.slice(0, 5) || [];
    if (!results.length) return m.reply("❌ No se encontró esa película.");

    const list = results.map((v, i) => `*${i + 1}.* ${v.title} (${v.release_date?.slice(0, 4) || "?"}) — id:${v.id}`).join("\n");

    const sent = await conn.sendMessage(m.chat, { text: `🎬 *PELÍCULAS ENCONTRADAS*\n\n${list}\n\nResponde con el número para ver detalles.` }, { quoted: m });

    conn.peliSessions = conn.peliSessions || {};
    conn.peliSessions[m.sender] = {
      stage: "CHOOSING_MOVIE",
      choices: results,
      key: sent.key,
      timeout: setTimeout(() => delete conn.peliSessions[m.sender], 600_000)
    };

    await m.react("🎥");
  } catch (err) {
    console.error(err);
    m.reply("⚠️ Error: " + err.message);
  }
};

handler.before = async (m, { conn }) => {
  conn.peliSessions = conn.peliSessions || {};
  const s = conn.peliSessions[m.sender];
  if (!s || !m.quoted || m.quoted.id !== s.key.id) return;

  // Elegir película
  if (s.stage === "CHOOSING_MOVIE") {
    const i = parseInt(m.text);
    if (isNaN(i) || i < 1 || i > s.choices.length) return m.reply("❌ Número inválido.");

    const movie = s.choices[i - 1];
    await m.react("⌛");

    const d = await tmdbDetail(movie.id);
    const poster = d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null;
    const genres = d.genres?.map(g => g.name).join(", ") || "Desconocido";
    const runtime = d.runtime ? `${d.runtime} min` : "Desconocido";
    const rating = d.vote_average ? `${d.vote_average}/10` : "N/A";

    let caption = `🎬 *${d.title}*\n\n`;
    caption += `🗓️ Año: ${d.release_date?.slice(0, 4) || "?"}\n`;
    caption += `📏 Duración: ${runtime}\n`;
    caption += `⭐ Puntuación: ${rating}\n`;
    caption += `🎭 Géneros: ${genres}\n\n`;
    caption += `📝 ${d.overview || "Sin descripción disponible."}\n\n`;
    caption += `🔗 [Ver en TMDb](https://www.themoviedb.org/movie/${d.id})\n\n`;

    // Buscar en IA después
    const iaItems = await iaSearch(d.title);

    if (!iaItems.length) {
      caption += `⚠️ No se encontraron copias en Internet Archive.`;
      await conn.sendMessage(m.chat, poster ? { image: { url: poster }, caption } : { text: caption }, { quoted: m });
      delete conn.peliSessions[m.sender];
      return;
    }

    caption += `📀 *Resultados en Internet Archive:*\n\n`;
    iaItems.forEach((it, n) => {
      caption += `*${n + 1}.* ${it.title}\n🪪 ${it.identifier}\n📅 ${it.publicdate?.slice(0, 10) || "?"}\n⚖️ ${it.rights || "Desconocido"}\n\n`;
    });
    caption += `📩 *Responde con el número para ver los archivos disponibles.*`;

    const sent = await conn.sendMessage(
      m.chat,
      poster ? { image: { url: poster }, caption } : { text: caption },
      { quoted: m }
    );

    s.stage = "CHOOSING_IA_ITEM";
    s.iaItems = iaItems;
    s.key = sent.key;
    return;
  }

  // Elegir item IA
  if (s.stage === "CHOOSING_IA_ITEM") {
    const i = parseInt(m.text);
    if (isNaN(i) || i < 1 || i > s.iaItems.length) return m.reply("❌ Número inválido.");

    const item = s.iaItems[i - 1];
    await m.react("📦");

    const files = await iaFiles(item.identifier);
    const vids = files.filter(f => /\.(mp4|ogv|webm|mpeg)$/i.test(f.name || ""));

    if (!vids.length) {
      await m.reply("❌ No hay archivos de video disponibles.");
      delete conn.peliSessions[m.sender];
      return;
    }

    let cap = `🎞️ *Archivos disponibles de:* ${item.title}\n\n`;
    vids.forEach((v, i) => {
      cap += `*${i + 1}.* ${v.name} — ${(v.size / 1024 / 1024).toFixed(2)} MB\n`;
    });
    cap += `\n📩 *Responde con el número para descargar.*`;

    const sent = await conn.sendMessage(m.chat, { text: cap }, { quoted: m });

    s.stage = "CHOOSING_FILE";
    s.files = vids;
    s.item = item;
    s.key = sent.key;
    return;
  }

  // Descargar archivo
  if (s.stage === "CHOOSING_FILE") {
    const i = parseInt(m.text);
    if (isNaN(i) || i < 1 || i > s.files.length) return m.reply("❌ Número inválido.");

    const file = s.files[i - 1];
    const url = `https://archive.org/download/${s.item.identifier}/${encodeURIComponent(file.name)}`;
    await m.reply(`📥 Descargando *${file.name}*...`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

    clearTimeout(s.timeout);
    delete conn.peliSessions[m.sender];
  }
};

handler.command = ["peli", "pelicula", "pelidownload"];
handler.tags = ["download"];
handler.help = ["peli <título>"];
handler.premium = false;

export default handler;