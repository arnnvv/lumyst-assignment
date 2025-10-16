import type { C1Output, C2Subcategory, GraphEdge, GraphNode } from "./types";

export class ReactFlowService {
  convertDataToReactFlowDataTypes(
    graphNodes: GraphNode[],
    c1Nodes: C1Output[],
    c2Nodes: C2Subcategory[],
    edges: GraphEdge[],
  ) {
    const reactFlowNodes = [
      // Regular graph nodes
      ...graphNodes.map((node) => ({
        id: node.id,
        position: node.position || { x: 0, y: 0 },
        data: { label: node.label },
        type: "default",
        style: {
          background: "#dbeafe",
          border: "2px solid #3b82f6",
          color: "#1e40af",
          borderRadius: "6px",
        },
      })),
      // C1 category nodes
      ...c1Nodes.map((node) => ({
        id: node.id,
        position: node.position || { x: 0, y: 0 },
        data: { label: node.label },
        type: "default",
        style: {
          background: "#fef2f2",
          border: "3px solid #dc2626",
          color: "#991b1b",
          fontWeight: "bold",
          borderRadius: "6px",
        },
      })),
      // C2 subcategory nodes
      ...c2Nodes.map((node) => ({
        id: node.id,
        position: node.position || { x: 0, y: 0 },
        data: { label: node.label },
        type: "default",
        style: {
          background: "#f0fdf4",
          border: "2px solid #16a34a",
          color: "#166534",
          borderRadius: "6px",
        },
      })),
    ];
    const pairKey = (a: string, b: string) =>
      a < b ? `${a}__${b}` : `${b}__${a}`;

    const pairs = new Map<string, { a2b?: GraphEdge; b2a?: GraphEdge }>();
    edges.forEach((e) => {
      const key = pairKey(e.source, e.target);
      const info = pairs.get(key) || {};
      if (e.source < e.target) info.a2b = e;
      else info.b2a = e;
      pairs.set(key, info);
    });

    const reactFlowEdges = edges.map((edge) => {
      const key = pairKey(edge.source, edge.target);
      const info = pairs.get(key);
      const isBilateral = info?.a2b && info?.b2a;

      const style =
        edge.label === "contains"
          ? { stroke: "#9ca3af", strokeDasharray: "5,5", strokeWidth: 1 }
          : edge.id.startsWith("c2_relationship")
            ? { stroke: "#059669", strokeWidth: 2 }
            : edge.id.startsWith("cross_c1_c2_rel")
              ? { stroke: "#d97706", strokeWidth: 2 }
              : { stroke: "#374151", strokeWidth: 1 };

      const labelSide = isBilateral
        ? edge.source < edge.target
          ? "above"
          : "below"
        : "above";

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: isBilateral ? "bilateral" : "default",
        data: isBilateral ? { labelSide } : undefined,
        style,
        labelStyle: { fill: "#000", fontWeight: "500" },
      };
    });

    return {
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
    };
  }
}
