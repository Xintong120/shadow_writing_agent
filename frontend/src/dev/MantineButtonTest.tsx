// Mantine Button Test Component
// This component showcases the updated Button component with Mantine sizing system
import React from 'react';
import { Button } from '@/components/atoms/button';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function ButtonShowcase() {
  const { scale, setScale, theme } = useTheme();

  const buttonVariants = ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'] as const;
  const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div className="min-h-screen bg-background p-lg">
      <div className="max-w-4xl mx-auto space-y-xl">
        {/* Header */}
        <div className="text-center space-y-md">
          <h1 className="text-3xl font-bold">Mantine Button Test</h1>
          <p className="text-muted-foreground">
            Testing the updated Button component with Mantine sizing system
          </p>
        </div>

        {/* Theme Controls */}
        <div className="bg-card p-lg rounded-lg border">
          <h2 className="text-xl font-semibold mb-md">Theme Controls</h2>
          <div className="space-y-md">
            <div>
              <label className="block text-sm font-medium mb-sm">
                Global Scale: {scale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-xs">
                <span>0.8x</span>
                <span>1.0x</span>
                <span>1.4x</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md text-sm">
              <div>
                <strong>Spacing.xs:</strong> {theme.spacing.xs}
              </div>
              <div>
                <strong>FontSize.md:</strong> {theme.fontSizes.md}
              </div>
            </div>
          </div>
        </div>

        {/* Size Variants */}
        <div className="bg-card p-lg rounded-lg border">
          <h2 className="text-xl font-semibold mb-md">Button Sizes</h2>
          <div className="space-y-lg">
            {buttonSizes.map((size) => (
              <div key={size} className="space-y-sm">
                <h3 className="text-sm font-medium uppercase tracking-wide">
                  Size: {size}
                </h3>
                <div className="flex flex-wrap gap-md">
                  {buttonVariants.map((variant) => (
                    <Button key={`${size}-${variant}`} variant={variant} size={size}>
                      {variant} {size}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Icon Buttons */}
        <div className="bg-card p-lg rounded-lg border">
          <h2 className="text-xl font-semibold mb-md">Icon Buttons</h2>
          <div className="flex flex-wrap gap-md">
            {buttonVariants.map((variant) => (
              <Button key={`icon-${variant}`} variant={variant} size="icon">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </Button>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-card p-lg rounded-lg border">
          <h2 className="text-xl font-semibold mb-md">Usage Examples</h2>
          <div className="space-y-md">
            <div>
              <h3 className="text-sm font-medium mb-sm">Primary Actions</h3>
              <div className="flex gap-md">
                <Button size="lg">Create New</Button>
                <Button size="lg" variant="secondary">Import</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-sm">Form Actions</h3>
              <div className="flex gap-sm">
                <Button size="md" variant="outline">Cancel</Button>
                <Button size="md">Save Changes</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-sm">Danger Actions</h3>
              <div className="flex gap-sm">
                <Button size="sm" variant="outline">Keep</Button>
                <Button size="sm" variant="destructive">Delete</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-card p-lg rounded-lg border">
          <h2 className="text-xl font-semibold mb-md">Configuration</h2>
          <div className="space-y-sm text-sm">
            <div><strong>Spacing System:</strong> Mantine compatible (10px, 12px, 16px, 20px, 32px)</div>
            <div><strong>Font Sizes:</strong> Mantine standard (12px, 14px, 16px, 18px, 20px)</div>
            <div><strong>Breakpoints:</strong> Mantine responsive (36em, 48em, 62em, 75em, 88em)</div>
            <div><strong>Shadows:</strong> Mantine box-shadow system</div>
            <div><strong>Global Scale:</strong> CSS custom property controlled scaling</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MantineButtonTest() {
  return (
    <ThemeProvider autoDetectBrowserScale={true}>
      <ButtonShowcase />
    </ThemeProvider>
  );
}