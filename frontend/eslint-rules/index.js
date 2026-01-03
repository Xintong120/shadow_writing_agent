/**
 * ESLint规则索引文件
 * 
 * 导出所有自定义主题一致性规则
 */

module.exports = {
  rules: {
    'no-hardcoded-colors': require('./no-hardcoded-colors'),
    'no-hardcoded-spacing': require('./no-hardcoded-spacing'),
    'no-hardcoded-typography': require('./no-hardcoded-typography'),
    'no-hardcoded-radius': require('./no-hardcoded-radius'),
  },
};
