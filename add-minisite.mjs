#!/usr/bin/env node
// Menambah minisite baru ke projects.json.
//
// Pakai:
//   node add-minisite.mjs https://nama-situs.pages.dev
//   node add-minisite.mjs https://nama-situs.pages.dev --name "Nama" --desc "Deskripsi" --tags "Niche,Negara,EN,USD"
//
// Tanpa opsi, judul dan deskripsi diambil otomatis dari halaman situsnya.
// Perlu Node 18 ke atas.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const file = join(dirname(fileURLToPath(import.meta.url)), "projects.json");

const args = process.argv.slice(2);
const url = args.find((a) => /^https?:\/\//i.test(a));
const opt = (k) => {
  const i = args.indexOf("--" + k);
  return i !== -1 ? args[i + 1] : undefined;
};

if (!url) {
  console.error('Pakai: node add-minisite.mjs https://situs-baru.pages.dev [--name "..."] [--desc "..."] [--tags "Niche,Negara,EN,USD"]');
  process.exit(1);
}

const decode = (s = "") =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

let title = "", metaDesc = "";
try {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const m =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  metaDesc = decode(m && m[1]);
} catch (e) {
  console.warn("Tidak bisa membaca situs (" + e.message + "). Pakai nilai bawaan, silakan edit manual.");
}

const hostName = new URL(url).hostname.replace(/\.pages\.dev$/, "");
const guessName = hostName.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const entry = {
  name: opt("name") || guessName,
  url: url.endsWith("/") ? url : url + "/",
  desc: opt("desc") || metaDesc || title || "Isi deskripsi singkat di sini.",
  tags: (opt("tags") || "Niche,Negara,EN,USD").split(",").map((t) => t.trim()).filter(Boolean),
  added: new Date().toISOString().slice(0, 10),
};

const list = JSON.parse(await readFile(file, "utf8"));
const norm = (u) => u.replace(/\/+$/, "").toLowerCase();
if (list.some((p) => norm(p.url) === norm(entry.url))) {
  console.error("Sudah ada di projects.json: " + entry.url);
  process.exit(1);
}

list.push(entry);
await writeFile(file, JSON.stringify(list, null, 2) + "\n");

console.log("Ditambahkan:", entry.name, "->", entry.url);
console.log("Tag ke-2 dipakai sebagai filter negara. Cek projects.json, ubah deskripsi dan tags bila perlu, lalu git push.");
