import React, { useState } from 'react';
import { getCurrentEntryId, getCurrentApiEndpoint } from '../utils/adminUrlParser';
import axios from 'axios';

export default function TranslateButton() {


  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleClick = async () => {

    const isEnglishInterface = window.location.search.includes('=en');
    if (!isEnglishInterface) {
      alert('this function only works on EN page');
      return;
    }


    //触发保存功能
    const saveButtons = Array.from(document.querySelectorAll('button'))
      .filter(button => button.textContent?.includes('Save'));
    if (saveButtons.length > 0) {
      saveButtons[0].click();
    }


    console.log('===== 开始翻译流程 =====');
    setIsLoading(true);
    setStatus('初始化翻译流程...');
    
    const entryId = getCurrentEntryId();
    if (!entryId) {
      console.error('未找到当前编辑的entryId');
      setStatus('错误：未找到当前编辑的entryId');
      setIsLoading(false);
      return;
    }
    
    const apiEndpoint = getCurrentApiEndpoint();
    if (!apiEndpoint) {
      console.error('未找到当前编辑的apiEndpoint');
      setStatus('错误：未找到当前编辑的apiEndpoint');
      setIsLoading(false);
      return;
    }

    try {
      // 使用后端API进行翻译
      setStatus('正在翻译内容...');
      
      // 调用后端API
      const baseUrl = window.location.origin; // 同源调用，避免跨域
      const response = await axios.post(`${baseUrl}/api/translate/content`, {
        entryId,
        apiEndpoint
      });
      
      if (response.data.success) {
        setStatus('翻译完成！');
        console.log('翻译结果:', response.data.results);
        //刷新页面
        window.location.reload();
      } else {
        setStatus(`翻译失败: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('翻译过程发生错误:', error);
      setStatus(`错误: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }     
  }

  return (
    <div  style={{
      width: '100%',
      height: '3rem',
    }}>
      <button
        style={{
          width: '100%',
          height: '3rem',
          background: isLoading ? '#8F8DFF' : '#4945ff',
          color: '#fff',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? '处理中...' : 'Translate'}
      </button>
      {status && (
        <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>
          {status}
        </div>
      )}
    </div>
  );
}