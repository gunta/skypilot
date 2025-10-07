import { useState } from 'react';
import type { Language } from '../i18n/translations';
import { getTranslation } from '../i18n/translations';

interface Props {
  lang: Language;
}

// Sora 2 pricing from OpenAI (in USD)
const PRICING = {
  'sora-2': {
    '4': { '720x1280': 0.12, '1280x720': 0.12, '1024x1792': 0.16, '1792x1024': 0.16 },
    '8': { '720x1280': 0.24, '1280x720': 0.24, '1024x1792': 0.32, '1792x1024': 0.32 },
    '12': { '720x1280': 0.36, '1280x720': 0.36, '1024x1792': 0.48, '1792x1024': 0.48 },
  },
  'sora-2-pro': {
    '4': { '720x1280': 0.48, '1280x720': 0.48, '1024x1792': 0.64, '1792x1024': 0.64 },
    '8': { '720x1280': 0.96, '1280x720': 0.96, '1024x1792': 1.28, '1792x1024': 1.28 },
    '12': { '720x1280': 1.44, '1280x720': 1.44, '1024x1792': 1.92, '1792x1024': 1.92 },
  },
};

// USD to JPY conversion rate (approximate)
const USD_TO_JPY = 150;

export default function CostCalculator({ lang }: Props) {
  const [model, setModel] = useState<'sora-2' | 'sora-2-pro'>('sora-2');
  const [duration, setDuration] = useState<'4' | '8' | '12'>('4');
  const [resolution, setResolution] = useState<keyof typeof PRICING['sora-2']['4']>('720x1280');
  const [quantity, setQuantity] = useState(1);

  const t = (key: any) => getTranslation(lang, key);
  const isJapanese = lang === 'ja';

  const calculateCost = () => {
    const pricePerVideoUSD = PRICING[model][duration][resolution];
    const pricePerVideo = isJapanese ? pricePerVideoUSD * USD_TO_JPY : pricePerVideoUSD;
    return {
      perVideo: pricePerVideo,
      total: pricePerVideo * quantity,
    };
  };

  const formatPrice = (price: number) => {
    if (isJapanese) {
      return `¥${Math.round(price).toLocaleString('ja-JP')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const cost = calculateCost();

  return (
    <div className="card max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">{t('calc.title')}</h3>
      
      <div className="space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('calc.model')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setModel('sora-2')}
              className={`p-3 rounded-lg border-2 transition-all ${
                model === 'sora-2'
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                  : 'border-custom-border text-text-secondary hover:border-accent-primary/50'
              }`}
            >
              Sora 2
            </button>
            <button
              onClick={() => setModel('sora-2-pro')}
              className={`p-3 rounded-lg border-2 transition-all ${
                model === 'sora-2-pro'
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                  : 'border-custom-border text-text-secondary hover:border-accent-primary/50'
              }`}
            >
              Sora 2 Pro
            </button>
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('calc.duration')}</label>
          <div className="grid grid-cols-3 gap-3">
            {(['4', '8', '12'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  duration === d
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-custom-border text-text-secondary hover:border-accent-primary/50'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('calc.resolution')}</label>
          <div className="grid grid-cols-2 gap-3">
            {(['720x1280', '1280x720', '1024x1792', '1792x1024'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  resolution === r
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-custom-border text-text-secondary hover:border-accent-primary/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Slider */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('calc.quantity')}: {quantity}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
        </div>

        {/* Cost Display */}
        <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-lg p-6 border border-accent-primary/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-secondary">{t('calc.perVideo')}</span>
            <span className="text-2xl font-bold">{formatPrice(cost.perVideo)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-custom-border">
            <span className="text-lg font-semibold">{t('calc.total')}</span>
            <span className="text-3xl font-bold gradient-text">{formatPrice(cost.total)}</span>
          </div>
        </div>

        <p className="text-center text-sm text-text-muted">
          {t('calc.noMarkup')}
        </p>

        <a
          href="#install"
          className="btn-primary w-full text-center block"
        >
          {t('calc.cta')}
        </a>
      </div>
    </div>
  );
}

