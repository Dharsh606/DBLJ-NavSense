import { MapGraph } from "../../models/MapGraph";
import graph from "../../assets/maps/building1.json";

type RouteStep = { instruction: string; distance: number };

let cachedRoute: RouteStep[] = [];

export async function planIndoorRoute(buildingId: string, from: string, to: string) {
  const g = graph as unknown as MapGraph;
  const route = bfs(g, from, to);
  cachedRoute = route.map((node, i) => ({ instruction: i === 0 ? "Start" : node.instruction, distance: node.distance }));
  return cachedRoute;
}

export function nextInstructionForIndoor(route?: RouteStep[], index: number = 0) {
  const r = route || cachedRoute;
  if (!r.length || index >= r.length) return "Destination reached.";
  const step = r[index];
  return `${step.instruction} in ${step.distance} meters.`;
}

function bfs(graph: MapGraph, start: string, goal: string) {
  const queue: { node: string; path: string[] }[] = [{ node: start, path: [start] }];
  const visited = new Set<string>();
  while (queue.length) {
    const { node, path } = queue.shift()!;
    if (node === goal) return path.map(n => ({ instruction: graph.nodes[n].hint, distance: 3 }));
    if (visited.has(node)) continue;
    visited.add(node);
    const edges = graph.edges[node] || [];
    for (const e of edges) queue.push({ node: e.to, path: [...path, e.to] });
  }
  return [];
}
