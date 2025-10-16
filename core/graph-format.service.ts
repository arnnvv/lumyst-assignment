import dagre from "dagre";
import type {
  C1Output,
  C2Relationship,
  C2Subcategory,
  CrossC1C2Relationship,
  GraphEdge,
  GraphNode,
} from "./types";

const NODE_WIDTH = 150;
const NODE_HEIGHT = 40;
const CLUSTER_PADDING = 40;

export class GraphFormatService {
  layoutHierarchicalGraph(
    graphNodes: GraphNode[],
    graphEdges: GraphEdge[],
    c1Outputs: C1Output[],
    c2Subcategories: C2Subcategory[],
    c2Relationships: C2Relationship[],
    crossC1C2Relationships: CrossC1C2Relationship[],
  ) {
    const nodeMap = new Map(graphNodes.map((node) => [node.id, node]));
    const c2NameToIdMap = new Map(
      c2Subcategories.map((c2) => [c2.c2Name, c2.id]),
    );

    const c2LayoutData = new Map();
    for (const c2 of c2Subcategories) {
      const innerGraph = new dagre.graphlib.Graph();
      innerGraph.setGraph({ rankdir: "TB", marginx: 20, marginy: 20 });
      innerGraph.setDefaultEdgeLabel(() => ({}));

      const innerNodeIds = new Set(c2.nodeIds);
      for (const nodeId of c2.nodeIds) {
        innerGraph.setNode(nodeId, {
          label: nodeMap.get(nodeId)?.label,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        });
      }

      for (const edge of graphEdges) {
        if (innerNodeIds.has(edge.source) && innerNodeIds.has(edge.target)) {
          innerGraph.setEdge(edge.source, edge.target);
        }
      }

      dagre.layout(innerGraph);

      c2LayoutData.set(c2.id, {
        width: (innerGraph.graph().width ?? 0) + CLUSTER_PADDING,
        height: (innerGraph.graph().height ?? 0) + CLUSTER_PADDING,
        nodes: innerGraph.nodes().map((id) => ({ id, ...innerGraph.node(id) })),
      });
    }

    const macroGraph = new dagre.graphlib.Graph({ compound: true });
    macroGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 70 });
    macroGraph.setDefaultEdgeLabel(() => ({}));

    const allC2NodeIds = new Set(c2Subcategories.flatMap((c2) => c2.nodeIds));
    const standaloneNodes = graphNodes.filter(
      (node) => !allC2NodeIds.has(node.id),
    );

    for (const node of standaloneNodes) {
      macroGraph.setNode(node.id, {
        label: node.label,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }

    for (const c1 of c1Outputs) {
      macroGraph.setNode(c1.id, { label: c1.label });
    }

    for (const c2 of c2Subcategories) {
      const layout = c2LayoutData.get(c2.id);
      macroGraph.setNode(c2.id, {
        label: c2.label,
        width: layout.width,
        height: layout.height,
      });
      macroGraph.setParent(c2.id, c2.c1CategoryId);
    }

    const allClusterEdges = [...c2Relationships, ...crossC1C2Relationships].map(
      (rel) => {
        const sourceId = c2NameToIdMap.get(rel.fromC2);
        const targetId = c2NameToIdMap.get(rel.toC2);
        if (sourceId && targetId) {
          return {
            id: rel.id,
            source: sourceId,
            target: targetId,
            label: rel.label,
          };
        }
        return null;
      },
    );

    for (const edge of allClusterEdges) {
      if (edge) {
        macroGraph.setEdge(edge.source, edge.target, { label: edge.label });
      }
    }

    dagre.layout(macroGraph);

    const positionedC1Nodes = c1Outputs.map((c1) => {
      const node = macroGraph.node(c1.id);
      return {
        ...c1,
        position: { x: node.x - node.width / 2, y: node.y - node.height / 2 },
        width: node.width,
        height: node.height,
      };
    });

    const positionedC2Nodes = c2Subcategories.map((c2) => {
      const node = macroGraph.node(c2.id);
      return {
        ...c2,
        position: { x: node.x - node.width / 2, y: node.y - node.height / 2 },
        width: node.width,
        height: node.height,
      };
    });

    const positionedGraphNodes: (GraphNode & { parentNode?: string })[] = [];
    for (const c2 of positionedC2Nodes) {
      const layout = c2LayoutData.get(c2.id);
      for (const innerNode of layout.nodes) {
        const originalNode = graphNodes.find((n) => n.id === innerNode.id);
        if (originalNode) {
          positionedGraphNodes.push({
            ...originalNode,
            position: {
              x: c2.position.x + innerNode.x - NODE_WIDTH / 2,
              y: c2.position.y + innerNode.y - NODE_HEIGHT / 2,
            },
            parentNode: c2.id,
          });
        }
      }
    }

    for (const node of standaloneNodes) {
      const nodeWithPosition = macroGraph.node(node.id);
      positionedGraphNodes.push({
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWithPosition.width / 2,
          y: nodeWithPosition.y - nodeWithPosition.height / 2,
        },
      });
    }

    const allEdges = [
      ...graphEdges,
      ...(allClusterEdges.filter(Boolean) as GraphEdge[]),
    ];

    return {
      graphNodes: positionedGraphNodes,
      c1Nodes: positionedC1Nodes,
      c2Nodes: positionedC2Nodes,
      edges: allEdges,
    };
  }
}
