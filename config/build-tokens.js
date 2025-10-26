/**
 * BUILD DESIGN SYSTEM - TOKEN BUILD SCRIPT
 *
 * Rebuilds the SCSS (alias-preserving) and CSS (flat value) token files
 * based on the current Tokens Studio export located in
 * `src/from-figma/tokens.json`.
 */

import { promises as fs } from 'fs';

const TOKENS_FILE = 'src/from-figma/tokens.json';
const BUILD_ROOT = 'src/tokens/build';
const SCSS_DIR = `${BUILD_ROOT}/scss`;
const CSS_DIR = `${BUILD_ROOT}/css`;

const OUTPUT_MANIFEST = [
  { title: 'Foundations', roots: ['Foundations'], scss: '_foundations.scss', css: 'foundations.css' },
  { title: 'Light Tokens', roots: ['Tokens/Light'], scss: 'tokens-light.scss', css: 'tokens-light.css' },
  { title: 'Dark Tokens', roots: ['Tokens/Dark'], scss: 'tokens-dark.scss', css: 'tokens-dark.css' },
  { title: 'Theme', roots: ['Theme'], scss: '_theme.scss', css: 'theme.css' },
  { title: 'Radius', roots: ['Radius'], scss: '_radius.scss', css: 'radius.css' },
  { title: 'Spacing', roots: ['Spacing'], scss: '_spacing.scss', css: 'spacing.css' },
  { title: 'Typography', roots: ['Typography'], scss: '_typography.scss', css: 'typography.css' },
  { title: 'Elevation', roots: ['Elevation'], scss: '_elevation.scss', css: 'elevation.css' },
  { title: 'Breakpoints', roots: ['Breakpoints'], scss: '_breakpoints.scss', css: 'breakpoints.css' },
  { title: 'Animation', roots: ['Animation'], scss: '_animation.scss', css: 'animation.css' },
  { title: 'Z-Index', roots: ['Z-Index'], scss: '_z-index.scss', css: 'z-index.css' },
];

const SHORT_KEY_ROOTS = new Set([
  'Foundations',
  'Theme',
  'Radius',
  'Spacing',
  'Typography',
  'Animation',
  'Breakpoints',
  'Z-Index',
  'Elevation',
]);

console.log('\n🎨 BUILD DS - Token Build Process');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function stripRoot(pathSegments) {
  if (pathSegments.length <= 1) {
    return [...pathSegments];
  }
  return pathSegments.slice(1);
}

