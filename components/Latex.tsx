"use client";
import {useMemo} from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
const MAU = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
type Doan = {math: boolean; block: boolean; text: string};
function tach(raw: string): Doan[] {
  return raw.split(MAU).filter((p) => p !== "").map((p) => {
    if (p.startsWith("$$") && p.endsWith("$$")) return {math: true, block: true, text: p.slice(2, -2)};
    if (p.startsWith("\\[") && p.endsWith("\\]")) return {math: true, block: true, text: p.slice(2, -2)};
    if (p.startsWith("\\(") && p.endsWith("\\)")) return {math: true, block: false, text: p.slice(2, -2)};
    if (p.startsWith("$") && p.endsWith("$") && p.length > 2) return {math: true, block: false, text: p.slice(1, -1)};
    return {math: false, block: false, text: p};
  });
}
export default function Latex({nguon, className}: {nguon: string; className?: string}) {
  const doan = useMemo(() => tach(nguon ?? ""), [nguon]);
  return (
    <span className={className}>
      {doan.map((d, i) => d.math ? (
        <span key={i} className={d.block ? "my-2 block overflow-x-auto overflow-y-hidden" : "inline-block align-middle"} dangerouslySetInnerHTML={{__html: katex.renderToString(d.text, {throwOnError: false, trust: false, strict: "ignore", displayMode: d.block, output: "html"})}} />
      ) : (
        <span key={i} className="whitespace-pre-wrap">{d.text}</span>
      ))}
    </span>
  );
}