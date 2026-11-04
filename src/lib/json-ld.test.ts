import { describe, expect, it } from "vitest";
import { safeJsonLd } from "./json-ld";

describe("safeJsonLd", () => {
  it("não deixa um </script> do texto fechar a tag", () => {
    const out = safeJsonLd({ name: 'x</script><img src=x onerror="alert(1)">' });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
  });

  it("continua sendo JSON válido e com o mesmo conteúdo", () => {
    const data = { name: "a < b & c > d", n: 1 };
    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });

  it("escapa separadores de linha unicode", () => {
    const input = { t: "a" + String.fromCharCode(0x2028) + "b" + String.fromCharCode(0x2029) + "c" };
    const out = safeJsonLd(input);
    expect(out.includes(String.fromCharCode(0x2028))).toBe(false);
    expect(out.includes(String.fromCharCode(0x2029))).toBe(false);
    expect(JSON.parse(out)).toEqual(input);
  });
});
