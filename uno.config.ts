import { presetPappIcon } from '@point-hub/preset-papp-icon';
import presetWind4 from '@unocss/preset-wind4';
import { defineConfig, presetWebFonts, transformerDirectives } from 'unocss';

export default defineConfig({
  presets: [
    presetWind4({
      preflights: { reset: true },
      mode: 'vue-scoped',
    }),
    presetPappIcon(),
    presetWebFonts({
      provider: 'none',
      fonts: {
        'inter': 'Inter',
        'open-sans': 'Open Sans',
        'logo': 'Caveat Brush',
      },
    }),
  ],
  transformers: [transformerDirectives()],
  safelist: [
    'i-fa7-brands:telegram',
    'i-fa7-brands:linkedin',
    'i-fa7-brands:threads',
    'i-fa7-brands:line',
    'i-fa7-brands:facebook',
    'i-fa7-brands:x-twitter',
    'i-fa7-brands:whatsapp',
  ],
});
