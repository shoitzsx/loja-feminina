// Remove o fundo branco dos itens 3D (public/images/novas/3d-*.png), deixando-os transparentes.
// 1) preenche a partir das bordas tudo que e quase branco (inclui a sombra suave sob o item);
// 2) remove tambem branco puro isolado (vaos entre correntes). Bordas suavizadas com um blur leve.
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const dir = join("public", "images", "novas");
const EDGE_TOLERANCE = 215; // min(r,g,b) a partir do qual o pixel conectado a borda conta como fundo
const PURE_WHITE = 236; // quase branco removido mesmo sem conexao com a borda (vaos entre correntes)
const SHADOW_FROM = 0.86; // a partir desta altura (fracao), cinza neutro e sombra de chao e sai

for (const file of await readdir(dir)) {
  if (!file.startsWith("3d-") || !file.endsWith(".png")) continue;

  const { data, info } = await sharp(join(dir, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const total = width * height;
  const minOf = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);

  const background = new Uint8Array(total);
  const stack = [];
  const push = (i) => {
    if (!background[i] && minOf(i) >= EDGE_TOLERANCE) {
      background[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % width;
    if (x > 0) push(i - 1);
    if (x < width - 1) push(i + 1);
    if (i >= width) push(i - width);
    if (i < total - width) push(i + width);
  }

  const mask = Buffer.alloc(total);
  for (let i = 0; i < total; i++) {
    const y = Math.floor(i / width);
    const spread = Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) - minOf(i);
    const floorShadow = y >= height * SHADOW_FROM && spread < 14 && minOf(i) >= 150;
    mask[i] = background[i] || floorShadow || minOf(i) >= PURE_WHITE ? 0 : 255;
  }
  const { data: soft, info: softInfo } = await sharp(mask, { raw: { width, height, channels: 1 } })
    .blur(0.8)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < total; i++) data[i * 4 + 3] = soft[i * softInfo.channels];
  const out = await sharp(data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(join(dir, file), out);
  const kept = mask.reduce((n, v) => n + (v ? 1 : 0), 0);
  console.log(`${file}: ${Math.round((kept / total) * 100)}% opaco, ${Math.round(out.length / 1024)} KB`);
}
