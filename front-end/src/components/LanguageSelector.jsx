import React from 'react';

const LanguageSelector = ({ language, setLanguage }) => {
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      style={{
        position: 'absolute',
        top: 10,
        left: 230,
        zIndex: 10,
        padding: '6px 10px',
        background: '#1c1c1c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
      }}
    >
      <option value="python">Python</option>
      <option value="javascript">JavaScript</option>
    </select>
  );
};

export default LanguageSelector; 
