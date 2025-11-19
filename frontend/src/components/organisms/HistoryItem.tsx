/**
 * 历史记录项组件
 *
 * 功能：
 * - 显示单个学习记录
 * - 原文和改写内容
 * - 质量评分和时间信息
 * - 词汇映射显示
 * - 响应式布局
 */

import { Calendar, Star } from 'lucide-react';
import { useMantineTheme } from '@mantine/core';
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme';

interface HistoryRecord {
  ted_title: string;
  ted_speaker?: string;
  learned_at: string;
  quality_score?: number;
  original: string;
  imitation: string;
  map?: Record<string, string[]>;
}

interface HistoryItemProps {
  record: HistoryRecord;
  onViewDetails?: (record: HistoryRecord) => void;
  className?: string;
}

function HistoryItem({
  record,
  onViewDetails,
  className = '',
  ...props
}: HistoryItemProps) {
  const theme = useMantineTheme();
  const colors = getSemanticColors(theme);
  const spacing = getSpacing(theme);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: theme.radius.md,
        padding: spacing.lg,
        transition: 'box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
      {...props}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <h3
            style={{
              fontSize: theme.fontSizes.lg,
              fontWeight: 600,
              marginBottom: spacing.xs,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: colors.text,
            }}
          >
            {record.ted_title}
          </h3>
          {record.ted_speaker && (
            <p
              style={{
                fontSize: theme.fontSizes.sm,
                color: colors.textSecondary,
                marginBottom: spacing.xs,
              }}
            >
              {record.ted_speaker}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              fontSize: theme.fontSizes.sm,
              color: colors.textSecondary,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Calendar style={{ height: '1rem', width: '1rem' }} />
              {formatDate(record.learned_at)}
            </div>
            {record.quality_score && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Star
                  style={{
                    height: '1rem',
                    width: '1rem',
                    fill: colors.warning,
                    color: colors.warning,
                  }}
                />
                <span
                  style={{
                    fontSize: theme.fontSizes.xs,
                    backgroundColor: colors.surfaceHover,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: theme.radius.sm,
                    color: colors.textSecondary,
                  }}
                >
                  {record.quality_score}/8
                </span>
              </div>
            )}
          </div>
        </div>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(record)}
            style={{
              flexShrink: 0,
              marginLeft: spacing.md,
              padding: `${spacing.xs} ${spacing.sm}`,
              fontSize: theme.fontSizes.sm,
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: theme.radius.sm,
              color: colors.text,
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.surfaceHover;
              e.currentTarget.style.borderColor = colors.borderHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            查看详情
          </button>
        )}
      </div>

      {/* 原文 */}
      <div style={{ marginBottom: spacing.sm }}>
        <h4
          style={{
            fontWeight: 500,
            fontSize: theme.fontSizes.sm,
            marginBottom: spacing.xs,
            color: colors.text,
          }}
        >
          原文：
        </h4>
        <p
          style={{
            fontSize: theme.fontSizes.sm,
            backgroundColor: `${colors.surfaceHover}80`,
            padding: spacing.sm,
            borderRadius: theme.radius.sm,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: colors.text,
            lineHeight: theme.lineHeights.md,
            margin: 0,
          }}
        >
          {record.original}
        </p>
      </div>

      {/* 改写 */}
      <div style={{ marginBottom: spacing.sm }}>
        <h4
          style={{
            fontWeight: 500,
            fontSize: theme.fontSizes.sm,
            marginBottom: spacing.xs,
            color: colors.text,
          }}
        >
          Shadow Writing：
        </h4>
        <p
          style={{
            fontSize: theme.fontSizes.sm,
            backgroundColor: `${colors.surfaceHover}80`,
            padding: spacing.sm,
            borderRadius: theme.radius.sm,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: colors.text,
            lineHeight: theme.lineHeights.md,
            margin: 0,
          }}
        >
          {record.imitation}
        </p>
      </div>

      {/* 词汇映射 */}
      {record.map && Object.keys(record.map).length > 0 && (
        <div>
          <h4
            style={{
              fontWeight: 500,
              fontSize: theme.fontSizes.sm,
              marginBottom: spacing.xs,
              color: colors.text,
            }}
          >
            词汇映射：
          </h4>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.xs,
            }}
          >
            {Object.entries(record.map).map(([category, words]) => (
              <span
                key={category}
                style={{
                  fontSize: theme.fontSizes.xs,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.radius.sm,
                  color: colors.textSecondary,
                  backgroundColor: 'transparent',
                }}
              >
                {category}: {words.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryItem;
