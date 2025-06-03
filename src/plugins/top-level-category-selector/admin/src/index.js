import TopLevelCategorySelector from './components/TopLevelCategorySelector';

export default {
  register(app) {
    // 注册自定义字段
    app.customFields.register({
      name: 'top-level-category',
      pluginId: 'top-level-category-selector',
      type: 'relation',
      intlLabel: {
        id: 'top-level-category-selector.top-level-category.label',
        defaultMessage: '顶级分类选择器',
      },
      intlDescription: {
        id: 'top-level-category-selector.top-level-category.description',
        defaultMessage: '只显示顶级分类的选择器',
      },
      components: {
        Input: TopLevelCategorySelector,
      },
      options: {
        // 保持与原生关系字段相同的选项
      },
    });
  },
}; 