/**
 * Type declarations for the Build Design System theme configuration.
 */

export type ColorMode = 'Light' | 'Dark';
export type NeutralMode = 'Gray' | 'Slate';
export type ThemeMode = 'Blue' | 'Purple' | 'Orange' | 'Sky';

export interface ThemeConfig {
  colorMode: ColorMode;
  neutralMode: NeutralMode;
  themeMode: ThemeMode;
}

export const themeConfig: ThemeConfig;
export default themeConfig;
