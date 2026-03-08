export type MapNode = { id: string; hint: string };
export type MapEdge = { from: string; to: string };
export type MapGraph = { nodes: Record<string, MapNode>; edges: Record<string, MapEdge[]> };