function segmentToWords(segment) {
  return segment
    .replace(/\//g, ' ')
    .split(/[\s_-]+/)
    .flatMap((part) => part.split(/(?<=[a-z0-9])(?=[A-Z])/))
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
}

function toCamelCaseName(pathSegments) {
  const words = stripRoot(pathSegments).flatMap(segmentToWords);
  if (!words.length) {
    return 'token';
  }
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function toKebabCaseName(pathSegments) {
  const parts = stripRoot(pathSegments).flatMap(segmentToWords);
  if (!parts.length) {
    return 'token';
  }
  return parts.map((part) => part.toLowerCase()).join('-');
}

function toScssVar(pathSegments) {
  let name = toCamelCaseName(pathSegments);
  if (/^\d/.test(name)) {
    name = `n${name}`;
  }
  return `$${name}`;
}

function toCssVar(pathSegments) {
  let name = toKebabCaseName(pathSegments);
  if (/^\d/.test(name)) {
    name = `n-${name}`;
  }
  return `--${name}`;
}

function normalizeRefKey(key) {
  return key
    .replace(/\s+/g, ' ')
    .replace(/\s/g, ' ')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
}

function flattenTokens(node, currentPath = []) {
  const entries = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    const nextPath = [...currentPath, key];
    if (value && typeof value === 'object' && '$value' in value) {
      entries.push({
        path: nextPath,
        root: nextPath[0],
        value: value.$value,
        type: value.$type ?? null,
        description: value.$description ?? null,
      });
    } else if (value && typeof value === 'object') {
      entries.push(...flattenTokens(value, nextPath));
    }
  }
  return entries;
}

function registerReference(map, token) {
  const fullKey = normalizeRefKey(token.path.join('.'));
  if (!map.has(fullKey)) {
    map.set(fullKey, token);
  }

  if (SHORT_KEY_ROOTS.has(token.root)) {
    const shortSegments = token.path.slice(1);
    if (shortSegments.length) {
      const shortKey = normalizeRefKey(shortSegments.join('.'));
      if (!map.has(shortKey)) {
        map.set(shortKey, token);
      }
    }
  }
}

function escapeDoubleQuotes(value) {
  return value.replace(/"/g, '\\"');
}

function shouldQuoteCss(value, type) {
  if (typeof value !== 'string') return false;
  if (value === '') return true;
  if (/^#/.test(value)) return false;
  if (/^-?\d*\.?\d+(px|rem|em|ms|s|%)?$/.test(value)) return false;
  if (/^[a-zA-Z-]+\(/.test(value)) return false;
  if (/^var\(/.test(value) || /^calc\(/.test(value)) return false;
  if (type === 'color') return false;
  if (type === 'fontFamilies') return true;
  if (type === 'fontWeights') return /\s/.test(value);
  return false;
}

function shouldQuoteScss(value, type) {
  if (typeof value !== 'string') return false;
  if (value === '') return true;
  if (/^#/.test(value)) return false;
  if (/^-?\d*\.?\d+(px|rem|em|ms|s|%)?$/.test(value)) return false;
  if (/^[a-zA-Z-]+\(/.test(value)) return false;
  if (/^var\(/.test(value) || /^calc\(/.test(value)) return false;
  if (type === 'color') return false;
  return value.includes(' ') || /[A-Z]/.test(value) || /[^a-z0-9_-]/i.test(value);
}

function formatScssValue(token, getTokenByReference) {
  const raw = token.value;
  if (typeof raw === 'string') {
    const refPattern = /\{([^}]+)\}/g;
    const matches = [...raw.matchAll(refPattern)];
    if (matches.length) {
      if (matches.length === 1 && raw.trim() === matches[0][0]) {
        const refToken = getTokenByReference(matches[0][1]);
        return toScssVar(refToken.path);
      }
      const replaced = raw.replace(refPattern, (_, refKey) => {
        const refToken = getTokenByReference(refKey);
        return `#{${toScssVar(refToken.path)}}`;
      });
      return `"${escapeDoubleQuotes(replaced)}"`;
    }
    if (shouldQuoteScss(raw, token.type)) {
      return `"${escapeDoubleQuotes(raw)}"`;
    }
    return raw;
  }
  if (typeof raw === 'number') {
    return raw;
  }
  return JSON.stringify(raw);
}

function resolveTokenValue(token, getTokenByReference, cache, stack = new Set()) {
  const key = token.path.join('>');
  if (cache.has(key)) {
    return cache.get(key);
  }
  if (stack.has(key)) {
    throw new Error(`Circular token reference detected for ${token.path.join('.')}`);
  }

  stack.add(key);
  let resolved;
  if (typeof token.value === 'string') {
    const refPattern = /\{([^}]+)\}/g;
    resolved = token.value.replace(refPattern, (_, refKey) => {
      const refToken = getTokenByReference(refKey);
      const refValue = resolveTokenValue(refToken, getTokenByReference, cache, stack);
      return String(refValue);
    });
  } else {
    resolved = token.value;
  }
  stack.delete(key);
  cache.set(key, resolved);
  return resolved;
}

function formatCssValue(token, resolvedValue) {
  if (typeof resolvedValue === 'number') {
    return resolvedValue;
  }
  if (typeof resolvedValue === 'string') {
    if (shouldQuoteCss(resolvedValue, token.type)) {
      return `"${escapeDoubleQuotes(resolvedValue)}"`;
    }
    return resolvedValue;
  }
  return JSON.stringify(resolvedValue);
}

function buildScss(tokens, getTokenByReference, title) {
  const sorted = [...tokens].sort((a, b) => {
    const aKey = toKebabCaseName(a.path);
    const bKey = toKebabCaseName(b.path);
    if (aKey === bKey) {
      return a.path.join('.').localeCompare(b.path.join('.'));
    }
    return aKey.localeCompare(bKey);
  });

  const header = [
    `// BUILD DESIGN SYSTEM - ${title} (SCSS)` ,
    `// Generated on ${new Date().toISOString()}`,
    '',
  ];

  // Split into base (literal) and alias (reference) tokens to avoid forward refs
  const baseTokens = [];
  const aliasTokens = [];
  for (const token of sorted) {
    const value = formatScssValue(token, getTokenByReference);
    const entry = { token, value };
    if (typeof value === 'string' && value.startsWith('$')) {
      aliasTokens.push(entry);
    } else {
      baseTokens.push(entry);
    }
  }

  const lines = [...header];

  // Emit base tokens first
  let currentBaseSection = null;
  for (const { token, value } of baseTokens) {
    const section = token.path[1] ?? token.path[0];
    if (section !== currentBaseSection) {
      currentBaseSection = section;
      lines.push(`// ${section}`);
    }
    lines.push(`${toScssVar(token.path)}: ${value};`);
  }

  // Then emit alias tokens
  if (aliasTokens.length) {
    lines.push('');
    let currentAliasSection = null;
    for (const { token, value } of aliasTokens) {
      const section = token.path[1] ?? token.path[0];
      if (section !== currentAliasSection) {
        currentAliasSection = section;
        lines.push(`// ${section}`);
      }
      lines.push(`${toScssVar(token.path)}: ${value};`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function buildCss(tokens, getTokenByReference, title, cache) {
  const sorted = [...tokens].sort((a, b) => {
    const aKey = toKebabCaseName(a.path);
    const bKey = toKebabCaseName(b.path);
    if (aKey === bKey) {
      return a.path.join('.').localeCompare(b.path.join('.'));
    }
    return aKey.localeCompare(bKey);
  });

  const lines = [
    `/* BUILD DESIGN SYSTEM - ${title} (CSS) */`,
    ':root {',
  ];

  for (const token of sorted) {
    const resolvedValue = resolveTokenValue(token, getTokenByReference, cache);
    const formatted = formatCssValue(token, resolvedValue);
    lines.push(`  ${toCssVar(token.path)}: ${formatted};`);
  }

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

try {
  console.log('📄 Reading tokens from src/from-figma/tokens.json');
  const tokensContent = await fs.readFile(TOKENS_FILE, 'utf-8');
  const tokensJson = JSON.parse(tokensContent);

  const flatTokens = flattenTokens(tokensJson);
  const referenceMap = new Map();
  flatTokens.forEach(token => registerReference(referenceMap, token));

  const getTokenByReference = (refKey) => {
    const normalizedKey = normalizeRefKey(refKey);
    const token = referenceMap.get(normalizedKey);
    if (!token) {
      throw new Error(`Unable to resolve token reference: ${refKey}`);
    }
    return token;
  };

  console.log('🧹 Resetting build directory');
  await fs.rm(BUILD_ROOT, { recursive: true, force: true });
  await fs.mkdir(SCSS_DIR, { recursive: true });
  await fs.mkdir(CSS_DIR, { recursive: true });

  const cssResolveCache = new Map();
  const scssByFile = new Map();

  for (const output of OUTPUT_MANIFEST) {
    const matchingTokens = flatTokens.filter(token => output.roots.includes(token.root));
    if (matchingTokens.length === 0) {
      continue;
    }

    console.log(`🔨 Building ${output.title} (${matchingTokens.length} tokens)`);

    // No need to manually specify - auto-detection will handle it
    const scssContent = buildScss(matchingTokens, getTokenByReference, output.title);
    const cssContent = buildCss(matchingTokens, getTokenByReference, output.title, cssResolveCache);

    await fs.writeFile(`${SCSS_DIR}/${output.scss}`, scssContent, 'utf-8');
    await fs.writeFile(`${CSS_DIR}/${output.css}`, cssContent, 'utf-8');

    scssByFile.set(output.scss, scssContent);
  }

  // Build all-in-one SCSS file by concatenating sections in dependency-safe order
  const order = [
    '_foundations.scss',
    'tokens-light.scss',
    '_theme.scss',
    '_radius.scss',
    '_spacing.scss',
    '_typography.scss',
    '_elevation.scss',
    '_breakpoints.scss',
    '_animation.scss',
    '_z-index.scss',
  ];
  const allHeader = `// BUILD DESIGN SYSTEM - All Tokens (Light Mode)\n// Auto-generated on ${new Date().toISOString()}\n\n`;
  const concatenated = order.map((file) => scssByFile.get(file) || '').join('\n');
  await fs.writeFile(`${SCSS_DIR}/_all.scss`, allHeader + concatenated, 'utf-8');

  const defaultForwards = OUTPUT_MANIFEST
    .filter(output => output.scss !== 'tokens-dark.scss')
    .map(output => `@use './${output.scss.replace(/\.scss$/, '')}' as *;`)
    .join('\n');

  const indexContent = `// BUILD DESIGN SYSTEM - Generated SCSS Tokens\n// Auto-generated on ${new Date().toISOString()}\n\n// Use this single file for all tokens\n@use './all' as *;\n\n// Or use individual files (not recommended due to dependency issues):\n// ${defaultForwards.replace(/\n/g, '\n// ')}\n// To switch to dark semantic tokens, replace tokens-light with:\n// @use './tokens-dark' as *;\n`;
  await fs.writeFile(`${SCSS_DIR}/_index.scss`, indexContent, 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Token build completed successfully!');
  console.log('\n📁 Output locations:');
  console.log(`   SCSS (with aliases): ${SCSS_DIR}`);
  console.log(`   CSS (flat values): ${CSS_DIR}\n`);
} catch (error) {
  console.error('❌ Error building tokens:', error);
  process.exit(1);
}
