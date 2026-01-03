/**
 * ESLint规则: 禁止硬编码圆角值
 * 
 * 检测并阻止在样式中使用硬编码的圆角值，强制使用主题radius token
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用硬编码圆角值，应使用主题radius token',
      category: 'Theme Consistency',
      recommended: true,
    },
    messages: {
      hardcodedRadius: '禁止使用硬编码圆角 "{{value}}"，请使用主题radius token (如: theme.radius.*, var(--mantine-radius-*))',
    },
    schema: [],
  },

  create(context) {
    // 圆角相关的CSS属性
    const radiusProperties = [
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
    ];

    // 圆角值的正则表达式
    const radiusPatterns = [
      /^\d+px$/,           // 像素: 4px, 8px, 16px
      /^\d+rem$/,          // rem: 0.25rem, 0.5rem
      /^\d+em$/,           // em: 0.25em, 0.5em
      /^\d+%$/,            // 百分比: 50%
      /^\d+\.\d+px$/,      // 小数像素: 4.5px
      /^\d+\.\d+rem$/,     // 小数rem: 0.25rem
      /^\d+\.\d+em$/,      // 小数em: 0.25em
    ];

    // 允许的特殊值
    const allowedValues = [
      '0',
      'inherit',
      'initial',
      'unset',
      'none',
    ];

    /**
     * 检查值是否为硬编码圆角
     */
    function isHardcodedRadius(value) {
      if (typeof value !== 'string') return false;
      
      const trimmedValue = value.trim();
      
      // 允许的特殊值
      if (allowedValues.includes(trimmedValue)) return false;
      
      // 检查是否匹配圆角模式
      return radiusPatterns.some(pattern => pattern.test(trimmedValue));
    }

    /**
     * 检查样式对象
     */
    function checkStyleObject(node) {
      if (node.type === 'ObjectExpression') {
        node.properties.forEach(prop => {
          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
            const propName = prop.key.name;
            
            // 检查是否为圆角属性
            if (radiusProperties.includes(propName)) {
              let value = null;
              
              if (prop.value.type === 'Literal') {
                value = prop.value.value;
              } else if (prop.value.type === 'TemplateLiteral' && prop.value.expressions.length === 0) {
                value = prop.value.quasis[0].value.cooked;
              }
              
              if (value && isHardcodedRadius(value)) {
                context.report({
                  node: prop.value,
                  messageId: 'hardcodedRadius',
                  data: { value },
                });
              }
            }
          }
        });
      }
    }

    /**
     * 检查sx prop中的样式对象
     */
    function checkSxProp(node) {
      if (node.type === 'JSXAttribute' && node.name.name === 'sx') {
        if (node.value && node.value.type === 'JSXExpressionContainer') {
          const expression = node.value.expression;
          
          // 处理对象表达式
          if (expression.type === 'ObjectExpression') {
            checkStyleObject(expression);
          }
          
          // 处理箭头函数返回的对象
          if (expression.type === 'ArrowFunctionExpression' && 
              expression.body.type === 'ObjectExpression') {
            checkStyleObject(expression.body);
          }
        }
      }
    }

    /**
     * 检查style prop中的样式对象
     */
    function checkStyleProp(node) {
      if (node.type === 'JSXAttribute' && node.name.name === 'style') {
        if (node.value && node.value.type === 'JSXExpressionContainer') {
          const expression = node.value.expression;
          if (expression.type === 'ObjectExpression') {
            checkStyleObject(expression);
          }
        }
      }
    }

    return {
      // 检查JSX属性
      JSXAttribute(node) {
        checkSxProp(node);
        checkStyleProp(node);
      },

      // 检查变量声明中的样式对象
      VariableDeclarator(node) {
        if (node.init && node.init.type === 'ObjectExpression') {
          // 检查变量名是否包含 'style' 或 'styles'
          if (node.id.type === 'Identifier' && 
              /style/i.test(node.id.name)) {
            checkStyleObject(node.init);
          }
        }
      },

      // 检查对象属性中的样式定义
      Property(node) {
        if (node.key.type === 'Identifier' && /style/i.test(node.key.name)) {
          if (node.value.type === 'ObjectExpression') {
            checkStyleObject(node.value);
          }
        }
      },
    };
  },
};
