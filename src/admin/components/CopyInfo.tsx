import React, { useState } from 'react';


export default function CopyInfo() {

  const handleClick = async () => {
      alert('copy info');
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
    
      }}
      onClick={handleClick}
    >
      Copy Info
    </button>
  );
}
