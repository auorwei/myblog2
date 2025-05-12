// src/plugins/my-plugin/server/controllers/entry-info.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'plugin::my-plugin.entry-info',
  ({ strapi }) => ({
    async show(ctx) {
      const { contentTypeUID, id, locale, status } = ctx.request.body;

      const entry = await strapi
        .service('plugin::my-plugin.entry-info')
        .findEntry(contentTypeUID, id, locale, status);

      ctx.body = entry;
    },
  })
);
