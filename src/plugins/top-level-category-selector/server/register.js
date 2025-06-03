'use strict';

/**
 * 注册自定义顶级分类选择器字段
 */

module.exports = ({ strapi }) => {
  // 注册自定义字段
  strapi.customFields.register({
    name: 'top-level-category',
    plugin: 'top-level-category-selector',
    type: 'relation', // 基础类型仍是关系字段
  });
}; 