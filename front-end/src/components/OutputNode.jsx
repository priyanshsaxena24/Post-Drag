import React, { useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './OutputNode.css';

const OutputNode = ({ data }) => {
  useEffect(() => {
    console.log('🧾 OutputNode received data:', data);
  }, [data]);

  const display = data?.error
    ? `❌ ${data.error}`
    : data?.output !== undefined
      ? `✅ ${String(data.output)}`
      : '⌛ Waiting...';

  return (
    <div className="output-node">
      <Handle type="target" position={Position.Top} />
      <strong>Output:</strong>
      <div className="output-box">
        <pre style={{ margin: 0 }}>{display}</pre>
      </div>
    </div>
  );
};

export default OutputNode;

