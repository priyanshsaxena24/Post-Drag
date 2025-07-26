import React, { useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import './CodeNode.css';

export default function CodeNode({ data }) {
  const [langExt, setLangExt] = useState(javascript);

  useEffect(() => {
    if (data.language === 'python') {
      setLangExt(python);
    } else {
      setLangExt(javascript);
    }
  }, [data.language]);

  return (
    <div className="code-node">
      <Handle type="target" position={Position.Top} />

      <CodeMirror
        value={data.label || ''}
        height="100px"
        extensions={[langExt]}
        theme="dark"
        onChange={(value) => data.onChange?.(value)}
        basicSetup={{ lineNumbers: true }}
      />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 
