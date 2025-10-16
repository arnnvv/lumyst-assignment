import type { C1Output, C2Subcategory, GraphEdge, GraphNode } from "./types";

export class ReactFlowService {
  convertDataToReactFlowDataTypes(
    graphNodes: (GraphNode & { parentNode?: string })[],
    c1Nodes: (C1Output & { width?: number; height?: number })[],
    c2Nodes: (C2Subcategory & { width?: number; height?: number })[],
    edges: GraphEdge[],
  ) {
    const reactFlowNodes = [
      // C1 category nodes (top-level groups)
      ...c1Nodes.map((node) => ({
        id: node.id,
        position: node.position || { x: 0, y: 0 },
        data: { label: node.label },
        type: "group",
        style: {
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          border: "2px solid #ef4444",
          borderRadius: "12px",
          width: node.width,
          height: node.height,
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: 10,
          fontWeight: "bold",
        },
      })),
      // C2 subcategory nodes (nested groups)
      ...c2Nodes.map((node) => ({
        id: node.id,
        position: node.position || { x: 0, y: 0 },
        data: { label: node.label },
        type: "group",
        parentNode: node.c1CategoryId,
        extent: "parent" as const,
        style: {
          backgroundColor: "rgba(34, 197, 94, 0.05)",
          border: "2px solid #22c55e",
          borderRadius: "10px",
          width: node.width,
          height: node.height,
        },
      })),
      // Regular graph nodes (children)
      ...graphNodes.map((node) => ({
        id: node.id,
        position: node.position || { x: 0, y: 0 },
        data: { label: node.label },
        type: "default",
        parentNode: node.parentNode,
        extent: "parent" as const,
        style: {
          background: "#e0f2fe",
          border: "1px solid #0ea5e9",
          color: "#0369a1",
          borderRadius: "6px",
          width: 150,
          height: 40,
        },
      })),
    ];

    const reactFlowEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      style: edge.id.startsWith("c2_relationship")
        ? { stroke: "#059669", strokeWidth: 2 }
        : edge.id.startsWith("cross_c1_c2_rel")
          ? { stroke: "#d97706", strokeWidth: 2 }
          : { stroke: "#4b5563", strokeWidth: 1.5 },
      labelStyle: { fill: "#1f2937", fontWeight: "500" },
      animated: edge.label === "calls",
    }));

    return {
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
    };
  }
}
