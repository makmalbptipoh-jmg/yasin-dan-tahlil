// build-yasin.js
// Cara run: node build-yasin.js
// Output: data/yasin.json

import fs from "fs/promises";

const AR_URL = "https://api.alquran.cloud/v1/surah/36/quran-uthmani";
const MS_URL = "https://quranenc.com/api/v1/translation/sura/malay_basumayyah/36";

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch gagal: ${url} (${r.status})`);
  return r.json();
}

function cleanText(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

async function main() {
  const [arRaw, msRaw] = await Promise.all([getJson(AR_URL), getJson(MS_URL)]);

  const arAyahs = arRaw?.data?.ayahs || [];
  const msAyahs = msRaw?.result || msRaw?.data || [];

  const msMap = new Map();
  for (const x of msAyahs) {
    const aya = Number(x.aya);
    if (!Number.isFinite(aya)) continue;
    msMap.set(aya, cleanText(x.translation));
  }

  const out = {
    meta: {
      surah: 36,
      name: "Ya-Sin",
      source_ar: "api.alquran.cloud (quran-uthmani)",
      source_ms: "quranenc.com (malay_basumayyah)"
    },
    ayahs: arAyahs.map(a => {
      const aya = Number(a.numberInSurah);
      return {
        aya,
        ar: cleanText(a.text),
        ms: msMap.get(aya) || ""
      };
    })
  };

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/yasin.json", JSON.stringify(out, null, 2), "utf8");
  console.log("Siap: data/yasin.json");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
