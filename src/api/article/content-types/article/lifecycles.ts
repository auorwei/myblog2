/**
 * 文章生命周期钩子 - 仅英文版本
 */

// 提取清理 HTML 内容的函数
function cleanHtmlContent(html: string): string {
  // 1) 去掉所有 class、id、data-* 属性
  html = html.replace(/\s+(?:class|id|data-[\w-]+)="[^"]*"/g, '');
  // 2) 修正多余的 </p></p>
  html = html.replace(/<\/p><\/p>/g, '</p>');
  return html;
}

// 新增：清理外部链接的函数
function clearnExternalLinks(html: string): string {
  // 匹配所有 a 标签
  return html.replace(/<a [^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
    // 如果是 http/https 开头且不包含 bingx
    if (/^https?:\/\//.test(href) && !/bingx/i.test(href)) {
      // 移除整个 a 标签，只保留文本内容，并去掉下划线
      return text.replace(/_/g, '');
    }
    // 否则保留原标签
    return match;
  });
}

// 新增：为目标关键词自动添加内链
function createInternalLinks(html: string): string {
  if (!html) return html;

  // 关键词映射表
  const keywordMap: Record<string, string> = {
    'bitcoin': 'https://bingx.com/en/price/bitcoin',
    'ethereum': 'https://bingx.com/en/price/ethereum',
    'bingx': 'https://bingx.com',
  };

  // 已处理的关键词记录
  const processedKeywords: Set<string> = new Set();
  
  try {
    // 使用 DOMParser 在浏览器中解析HTML会更安全，
    // 但在 Node.js 环境下，我们使用更安全的方法解析

    // 预处理HTML，避免关键字嵌套在已有标签内
    // 先将所有 HTML 标签替换为安全标记
    const tagPlaceholders: {[key: string]: string} = {};
    let tagCounter = 0;
    
    // 安全地标记所有HTML标签
    const safeHtml = html.replace(/<[^>]+>/g, (tag) => {
      const placeholder = `__TAG_PLACEHOLDER_${tagCounter++}__`;
      tagPlaceholders[placeholder] = tag;
      return placeholder;
    });
    
    // 在安全文本中查找和替换关键词
    let processedHtml = safeHtml;
    Object.keys(keywordMap).forEach(keyword => {
      // 如果关键词已处理过，跳过
      if (processedKeywords.has(keyword.toLowerCase())) return;
      
      // 匹配关键词的正则表达式（区分单词边界）
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
      
      // 检查并替换关键词
      if (keywordRegex.test(processedHtml)) {
        // 只替换第一次出现
        processedHtml = processedHtml.replace(keywordRegex, (match) => {
          processedKeywords.add(keyword.toLowerCase());
          // 创建带占位符的链接
          return `__LINK_START_${keyword}__${match}__LINK_END__`;
        });
      }
    });
    
    // 恢复所有HTML标签
    let finalHtml = processedHtml;
    Object.keys(tagPlaceholders).forEach(placeholder => {
      finalHtml = finalHtml.replace(new RegExp(placeholder, 'g'), tagPlaceholders[placeholder]);
    });
    
    // 最后处理链接占位符
    Object.keys(keywordMap).forEach(keyword => {
      const startPlaceholder = `__LINK_START_${keyword}__`;
      const endPlaceholder = `__LINK_END__`;
      
      // 安全替换链接占位符
      if (finalHtml.includes(startPlaceholder)) {
        finalHtml = finalHtml.replace(
          startPlaceholder, 
          `<a href="${keywordMap[keyword]}" target="_blank">`
        );
        finalHtml = finalHtml.replace(endPlaceholder, '</a>');
      }
    });
    
    return finalHtml;
  } catch (error) {
    console.error('处理内部链接时出错:', error);
    // 发生错误时返回原始内容，确保不破坏文章
    return html;
  }
}

module.exports = {
  /**
   * 创建文章前触发
   */
  async beforeCreate(event) {
    // 检查是否有内容需要清理
    if (event.params.data.content) {
      let content = event.params.data.content;
      content = cleanHtmlContent(content);
      content = clearnExternalLinks(content);
      content = createInternalLinks(content);
      event.params.data.content = content;
    }
    
  },
  
  /**
   * 创建文章后触发
   */
  async afterCreate(event) {
    const { result } = event;
    
    const { data } = event.params;

  },
  
  /**
   * 更新文章前触发
   */
  async beforeUpdate(event) {
    const { data, where } = event.params;
    
    // 检查是否有内容需要清理
    if (data && data.content) {
      let content = data.content;
      content = cleanHtmlContent(content);
      content = clearnExternalLinks(content);
     // content = createInternalLinks(content);
      data.content = content;
    }
    
    // 检查是否为英文内容 - 注意更新时可能没有直接的locale字段
    // 我们可以通过在where条件中查找locale
   
  },
  
  /**
   * 更新文章后触发
   */
  async afterUpdate(event) {
    const { result } = event;
    
    // 仅对英文内容生效
    if (result.locale === 'en') {
      console.log('✅ 英文文章更新成功，ID:', result.id);
    }
  }
};
