/**
 * Serializa dados estruturados (JSON-LD) para dentro de uma tag <script>.
 * Escapa "<" e os separadores de linha unicode, para que um texto como "</script>"
 * nunca feche a tag nem injete HTML. O resultado continua sendo JSON válido.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}
