import React, { useState, useEffect } from 'react';
import { getCurrentEntryId, getCurrentApiEndpoint } from '../utils/adminUrlParser';
import axios from 'axios';

export default function TranslateButton() {


  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [allLocales, setAllLocales] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [translationStatus, setTranslationStatus] = useState<{ [locale: string]: 'idle' | 'loading' | 'success' | 'error' }>({});

  // 组件加载时获取所有locales
  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const baseUrl = window.location.origin;
        const response = await axios.get(`${baseUrl}/api/translate/locales`);
        setAllLocales(response.data);
        setSelectedLocales([]); // 默认不选中
      } catch (error: any) {
        setAllLocales([]);
      }
    };
    fetchLocales();
  }, []);

  // 全选/取消全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLocales(allLocales.filter(l => l !== 'en'));
    } else {
      setSelectedLocales([]);
    }
  };

  // 单个locale选择
  const handleSelectLocale = (locale: string) => {
    if (locale === 'en') return;
    setSelectedLocales(prev => {
      const filtered = prev.filter(l => l !== 'en');
      return filtered.includes(locale)
        ? filtered.filter(l => l !== locale)
        : [...filtered, locale];
    });
  };

  const handleClick = async () => {
    const isEnglishInterface = window.location.search.includes('=en');
    if (!isEnglishInterface) {
      alert('this function only works on EN page');
      return;
    }

    // 检查是否有未保存的更改（页面上有可用的保存按钮，仅根据文字判断）
    const saveButtonTexts = ['Save', '保存', '儲存'];
    const saveButtons = Array.from(document.querySelectorAll('button')).filter(button => {
      const text = button.innerText.trim();
      const hasSaveText = saveButtonTexts.includes(text);
      const isEnabled = !button.disabled && button.getAttribute('aria-disabled') !== 'true';
      return hasSaveText && isEnabled;
    });
    if (saveButtons.length > 0) {
      alert('请先保存内容，再进行翻译！');
      return;
    }

    const filteredLocales = selectedLocales.filter(l => l !== 'en');
    if (filteredLocales.length === 0) {
      alert('请至少选择一种语言');
      return;
    }

    // 获取entryId和apiEndpoint
    const entryId = getCurrentEntryId();
    if (!entryId) {
      alert('未找到当前编辑的entryId');
      return;
    }
    const apiEndpoint = getCurrentApiEndpoint();
    if (!apiEndpoint) {
      alert('未找到当前编辑的apiEndpoint');
      return;
    }

    // 初始化所有选中语言为loading
    const newStatus: { [locale: string]: 'idle' | 'loading' | 'success' | 'error' } = {};
    filteredLocales.forEach(locale => {
      newStatus[locale] = 'loading';
    });
    setTranslationStatus(prev => ({ ...prev, ...newStatus }));
    setIsLoading(true);
    setStatus('正在翻译内容...');




    
    // 并发翻译请求
    await Promise.all(filteredLocales.map(async (locale) => {
      try {
        const baseUrl = window.location.origin;
        const response = await axios.post(`${baseUrl}/api/translate/content`, {
          entryId,
          apiEndpoint,
          locale
        });
        if (response.data.success) {
          setTranslationStatus(prev => ({ ...prev, [locale]: 'success' }));
        } else {
          setTranslationStatus(prev => ({ ...prev, [locale]: 'error' }));
        }
      } catch (error) {
        setTranslationStatus(prev => ({ ...prev, [locale]: 'error' }));
      }
    }));
    setIsLoading(false);
    setStatus('翻译流程已结束');
    window.location.reload();
  };

  return (
    <div  style={{
      width: '100%',
      // height: '3rem', // 移除固定高度，适应内容
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
      {/* locales复选框区域 */}
      <div style={{ marginTop: '16px', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={allLocales.length > 0 && selectedLocales.length === allLocales.length}
            onChange={handleSelectAll}
            disabled={allLocales.length === 0}
          />
          <span style={{ marginLeft: 8 }}>All</span>
        </label>
        {allLocales.filter(locale => locale !== 'en').map(locale => (
          <label key={locale} style={{ display: 'block', marginBottom: '4px', marginLeft: 16 }}>
            <input
              type="checkbox"
              checked={selectedLocales.includes(locale)}
              onChange={() => handleSelectLocale(locale)}
            />
            <span style={{ marginLeft: 8 }}>{locale}</span>
            {/* 状态展示 */}
            {translationStatus[locale] === 'loading' && (
              <span style={{ marginLeft: 8, color: '#888' }}>
                <span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #ccc', borderTop: '2px solid #4945ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </span>
            )}
            {translationStatus[locale] === 'success' && (
              <span style={{ marginLeft: 8, color: 'green' }}>完成</span>
            )}
            {translationStatus[locale] === 'error' && (
              <span style={{ marginLeft: 8, color: 'red' }}>失败</span>
            )}
          </label>
        ))}
      </div>
      {/* 状态提示 */}
      {status && (
        <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>
          {status}
        </div>
      )}
    </div>
  );
}