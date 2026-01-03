/**
 * ESLint规则: 禁止硬编码颜色值
 * 
 * 检测并阻止在样式中使用硬编码的颜色值，强制使用主题token
 * 排除: boxShadow 属性允许硬编码
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用硬编码颜色值，应使用主题token',
      category: 'Theme Consistency',
      recommended: true,
    },
    messages: {
      hardcodedColor: '禁止使用硬编码颜色 "{{value}}"，请使用主题token (如: theme.colors.*, var(--mantine-color-*))',
    },
    schema: [],
  },

  create(context) {
    // 颜色相关的CSS属性
    const colorProperties = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'fill',
      'stroke',
    ];

    // 颜色值的正则表达式
    const colorPatterns = [
      /^#[0-9a-fA-F]{3,8}$/,           // 十六进制颜色: #fff, #ffffff, #ffffff00
      /^rgb\(/i,                        // RGB: rgb(255, 255, 255)
      /^rgba\(/i,                       // RGBA: rgba(255, 255, 255, 0.5)
      /^hsl\(/i,                        // HSL: hsl(0, 0%, 100%)
      /^hsla\(/i,                       // HSLA: hsla(0, 0%, 100%, 0.5)
      /^(white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|cyan|magenta|brown|transparent)$/i, // 颜色名称
    ];

    /**
     * 检查值是否为硬编码颜色
     */
    function isHardcodedColor(value) {
      if (typeof value !== 'string') return false;
      return colorPatterns.some(pattern => pattern.test(value.trim()));
    }

    /**
     * 检查JSX属性中的style对象
     */
    function checkStyleObject(node) {
      if (node.type === 'ObjectExpression') {
        node.properties.forEach(prop => {
          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
            const propName = prop.key.name;
            
            // 跳过boxShadow属性
            if (propName === 'boxShadow') return;
            
            // 检查是否为颜色属性
            if (colorProperties.includes(propName)) {
              let value = null;
              
              if (prop.value.type === 'Literal') {
                value = prop.value.value;
              } else if (prop.value.type === 'TemplateLiteral' && prop.value.expressions.length === 0) {
                value = prop.value.quasis[0].value.cooked;
              }
              
              if (value && isHardcodedColor(value)) {
                context.report({
                  node: prop.value,
                  messageId: 'hardcodedColor',
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
