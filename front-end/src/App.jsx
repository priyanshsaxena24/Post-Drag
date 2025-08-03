import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  addEdge,
  applyNodeChanges,
} from '@xyflow/react';

import CodeNode from './components/CodeNode';
import VariableNode from './components/VariableNode';
import OutputNode from './components/OutputNode';
import '@xyflow/react/dist/style.css';
import './App.css';

const nodeTypes = {
  code: CodeNode,
  variable: VariableNode,
  output: OutputNode,
};

export default function App() {
  const [codeMap, setCodeMap] = useState({
    '1': '2+2',
  });

  const [nodes, setNodes] = useState([
    { id: '1', type: 'code', position: { x: 100, y: 100 }, data: {} },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1' },
  ]);

  const [nodeIdCounter, setNodeIdCounter] = useState(3);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        position: node.position ?? { x: 0, y: 0 },
        data: {
          ...node.data,
          label: codeMap[node.id] || '',
          onChange: (val) =>
            setCodeMap((prev) => ({ ...prev, [node.id]: val })),
        },
      }))
    );
  }, [codeMap]);

  const addCodeNode = () => {
    const newId = String(nodeIdCounter);
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: 'code',
        position: { x: 200 + nodeIdCounter * 20, y: 100 + nodeIdCounter * 20 },
        data: {},
      },
    ]);
    setCodeMap((prev) => ({ ...prev, [newId]: '' }));
    setNodeIdCounter((n) => n + 1);
  };

  const addVariableNode = () => {
    const newId = String(nodeIdCounter);
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: 'variable',
        position: { x: 100, y: 300 + nodeIdCounter * 30 },
        data: {},
      },
    ]);
    setCodeMap((prev) => ({ ...prev, [newId]: '' }));
    setNodeIdCounter((n) => n + 1);
  };

  const addOutputNode = () => {
    const newId = String(nodeIdCounter);
    const newNode = {
      id: newId,
      type: 'output',
      position: { x: 200, y: 100 + nodeIdCounter * 60 },
      data: { output: '', error: null },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
  };

  const onConnect = useCallback(
    (params) => {
      if (params.source === params.target) {
        alert('Self-loop not allowed!');
        return;
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onEdgeDoubleClick = useCallback(
    (_, edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const onEdgeClick = useCallback((e, edge) => {
    e.stopPropagation();
    setSelectedEdgeId(edge.id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId) {
        setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId]);

  const runGraph = async () => {
    const adj = {}, indegree = {};
    nodes.forEach((node) => {
      adj[node.id] = [];
      indegree[node.id] = 0;
    });
    edges.forEach(({ source, target }) => {
      adj[source].push(target);
      indegree[target]++;
    });

    const queue = Object.keys(indegree).filter((n) => indegree[n] === 0);
    const ordered = [];
    while (queue.length) {
      const current = queue.shift();
      ordered.push(current);
      adj[current].forEach((nbr) => {
        indegree[nbr]--;
        if (indegree[nbr] === 0) queue.push(nbr);
      });
    }

    if (ordered.length !== nodes.length) {
      console.warn('Cycle detected or disconnected graph');
      return;
    }

    const results = {};
    const newNodes = [...nodes];

    for (const nodeId of ordered) {
      const node = nodes.find((n) => n.id === nodeId);
      const code = codeMap[nodeId] || '';
      const incoming = edges.filter((e) => e.target === nodeId);
      let input = null;

      if (incoming.length === 1) {
        const sourceId = incoming[0].source;
        input = results[sourceId];
      }

      if (node.type === 'output') continue;

      try {
        let finalCode = code;

        if (language === 'javascript' && input !== null) {
          finalCode = `const input = ${JSON.stringify(input)};\n${code}`;
        }

        const payload = language === 'python'
          ? { code, input }
          : { code: finalCode };

        const res = await fetch(`https://post-drag-jv2n.vercel.app/api/execute/${language}/`, {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const resultData = await res.json();

        if (res.ok) {
          results[nodeId] = resultData.output;
          const idx = newNodes.findIndex(n => n.id === nodeId);
          if (idx !== -1) {
            newNodes[idx].data = {
              ...newNodes[idx].data,
              output: resultData.output,
              error: null,
            };
          }
          console.log(`✅ Node ${nodeId} output:`, resultData.output);
        } else {
          throw new Error(resultData.error);
        }
      } catch (err) {
        results[nodeId] = undefined;
        console.warn(`❌ Node ${nodeId} error:`, err);
      }
    }

    for (const node of newNodes) {
      if (node.type === 'output') {
        const incoming = edges.find(e => e.target === node.id);
        if (incoming) {
          const sourceId = incoming.source;
          node.data = {
            ...node.data,
            output: results[sourceId] ?? '',
            error: null,
          };
          console.log(`🔗 OutputNode ${node.id} received data:`, results[sourceId]);
        }
      }
    }

    setNodes(newNodes.map(n => ({
      ...n,
      data: { ...n.data },
    })));
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  return (
    <div className="app-container">
      <div className="toolbar">
        <button onClick={runGraph}>Run Graph</button>
        <button onClick={addCodeNode}>+ Add Code</button>
        <button onClick={addVariableNode}>+ Add Variable</button>
        <button onClick={addOutputNode}>+ Add Output</button>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

