# Design System Implementation and Architecture

## Source

The design system foundation will be built based on the exported tokens from Figma (~src/from-figma/tokens.json). You should also reference the original figma file via Figma MCP (https://www.figma.com/design/a2A9xd6rJO7asaHl1zhgVl/Align-UI-%E2%9C%A6-Design-System--1.1-?node-id=553-14956&t=ycJLhconLSZu3GS6-1)

## Tasks

Create a full-fledged design system called **Build DS**, using SD Transorms (2.0.1), Style Dictionary (5.04), React (10.2), Typescript (5.9.3), Vite (7.1.12) and Storybook (9.1)

Install all the dependencies required based on the mentioned stack.

### 1. Processing tokens from Figma

According to Tokens Studio Docs, Tokens coming from Tokens Studio require an additional step: @Tokens-studio/sd-transforms, an npm package that prepares Tokens for Style Dictionary. Read the instructions in (https://www.npmjs.com/package/@tokens-studio/sd-transforms) and install that utility and use it to prepare the JSON tokens for Style Dictionary.

### 2. Build Tokens to Output formats (SCSS)

Now with Style Dictionary, you will convert those tokens to SCSS in separated files,(~src/tokens/build/) each file per token set. Also specify in the tokens build config file, that "outputReferences: true" for SCSS (preserves alias references) and "outputReferences: false" for CSS (flat hex/numeric values).

Notice that the following Collections/Sets ("01-Tokens", "02-Neutral", "03-Theme") have multiple modes or sets.
* Tokens: Stablishes the overall appereance, Light (Light mode should be default) or Dark mode.
* Neutral: Defines the hue of the grey palette (Gray is default)
* Theme: Thought to be used for multibrand purposes (Blue default)

Build tokens output:
npm run build:tokens

Debug if necessary.

### 3. Design System Documentation
If previous task has been completed successfully, continue to this one.
Using storybook, create a solid documentation that can showcase the foundations and structure of the design system. This should include:
* Interactive Docs
* Component Playground
* Visual Testing
* Design Token Showcase

Build for production. Debug if necessary
npm run build              # Build design system
npm run build-storybook    # Build Storybook static site

### 4. Component Build for testing: Button
Only proceed to this task if the previous has been completed successfully. If ready, ask me before continuing.

# 🏗️ System Overview

## 📐 Architecture Layers

### Layer 1: Design Tokens (Foundation - From Figma/Figma MCP)
```
┌─────────────────────────────────────────────────────────┐
│                 BUILD DESIGN SYSTEM                     │
│                                                         │
│  Foundations                                            │
│  Tokens                                                 │
│  Neutral                                                │
│  Theme                                                  │
│  Radius                                                 │
│  Spacing                                                │
│  Typography                                             │
│  Elevation                                              │
│  Breakpoints                                            │
│  Animation                                              │
│  Z-Index 

                                                          │
│  ↓ Imported by                                          │
└─────────────────────────────────────────────────────────┘
```

### Layer 2: Global Styles
```
┌───────────────────────────────────────────────────┐
│              GLOBAL STYLES                        │
│                                                   │
│  • SD Transforms                                  │
│  • Style Dictionary                               │
│  • Build Production Tokens:                       │
│    • SCSS (Alias)                                 │
│    • CSS (Flat)                                   │
│  ↓ Used by                                        │
└───────────────────────────────────────────────────┘
```

### Layer 3: Components
```
┌───────────────────────────────────────────────────┐
│              REACT COMPONENTS                      │
│                                                    │
│  Button • Card • Input • ... (your components)    │
│                                                    │
│  Each component:                                   │
│  • .tsx (Logic)                                   │
│  • .scss (Styles using tokens)                    │
│  • .stories.tsx (Documentation)                   │
│                                                    │
│  ↓ Documented in                                  │
└───────────────────────────────────────────────────┘
```

### Layer 4: Storybook
```
┌───────────────────────────────────────────────────┐
│              STORYBOOK                             │
│                                                    │
│  • Interactive Documentation                       │
│  • Component Playground                            │
│  • Visual Testing                                  │
│  • Design Token Showcase                           │
└───────────────────────────────────────────────────┘
```

---

# 🔄 Token Flow

```
┌──────────────┐
│ tokens.json  │  ← Raw design tokens
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ colors.scss  │
│ spacing.scss │
│ typography...│  ← built tokens
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ index.scss   │  ← Token aggregator
└──────┬───────┘    (exports all tokens)
       │
       ├─────────────────────────────┐
       ↓                             ↓
┌──────────────┐            ┌──────────────┐
│ global.scss  │            │ Component    │
│              │            │ .scss files  │
└──────────────┘            └──────────────┘
       │                             │
       └──────────┬──────────────────┘
                  ↓
          ┌──────────────┐
          │  Storybook   │
          │  (Preview)   │
          └──────────────┘
```

---

# 🎨 Token Hierarchy

```
┌────────────────────────────────────────────────┐
│            BASE TOKENS (Foundations)           │
│                                                │
│  $blue-500: #335CFF;                         │
│  $font-size-3: 16px;                           │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│         SEMANTIC TOKENS (Tokens)               │
│                                                │
│ Light and Dark Mode                            │
│ $state-success-base: $blue-500                 │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│               THEMING (Theme)                  │
│                                                │
│ Blue / Purple / Orange / Sky                   │
│ $primary-base: $blue-500                       │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│        COMPONENT STYLES (Application)           │
│                                                 │
│  .button {                                      │
│    background: $color-interactive-default;     │
│    padding: $spacing-md;                       │
│    font-size: $body-base-size;                 │
│  }                                              │
└────────────────────────────────────────────────┘
```

---

# Expected outcome
1. Tokens built for production in SCSS (aliased) and CSS (flat) converted using Style Dictionary.
2. Design System documentation using Storybook

