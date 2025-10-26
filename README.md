# Build Design System

A comprehensive design system built with **Style Dictionary**, **React**, **TypeScript**, and **Storybook**.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎨 Features

- **Design Tokens** from Figma (via Tokens Studio)
- **Multi-Theme Support** (Light/Dark mode, Multiple color themes)
- **Style Dictionary** for token transformation
- **SCSS** with aliases for maintainability
- **CSS Custom Properties** for browser compatibility
- **React Components** with TypeScript
- **Comprehensive Documentation** via Storybook

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
# Build design tokens
npm run build:tokens

# Start Storybook (documentation)
npm run storybook

# Build design system library
npm run build

# Build Storybook for production
npm run build-storybook
```

## 🎯 Changing Themes

The design system supports multiple themes that can be easily switched by editing `config/theme.config.js`:

```javascript
export const themeConfig = {
  colorMode: 'Light',    // Options: 'Light' | 'Dark'
  neutralMode: 'Gray',   // Options: 'Gray' | 'Slate'
  themeMode: 'Blue'      // Options: 'Blue' | 'Purple' | 'Orange' | 'Sky'
};
```

After changing the configuration, rebuild the tokens:

```bash
npm run build:tokens
```

## 📁 Project Structure

```
build-ds/
├── config/
│   ├── theme.config.js       # 🎨 Theme configuration (edit this!)
│   ├── build-tokens.js       # Token build script
│   └── debug-tokens.js       # Debug utility
├── src/
│   ├── from-figma/
│   │   └── tokens.json       # Raw tokens from Figma
│   ├── tokens/build/
│   │   ├── scss/             # ✅ SCSS with aliases ($color-primary: $blue-500)
│   │   └── css/              # ✅ CSS with flat values (--color-primary: #335CFF)
│   ├── styles/
│   │   └── index.scss        # Global styles
│   ├── stories/              # Storybook documentation
│   └── components/           # React components (add your components here)
├── .storybook/               # Storybook configuration
└── public/                   # Static assets
```

## 🎨 Design Tokens

### Token Categories

- **Foundations** - Base colors, primitives
- **Light/Dark Tokens** - Semantic tokens for light and dark modes
- **Theme** - Semantic theme tokens
- **Radius** - Border radius values
- **Spacing** - Spacing scale
- **Typography** - Font families, sizes, weights
- **Elevation** - Shadow definitions
- **Breakpoints** - Responsive breakpoints
- **Animation** - Animation durations and easings
- **Z-Index** - Stacking order values

### Token Outputs

#### SCSS (with aliases)
Located in `src/tokens/build/scss/`

Preserves token relationships through SCSS variable aliases:

```scss
// Example: Foundation colors
$blue500: #335CFF;

// Example: Semantic tokens that reference foundations
$bgSoft200: $blue100;
$textPrimary: $gray900;
```

The main index file (`_index.scss`) uses modern `@forward` statements:

```scss
@forward './_foundations';
@forward './tokens-light';      // Light mode semantic tokens
@forward './_theme';
@forward './_radius';
// To use dark mode: @forward './tokens-dark';
```

#### CSS (flat values)
Located in `src/tokens/build/css/`

All values fully resolved for browser use:

```css
/* Flat values, ready for production */
:root {
  --blue500: #335CFF;
  --bgSoft200: #E3EAFF;
  --textPrimary: #141414;
}
```

## 📚 Documentation

Start Storybook to explore the full documentation:

```bash
npm run storybook
```

Visit `http://localhost:6006` to see:
- Complete token documentation
- Component examples
- Interactive playground
- Design guidelines

## 🔧 Development Workflow

### 1. Update Tokens from Figma
Export your tokens from Figma using Tokens Studio and replace `src/from-figma/tokens.json`

### 2. Build Tokens
```bash
npm run build:tokens
```

### 3. Create Components
Add components in `src/components/` using the design tokens:

```tsx
import './Button.scss';

export const Button = () => {
  return <button className="button">Click me</button>;
};
```

```scss
// Button.scss
@use '../tokens/build/scss/index' as *;

.button {
  background-color: $bgPrimary;
  color: $textWhite;
  padding: $spacing12 $spacing24;
  border-radius: $radius8;
  font-size: $fontSize3;
  transition: $transitionStandard;
}
```

### 4. Document in Storybook
Create a story file `Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
```

## 🏗️ Building for Production

### Build Design System Library
```bash
npm run build
```

### Build Storybook Documentation
```bash
npm run build-storybook
```

The static Storybook site will be generated in `storybook-static/` and can be deployed to any static hosting service.

## 🎭 Technology Stack

- **React** 19.0.2
- **TypeScript** 5.9.3
- **Vite** 6.0.7
- **SCSS/Sass** 1.83.4 (modern `@use`/`@forward` syntax)
- **Storybook** 8.6.14

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build:tokens` | Build design tokens from Figma JSON |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build design system library |
| `npm run storybook` | Start Storybook development server |
| `npm run build-storybook` | Build Storybook for production |
| `npm run preview` | Preview production build |

## 🤝 Contributing

1. Update tokens in Figma
2. Export to `src/from-figma/tokens.json`
3. Run `npm run build:tokens`
4. Create/update components
5. Document in Storybook
6. Build and test

## 📄 License

MIT

---

Built with ❤️ using [Style Dictionary](https://amzn.github.io/style-dictionary/) and [Storybook](https://storybook.js.org/)
