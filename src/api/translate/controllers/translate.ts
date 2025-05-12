/**
 * 翻译API控制器
 */

export default {
  /**
   * 获取支持的语言列表
   * @param {object} ctx - Koa上下文
   */
  async getLocales(ctx) {
    try {
      const service = strapi.service('api::translate.translate');
      const locales = await service.getLocales();
      return locales;
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * 翻译内容
   * @param {object} ctx - Koa上下文
   */
  async translateContent(ctx) {
    try {
      const { entryId, apiEndpoint, locale } = ctx.request.body;
      
      // 参数验证
      if (!entryId || !apiEndpoint) {
        return ctx.badRequest('缺少必要参数');
      }

      const service = strapi.service('api::translate.translate');
      const result = await service.translateContent(entryId, apiEndpoint, locale);
      
      return result;
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },
};