/**
 * ESLint规则: 禁止硬编码间距值
 * 
 * 检测并阻止在样式中使用硬编码的间距值，强制使用主题spacing token
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用硬编码间距值，应使用主题spacing token',
      category: 'Theme Consistency',
      recommended: true,
    },
    messages: {
      hardcodedSpacing: '禁止使用硬编码间距 "{{value}}"，请使用主题spacing token (如: theme.spacing.*, var(--mantine-spacing-*))',
    },
    schema: [],
  },

  create(context) {
    // 间距相关的CSS属性
    const spacingProperties = [
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'gap',
      'rowGap',
      'columnGap',
      'gridGap',
      'gridRowGap',
      'gridColumnGap',
      'top',
      'right',
      'bottom',
      'left',
      'inset',
    ];

    // 间距值的正则表达式 (匹配数字+单位)
    const spacingPatterns = [
      /^\d+px$/,           // 像素: 16px, 24px
      /^\d+rem$/,          // rem: 1rem, 2rem
      /^\d+em$/,           // em: 1em, 2em
      /^\d+%$/,            // 百分比: 50%, 100%
      /^\d+vh$/,           // viewport height: 10vh
      /^\d+vw$/,           // viewport width: 10vw
      /^\d+\.\d+px$/,      // 小数像素: 16.5px
      /^\d+\.\d+rem$/,     // 小数rem: 1.5rem
      /^\d+\.\d+em$/,      // 小数em: 1.5em
    ];

    // 允许的特殊值
    const allowedValues = [
      '0',
      'auto',
      'inherit',
      'initial',
      'unset',
      'none',
    ];

    /**
     * 检查值是否为硬编码间距
     */
    function isHardcodedSpacing(value) {
      if (typeof value !== 'string') return false;
      
      const trimmedValue = value.trim();
      
      // 允许的特殊值
      if (allowedValues.includes(trimmedValue)) return false;
      
      // 检查是否匹配间距模式
      return spacingPatterns.some(pattern => pattern.test(trimmedValue));
    }

    /**
     * 检查样式对象
     */
    function checkStyleObject(node) {
      if (node.type === 'ObjectExpression') {
        node.properties.forEach(prop => {
          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
            const propName = prop.key.name;
            
            // 检查是否为间距属性
            if (spacingProperties.includes(propName)) {
              let value = null;
              
              if (prop.value.type === 'Literal') {
                value = prop.value.value;
              } else if (prop.value.type === 'TemplateLiteral' && prop.value.expressions.length === 0) {
                value = prop.value.quasis[0].value.cooked;
              }
              
              if (value && isHardcodedSpacing(value)) {
                context.report({
                  node: prop.value,
                  messageId: 'hardcodedSpacing',
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
