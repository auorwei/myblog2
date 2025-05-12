/**
 * 将英文单数名词转为复数形式
 * @param singular 单数形式
 * @returns 复数形式
 */
export const toPlural = (singular: string): string => {
  // 特殊情况列表
  const specialCases: {[key: string]: string} = {
    'category': 'categories',
    'family': 'families',
    'history': 'histories',
    'story': 'stories',
    'leaf': 'leaves',
    'potato': 'potatoes',
    'tomato': 'tomatoes',
    'cactus': 'cacti',
    'focus': 'foci',
    'analysis': 'analyses',
    'crisis': 'crises',
    'thesis': 'theses',
    'child': 'children',
    'goose': 'geese',
    'man': 'men',
    'woman': 'women',
    'tooth': 'teeth',
    'foot': 'feet',
    'mouse': 'mice',
    'person': 'people'
  };

  // 检查是否为特殊情况
  if (specialCases[singular]) {
    console.log(`检测到特殊复数形式: ${singular} -> ${specialCases[singular]}`);
    return specialCases[singular];
  }

  // 常规规则
  if (singular.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(ending => singular.endsWith(ending))) {
    // 以辅音+y结尾: city -> cities
    return singular.slice(0, -1) + 'ies';
  } else if (singular.endsWith('s') || singular.endsWith('x') || 
            singular.endsWith('z') || singular.endsWith('ch') || 
            singular.endsWith('sh')) {
    // 以s, x, z, ch, sh结尾: bus -> buses, box -> boxes
    return singular + 'es';
  } else if (singular.endsWith('fe')) {
    // 以fe结尾: knife -> knives
    return singular.slice(0, -2) + 'ves';
  } else if (singular.endsWith('f')) {
    // 以f结尾: leaf -> leaves (有些例外，但这些已在特殊情况中处理)
    return singular.slice(0, -1) + 'ves';
  } else {
    // 默认情况: 添加s
    return singular + 's';
  }
}; 