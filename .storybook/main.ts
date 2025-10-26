import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    // Ensure SCSS is properly handled
    if (config.css?.preprocessorOptions) {
      config.css.preprocessorOptions.scss = {
        api: 'modern-compiler',
      };
    } else {
      config.css = {
        ...config.css,
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler',
          },
        },
      };
    }
    return config;
  },
};

export default config;
