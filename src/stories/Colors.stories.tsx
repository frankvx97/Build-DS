import type { Meta } from '@storybook/react';
import { TokenEntry, getSection } from '../utils/tokenParser';
import './Colors.scss';

type Swatch = {
  id: string;
  name: string;
  value: string;
  variable: string;
};

type Section = {
  title: string;
  description?: string;
  swatches: Swatch[];
};

const meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i;

const ColorSwatch = ({ name, value, variable }: Swatch) => (
  <div className="color-swatch">
    <div className="color-swatch__preview" style={{ backgroundColor: HEX_COLOR_REGEX.test(value) ? value : '#ffffff' }} />
    <div className="color-swatch__info">
      <div className="color-swatch__name">{name}</div>
      <div className="color-swatch__value">{value}</div>
      <div className="color-swatch__variable">{variable}</div>
    </div>
  </div>
);

const ColorSection = ({ title, swatches, description }: { title: string; swatches: Swatch[]; description?: string }) => (
  <div className="color-section">
    <h2 className="color-section__title">{title}</h2>
    {description ? <p className="color-section__description">{description}</p> : null}
    <div className="color-section__grid">
      {swatches.map((swatch) => (
        <ColorSwatch key={swatch.id} {...swatch} />
      ))}
    </div>
  </div>
);

export const Foundations = () => {
  const sections = buildFoundationSections();

  return (
    <div className="tokens-page">
      <h1>Foundation Colors</h1>
      <p className="tokens-page__description">
        Base color palette from which all semantic colors are derived. These colors are the building blocks of the design system.
      </p>

      {sections.map((section) => (
        <ColorSection key={section.title} title={section.title} swatches={section.swatches} />
      ))}
    </div>
  );
};

export const SemanticColors = () => {
  const sections = buildSemanticSections();

  return (
    <div className="tokens-page">
      <h1>Semantic Colors</h1>
      <p className="tokens-page__description">
        Purpose-driven colors for backgrounds, text, borders, icons, and overlays. These tokens adapt to the active theme.
      </p>

      {sections.map((section) => (
        <ColorSection key={section.title} title={section.title} swatches={section.swatches} />
      ))}
    </div>
  );
};

export const ThemeColors = () => {
  const primaryTokens = buildThemeSwatches();

  return (
    <div className="tokens-page">
      <h1>Theme Colors</h1>
      <p className="tokens-page__description">
        Primary brand palette resolved from the current theme configuration. Update <code>config/theme.config.js</code> and rebuild
        tokens to switch themes.
      </p>

      <ColorSection title="Primary" swatches={primaryTokens} />

      <div className="theme-note">
        <strong>Note:</strong> Change the theme by editing <code>config/theme.config.js</code> and running <code>npm run build:tokens</code>
      </div>
    </div>
  );
};

function buildFoundationSections(): Section[] {
  const tokens = getSection('Foundations').flatMap((group) => group.tokens);
  const order: string[] = [];
  const groups = new Map<string, { title: string; swatches: Swatch[] }>();

  tokens.forEach((token) => {
    if (!HEX_COLOR_REGEX.test(token.value)) {
      return;
    }

    const { family, subFamily, shadeSegments } = splitTokenName(token);
    const groupTitle = formatFoundationGroupTitle(family, subFamily);
    const swatchName = formatFoundationSwatchName(family, subFamily, shadeSegments);
    const groupKey = buildFoundationGroupKey(family, subFamily);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { title: groupTitle, swatches: [] });
      order.push(groupKey);
    }

    groups.get(groupKey)!.swatches.push({
      id: token.name,
      name: swatchName,
      value: token.value,
      variable: token.variable,
    });
  });

  const FOUNDATION_ORDER = [
    'neutral-gray',
    'neutral-slate',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'sky',
    'blue',
    'purple',
    'pink',
    'alpha-black',
    'alpha-blue',
    'alpha-gray',
    'alpha-green',
    'alpha-orange',
    'alpha-pink',
    'alpha-purple',
    'alpha-red',
    'alpha-sky',
    'alpha-slate',
    'alpha-teal',
    'alpha-white',
    'alpha-yellow',
  ];

  const orderedKeys = [...order].sort((a, b) => {
    const indexA = FOUNDATION_ORDER.indexOf(a);
    const indexB = FOUNDATION_ORDER.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return 0;
    }

    if (indexA === -1) {
      return 1;
    }

    if (indexB === -1) {
      return -1;
    }

    return indexA - indexB;
  });

  return orderedKeys.map((key) => {
    const group = groups.get(key);
    if (!group) {
      return { title: key, swatches: [] };
    }

    return {
      title: group.title,
      swatches: [...group.swatches].sort((a, b) => extractShadeOrder(a.id) - extractShadeOrder(b.id)),
    };
  });
}

