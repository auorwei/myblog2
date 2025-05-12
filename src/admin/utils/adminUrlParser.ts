import { toPlural } from './stringUtils';

/**
 * 条目信息接口
 */
export interface EntryInfo {
  contentTypeString: string;
  apiEndpoint: string;
  id: string;
  locale: string;
}

/**
 * 从管理面板URL中解析当前编辑的条目信息
 * @returns 条目信息对象，或 null（如果解析失败）
 */
export const getCurrentEditInfo = (): EntryInfo | null => {
  try {
    const url = window.location.pathname;
    console.log('当前URL:', url);
    
    // 获取路径部分（去掉查询参数）
    const pathOnly = url.split('?')[0];
    
    // 提取 entry ID - 使用/分隔符，获取最后一个部分
    const pathParts = pathOnly.split('/').filter(part => part.length > 0);
    // 从路径的最后提取 ID
    const entryId = pathParts[pathParts.length - 1];
    
    console.log('提取的 Entry ID:', entryId);
    
    // 获取内容类型部分
    let contentTypeString = '';
    
    // 在路径中查找包含api::的部分
    for (const part of pathParts) {
      if (part.includes('::')) {
        contentTypeString = part;
        break;
      }
    }
    
    console.log('找到的内容类型字符串:', contentTypeString);
    
    // 如果找不到内容类型，尝试通过正则匹配
    if (!contentTypeString) {
      const contentTypeMatch = url.match(/content-manager\/(collectionType|singleType)\/(.+?)\/(.+?)(?:\/(.+))?$/);
      console.log('内容类型匹配结果:', contentTypeMatch);
      
      if (!contentTypeMatch) return null;
      
      contentTypeString = contentTypeMatch[2];
    }
    
    // 内容类型的处理 - 使用::分隔符获取最后一个部分
    const contentTypeParts = contentTypeString.split('::');
    const apiModelString = contentTypeParts[contentTypeParts.length - 1]; // 获取最后一个部分，例如"article.article"
    console.log('API模型字符串:', apiModelString);
    
    // 使用.分隔符获取第一个部分
    const modelParts = apiModelString.split('.');
    const modelName = modelParts[0]; // 获取第一个部分，例如"article"
    console.log('模型名称:', modelName);
    
    // 将单数形式转换为复数形式作为API端点
    const apiEndpoint = toPlural(modelName);
    
    console.log(`最终API端点: ${apiEndpoint}, ID: ${entryId}`);
    
    return { 
      contentTypeString,
      apiEndpoint, 
      id: entryId,
      locale: (() => {
        // 从URL查询参数中获取locale
        const searchParams = new URLSearchParams(window.location.search);
        const localeParam = searchParams.get('plugins[i18n][locale]');
        return localeParam || 'en'; // 如果没有找到，默认返回'en'
      })()
    };
  } catch (e) {
    console.error('解析URL时出错:', e);
    return null;
  }
}; 

// 获取当前的entryid
export const getCurrentEntryId = (): string | null => {
  const currentEditInfo = getCurrentEditInfo();
  return currentEditInfo?.id || null;
};

// 获取当前的apiEndpoint
export const getCurrentApiEndpoint = (): string | null => {
  const currentEditInfo = getCurrentEditInfo();
  return currentEditInfo?.apiEndpoint || null;
};






