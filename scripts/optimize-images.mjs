// Converte as imagens de public/images/novas para WebP (qualidade 82).
// Os itens 3D (3d-*) ficam em PNG: o recorte de transparencia usa scripts/white-to-alpha.mjs.
import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { extname, basename, join } from "node:path";
import sharp from "sharp";

const dir = join("public", "images", "novas");
const maxWidth = { produto: 825, fundo: 1024, hero: 1024, textura: 1024 };

for (const file of await readdir(dir)) {
  const ext = extname(file).toLowerCase();
  const name = basename(file, ext);
  if (name.startsWith("3d-") || ![".png", ".webp", ".jpg", ".jpeg"].includes(ext)) continue;

  const kind = name.split("-")[0];
  const width = maxWidth[kind];
  if (!width) continue;

  const input = join(dir, file);
  const output = join(dir, `${name}.webp`);
  const buffer = await sharp(await readFile(input))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(output, buffer);
  if (input !== output) await unlink(input);
  console.log(`${file} -> ${name}.webp (${Math.round(buffer.length / 1024)} KB)`);
}