function buildSemanticSections(): Section[] {
  const DISPLAY_ORDER = ['Background', 'Text', 'State', 'Icon', 'Stroke', 'Static', 'Overlay', 'Social'];
  const prefixToTitle: Record<string, string> = {
    bg: 'Background',
    text: 'Text',
    state: 'State',
    icon: 'Icon',
    stroke: 'Stroke',
    static: 'Static',
    overlay: 'Overlay',
    social: 'Social',
  };

  const tokens = getSection('Light Tokens').flatMap((group) => group.tokens);
  const groups = new Map<string, Swatch[]>();

  const groupSorters: Record<string, (swatches: Swatch[]) => Swatch[]> = {
    Background: createOrderSorter(['White 0', 'Weak 50', 'Soft 200', 'Sub 300', 'Surface 800', 'Strong 950']),
    Text: createOrderSorter(['Strong 950', 'Sub 600', 'Soft 400', 'Disabled 300', 'White 0']),
    Icon: createOrderSorter(['Strong 950', 'Sub 600', 'Soft 400', 'Disabled 300', 'White 0']),
    Stroke: createOrderSorter(['Strong 950', 'Sub 300', 'Soft 200', 'White 0']),
    Static: createOrderSorter(['Static Black', 'Static White']),
    Overlay: createOrderSorter(['Overlay Slate', 'Overlay Gray']),
  };

  tokens.forEach((token) => {
    if (!HEX_COLOR_REGEX.test(token.value)) {
      return;
    }

    const segments = toSegments(token.name);
    const prefix = segments[0];
    const title = prefixToTitle[prefix];

    if (!title) {
      return;
    }

    if (!groups.has(title)) {
      groups.set(title, []);
    }

    groups.get(title)!.push({
      id: token.name,
      name: formatLabel(segments.slice(1)),
      value: token.value,
      variable: token.variable,
    });
  });

  return DISPLAY_ORDER.filter((title) => groups.has(title)).map((title) => ({
    title,
    swatches: sortSwatches(groups.get(title) ?? [], groupSorters[title]),
  }));
}

function buildThemeSwatches(): Swatch[] {
  const ORDER = ['Base', 'Dark', 'Darker', 'Alpha 10', 'Alpha 16', 'Alpha 24'];
  const orderMap = new Map(ORDER.map((label, index) => [label.toLowerCase(), index]));

  return getSection('Theme')
    .flatMap((group) => group.tokens)
    .filter((token) => HEX_COLOR_REGEX.test(token.value))
    .map((token) => {
      const segments = toSegments(token.name);
      return {
        id: token.name,
        name: formatLabel(segments.slice(1)),
        value: token.value,
        variable: token.variable,
      };
    })
    .sort((a, b) => {
      const indexA = orderMap.get(a.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const indexB = orderMap.get(b.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });
}

function splitTokenName(token: TokenEntry) {
  const segments = toSegments(token.name);
  const family = segments[0] ?? 'other';
  const hasSubFamily = family === 'neutral' || family === 'alpha';
  const subFamily = hasSubFamily ? segments[1] : undefined;
  const shadeSegments = hasSubFamily ? segments.slice(2) : segments.slice(1);

  return { family, subFamily, shadeSegments };
}

function toSegments(name: string): string[] {
  return name
    .replace(/([0-9]+)/g, '-$1')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .split('-')
    .filter(Boolean);
}

function formatFoundationGroupTitle(family: string, subFamily?: string): string {
  if (family === 'neutral' && subFamily) {
    return `Neutral ${capitalize(subFamily)}`;
  }

  if (family === 'alpha' && subFamily) {
    return `Alpha ${capitalize(subFamily)}`;
  }

  return capitalize(family);
}

function formatFoundationSwatchName(family: string, subFamily: string | undefined, shadeSegments: string[]): string {
  const shade = formatLabel(shadeSegments);

  if (family === 'neutral' && subFamily) {
    return `${capitalize(subFamily)} ${shade}`.trim();
  }

  if (family === 'alpha' && subFamily) {
    return `${capitalize(subFamily)} ${shade}`.trim();
  }

  return `${capitalize(family)} ${shade}`.trim();
}

function buildFoundationGroupKey(family: string, subFamily?: string): string {
  if (family === 'neutral' && subFamily) {
    return `neutral-${subFamily}`;
  }

  if (family === 'alpha' && subFamily) {
    return `alpha-${subFamily}`;
  }

  return family;
}

function formatLabel(segments: string[]): string {
  if (segments.length === 0) {
    return '';
  }

  return segments
    .map((segment) => (/^\d+$/.test(segment) ? segment : capitalize(segment)))
    .join(' ');
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractShadeOrder(id: string): number {
  const numericMatch = id.match(/(\d+)(?!.*\d)/);
  if (numericMatch) {
    return Number.parseInt(numericMatch[1], 10);
  }

  return Number.MAX_SAFE_INTEGER;
}

function createOrderSorter(order: string[]): (swatches: Swatch[]) => Swatch[] {
  const orderMap = new Map(order.map((label, index) => [label.toLowerCase(), index]));
  return (swatches: Swatch[]) =>
    [...swatches].sort((a, b) => {
      const indexA = orderMap.get(a.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const indexB = orderMap.get(b.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

      if (indexA === indexB) {
        return a.name.localeCompare(b.name);
      }

      return indexA - indexB;
    });
}

function sortSwatches(swatches: Swatch[], sorter?: (swatches: Swatch[]) => Swatch[]): Swatch[] {
  if (sorter) {
    return sorter(swatches);
  }

  return [...swatches].sort((a, b) => a.name.localeCompare(b.name));
}
