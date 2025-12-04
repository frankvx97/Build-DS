# Naming Conventions

This document describes the naming conventions used throughout the BUILD DS design system.

## Table of Contents

- [SCSS Variable Naming](#scss-variable-naming)
- [Token Structure](#token-structure)
- [Case Style: lowerCamelCase](#case-style-lowercamelcase)
- [Category Reference](#category-reference)
- [Examples](#examples)

---

## SCSS Variable Naming

Our design system uses a **BEM-inspired flat naming convention** for SCSS variables. This approach creates self-documenting, scalable token names that clearly communicate purpose and context.

### Structure Pattern

```
$[category][modifier][intensity]
 ↑          ↑         ↑
 |          |         └─ Numeric scale (0-950) or semantic descriptor
 |          └─────────── Variant/State (Soft, Strong, Weak, etc.)
 └────────────────────── Use case category (bg, text, icon, etc.)
```

### Why This Structure?

✅ **Self-documenting** - Token names clearly describe their purpose  
✅ **Scalable** - Easy to add new modifiers or intensities  
✅ **Purpose-driven** - Names describe intent, not implementation  
✅ **IDE-friendly** - Excellent autocomplete with category prefixes  
✅ **Maintainable** - Easy to find and update related tokens  

---

## Token Structure

### Format Breakdown

Our tokens follow a three-part structure:

1. **Category** - The UI element type (bg, text, icon, state, etc.)
2. **Modifier** - The variant or semantic meaning (Soft, Strong, Error, Success, etc.)
3. **Intensity** - The color ramp value (0-950) or semantic descriptor (Base, Light, Dark)

#### Examples:

```scss
$bgSoft200
 ↑  ↑    ↑
 |  |    └─ Intensity: 200 (medium-light on 0-950 scale)
 |  └────── Modifier: Soft (muted appearance)
 └───────── Category: bg (background)

$stateErrorBase
 ↑     ↑    ↑
 |     |    └─ Intensity: Base (primary/main color)
 |     └────── Modifier: Error (error state)
 └──────────── Category: state (UI state)

$textStrong950
 ↑    ↑      ↑
 |    |      └─ Intensity: 950 (darkest on 0-950 scale)
 |    └──────── Modifier: Strong (high emphasis)
 └───────────── Category: text (text/typography)
```

### Color Intensity Scale

The numeric scale (0-950) represents color lightness/darkness:

| Range | Description | Use Case |
|-------|-------------|----------|
| **0** | Lightest (white or near-white) | Light backgrounds, white text |
| **50-100** | Very light, subtle | Weak variants, hover states |
| **200-300** | Light to medium-light | Soft backgrounds, subtle elements |
| **400-600** | Medium | Standard text, icons, balanced contrast |
| **800-900** | Dark | Dark surfaces, high contrast text |
| **950** | Darkest (black or near-black) | Strong emphasis, maximum contrast |

---

## Case Style: lowerCamelCase

All SCSS variables use **lowerCamelCase** (also called camelCase).

### What is lowerCamelCase?

A naming style where:
- The **first word starts with lowercase**
- **Each subsequent word starts with uppercase**
- **No spaces, hyphens, or underscores**

### Examples:

```scss
$bgSoft200        // bg + Soft + 200
$textStrong950    // text + Strong + 950
$stateErrorBase   // state + Error + Base
$stateWarningDark // state + Warning + Dark
$iconDisabled300  // icon + Disabled + 300
$socialAmazon     // social + Amazon
```

### Why lowerCamelCase?

✅ **SCSS Convention** - Preferred style in the Sass/SCSS community  
✅ **Readability** - Clean and easy to read without delimiters  
✅ **JavaScript Consistency** - Matches JS/TS variable naming (enables sharing token names across languages)  
✅ **No Escaping Needed** - Unlike kebab-case, doesn't require special handling in SCSS  
✅ **IDE Support** - Works seamlessly with autocomplete and IntelliSense  
✅ **Type Safety** - Easy to generate TypeScript types from token names  

### Comparison with Other Styles:

| Style | Example | Notes |
|-------|---------|-------|
| **lowerCamelCase** | `$bgSoft200` | ✅ Our choice - SCSS best practice |
| **kebab-case** | `$bg-soft-200` | Common for CSS custom properties (`--bg-soft-200`) |
| **snake_case** | `$bg_soft_200` | Less common in modern CSS/SCSS |
| **UPPER_SNAKE_CASE** | `$BG_SOFT_200` | Typically for constants |
| **PascalCase** | `$BgSoft200` | Common for class names, not variables |

### Technical Implementation

The lowerCamelCase conversion is implemented in `config/build-tokens.js` through the `toCamelCaseName()` function:

```javascript
// Line 61-73 in config/build-tokens.js
function toCamelCaseName(pathSegments) {
  const words = stripRoot(pathSegments).flatMap(segmentToWords);
  if (!words.length) {
    return 'token';
  }
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;  // ← First word stays lowercase
      return lower.charAt(0).toUpperCase() + lower.slice(1);  // ← Rest capitalize
    })
    .join('');
}
```

This function is used by `toScssVar()` to generate SCSS variable names:

```javascript
// Line 88-94 in config/build-tokens.js
function toScssVar(pathSegments) {
  let name = toCamelCaseName(pathSegments);  // ← Applies lowerCamelCase
  if (/^\d/.test(name)) {
    name = `n${name}`;  // Prefix with 'n' if starts with number
  }
  return `$${name}`;  // Add $ prefix for SCSS
}
```

**Conversion Process Example:**

1. Token path from Figma: `['Tokens/Light', 'bg', 'soft', '200']`
2. `stripRoot()` removes first segment: `['bg', 'soft', '200']`
3. `segmentToWords()` splits into words: `['bg', 'soft', '200']`
4. `toCamelCaseName()` applies lowerCamelCase:
   - First word: `'bg'` (stays lowercase)
   - Second word: `'soft'` → `'Soft'` (capitalize first letter)
   - Third word: `'200'` → `'200'` (numbers stay as-is)
   - Result: `'bgSoft200'`
5. `toScssVar()` adds `$` prefix: `'$bgSoft200'`

**For CSS (kebab-case):**

A parallel function `toKebabCaseName()` generates CSS custom property names:

```javascript
// Line 75-82 in config/build-tokens.js
function toKebabCaseName(pathSegments) {
  const parts = stripRoot(pathSegments).flatMap(segmentToWords);
  if (!parts.length) {
    return 'token';
  }
  return parts.map((part) => part.toLowerCase()).join('-');
}
```

Which produces: `--bg-soft-200` for CSS custom properties.

**Key Insight:** The naming convention is enforced at the build script level, ensuring consistency across all generated token files. To modify the naming pattern (e.g., switching to snake_case or PascalCase), you would update these utility functions in `config/build-tokens.js`.

---

## Category Reference

### Core Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **bg** | Background colors | `$bgWhite0`, `$bgSoft200`, `$bgStrong950` |
| **text** | Text/typography colors | `$textWhite0`, `$textSoft400`, `$textStrong950` |
| **icon** | Icon colors | `$iconWhite0`, `$iconSoft400`, `$iconSub600` |
| **stroke** | Border/outline colors | `$strokeSoft200`, `$strokeSub300`, `$strokeStrong950` |
| **state** | UI state colors | `$stateErrorBase`, `$stateSuccessLight`, `$stateWarningDark` |
| **overlay** | Overlay/scrim colors | `$overlayOverlayGray`, `$overlayOverlaySlate` |
| **illustration** | Illustration/graphic colors | `$illustrationWeak100`, `$illustrationStrong400` |
| **social** | Brand/social media colors | `$socialGithub`, `$socialTwitter`, `$socialNotion` |
| **static** | Fixed colors (light/dark) | `$staticStaticWhite`, `$staticStaticBlack` |

### Common Modifiers

| Modifier | Meaning | When to Use |
|----------|---------|-------------|
| **White0** | Lightest, almost white | Light backgrounds, white text |
| **Weak50-100** | Very light, subtle | Subtle backgrounds, disabled states |
| **Soft200-400** | Soft, muted appearance | Secondary backgrounds, soft emphasis |
| **Sub300-600** | Subtle, subdued | Tertiary elements, subtle text |
| **Surface800** | Dark surface | Dark mode surfaces |
| **Strong950** | Darkest, most prominent | Primary text, high contrast elements |
| **Disabled** | Disabled state | Inactive or unavailable elements |
| **Base** | Semantic base color | Primary state color |
| **Light/Lighter** | Light variants | Hover states, backgrounds |
| **Dark** | Dark variant | Text on light backgrounds, dark emphasis |

---

## Examples

### Background Tokens

```scss
// Light to dark progression
$bgWhite0: $neutralSlate0;          // Pure white
$bgWeak50: $neutralSlate50;         // Very light gray
$bgSoft200: $neutralSlate200;       // Soft gray background
$bgSub300: $neutralSlate300;        // Subtle gray
$bgSurface800: $neutralSlate800;    // Dark surface
$bgStrong950: $neutralSlate950;     // Near black
```

### Text Tokens

```scss
// Emphasis levels
$textWhite0: $neutralSlate0;        // White text (dark backgrounds)
$textDisabled300: $neutralSlate300; // Disabled text
$textSoft400: $neutralSlate400;     // Soft/secondary text
$textSub600: $neutralSlate600;      // Subtle/tertiary text
$textStrong950: $neutralSlate950;   // Primary/strong text
```

### State Tokens

```scss
// Error state variations
$stateErrorBase: $red500;           // Base error color
$stateErrorLight: $red200;          // Light error (backgrounds)
$stateErrorLighter: $red50;         // Lightest error (hover/focus)
$stateErrorDark: $red950;           // Dark error (text)

// Success state variations
$stateSuccessBase: $green500;       // Base success color
$stateSuccessLight: $green200;      // Light success
$stateSuccessLighter: $green50;     // Lightest success
$stateSuccessDark: $green950;       // Dark success
```

### Icon Tokens

```scss
// Icon color hierarchy
$iconWhite0: $neutralSlate0;        // White icons
$iconDisabled300: $neutralSlate300; // Disabled icons
$iconSoft400: $neutralSlate400;     // Soft/secondary icons
$iconSub600: $neutralSlate600;      // Subtle icons
$iconStrong950: $neutralSlate950;   // Primary/strong icons
```

### Stroke/Border Tokens

```scss
// Border emphasis
$strokeWhite0: $neutralSlate0;      // White borders
$strokeSoft200: $neutralSlate200;   // Soft borders
$strokeSub300: $neutralSlate300;    // Subtle borders
$strokeStrong950: $neutralSlate950; // Strong borders
```

### Social/Brand Tokens

```scss
// Brand colors (exact brand values)
$socialGithub: #24292f;
$socialTwitter: #010101;
$socialNotion: #1e2226;
$socialApple: #000000;
```

---

## Usage Guidelines

### ✅ Do:

- Use semantic token names that describe purpose
- Choose tokens based on their semantic meaning, not their visual appearance
- Follow the category → modifier → intensity pattern consistently
- Use the appropriate intensity for the context (e.g., `$textStrong950` for primary text)

### ❌ Don't:

- Don't use foundation tokens directly (e.g., `$red500`) - use semantic tokens instead (e.g., `$stateErrorBase`)
- Don't create custom token names that break the naming pattern
- Don't use hardcoded color values - always use tokens
- Don't mix naming conventions (stick with lowerCamelCase)

### Example: Choosing the Right Token

```scss
// ✅ Good - Semantic and purposeful
.button {
  background-color: $bgStrong950;
  color: $textWhite0;
  border: 1px solid $strokeSub300;
}

.button:disabled {
  background-color: $bgSoft200;
  color: $textDisabled300;
}

// ❌ Bad - Using foundation tokens directly
.button {
  background-color: $neutralSlate950; // Use $bgStrong950 instead
  color: $neutralSlate0;              // Use $textWhite0 instead
}
```

---

## Token Architecture

Our token system has three layers:

1. **Foundation Tokens** - Core color palette (`$red500`, `$blue200`, etc.)
   - Raw color values
   - Numeric scale (0-950)
   - Not used directly in components

2. **Semantic Tokens** - Purpose-driven mappings (`$bgSoft200`, `$textStrong950`)
   - Reference foundation tokens
   - Named by purpose/context
   - **Primary layer for component development**

3. **Component Tokens** - Component-specific values (if needed)
   - Reference semantic tokens
   - Specific to individual components

This layered approach provides:
- **Flexibility** - Change themes by swapping semantic token values
- **Consistency** - Reuse patterns across components
- **Maintainability** - Update colors globally via semantic tokens
- **Scalability** - Easy to extend with new tokens

---

## Additional Resources

- [Design Tokens W3C Specification](https://www.w3.org/community/design-tokens/)
- [Figma Tokens Documentation](https://docs.tokens.studio/)
- [SCSS Style Guide](https://sass-lang.com/styleguide)
- [More about Casings](https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/)

---

**Last Updated:** October 27, 2025  
**Maintained by:** BUILD DS Team
