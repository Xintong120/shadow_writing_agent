// ResultDisplay.tsx
// 作用：显示句子改写结果

import { useMantineTheme } from '@mantine/core';
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme';

interface ParaphraseItem {
  strategy: string;
  score: number;
  sentence: string;
}

interface ResultDisplayProps {
  results: {
    original: string;
    paraphrases: ParaphraseItem[];
  };
}

function ResultDisplay({ results }: ResultDisplayProps) {
  const theme = useMantineTheme();
  const colors = getSemanticColors(theme);
  const spacing = getSpacing(theme);

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: theme.radius.md,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2
        style={{
          fontSize: theme.fontSizes.lg,
          fontWeight: 600,
          marginBottom: spacing.md,
          color: colors.text,
        }}
      >
        改写结果
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {/* 原始句子 */}
        <div
          style={{
            padding: spacing.sm,
            backgroundColor: colors.surfaceHover,
            borderRadius: theme.radius.sm,
          }}
        >
          <h3
            style={{
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: spacing.xs,
              fontSize: theme.fontSizes.sm,
            }}
          >
            原始句子:
          </h3>
          <p
            style={{
              color: colors.text,
              fontSize: theme.fontSizes.md,
              lineHeight: theme.lineHeights.md,
              margin: 0,
            }}
          >
            {results.original}
          </p>
        </div>

        {/* 改写结果 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <h3
            style={{
              fontWeight: 500,
              color: colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              margin: 0,
            }}
          >
            改写结果:
          </h3>
          {results.paraphrases.map((item, index) => (
            <div
              key={index}
              style={{
                padding: spacing.sm,
                border: `1px solid ${colors.border}`,
                borderRadius: theme.radius.sm,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing.xs,
                }}
              >
                <span
                  style={{
                    fontSize: theme.fontSizes.sm,
                    color: colors.textSecondary,
                  }}
                >
                  策略: {item.strategy}
                </span>
                <span
                  style={{
                    fontSize: theme.fontSizes.sm,
                    fontWeight: 500,
                    color: colors.success,
                  }}
                >
                  评分: {item.score}
                </span>
              </div>
              <p
                style={{
                  color: colors.text,
                  fontSize: theme.fontSizes.md,
                  lineHeight: theme.lineHeights.md,
                  margin: 0,
                }}
              >
                {item.sentence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultDisplay;
