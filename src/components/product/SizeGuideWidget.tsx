"use client";

import { Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

export function SizeGuideWidget({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(inline);
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(60);
  const [bust, setBust] = useState(90);
  const [waist, setWaist] = useState(72);
  const [hip, setHip] = useState(98);

  const recommendation = useMemo(() => recommendSize({ height, weight, bust, waist, hip }), [bust, height, hip, waist, weight]);

  const content = (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberInput label="Altura (cm)" value={height} setValue={setHeight} min={130} max={210} />
        <NumberInput label="Peso (kg)" value={weight} setValue={setWeight} min={35} max={140} />
        <NumberInput label="Busto (cm)" value={bust} setValue={setBust} min={70} max={140} />
        <NumberInput label="Cintura (cm)" value={waist} setValue={setWaist} min={55} max={130} />
        <NumberInput label="Quadril (cm)" value={hip} setValue={setHip} min={75} max={150} />
      </div>
      <div className="rounded-lg bg-rosebrand-100 p-4 shadow-card">
        <p className="text-sm font-bold text-neutral-700">Tamanho recomendado</p>
        <p className="mt-1 text-3xl font-black text-rosebrand-700">{recommendation}</p>
        <p className="mt-2 text-xs leading-5 text-neutral-600">
          Esta é uma recomendação baseada nas medidas informadas. Consulte também a tabela específica da peça.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-ink text-white">
              {["Tamanho", "Busto", "Cintura", "Quadril"].map((head) => (
                <th key={head} className="px-3 py-2 text-left">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["P", "84-90", "64-72", "90-98"],
              ["M", "91-98", "73-80", "99-106"],
              ["G", "99-106", "81-88", "107-114"],
              ["GG", "107-116", "89-100", "115-124"]
            ].map((row) => (
              <tr key={row[0]} className="border-b border-rosebrand-100">
                {row.map((cell) => (
                  <td key={cell} className="px-3 py-2">{cell} cm</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <Ruler className="size-4" />
        Qual é o meu tamanho?
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-rosebrand-50/95 p-5 shadow-soft backdrop-blur sm:rounded-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-ink">Guia de tamanhos</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-rosebrand-100">Fechar</button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function NumberInput({ label, value, setValue, min, max }: { label: string; value: number; setValue: (value: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input type="number" min={min} max={max} value={value} onChange={(event) => setValue(Number(event.target.value))} className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3" />
    </label>
  );
}

function recommendSize(values: { height: number; weight: number; bust: number; waist: number; hip: number }) {
  const score = Math.max(values.bust, values.waist + 18, values.hip - 6, values.weight + 32, values.height - 74);
  if (score <= 92) return "P";
  if (score <= 100) return "M";
  if (score <= 110) return "G";
  return "GG";
}
