# UI Component Library

This directory contains a set of reusable UI components built with Tamagui for the DeepRead app, supporting both mobile and web platforms.

## Design Tokens

The design system uses tokens defined in `tamagui.config.ts` for consistent styling across the app:

### Spacing

Spacing tokens follow a 4px scale and can be accessed using `$space.{token}`:

```tsx
<YStack padding="$4" gap="$2" />
```

Available spacing tokens:
- `$0` - 0px
- `$0.5` - 2px
- `$1` - 4px
- `$1.5` - 6px
- `$2` - 8px 
- `$2.5` - 10px
- `$3` - 12px
- `$3.5` - 14px
- `$4` - 16px
- `$5` - 20px
- `$6` - 24px
- `$8` - 32px
- `$10` - 40px
- `$12` - 48px
- `$16` - 64px
- `$20` - 80px
- `$24` - 96px

### Colors

Colors provide consistent branding and states:

```tsx
<Text color="$primary" />
<Button backgroundColor="$secondary" />
```

Key color tokens:
- `$primary` - Primary brand color
- `$secondary` - Secondary brand color
- `$text` - Default text color
- `$textMuted` - Secondary text color
- `$background` - Background color
- `$error` - Error states
- `$success` - Success states
- `$warning` - Warning states

### Font Sizes

Font sizes use a consistent scale with Manrope as the primary font:

```tsx
<Text fontSize="$md" />
<Heading fontSize="$2xl" />
```

Available size tokens:
- `$1` - 12px
- `$2` - 14px
- `$3` - 16px
- `$4` - 18px
- `$5` - 20px
- `$6` - 24px
- `$7` - 30px
- `$8` - 36px
- `$9` - 48px
- `$10` - 60px

Font weights for Manrope:
- `$1` - 200 (ExtraLight)
- `$2` - 300 (Light)
- `$3` - 400 (Regular)
- `$4` - 500 (Medium)
- `$5` - 600 (SemiBold)
- `$6` - 700 (Bold)
- `$7` - 800 (ExtraBold)

### Theming

The app supports both light and dark themes which are defined in `tamagui.config.ts`.

## Components

### Button

A customized button with variants, loading state, and full-width support.

```tsx
import { Button } from '~/components/ui/Button'

// Basic usage
<Button onPress={() => console.log('Pressed')}>Click Me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// With loading state
<Button isLoading>Loading</Button>

// Full width button
<Button fullWidth>Full Width</Button>
```

### TextInput

A styled input component with built-in label and error handling.

```tsx
import { TextInput } from '~/components/ui/TextInput'

// Basic usage
<TextInput placeholder="Enter your name" />

// With label
<TextInput 
  label="Email Address" 
  placeholder="example@email.com" 
/>

// With error state
<TextInput 
  label="Password" 
  placeholder="Enter password" 
  error="Password must be at least 8 characters" 
/>

// With helper text
<TextInput 
  label="Username" 
  helperText="Your username will be visible to others"
/>

// Required field
<TextInput 
  label="Full Name" 
  required
/>
```

### Card

A container component for grouping related content with optional elevation.

```tsx
import { Card } from '~/components/ui/Card'
import { Text } from 'tamagui'

// Basic usage
<Card>
  <Text>Card content goes here</Text>
</Card>

// With variants
<Card variant="elevated">
  <Text>Elevated card with shadow</Text>
</Card>

<Card variant="outline">
  <Text>Outlined card with border</Text>
</Card>

<Card variant="ghost">
  <Text>Ghost card (no border or shadow)</Text>
</Card>
```

### Heading

A text component for section headings with different levels of hierarchy.

```tsx
import { Heading } from '~/components/ui/Heading'

// Basic usage (defaults to level 2)
<Heading>Section Title</Heading>

// Different heading levels
<Heading level="1">Page Title</Heading>
<Heading level="2">Section Title</Heading>
<Heading level="3">Subsection Title</Heading>
<Heading level="4">Small Heading</Heading>

// Different font weights
<Heading weight="normal">Normal Weight</Heading>
<Heading weight="medium">Medium Weight</Heading>
<Heading weight="semibold">Semibold Weight</Heading>
<Heading weight="bold">Bold Weight</Heading>
```

### Label

A specialized text component for form field labels.

```tsx
import { Label } from '~/components/ui/Label'

// Basic usage
<Label htmlFor="name-input">Name</Label>

// Required field
<Label htmlFor="email-input" required>Email Address</Label>
```

## Responsive Design

Components automatically adjust to different screen sizes using Tamagui's media queries:

```tsx
import { YStack } from 'tamagui'

<YStack 
  padding="$4"
  $sm={{ padding: '$2' }}
  $lg={{ padding: '$6' }}
/>
```

Available media query breakpoints:
- `$sm` - max-width: 640px
- `$md` - max-width: 768px 
- `$lg` - max-width: 1024px
- `$xl` - max-width: 1280px
- `$gtSm` - min-width: 641px
- `$gtMd` - min-width: 769px
- `$gtLg` - min-width: 1025px
- `$landscape` - orientation: landscape
- `$portrait` - orientation: portrait 