# Currency Display Feature

## Overview

The cost calculator automatically displays prices in the user's preferred currency based on their selected language:

- **English (`?lang=en`)**: Displays prices in **USD ($)**
- **Japanese (`?lang=ja`)**: Displays prices in **JPY (¥)**

## Implementation Details

### Conversion Rate
- **Fixed Rate**: 1 USD = 150 JPY
- This is an approximate rate for reference purposes
- Actual payment to OpenAI is always in USD

### How It Works

1. **Language Detection**: The calculator detects the current language from the `lang` prop
2. **Price Conversion**: 
   - Base prices are stored in USD (OpenAI's pricing)
   - When language is Japanese, prices are multiplied by 150
3. **Formatting**:
   - USD: `$0.12` (2 decimal places)
   - JPY: `¥18` (rounded to nearest yen, with thousands separator)

### Example Pricing

#### Sora 2 (4 seconds, 720x1280)
- **English**: $0.12 per video
- **Japanese**: ¥18 per video

#### Sora 2 Pro (8 seconds, 1792x1024)
- **English**: $1.28 per video
- **Japanese**: ¥192 per video

## User Experience

### English Version
```
Cost Calculator
Model: Sora 2
Duration: 4s
Resolution: 720x1280
Quantity: 10

per video: $0.12
Total Cost: $1.20

No markup. You pay OpenAI directly in USD.
```

### Japanese Version
```
コスト計算機
モデル: Sora 2
時間: 4s
解像度: 720x1280
数量: 10

動画あたり: ¥18
合計コスト: ¥1,800

マークアップなし。OpenAI への支払いは米ドル建てです（参考価格：1ドル=150円）。
```

## Important Notes

1. **Reference Only**: JPY prices are for reference/convenience
2. **Actual Payment**: All payments to OpenAI are processed in USD
3. **Conversion Rate**: The 150 JPY/USD rate is approximate and may not reflect current exchange rates
4. **Transparency**: The disclaimer clearly states that payment is in USD

## Future Enhancements

Potential improvements:
- [ ] Use real-time exchange rates via API (e.g., exchangerate-api.io)
- [ ] Add more currency options (EUR, GBP, etc.)
- [ ] Allow manual currency selection independent of language
- [ ] Display both USD and local currency simultaneously
- [ ] Add a small note about when exchange rates were last updated

## Code Location

- **Component**: `landing/src/components/CostCalculator.tsx`
- **Translations**: `landing/src/i18n/translations.ts`
- **Conversion Rate**: `USD_TO_JPY = 150` constant in CostCalculator.tsx

## Updating the Conversion Rate

To update the JPY conversion rate:

1. Open `landing/src/components/CostCalculator.tsx`
2. Find the constant: `const USD_TO_JPY = 150;`
3. Update to desired rate (e.g., `const USD_TO_JPY = 155;`)
4. Rebuild: `bun run build`

It's recommended to update this rate periodically to keep it reasonably accurate.

