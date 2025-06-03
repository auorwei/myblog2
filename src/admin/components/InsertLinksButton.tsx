import React, { useState } from 'react';

export default function InsertLinksButton() {
  const [editorData, setEditorData] = useState('<p>Hello Bitcoin</p>');

  const handleClick = () => {
    // 检查当前是否为英文界面
    const isEnglishInterface = window.location.search.includes('=en');
    if (!isEnglishInterface) {
      alert('请回英文界面使用这个功能');
      return;
    }
    // 直接用 state 替换内容
    const newHtml = editorData.replace(/Bitcoin/g, '比特币');
    setEditorData(newHtml);
    console.log('替换后的内容:', newHtml);
    alert('内容已替换并同步到编辑器');
  };

  return (
      
      <button
        style={{
          width: '100%',
          height: '3rem',
          background: '#4945ff',
          color: '#fff',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
        onClick={handleClick}
      >
        Insert Links
      </button>
    
  );
}
