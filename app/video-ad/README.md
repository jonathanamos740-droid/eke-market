# Eke Market Video Ad

A 30-second Apple-style promotional video for Eke Market, built with Remotion. Features animated UI components instead of screenshots.

## Project Structure

```
video-ad/
├── src/
│   ├── index.ts          # Remotion entry point
│   ├── EkeAd.tsx         # Main video composition with all scenes
│   ├── EkeLogo.tsx       # SVG logo component
│   ├── brand.ts          # Brand colors and typography
│   ├── mockData.ts       # Mock coin data for animations
│   └── (old files: TextSnap.tsx, Screenshot.tsx - no longer used)
├── public/
│   ├── beat.mp3          # Background music (add your own)
│   └── placeholder.txt   # Instructions
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## Setup

1. Install dependencies:
   ```bash
   cd app/video-ad
   npm install
   ```

2. Add background music to `public/beat.mp3`:
   - Download a royalty-free upbeat track from [Pixabay](https://pixabay.com/music/) or [Mixkit](https://mixkit.co/free-stock-music/)
   - Search terms: "upbeat", "bouncy", "corporate", "tech"
   - Save as `beat.mp3` in the `public/` folder

## Commands

### Preview in browser
```bash
npm start
```

### Render the video
```bash
npm run build
```

This outputs `out/eke-ad.mp4` (H.264, 1080p, 30fps).

## Video Timeline (30 seconds @ 30fps = 900 frames)

| Time | Frames | Scene | Description |
|------|--------|-------|-------------|
| 0-2s | 0-60 | Logo Reveal | EKE logo scales in with spring animation + amber glow pulse |
| 2-7s | 60-210 | Coin List | Navbar + 8 coin rows slide in staggered, prices count up |
| 7-9s | 210-270 | Text Snap | "Real-time prices." |
| 9-14s | 270-420 | Coin Detail | Bitcoin detail page, price counts 66k→67k, chart draws itself |
| 14-18s | 420-540 | Text Snaps | "Live volumes." → "Full market history." → "Thousands of coins." |
| 18-21s | 540-630 | Global Stats | 4 stat cards animate in with icons |
| 21-25s | 630-750 | Text Snaps | "No login." → "No sign up." → "Just open." (120px) |
| 25-30s | 750-900 | Outro | Logo + ekemarket.com |

## Animated Components

### Coin List (Scene 2)
- Navbar with logo, nav links, and search bar
- 8 coin rows with:
  - Slide-in animation (staggered by 8 frames each)
  - Price counter animation (95% → 100% of final value)
  - Green/red color for positive/negative changes
  - Coin icons with brand colors

### Coin Detail (Scene 4)
- Bitcoin header with icon
- Price counter: $66,000 → $67,420.50
- Stats fade in (Market Cap, Volume, Circulating)
- SVG line chart with stroke-dashoffset drawing animation
- Gradient area fill

### Global Stats (Scene 6)
- 4 stat cards with emoji icons
- Staggered fade-in + slide-up animation
- Total Market Cap, 24h Volume, BTC Dominance, Active Cryptos

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0D0D0F` | Main background |
| Primary | `#BA7517` | Brand gold/brown |
| Accent | `#EF9F27` | Highlight amber |
| Green | `#1D9E75` | Positive price change |
| Red | `#E24B4A` | Negative price change |
| White | `#FFFFFF` | Primary text |

## Mock Data

Real-looking coin values in `mockData.ts`:
- Bitcoin: $67,420.50 (+2.4%)
- Ethereum: $3,510.20 (+1.8%)
- BNB: $412.80 (-0.6%)
- Solana: $178.40 (+5.2%)
- And 4 more coins...

## Animations Used

- **spring()** - Logo reveal entrance (physical, satisfying)
- **interpolate()** - Counter animations, opacity fades, price tickers
- **strokeDashoffset** - Chart line drawing itself left-to-right
- **Staggered delays** - Coin rows enter one by one (8 frames apart)
- **Hard cuts** - Between text scenes (no transitions)

## Typography

- Font: Inter (system fallback: -apple-system, BlinkMacSystemFont)
- Big statements: 96px, weight 800
- "Just open.": 120px for emphasis
- UI elements: 12-14px, weight 400-600