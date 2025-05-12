/**
 * 文章生命周期钩子 - 仅英文版本
 */

module.exports = {
  /**
   * 创建文章前触发
   */
  async beforeCreate(event) {
    
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
