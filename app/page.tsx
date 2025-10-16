"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { BidirectionalEdge } from "@/components/bidirectional";
import { convertDataToGraphNodesAndEdges } from "../core/data/data-converter";
import { GraphFormatService } from "../core/graph-format.service";
import { ReactFlowService } from "../core/react-flow.service";

const edgeTypes = { bilateral: BidirectionalEdge };

const graphFormatService = new GraphFormatService();
const reactFlowService = new ReactFlowService();

const { graphNodes, graphEdges, c1Output, c2Subcategories, c2Relationships } =
  convertDataToGraphNodesAndEdges();

const layoutedData = graphFormatService.layoutCategoriesWithNodes(
  graphNodes,
  graphEdges,
  c1Output,
  c2Subcategories,
  c2Relationships,
);
const { nodes: initialNodes, edges: initialEdges } =
  reactFlowService.convertDataToReactFlowDataTypes(
    layoutedData.graphNodes,
    layoutedData.c1Nodes,
    layoutedData.c2Nodes,
    layoutedData.edges,
  );

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((s) => applyNodeChanges(changes, s)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((s) => applyEdgeChanges(changes, s)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((s) => addEdge(params, s)),
    [],
  );
  return (
    <div style={{ width: "100vw", height: "100vh", background: "white" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        style={{
          background: "white",
        }}
      />
    </div>
  );
}
