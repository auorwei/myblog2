/**
 * 翻译API服务
 */
import { factories } from '@strapi/strapi';
import StrapiApiService from '../../../admin/services/StrapiApiService';
import { TranslationService } from '../../../admin/services/TranslationService';
import { HtmlParseService } from '../../../admin/services/HtmlParseService';

export default factories.createCoreService('api::translate.translate', ({ strapi }) => ({
  /**
   * 获取支持的语言列表
   */
  async getLocales() {
    try {
      const baseUrl = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
      const token = process.env.STRAPI_API_TOKEN;
      
      if (!token) {
        throw new Error('未设置STRAPI_API_TOKEN环境变量');
      }
      
      const apiService = new StrapiApiService(baseUrl, token);
      const locales = await apiService.getAllLocales();
      return locales;
    } catch (error) {
      console.error('获取语言列表失败:', error);
      throw error;
    }
  },

  /**
   * 翻译内容
   * @param {string} entryId - 条目ID
   * @param {string} apiEndpoint - API端点
   * @param {string} targetLocale - 目标语言，如果不提供则翻译所有语言
   */
  async translateContent(entryId, apiEndpoint, targetLocale = null) {
    try {
      // 初始化服务
      const baseUrl = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
      const token = process.env.STRAPI_API_TOKEN;
      const authKey = process.env.DEEPL_AUTH_KEY;
      
      if (!token) {
        throw new Error('未设置STRAPI_API_TOKEN环境变量');
      }
      
      if (!authKey) {
        throw new Error('未设置DEEPL_AUTH_KEY环境变量');
      }
      
      const apiService = new StrapiApiService(baseUrl, token);
      const translationService = new TranslationService(authKey);

        // 获取英文内容
      const entry = await apiService.getEntry(apiEndpoint, entryId, 'en');
      if (!entry) {
        throw new Error('获取英文内容失败');
      }


      //如果apiEndpoint为articles按照这个逻辑
      if(apiEndpoint === 'articles'){

      }
    

      // 获取翻译源数据
      const title = entry.title;
      const content = entry.content;
      const category = entry.category?.documentId;
      const tags = entry.tags;
      const slug = entry.slug;
      const coverPicture = entry.coverPicture?.id;
      
      // 获取所有可用语言
      const locales = await apiService.getAllLocales();
      const targetLocales = targetLocale ? [targetLocale] : locales.filter(locale => locale !== 'en');
      
    // 检查category是否还没有多语言
      if (category) {
        const categoryEntry = await apiService.getEntry('categories', category, '*');
        if (categoryEntry) {
          const categorySlug = categoryEntry.slug;
          const categoryName = categoryEntry.name;
          const categoryDescription = categoryEntry.description || '';
          const categoryLocalizations = categoryEntry.localizations || [];
          const categoryLocalesList = categoryLocalizations.map(loc => loc.locale);
          const missingCategoryLocalesSet = targetLocales.filter(locale => 
            locale !== 'en' && !categoryLocalesList.includes(locale));
          
          if (missingCategoryLocalesSet.length > 0) {
            for (const missingLocale of missingCategoryLocalesSet) {
              if (missingLocale === 'en') continue;
              
              const categoryTranslation = await translationService.translate(
                `${categoryName}<br>${categoryDescription}`, 
                missingLocale
              );
              
              const [translatedName, translatedDescription] = categoryTranslation.split('<br>');
              const categoryPayload = {
                slug: categorySlug,
                name: translatedName.replace(/<\/?p>/g, ''),
                description: translatedDescription.replace(/<\/?p>/g, '')
              };
              
              const categoryRes = await apiService.publishEntry(
                'categories', 
                category, 
                missingLocale, 
                categoryPayload, 
                false
              );
              console.log('发布分类成功：', categoryRes);
            }
          }
        }
      }

      // 检查tags多语言是否已经完善
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          const tagEntry = await apiService.getEntry('tags', tag.documentId, '*');
          if (tagEntry) {
            const tagSlug = tagEntry.slug;
            const tagName = tagEntry.name;
            const tagDescription = tagEntry.description || '';
            const tagLocalizations = tagEntry.localizations || [];
            const tagLocalesList = tagLocalizations.map(loc => loc.locale);
            const missingTagLocalesSet = targetLocales.filter(locale => 
              locale !== 'en' && !tagLocalesList.includes(locale));
            
            if (missingTagLocalesSet.length > 0) {
              for (const missingLocale of missingTagLocalesSet) {
                if (missingLocale === 'en') continue;
                
                const tagTranslation = await translationService.translate(
                  `${tagName}<br>${tagDescription}`, 
                  missingLocale
                );
                
                const [translatedName, translatedDescription] = tagTranslation.split('<br>');
                const tagPayload = {
                  slug: tagSlug,
                  name: translatedName,
                  description: translatedDescription
                };
                
                const tagRes = await apiService.publishEntry(
                  'tags', 
                  tag.documentId, 
                  missingLocale, 
                  tagPayload
                );
                console.log('发布tag成功：', tagRes);
              }
            }
          }
        }
      }





      const results = [];
      
      // 对每种语言进行翻译
      for (const locale of targetLocales) {
        if (locale === 'en') continue;
        
        // 组合HTML并解析
        const articleHtml = `<h1>${title}</h1>${content}`;
        const [stripped, attrs] = HtmlParseService.decompose(articleHtml);
        
        // 翻译内容
        const translatedHtml = await translationService.translate(stripped, locale);
        
        // 重新组合HTML
        const recomposeHtml = HtmlParseService.recompose(translatedHtml, attrs);
        const finalHtml = HtmlParseService.cleanForStrapi(recomposeHtml);
        
        // 分离标题和内容
        const parts = finalHtml.split('</h1>');
        const finalTitle = parts[0].replace('<h1>', '');
        const finalContent = parts[1];

        // 构造请求数据
        const localTagsList = tags ? tags.map(tag => tag.documentId) : [];
        

        const paydata = {
            slug: slug,
          title: finalTitle,
          content: finalContent,
          category: category,
          tags: localTagsList,
          coverPicture: coverPicture
          
          };

        // 发布翻译内容
        const res = await apiService.publishEntry(apiEndpoint, entryId, locale, paydata, true);
        results.push({ locale, success: true, title: finalTitle });
      }
      
      return { 
        success: true, 
        message: '翻译完成', 
        results 
      };
    } catch (error) {
      console.error('翻译过程发生错误:', error);
      throw error;
    }
  },
}));