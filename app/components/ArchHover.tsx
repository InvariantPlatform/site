"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lights a diagram's connections: hover (or tap) a component and its lines
 * glow and flow while everything else dims. Nodes are `[data-node]`, lines are
 * `[data-from][data-to]`. Tapping pins the selection; tapping empty space clears it.
 */
export default function ArchHover({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<SVGGElement>("[data-node]")];
    const edges = [...root.querySelectorAll<SVGGElement>("[data-from]")];
    let pinned: string | null = null;

    const light = (id: string | null) => {
      root.classList.toggle("focus", id !== null);
      const near = new Set(id ? [id] : []);
      for (const e of edges) {
        const on = id !== null && (e.dataset.from === id || e.dataset.to === id);
        e.classList.toggle("lit", on);
        if (on) near.add(e.dataset.from!).add(e.dataset.to!);
      }
      for (const n of nodes) n.classList.toggle("lit", near.has(n.dataset.node!));
    };

    const off: (() => void)[] = [];
    const on = (el: Element, type: string, fn: (ev: PointerEvent) => void) => {
      el.addEventListener(type, fn as EventListener);
      off.push(() => el.removeEventListener(type, fn as EventListener));
    };
    for (const n of nodes) {
      const id = n.dataset.node!;
      on(n, "pointerenter", (ev) => { if (ev.pointerType === "mouse") light(id); });
      on(n, "pointerleave", (ev) => { if (ev.pointerType === "mouse") light(pinned); });
      on(n, "click", (ev) => { ev.stopPropagation(); pinned = pinned === id ? null : id; light(pinned); });
    }
    for (const e of edges) {
      on(e, "pointerenter", () => e.classList.add("hot"));
      on(e, "pointerleave", () => e.classList.remove("hot"));
    }
    on(root, "click", () => { pinned = null; light(null); });
    return () => off.forEach((f) => f());
  }, []);
  return <div ref={ref} className="arch-live">{children}</div>;
}
