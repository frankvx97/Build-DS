/**
 * DEBUG SCRIPT - Check token structure after preprocessing
 */

import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

// Register Tokens Studio transforms
register(StyleDictionary, {
  excludeParentKeys: true,
});

const config = {
  source: ['src/from-figma/tokens.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    debug: {
      transformGroup: 'tokens-studio',
      buildPath: 'src/tokens/build/',
      files: []
    }
  }
};

const sd = new StyleDictionary(config);
const tokens = await sd.exportPlatform('debug');

// Log first few tokens to understand structure
const tokenArray = Object.values(tokens).slice(0, 5);
console.log('Sample tokens:', JSON.stringify(tokenArray, null, 2));
