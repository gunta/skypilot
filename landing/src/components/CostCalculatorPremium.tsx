import { useState, useEffect } from 'react';
import { getTranslation, type Language } from '../i18n/translations';
import ScrollReveal from './ScrollReveal';

interface Props {
  lang: Language;
}

interface CurrencyRates {
  [key: string]: number;
}

const exchangeRates: CurrencyRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.5,
  CNY: 6.45,
  KRW: 1180,
  INR: 74.5,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  SGD: 1.35,
  HKD: 7.78,
  NZD: 1.42,
  SEK: 8.6,
  NOK: 8.5,
  DKK: 6.3,
  RUB: 73.5,
  BRL: 5.2,
  MXN: 20.1,
  ZAR: 14.5,
  AED: 3.67,
  SAR: 3.75,
  THB: 33.0,
  MYR: 4.15,
  IDR: 14300,
  PHP: 50.5,
  VND: 23000,
  PLN: 3.9,
  CZK: 21.5,
  HUF: 300,
  RON: 4.2,
  BGN: 1.65,
  HRK: 6.35,
  TRY: 8.5,
  ISK: 125,
  ILS: 3.2,
  CLP: 750,
  ARS: 98,
  COP: 3800,
  PEN: 4.1,
  UYU: 43.5,
  TWD: 28,
  PKR: 160,
  BDT: 85,
  LKR: 200,
  NGN: 410,
  EGP: 15.7,
  KES: 110,
  GHS: 6.1,
  MAD: 9.0,
  TND: 2.8,
  UAH: 27,
  KZT: 425
};

export default function CostCalculatorPremium({ lang }: Props) {
  const [videoCount, setVideoCount] = useState(10);
  const [duration, setDuration] = useState(5);
  const [currency, setCurrency] = useState(lang === 'ja' ? 'JPY' : 'USD');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const t = (key: string) => getTranslation(lang, key);
  
  // Sora 2 pricing (example rates)
  const baseRatePerVideo = 0.50;
  const durationMultiplier = duration / 5;
  const totalCostUSD = videoCount * baseRatePerVideo * durationMultiplier;
  const totalCostLocal = totalCostUSD * exchangeRates[currency];
  
  const formatCurrency = (amount: number, curr: string) => {
    const formatter = new Intl.NumberFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: curr === 'JPY' || curr === 'KRW' ? 0 : 2,
      maximumFractionDigits: curr === 'JPY' || curr === 'KRW' ? 0 : 2,
    });
    return formatter.format(amount);
  };
  
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
  const allCurrencies = Object.keys(exchangeRates).sort();

  return (
    <div className="max-w-5xl mx-auto">
      <ScrollReveal delay={0.1}>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 mb-6 text-xs font-bold tracking-wider text-accent-primary uppercase glass-card rounded-full">
            Pricing Calculator
          </span>
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            <span className="text-gradient-animate">
              {t('calculator.title')}
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('calculator.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-8 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Controls */}
            <div className="space-y-8">
              {/* Video Count Slider */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.videos')}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-xl font-bold text-xl text-white">
                    {videoCount}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={videoCount}
                    onChange={(e) => setVideoCount(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider-premium"
                    style={{
                      background: `linear-gradient(to right, #00d4ff 0%, #8b5cf6 ${videoCount}%, rgba(255,255,255,0.1) ${videoCount}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-text-muted">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.duration')}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-accent-secondary/20 to-accent-primary/20 rounded-xl font-bold text-xl text-white">
                    {duration}s
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider-premium"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #00d4ff ${duration * 5}%, rgba(255,255,255,0.1) ${duration * 5}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-text-muted">
                    <span>1s</span>
                    <span>5s</span>
                    <span>10s</span>
                    <span>15s</span>
                    <span>20s</span>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.currency')}
                  </span>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
                  >
                    {showAdvanced ? 'Show Less' : 'Show All'} →
                  </button>
                </label>
                
                {/* Popular Currencies */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {popularCurrencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`
                        px-3 py-2 rounded-xl text-sm font-semibold transition-all
                        ${currency === curr 
                          ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white scale-105 shadow-lg' 
                          : 'glass-card hover:scale-105 hover:border-accent-primary/50'}
                      `}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                
                {/* All Currencies (when expanded) */}
                {showAdvanced && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4 p-4 bg-white/5 rounded-2xl">
                    {allCurrencies.filter(c => !popularCurrencies.includes(c)).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`
                          px-2 py-1 rounded-lg text-xs font-medium transition-all
                          ${currency === curr 
                            ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white' 
                            : 'text-text-secondary hover:text-white hover:bg-white/10'}
                        `}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Results */}
            <div className="flex flex-col justify-center">
              <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10 border border-white/20">
                <div className="text-center">
                  <div className="text-sm text-text-muted uppercase tracking-wider mb-2">
                    Estimated Cost
                  </div>
                  <div className="text-5xl sm:text-6xl font-black mb-4">
                    <span className="text-gradient-animate">
                      {formatCurrency(totalCostLocal, currency)}
                    </span>
                  </div>
                  
                  {currency !== 'USD' && (
                    <div className="text-sm text-text-secondary">
                      ≈ {formatCurrency(totalCostUSD, 'USD')}
                    </div>
                  )}
                  
                  <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                    <div className="glass-card rounded-xl p-4">
                      <div className="text-text-muted mb-1">Per Video</div>
                      <div className="font-bold text-white">
                        {formatCurrency(totalCostLocal / videoCount, currency)}
                      </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                      <div className="text-text-muted mb-1">Per Second</div>
                      <div className="font-bold text-white">
                        {formatCurrency(totalCostLocal / (videoCount * duration), currency)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comparison */}
                  <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-success">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">
                        {t('calculator.savings')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Info Cards */}
      <ScrollReveal delay={0.3}>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-primary/20 rounded-lg">
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Pay As You Go</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Only pay for what you generate. No subscriptions, no hidden fees.
            </p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-secondary/20 rounded-lg">
                <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Real-time Rates</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Always get the latest exchange rates and pricing from OpenAI.
            </p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">No Markup</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Direct API pricing with zero platform fees or commissions.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

<style>{`
  .slider-premium {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    height: 12px;
    border-radius: 9999px;
    cursor: pointer;
  }
  
  .slider-premium::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00d4ff, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.4);
    transition: all 0.2s;
  }
  
  .slider-premium::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  }
  
  .slider-premium::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00d4ff, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.4);
    transition: all 0.2s;
    border: none;
  }
  
  .slider-premium::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  }
`}</style>
