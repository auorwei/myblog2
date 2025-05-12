import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({

    /**
     * 重写 create 方法：先创建英文，再一并为所有其它 locale
     * 创建「草稿」条目，并且和英文版互联（localizations）。
     */
    async create(ctx) {
      // 1. 先调用默认逻辑，创建主条目
      //    假设前端发的是 { data: { title, content, slug, category, tags, ... }, locale: 'en' }
      const mainEntry = await super.create(ctx);

      // 2. 拿到所有注册的语言列表（code 字段）
      const allLocales = await strapi.db.query('plugin::i18n.locale').findMany({
        select: ['code']
      });
      const defaultLocale = ctx.request.body.locale || 'en';

      // 3. 准备要复制的字段（和主条目一模一样，除了 locale 与 localizations）
      const payload = {
        ...ctx.request.body.data,
        // 把英文版当作 localizations 的第一个关联
        localizations: [{ id: mainEntry.id }],
      };

      // 4. 为每个其他语言创建草稿
      for (const { code } of allLocales) {
        if (code === defaultLocale) continue;
        try {
          await strapi.db.query('api::article.article').create({
            data: {
              ...payload,
            locale: code,
            }
          });
        } catch (err) {
          strapi.log.error(
            `自动创建 locale=${code} 草稿失败（enId=${mainEntry.id}）:`,
            err
          );
        }
      }

      // 5. 最后把「英文主条目」返回给前端
      return mainEntry;
    },

  })
);
