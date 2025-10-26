import type { Meta } from '@storybook/react';
import './Typography.scss';

const meta = {
  title: 'Design Tokens/Typography',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

export const TypeScale = () => (
  <div className="tokens-page">
    <h1>Typography Scale</h1>
    <p className="tokens-page__description">
      Typography tokens including font families, sizes, weights, line heights, and letter spacing.
    </p>

    <div className="type-section">
      <h2>Titles</h2>
      <div className="type-sample" style={{ fontSize: '56px', lineHeight: '64px', fontWeight: 500, fontFamily: 'Inter Display, sans-serif' }}>
        <div className="type-sample__text">H1 Title</div>
        <div className="type-sample__specs">56px / 64px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '48px', lineHeight: '56px', fontWeight: 500, fontFamily: 'Inter Display, sans-serif' }}>
        <div className="type-sample__text">H2 Title</div>
        <div className="type-sample__specs">48px / 56px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '40px', lineHeight: '48px', fontWeight: 500, fontFamily: 'Inter Display, sans-serif' }}>
        <div className="type-sample__text">H3 Title</div>
        <div className="type-sample__specs">40px / 48px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '32px', lineHeight: '40px', fontWeight: 500, fontFamily: 'Inter Display, sans-serif' }}>
        <div className="type-sample__text">H4 Title</div>
        <div className="type-sample__specs">32px / 40px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '24px', lineHeight: '32px', fontWeight: 500, fontFamily: 'Inter Display, sans-serif' }}>
        <div className="type-sample__text">H5 Title</div>
        <div className="type-sample__specs">24px / 32px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '20px', lineHeight: '28px', fontWeight: 500, fontFamily: 'Inter Display, sans-serif' }}>
        <div className="type-sample__text">H6 Title</div>
        <div className="type-sample__specs">20px / 28px Line Height / Medium</div>
      </div>
    </div>

    <div className="type-section">
      <h2>Labels</h2>
      <div className="type-sample" style={{ fontSize: '24px', lineHeight: '32px', fontWeight: 500 }}>
        <div className="type-sample__text">Label X Large</div>
        <div className="type-sample__specs">24px / 32px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '18px', lineHeight: '24px', fontWeight: 500 }}>
        <div className="type-sample__text">Label Large</div>
        <div className="type-sample__specs">18px / 24px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}>
        <div className="type-sample__text">Label Medium</div>
        <div className="type-sample__specs">16px / 24px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500 }}>
        <div className="type-sample__text">Label Small</div>
        <div className="type-sample__specs">14px / 20px Line Height / Medium</div>
      </div>
      <div className="type-sample" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 500 }}>
        <div className="type-sample__text">Label X Small</div>
        <div className="type-sample__specs">12px / 16px Line Height / Medium</div>
      </div>
    </div>

    <div className="type-section">
      <h2>Paragraphs</h2>
      <div className="type-sample" style={{ fontSize: '18px', lineHeight: '24px', fontWeight: 400 }}>
        <div className="type-sample__text">
          The quick brown fox jumps over the lazy dog. Regular paragraph text used for body content.
        </div>
        <div className="type-sample__specs">Paragraph Large - 18px / 24px Line Height / Regular</div>
      </div>
      <div className="type-sample" style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}>
        <div className="type-sample__text">
          The quick brown fox jumps over the lazy dog. Regular paragraph text used for body content.
        </div>
        <div className="type-sample__specs">Paragraph Medium - 16px / 24px Line Height / Regular</div>
      </div>
      <div className="type-sample" style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 400 }}>
        <div className="type-sample__text">
          The quick brown fox jumps over the lazy dog. Regular paragraph text used for body content.
        </div>
        <div className="type-sample__specs">Paragraph Small - 14px / 20px Line Height / Regular</div>
      </div>
    </div>

    <div className="type-section">
      <h2>Font Families</h2>
      <div className="font-family-sample">
        <div style={{ fontFamily: 'Inter Display, sans-serif', fontSize: '24px', marginBottom: '8px' }}>
          Inter Display
        </div>
        <div style={{ fontFamily: 'Inter Display, sans-serif', fontSize: '16px', color: '#666' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
          abcdefghijklmnopqrstuvwxyz<br />
          0123456789
        </div>
      </div>
      <div className="font-family-sample">
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', marginBottom: '8px' }}>
          Inter
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#666' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
          abcdefghijklmnopqrstuvwxyz<br />
          0123456789
        </div>
      </div>
    </div>
  </div>
);
