import React from 'react';

export default function InsertLinksButton() {
  const handleClick = () => {


    // 检查当前是否为英文界面
    const isEnglishInterface = window.location.search.includes('=en');
    if (!isEnglishInterface) {
      alert('请回英文界面使用这个功能');
      return;
    }

    console.log('Insert Links 按钮被点击');
    // TODO: 你的插入链接逻辑
    alert('Insert Links 按钮被点击');
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
      }}
      onClick={handleClick}
    >
      Insert Links
    </button>
  );
}
