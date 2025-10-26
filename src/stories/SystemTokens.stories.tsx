import { useEffect, useMemo, useState } from 'react';
import type { Meta } from '@storybook/react';
import { getSection } from '../utils/tokenParser';
import './SystemTokens.scss';

type TableRow = {
  id: string;
  label: string;
  value: string;
  variable: string;
};

type AnimationRow = TableRow & {
  previewValue: string;
};

type ElevationProperty = {
  name: string;
  rawValue: string;
  displayValue: string;
  variable: string;
};

type ElevationLayer = {
  index: number;
  properties: ElevationProperty[];
};

type ElevationGroup = {
  id: string;
  label: string;
  layers: ElevationLayer[];
  boxShadow: string | null;
};

const meta: Meta = {
  title: 'Design Tokens/System',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Elevation = () => {
  const groups = buildElevationGroups();

  return (
    <div className="tokens-page">
      <h1>Elevation</h1>
      <p className="tokens-page__description">
        Shadow tokens representing component elevation stacks. Each card previews the resolved <code>box-shadow</code> output and exposes
        the raw token values.
      </p>

      <div className="elevation-grid">
        {groups.map((group) => (
          <div key={group.id} className="elevation-card">
            <div className="elevation-card__preview" style={{ boxShadow: group.boxShadow ?? 'none' }} />
            <div className="elevation-card__header">
              <div className="elevation-card__title">{group.label}</div>
              <div className="elevation-card__shadow">{group.boxShadow ?? 'No shadow defined'}</div>
            </div>

            {group.layers.map((layer) => (
              <div key={layer.index}>
                <div className="elevation-card__layer-title">Layer {layer.index}</div>
                <table className="tokens-table tokens-table--compact">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                      <th>Variable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layer.properties.map((property) => (
                      <tr key={property.variable}>
                        <td>{property.name}</td>
                        <td>{property.displayValue}</td>
                        <td>
                          <code>{property.variable}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Breakpoints = () => {
  const rows = buildBreakpointRows();

  return (
    <div className="tokens-page">
      <h1>Breakpoints</h1>
      <p className="tokens-page__description">Viewport breakpoints that drive responsive layouts.</p>

      <table className="tokens-table">
        <thead>
          <tr>
            <th>Breakpoint</th>
            <th>Value</th>
            <th>Variable</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>{row.value}</td>
              <td>
                <code>{row.variable}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Animation = () => {
  const groups = buildAnimationGroups();

  return (
    <div className="tokens-page">
      <h1>Animation</h1>
      <p className="tokens-page__description">Duration, easing, and transition tokens for motion design.</p>

      {groups.map((group) => (
        <section key={group.title} style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: 600 }}>{group.title}</h2>
          <table className="tokens-table tokens-table--compact tokens-table--animation">
            <thead>
              <tr>
                <th>Token</th>
                <th>Value</th>
                <th>Variable</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td>{row.value}</td>
                  <td>
                    <code>{row.variable}</code>
                  </td>
                  <td className="tokens-table__preview">
                    <AnimationPreview category={group.title} value={row.previewValue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
};

const AnimationPreview = ({ category, value }: { category: string; value: string }) => {
  if (!value) {
    return <span className="animation-preview__placeholder">—</span>;
  }

  if (category === 'Duration') {
    return <MotionPreview duration={value} />;
  }

  if (category === 'Easing') {
    return <MotionPreview duration="900ms" easing={value} />;
  }

  if (category === 'Transitions') {
    return <TransitionPreview transition={value} />;
  }

  return <span className="animation-preview__placeholder">—</span>;
};

const MotionPreview = ({ duration, easing }: { duration: string; easing?: string }) => {
  const durationMs = useMemo(() => parseDurationToMs(duration, 600), [duration]);
  const timingFunction = easing && isTimingFunction(easing) ? easing : 'cubic-bezier(0.4, 0, 0.2, 1)';
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timeouts: number[] = [];
    let cancelled = false;

    const schedule = () => {
      if (cancelled) {
        return;
      }

      timeouts.push(
        window.setTimeout(() => {
          if (cancelled) {
            return;
          }

          setActive(true);

          timeouts.push(
            window.setTimeout(() => {
              if (cancelled) {
                return;
              }

              setActive(false);
              schedule();
            }, durationMs + 1000),
          );
        }, 1000),
      );
    };

    schedule();

    return () => {
      cancelled = true;
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [durationMs]);

  return (
    <div className="animation-preview animation-preview--motion">
      <div className="animation-preview__track">
        <div
          className={`animation-preview__dot${active ? ' animation-preview__dot--active' : ''}`}
          style={{
            transitionDuration: `${durationMs}ms`,
            transitionTimingFunction: timingFunction,
          }}
        />
      </div>
    </div>
  );
};

const TransitionPreview = ({ transition }: { transition: string }) => {
  const [active, setActive] = useState(false);
  const sanitized = useMemo(() => normalizeTransition(transition), [transition]);
  const targetsOpacity = useMemo(() => /(^|\s)(all|opacity)\b/i.test(sanitized), [sanitized]);

  useEffect(() => {
    const interval = window.setInterval(() => setActive((previous) => !previous), 1600);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="animation-preview animation-preview--transition">
      <div
        className="animation-preview__box"
        style={{
          transition: sanitized,
          transform: active ? 'translateX(60px) scale(1.08)' : 'translateX(0) scale(1)',
          opacity: targetsOpacity ? (active ? 0.45 : 1) : 1,
        }}
      />
    </div>
  );
};

export const ZIndex = () => {
  const rows = buildZIndexRows();

  return (
    <div className="tokens-page">
      <h1>Z-Index</h1>
      <p className="tokens-page__description">Layering scale that controls stacking context across surfaces.</p>

      <table className="tokens-table">
        <thead>
          <tr>
            <th>Usage</th>
            <th>Value</th>
            <th>Variable</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>{row.value}</td>
              <td>
                <code>{row.variable}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function buildBreakpointRows(): TableRow[] {
  return getSection('Breakpoints')
    .flatMap((group) => group.tokens)
    .map((token) => ({
      id: token.name,
      label: formatBreakpointLabel(token.name),
      value: token.value,
      variable: token.variable,
    }))
    .sort((a, b) => extractNumericValue(a.value) - extractNumericValue(b.value));
}

function buildAnimationGroups(): { title: string; rows: AnimationRow[] }[] {
  const order = ['Duration', 'Easing', 'Transitions'];
  const groups = new Map<string, AnimationRow[]>();

  getSection('Animation')
    .flatMap((group) => group.tokens)
    .forEach((token) => {
      const segments = toSegments(token.name);
      const category = segments[1] ?? 'general';
      const title = formatAnimationGroupTitle(category);
      if (!groups.has(title)) {
        groups.set(title, []);
      }

      const value = title === 'Transitions' ? stripQuotes(token.value) : token.value;

      groups.get(title)!.push({
        id: token.name,
        label: formatLabel(segments.slice(2)),
        value,
        variable: token.variable,
        previewValue: value,
      });
    });

  return order
    .filter((title) => groups.has(title))
    .map((title) => ({
      title,
      rows: groups.get(title) ?? [],
    }));
}

function buildZIndexRows(): TableRow[] {
  return getSection('Z-Index')
    .flatMap((group) => group.tokens)
    .map((token) => ({
      id: token.name,
      label: formatZIndexLabel(token.name),
      value: token.value,
      variable: token.variable,
    }))
    .sort((a, b) => Number.parseInt(a.value, 10) - Number.parseInt(b.value, 10));
}

function buildElevationGroups(): ElevationGroup[] {
  const propertyOrder = ['Type', 'X', 'Y', 'Blur', 'Spread', 'Color'];
  const groups = new Map<string, Map<number, ElevationLayer>>();

  getSection('Elevation')
    .flatMap((group) => group.tokens)
    .forEach((token) => {
      const parsed = parseElevationTokenName(token.name);
      if (!parsed) {
        return;
      }

      const { base, index, property } = parsed;

      if (!groups.has(base)) {
        groups.set(base, new Map());
      }

      const layerMap = groups.get(base)!;
      if (!layerMap.has(index)) {
        layerMap.set(index, { index, properties: [] });
      }

      const layer = layerMap.get(index)!;
      const rawValue = stripQuotes(token.value);
      layer.properties.push({
        name: property,
        rawValue,
        displayValue: formatElevationDisplay(property, rawValue),
        variable: token.variable,
      });
    });

  return Array.from(groups.entries())
    .map(([base, layerMap]) => {
      const layers = Array.from(layerMap.values())
        .map((layer) => ({
          index: layer.index,
          properties: layer.properties
            .slice()
            .sort((a, b) => {
              const orderA = propertyOrder.indexOf(a.name);
              const orderB = propertyOrder.indexOf(b.name);
              const safeA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
              const safeB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
              return safeA - safeB;
            }),
        }))
        .sort((a, b) => a.index - b.index);

      return {
        id: base,
        label: formatTitle(base),
        layers,
        boxShadow: computeBoxShadow(layers),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function parseElevationTokenName(name: string): { base: string; index: number; property: string } | null {
  const match = name.match(/^(.*?)(\d+)?(Blur|Color|Spread|Type|X|Y)$/);
  if (!match) {
    return null;
  }

  const [, basePart, indexPart, property] = match;
  const base = basePart ?? name;
  const index = indexPart ? Number.parseInt(indexPart, 10) : 0;

  return { base, index, property };
}

function computeBoxShadow(layers: ElevationLayer[]): string | null {
  const parts = layers
    .map((layer) => {
      const map = Object.fromEntries(layer.properties.map((prop) => [prop.name.toLowerCase(), prop.rawValue]));
      const type = map.type ?? 'dropShadow';
      const color = map.color;
      if (!color) {
        return null;
      }

      const x = withUnit(map.x ?? '0');
      const y = withUnit(map.y ?? '0');
      const blur = withUnit(map.blur ?? '0');
      const spread = withUnit(map.spread ?? '0');
      const prefix = type === 'innerShadow' ? 'inset ' : '';

      return `${prefix}${x} ${y} ${blur} ${spread} ${color}`.trim();
    })
    .filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}

function formatElevationDisplay(property: string, value: string): string {
  const key = property.toLowerCase();
  if (key === 'type') {
    return capitalizeWords(value.replace('Shadow', ' Shadow'));
  }

  if (key === 'color') {
    return value;
  }

  return withUnit(value);
}

function formatBreakpointLabel(name: string): string {
  const segments = toSegments(name);
  const label = segments[1] ?? name;
  return label.toUpperCase();
}

function formatAnimationGroupTitle(category: string): string {
  switch (category.toLowerCase()) {
    case 'duration':
      return 'Duration';
    case 'easing':
      return 'Easing';
    case 'transitions':
      return 'Transitions';
    default:
      return capitalize(category);
  }
}

function formatZIndexLabel(name: string): string {
  const segments = toSegments(name);
  const labelSegments = segments.slice(2);
  return labelSegments.length ? labelSegments.map(capitalize).join(' ') : capitalize(segments[segments.length - 1] ?? name);
}

function formatLabel(segments: string[]): string {
  if (!segments.length) {
    return '';
  }

  return segments
    .map((segment) => (/^\d+$/.test(segment) ? segment : capitalize(segment)))
    .join(' ');
}

function withUnit(value: string): string {
  if (/(px|rem|em|%)$/i.test(value)) {
    return value;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return `${value}px`;
  }

  return value;
}

function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, '');
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitalizeWords(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(' ');
}

function formatTitle(name: string): string {
  return toSegments(name)
    .map((segment) => (/^\d+$/.test(segment) ? segment : capitalize(segment)))
    .join(' ');
}

function toSegments(name: string): string[] {
  return name
    .replace(/([0-9]+)/g, '-$1')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .split('-')
    .filter(Boolean);
}

function extractNumericValue(value: string): number {
  const match = value.match(/-?\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function parseDurationToMs(value: string, fallback: number): number {
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?\d*\.?\d+)(ms|s)$/i);
  if (!match) {
    return fallback;
  }

  const amount = Number.parseFloat(match[1]);
  if (Number.isNaN(amount)) {
    return fallback;
  }

  const unit = match[2].toLowerCase();
  const milliseconds = unit === 's' ? amount * 1000 : amount;
  const MIN_DURATION_MS = 80;
  return Math.max(milliseconds, MIN_DURATION_MS);
}

function isTimingFunction(value: string): boolean {
  const trimmed = value.trim();
  return (
    /^cubic-bezier\(([^)]+)\)$/i.test(trimmed) ||
    /^(linear|ease|ease-in|ease-out|ease-in-out)$/i.test(trimmed) ||
    /^steps\(\s*\d+\s*(,\s*(start|end))?\s*\)$/i.test(trimmed)
  );
}

function normalizeTransition(value: string): string {
  const trimmed = stripQuotes(value).trim();
  if (!trimmed) {
    return 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)';
  }

  const first = trimmed.split(',')[0]?.trim() ?? '';
  if (!first) {
    return 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)';
  }

  const segments = first.split(/\s+/).filter(Boolean);
  let property = segments[0] ?? 'transform';
  let durationSegment = segments.find((segment) => /(ms|s)$/i.test(segment));
  let easingSegment = segments.find((segment) => isTimingFunction(segment));

  if (!durationSegment) {
    durationSegment = '250ms';
  }

  if (!easingSegment) {
    const remaining = segments.filter((segment) => segment !== property && segment !== durationSegment).join(' ');
    easingSegment = remaining && isTimingFunction(remaining) ? remaining : 'cubic-bezier(0.4, 0, 0.2, 1)';
  }

  if (!/(all|opacity|transform|color|background|scale|translate)/i.test(property)) {
    property = 'transform';
  }

  return `${property} ${durationSegment} ${easingSegment}`.trim();
}
