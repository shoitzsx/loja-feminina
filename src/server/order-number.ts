import { randomInt } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Número de pedido imprevisível e sem colisão prática: "BC" + 10 caracteres aleatórios. */
export function generateOrderNumber(): string {
  let suffix = "";
  for (let i = 0; i < 10; i += 1) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `BC${suffix}`;
}
