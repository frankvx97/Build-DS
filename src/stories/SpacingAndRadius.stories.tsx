import type { Meta } from '@storybook/react';
import { getSection } from '../utils/tokenParser';

const meta = {
  title: 'Design Tokens/Spacing',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

const spacingTokens = buildSpacingTokens();
const radiusTokens = buildRadiusTokens();

const SpacingSample = ({ value, variable }: { value: string; variable: string }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ minWidth: '120px', fontFamily: 'monospace', fontSize: '14px' }}>{variable}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: value, height: '32px', background: '#335cff', borderRadius: '4px' }} />
        <span style={{ fontSize: '14px', color: '#666' }}>{value}</span>
      </div>
    </div>
  </div>
);

export const SpacingScale = () => (
  <div className="tokens-page">
    <h1>Spacing Scale</h1>
    <p className="tokens-page__description">
      Consistent spacing tokens for margins, padding, and gaps throughout the design system.
    </p>

    <div style={{ marginTop: '32px' }}>
      {spacingTokens.map((token) => (
        <SpacingSample key={token.variable} value={token.value} variable={token.variable} />
      ))}
    </div>
  </div>
);

export const BorderRadius = () => (
  <div className="tokens-page">
    <h1>Border Radius</h1>
    <p className="tokens-page__description">
      Border radius tokens for consistent rounded corners across components.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', marginTop: '32px' }}>
      {radiusTokens.map((token) => (
        <div key={token.variable} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              background: '#335cff',
              borderRadius: token.value,
              margin: '0 auto 12px',
            }}
          />
          <div style={{ fontFamily: 'monospace', fontSize: '13px', marginBottom: '4px' }}>{token.variable}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>{token.value}</div>
        </div>
      ))}
    </div>
  </div>
);

function buildSpacingTokens() {
  return getSection('Spacing')
    .flatMap((group) => group.tokens)
    .map((token) => ({
      variable: token.variable,
      value: token.value,
    }))
    .sort((a, b) => extractNumeric(a.value) - extractNumeric(b.value));
}

function buildRadiusTokens() {
  return getSection('Radius')
    .flatMap((group) => group.tokens)
    .map((token) => ({
      variable: token.variable,
      value: token.value,
    }))
    .sort((a, b) => extractNumeric(a.value) - extractNumeric(b.value));
}

function extractNumeric(value: string): number {
  if (value.toLowerCase() === '999px') {
    return Number.MAX_SAFE_INTEGER;
  }

  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : 0;
}
