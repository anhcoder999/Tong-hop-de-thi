"use client";
import {useMemo} from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
const MAU = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
type Doan = {math: boolean; block: boolean; text: string; goc: string; html: string | null};
function tach(raw: string): Omit<Doan, "html">[] {
  return raw.split(MAU).filter((p) => p !== "").map((p) => {
    if (p.startsWith("$$") && p.endsWith("$$") && p.length > 4) return {math: true, block: true, text: p.slice(2, -2), goc: p};
    if (p.startsWith("\\[") && p.endsWith("\\]")) return {math: true, block: true, text: p.slice(2, -2), goc: p};
    if (p.startsWith("\\(") && p.endsWith("\\)")) return {math: true, block: false, text: p.slice(2, -2), goc: p};
    if (p.startsWith("$") && p.endsWith("$") && p.length > 2) return {math: true, block: false, text: p.slice(1, -1), goc: p};
    return {math: false, block: false, text: p, goc: p};
  });
}
function ve(text: string, block: boolean): string | null {
  try {
    return katex.renderToString(text, {throwOnError: true, trust: false, strict: "ignore", displayMode: block, output: "html"});
  } catch {
    return null;
  }
}
export default function Latex({nguon, className}: {nguon: string; className?: string}) {
  const doan = useMemo<Doan[]>(() => tach(nguon ?? "").map((d) => ({...d, html: d.math ? ve(d.text, d.block) : null})), [nguon]);
  return (
    <span className={className}>
      {doan.map((d, i) => {
        if (!d.math || d.html === null) return <span key={i} className="whitespace-pre-wrap">{d.math ? d.goc : d.text}</span>;
        return <span key={i} className={d.block ? "my-2 block overflow-x-auto overflow-y-hidden" : "inline-block align-middle"} dangerouslySetInnerHTML={{__html: d.html}} />;
      })}
    </span>
  );
}