import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function VariableNode({ data }) {
  return (
    <div style={{ padding: 10, borderRadius: 6, background: '#2d2d2d', color: '#fff' }}>
      <div>Variable:</div>
      <input
        type="text"
        value={data.label || ''}
        onChange={(e) => data.onChange?.(e.target.value)}
        style={{
          background: '#1e1e1e',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '4px',
          padding: '4px',
          width: '100px',
        }}
      />
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}

