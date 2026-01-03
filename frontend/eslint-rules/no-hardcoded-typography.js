/**
 * ESLint规则: 禁止硬编码字体和行高值
 * 
 * 检测并阻止在样式中使用硬编码的字体大小和行高值，强制使用主题typography token
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用硬编码字体和行高值，应使用主题typography token',
      category: 'Theme Consistency',
      recommended: true,
    },
    messages: {
      hardcodedFontSize: '禁止使用硬编码字体大小 "{{value}}"，请使用主题fontSizes token (如: theme.fontSizes.*, var(--mantine-font-size-*))',
      hardcodedLineHeight: '禁止使用硬编码行高 "{{value}}"，请使用主题lineHeight token (如: theme.lineHeight)',
      hardcodedFontWeight: '禁止使用硬编码字重 "{{value}}"，请使用主题fontWeight token (如: theme.fontWeight.*)',
      hardcodedFontFamily: '禁止使用硬编码字体族 "{{value}}"，请使用主题fontFamily token (如: theme.fontFamily, theme.fontFamilyMonospace)',
    },
    schema: [],
  },

  create(context) {
    // 字体相关的CSS属性
    const typographyProperties = {
      fontSize: 'hardcodedFontSize',
      lineHeight: 'hardcodedLineHeight',
      fontWeight: 'hardcodedFontWeight',
      fontFamily: 'hardcodedFontFamily',
    };

    // 字体大小值的正则表达式
    const fontSizePatterns = [
      /^\d+px$/,           // 像素: 14px, 16px
      /^\d+rem$/,          // rem: 1rem, 1.5rem
      /^\d+em$/,           // em: 1em, 1.2em
      /^\d+pt$/,           // pt: 12pt
      /^\d+\.\d+px$/,      // 小数像素: 14.5px
      /^\d+\.\d+rem$/,     // 小数rem: 1.25rem
      /^\d+\.\d+em$/,      // 小数em: 1.2em
    ];

    // 行高值的正则表达式
    const lineHeightPatterns = [
      /^\d+\.\d+$/,        // 数字: 1.5, 1.6, 2.0
      /^\d+px$/,           // 像素: 20px, 24px
      /^\d+%$/,            // 百分比: 150%
    ];

    // 字重值的正则表达式
    const fontWeightPatterns = [
      /^(100|200|300|400|500|600|700|800|900)$/,  // 数字字重
      /^(normal|bold|bolder|lighter)$/i,          // 关键字字重
    ];

    // 允许的特殊值
    const allowedValues = [
      'inherit',
      'initial',
      'unset',
      'normal',
    ];

    /**
     * 检查值是否为硬编码字体大小
     */
    function isHardcodedFontSize(value) {
      if (typeof value !== 'string') return false;
      const trimmedValue = value.trim();
      if (allowedValues.includes(trimmedValue)) return false;
      return fontSizePatterns.some(pattern => pattern.test(trimmedValue));
    }

    /**
     * 检查值是否为硬编码行高
     */
    function isHardcodedLineHeight(value) {
      if (typeof value !== 'string' && typeof value !== 'number') return false;
      const stringValue = String(value).trim();
      if (allowedValues.includes(stringValue)) return false;
      return lineHeightPatterns.some(pattern => pattern.test(stringValue));
    }

    /**
     * 检查值是否为硬编码字重
     */
    function isHardcodedFontWeight(value) {
      if (typeof value !== 'string' && typeof value !== 'number') return false;
      const stringValue = String(value).trim();
      if (allowedValues.includes(stringValue)) return false;
      return fontWeightPatterns.some(pattern => pattern.test(stringValue));
    }

    /**
     * 检查值是否为硬编码字体族
     */
    function isHardcodedFontFamily(value) {
      if (typeof value !== 'string') return false;
      const trimmedValue = value.trim();
      if (allowedValues.includes(trimmedValue)) return false;
      // 检查是否包含字体名称（通常包含引号或逗号）
      return /['",]/.test(trimmedValue) || /^[a-zA-Z\s-]+$/.test(trimmedValue);
    }

    /**
     * 检查样式对象
     */
    function checkStyleObject(node) {
      if (node.type === 'ObjectExpression') {
        node.properties.forEach(prop => {
          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
            const propName = prop.key.name;
            
            // 检查是否为字体相关属性
            if (typographyProperties[propName]) {
              let value = null;
              
              if (prop.value.type === 'Literal') {
                value = prop.value.value;
              } else if (prop.value.type === 'TemplateLiteral' && prop.value.expressions.length === 0) {
                value = prop.value.quasis[0].value.cooked;
              }
              
              if (value !== null) {
                let isHardcoded = false;
                
                switch (propName) {
                  case 'fontSize':
                    isHardcoded = isHardcodedFontSize(value);
                    break;
                  case 'lineHeight':
                    isHardcoded = isHardcodedLineHeight(value);
                    break;
                  case 'fontWeight':
                    isHardcoded = isHardcodedFontWeight(value);
                    break;
                  case 'fontFamily':
                    isHardcoded = isHardcodedFontFamily(value);
                    break;
                }
                
                if (isHardcoded) {
                  context.report({
                    node: prop.value,
                    messageId: typographyProperties[propName],
                    data: { value: String(value) },
                  });
                }
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
