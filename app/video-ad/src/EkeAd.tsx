import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Audio,
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import { brand } from './brand';
import { EkeLogo } from './EkeLogo';
import { CoinImage } from './CoinImage';
import { mockCoins, btcPriceHistory, globalStats, formatPrice, formatPercent } from './mockData';

const FPS = 30;

// ==================== NAVBAR COMPONENT ====================
const Navbar: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: 'rgba(20, 20, 24, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ transform: 'scale(0.25)', transformOrigin: 'left center' }}>
            <EkeLogo />
          </div>
          <span style={{ color: brand.white, fontFamily: brand.font, fontSize: 14, fontWeight: 700, letterSpacing: '0.5px' }}>
            EKE MARKET
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Markets', 'Gainers', 'Compare', 'Watchlist'].map((item) => (
            <span
              key={item}
              style={{
                color: brand.textSecondary,
                fontFamily: brand.font,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 240,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.textMuted} strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span style={{ color: brand.textMuted, fontFamily: brand.font, fontSize: 12 }}>
          Search coins...
        </span>
      </div>
    </div>
  );
};

// ==================== COIN ROW COMPONENT ====================
interface CoinRowProps {
  coin: typeof mockCoins[0];
  frameOffset: number;
  durationInFrames: number;
}

const CoinRow: React.FC<CoinRowProps> = ({ coin, frameOffset, durationInFrames }) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - frameOffset;

  const translateX = interpolate(
    relativeFrame,
    [0, 15],
    [100, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = interpolate(
    relativeFrame,
    [0, 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const displayPrice = interpolate(
    relativeFrame,
    [0, 30],
    [coin.price * 0.95, coin.price],
    { extrapolateRight: 'clamp' }
  );

  const isPositive = coin.change >= 0;
  const color = isPositive ? brand.green : brand.red;

  if (relativeFrame < 0 || relativeFrame > durationInFrames) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <div style={{ width: 40, color: brand.textMuted, fontSize: 13, fontFamily: brand.font }}>
        #{coin.rank}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <CoinImage symbol={coin.symbol} size={40} />
        <div>
          <div style={{ color: brand.white, fontSize: 14, fontWeight: 600, fontFamily: brand.font }}>
            {coin.name}
          </div>
          <div style={{ color: brand.textMuted, fontSize: 11, fontFamily: brand.font }}>
            {coin.symbol}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', width: 140 }}>
        <div style={{ color: brand.white, fontSize: 14, fontWeight: 600, fontFamily: brand.font }}>
          ${formatPrice(displayPrice)}
        </div>
      </div>

      <div style={{ textAlign: 'right', width: 100, color, fontSize: 14, fontWeight: 600, fontFamily: brand.font }}>
        {formatPercent(coin.change)}
      </div>

      <div style={{ textAlign: 'right', width: 100, color: brand.textSecondary, fontSize: 13, fontFamily: brand.font }}>
        ${coin.marketCap}
      </div>

      <div style={{ textAlign: 'right', width: 80, color: brand.textSecondary, fontSize: 13, fontFamily: brand.font }}>
        ${coin.volume}
      </div>
    </div>
  );
};

// ==================== PRICE CHART COMPONENT ====================
const PriceChart: React.FC<{ frameOffset: number; durationInFrames: number }> = ({
  frameOffset,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - frameOffset;

  const chartWidth = 600;
  const chartHeight = 180;
  const padding = 20;

  const minPrice = Math.min(...btcPriceHistory) * 0.99;
  const maxPrice = Math.max(...btcPriceHistory) * 1.01;
  const range = maxPrice - minPrice;

  const points = btcPriceHistory.map((price, i) => ({
    x: padding + (i / (btcPriceHistory.length - 1)) * (chartWidth - 2 * padding),
    y: chartHeight - padding - ((price - minPrice) / range) * (chartHeight - 2 * padding),
  }));

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (point.x - prev.x) * 0.4;
    const cpx2 = prev.x + (point.x - prev.x) * 0.6;
    return `${acc} C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const pathLength = 1000;
  const drawProgress = interpolate(
    relativeFrame,
    [0, 90],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  if (relativeFrame < 0) return null;

  return (
    <div style={{ position: 'relative', width: chartWidth, height: chartHeight }}>
      <svg width={chartWidth} height={chartHeight}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={brand.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={brand.primary} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i / 4) * (chartHeight - 2 * padding)}
            x2={chartWidth - padding}
            y2={padding + (i / 4) * (chartHeight - 2 * padding)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        <path
          d={areaD}
          fill="url(#chartGradient)"
          opacity={Math.min(drawProgress * 2, 1)}
        />

        <path
          d={pathD}
          fill="none"
          stroke={brand.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength * (1 - drawProgress)}
        />

        {drawProgress > 0.8 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="5"
            fill={brand.primary}
            opacity={interpolate(drawProgress, [0.8, 1], [0, 1])}
          />
        )}
      </svg>
    </div>
  );
};

// ==================== GLOBAL STATS COMPONENT ====================
const GlobalStats: React.FC<{ frameOffset: number; durationInFrames: number }> = ({
  frameOffset,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - frameOffset;

  if (relativeFrame < 0) return null;

  const stats = [
    { label: 'Total Market Cap', value: globalStats.totalMarketCap, symbol: '$', delay: 0 },
    { label: '24h Volume', value: globalStats.totalVolume, symbol: 'VOL', delay: 10 },
    { label: 'BTC Dominance', value: `${globalStats.btcDominance}%`, symbol: 'BTC', delay: 20 },
    { label: 'Active Coins', value: globalStats.activeCryptos.toLocaleString(), symbol: 'COIN', delay: 30 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        padding: '0 48px',
        marginTop: 40,
      }}
    >
      {stats.map((stat, i) => {
        const opacity = interpolate(
          relativeFrame,
          [stat.delay, stat.delay + 15],
          [0, 1],
          { extrapolateRight: 'clamp' }
        );
        const translateY = interpolate(
          relativeFrame,
          [stat.delay, stat.delay + 15],
          [20, 0],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={stat.label}
            style={{
              background: brand.surface,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 24,
              width: 220,
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <div style={{ color: brand.textMuted, fontSize: 11, fontFamily: brand.font, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {stat.label}
            </div>
            <div style={{ color: brand.primary, fontSize: 14, fontWeight: 700, fontFamily: brand.font, marginBottom: 8 }}>
              {stat.symbol}
            </div>
            <div style={{ color: brand.white, fontSize: 24, fontWeight: 700, fontFamily: brand.font }}>
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== COIN DETAIL COMPONENT ====================
const CoinDetail: React.FC<{ frameOffset: number; durationInFrames: number }> = ({
  frameOffset,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - frameOffset;

  if (relativeFrame < 0) return null;

  const displayPrice = interpolate(
    relativeFrame,
    [0, 60],
    [66000, 67420.50],
    { extrapolateRight: 'clamp' }
  );

  const statsOpacity = interpolate(
    relativeFrame,
    [60, 80],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ padding: '60px 48px', display: 'flex', gap: 48, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <CoinImage symbol="BTC" size={48} />
          <div>
            <div style={{ color: brand.white, fontSize: 28, fontWeight: 700, fontFamily: brand.font }}>
              Bitcoin
            </div>
            <div style={{ color: brand.textMuted, fontSize: 13, fontFamily: brand.font }}>
              BTC
            </div>
          </div>
        </div>

        <div style={{ color: brand.white, fontSize: 48, fontWeight: 800, fontFamily: brand.font, marginBottom: 8 }}>
          ${formatPrice(displayPrice)}
        </div>
        <div style={{ color: brand.green, fontSize: 16, fontWeight: 600, fontFamily: brand.font }}>
          +2.4% (24h)
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 32, opacity: statsOpacity }}>
          <div>
            <div style={{ color: brand.textMuted, fontSize: 11, fontFamily: brand.font, marginBottom: 4 }}>
              Market Cap
            </div>
            <div style={{ color: brand.white, fontSize: 16, fontWeight: 600, fontFamily: brand.font }}>
              $1.32T
            </div>
          </div>
          <div>
            <div style={{ color: brand.textMuted, fontSize: 11, fontFamily: brand.font, marginBottom: 4 }}>
              24h Volume
            </div>
            <div style={{ color: brand.white, fontSize: 16, fontWeight: 600, fontFamily: brand.font }}>
              $28.5B
            </div>
          </div>
          <div>
            <div style={{ color: brand.textMuted, fontSize: 11, fontFamily: brand.font, marginBottom: 4 }}>
              Circulating
            </div>
            <div style={{ color: brand.white, fontSize: 16, fontWeight: 600, fontFamily: brand.font }}>
              19.6M BTC
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1.2 }}>
        <PriceChart frameOffset={frameOffset + 20} durationInFrames={durationInFrames - 20} />
      </div>
    </div>
  );
};

// ==================== TEXT SNAP COMPONENT ====================
const TextSnap: React.FC<{ text: string; color?: string; size?: number }> = ({
  text,
  color = brand.white,
  size = 96,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 6], [0.92, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: brand.bg,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontSize: size,
          fontWeight: 800,
          color,
          fontFamily: brand.font,
          textAlign: 'center',
          letterSpacing: '-2px',
          lineHeight: 1.1,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ==================== LOGO SCENE COMPONENT ====================
const LogoScene: React.FC<{ scale?: number; showMarket?: boolean }> = ({ scale = 1, showMarket = false }) => {
  const frame = useCurrentFrame();
  const currentScale = spring({
    fps: FPS,
    frame: frame,
    config: { damping: 200, stiffness: 300 },
    from: 0.85,
    to: scale,
  });

  const glowOpacity = interpolate(frame, [0, 30, 60], [0, 0.3, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: brand.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.primary}33 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      <div style={{ transform: `scale(${currentScale})`, transformOrigin: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ transform: 'scale(3)' }}>
          <EkeLogo />
        </div>
        {showMarket && (
          <span
            style={{
              fontFamily: brand.font,
              fontSize: 18,
              fontWeight: 400,
              color: brand.primary,
              letterSpacing: 8,
              marginTop: 8,
            }}
          >
            MARKET
          </span>
        )}
      </div>
    </div>
  );
};

// ==================== COMPARISON SCENE ====================
const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();

  const coins = [
    { symbol: 'BTC', name: 'Bitcoin', price: 67420, change: +2.4, cap: '1.32T', volume: '38.2B' },
    { symbol: 'ETH', name: 'Ethereum', price: 3510, change: +1.8, cap: '421B', volume: '18.4B' },
    { symbol: 'SOL', name: 'Solana', price: 178, change: +5.2, cap: '82B', volume: '6.1B' },
    { symbol: 'BNB', name: 'BNB', price: 412, change: -0.6, cap: '63B', volume: '2.8B' },
    { symbol: 'AVAX', name: 'Avalanche', price: 38.9, change: +4.7, cap: '16B', volume: '1.2B' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: brand.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 60,
    }}>
      <div style={{
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frame, [0, 10], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        fontSize: 28, fontWeight: 800, color: brand.white,
        fontFamily: brand.font,
        marginBottom: 40, letterSpacing: -0.5,
      }}>
        Compare up to <span style={{ color: brand.accent }}>5 coins</span> at once
      </div>

      <div style={{ display: 'flex', gap: 16, width: '100%', justifyContent: 'center' }}>
        {coins.map((coin, i) => {
          const delay = i * 12;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: 'clamp' });
          const translateY = interpolate(frame, [delay, delay + 12], [40, 0], { extrapolateRight: 'clamp' });
          const isPositive = coin.change >= 0;

          return (
            <div key={coin.symbol} style={{
              opacity, transform: `translateY(${translateY}px)`,
              background: brand.surface,
              border: `1px solid ${brand.primary}`,
              borderRadius: 12,
              padding: '20px 16px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10,
              flex: 1, minWidth: 0,
            }}>
              <CoinImage symbol={coin.symbol} size={36} />
              <div style={{ fontSize: 13, fontWeight: 700, color: brand.white, fontFamily: brand.font }}>{coin.symbol}</div>
              <div style={{ fontSize: 12, color: brand.textSecondary, fontFamily: brand.font }}>{coin.name}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: brand.white, fontFamily: brand.font }}>
                ${coin.price.toLocaleString()}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: isPositive ? brand.green : brand.red,
                fontFamily: brand.font,
              }}>
                {isPositive ? '+' : ''}{coin.change}%
              </div>
              <div style={{ borderTop: '1px solid #222', width: '100%', paddingTop: 8, marginTop: 4 }}>
                <div style={{ fontSize: 10, color: '#666', fontFamily: brand.font, marginBottom: 3 }}>Market Cap</div>
                <div style={{ fontSize: 11, color: brand.primary, fontWeight: 600, fontFamily: brand.font }}>${coin.cap}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#666', fontFamily: brand.font, marginBottom: 3 }}>Volume 24h</div>
                <div style={{ fontSize: 11, color: brand.primary, fontWeight: 600, fontFamily: brand.font }}>${coin.volume}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        opacity: interpolate(frame, [100, 110], [0, 1], { extrapolateRight: 'clamp' }),
        fontSize: 16, color: brand.accent,
        fontFamily: brand.font,
        marginTop: 32, letterSpacing: 2,
        fontWeight: 400,
      }}>
        Price • Market Cap • Volume • 24h Change — all side by side
      </div>
    </div>
  );
};

// ==================== CONVERTER SCENE ====================
const ConverterScene: React.FC = () => {
  const frame = useCurrentFrame();

  const btcAmount = 0.5;
  const rate = 67420;

  const currencies = [
    { code: 'USD', symbol: '$', value: (btcAmount * rate).toLocaleString(), flag: 'US' },
    { code: 'NGN', symbol: '₦', value: (btcAmount * rate * 1580).toLocaleString(), flag: 'NG' },
    { code: 'EUR', symbol: '€', value: (btcAmount * rate * 0.93).toLocaleString(), flag: 'EU' },
    { code: 'GBP', symbol: '£', value: (btcAmount * rate * 0.79).toLocaleString(), flag: 'GB' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: brand.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 80,
    }}>

      <div style={{
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        fontSize: 28, fontWeight: 800, color: brand.white,
        fontFamily: brand.font,
        marginBottom: 48, letterSpacing: -0.5,
      }}>
        Built-in <span style={{ color: brand.accent }}>currency converter</span>
      </div>

      <div style={{
        opacity: interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' }),
        display: 'flex', alignItems: 'center', gap: 16,
        background: brand.surface,
        border: `1px solid ${brand.primary}`,
        borderRadius: 12,
        padding: '16px 24px',
        marginBottom: 32,
        width: '100%', maxWidth: 500,
      }}>
        <CoinImage symbol="BTC" size={32} />
        <div style={{ fontSize: 32, fontWeight: 800, color: brand.white, fontFamily: brand.font }}>
          0.5 BTC
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 14, color: brand.primary, fontFamily: brand.font }}>
          Bitcoin
        </div>
      </div>

      <div style={{
        opacity: interpolate(frame, [18, 26], [0, 1], { extrapolateRight: 'clamp' }),
        fontSize: 28, color: brand.accent, marginBottom: 32,
        fontFamily: brand.font, fontWeight: 300,
      }}>
        =
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 500 }}>
        {currencies.map((cur, i) => {
          const delay = 26 + i * 14;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: 'clamp' });
          const translateX = interpolate(frame, [delay, delay + 12], [-30, 0], { extrapolateRight: 'clamp' });

          return (
            <div key={cur.code} style={{
              opacity, transform: `translateX(${translateX}px)`,
              display: 'flex', alignItems: 'center',
              background: brand.surface,
              border: '1px solid #222',
              borderRadius: 10,
              padding: '14px 20px',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#1a1a1a', border: `1px solid ${brand.primary}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: brand.accent,
                  fontFamily: brand.font,
                }}>
                  {cur.code}
                </div>
                <div style={{ fontSize: 14, color: '#888', fontFamily: brand.font }}>{cur.code}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: brand.white, fontFamily: brand.font }}>
                {cur.symbol}{cur.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== LOGO OUTRO COMPONENT ====================
const LogoOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const urlOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: brand.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <div style={{ opacity, transform: 'scale(2.5)' }}>
        <EkeLogo />
      </div>
      <div
        style={{
          opacity: urlOpacity,
          color: brand.primary,
          fontSize: 18,
          fontWeight: 400,
          fontFamily: brand.font,
          letterSpacing: 8,
        }}
      >
        MARKET
      </div>
      <div
        style={{
          opacity: urlOpacity,
          color: brand.primary,
          fontSize: 14,
          fontWeight: 400,
          fontFamily: brand.font,
          letterSpacing: 2,
          marginTop: 8,
        }}
      >
        ekemarket.com
      </div>
    </div>
  );
};

// ==================== MAIN COMPOSITION ====================
export const EkeAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: brand.bg }}>
      <Audio src={staticFile('beat.mp3')} volume={0.7} />

      {/* Scene 1: Logo Reveal (0-60) */}
      <Sequence from={0} durationInFrames={60}>
        <LogoScene />
      </Sequence>

      {/* Scene 2: Coin List (60-210) */}
      <Sequence from={60} durationInFrames={150}>
        <div style={{ width: '100%', height: '100%', background: brand.bg, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px', marginTop: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 8,
              }}
            >
              <div style={{ width: 40 }} />
              <div style={{ flex: 1, color: brand.textMuted, fontSize: 11, fontFamily: brand.font, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Name
              </div>
              <div style={{ width: 140, textAlign: 'right', color: brand.textMuted, fontSize: 11, fontFamily: brand.font, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Price
              </div>
              <div style={{ width: 100, textAlign: 'right', color: brand.textMuted, fontSize: 11, fontFamily: brand.font, textTransform: 'uppercase', letterSpacing: '1px' }}>
                24h
              </div>
              <div style={{ width: 100, textAlign: 'right', color: brand.textMuted, fontSize: 11, fontFamily: brand.font, textTransform: 'uppercase', letterSpacing: '1px' }}>
                MCap
              </div>
              <div style={{ width: 80, textAlign: 'right', color: brand.textMuted, fontSize: 11, fontFamily: brand.font, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Vol
              </div>
            </div>

            {mockCoins.map((coin, i) => (
              <CoinRow
                key={coin.symbol}
                coin={coin}
                frameOffset={i * 8}
                durationInFrames={150 - i * 8}
              />
            ))}
          </div>
        </div>
      </Sequence>

      {/* Scene 3: Text Snap (210-270) */}
      <Sequence from={210} durationInFrames={60}>
        <TextSnap text="Real-time prices." />
      </Sequence>

      {/* Scene 4: Coin Detail (270-420) */}
      <Sequence from={270} durationInFrames={150}>
        <div style={{ width: '100%', height: '100%', background: brand.bg, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <CoinDetail frameOffset={0} durationInFrames={150} />
          </div>
        </div>
      </Sequence>

      {/* Scene 5: Text Snaps (420-540) */}
      <Sequence from={420} durationInFrames={40}>
        <TextSnap text="Live volumes." />
      </Sequence>
      <Sequence from={460} durationInFrames={40}>
        <TextSnap text="Full market history." />
      </Sequence>
      <Sequence from={500} durationInFrames={40}>
        <TextSnap text="Thousands of coins." color={brand.accent} />
      </Sequence>

      {/* Scene 6: Global Stats (540-630) */}
      <Sequence from={540} durationInFrames={90}>
        <div style={{ width: '100%', height: '100%', background: brand.bg, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <GlobalStats frameOffset={0} durationInFrames={90} />
          </div>
        </div>
      </Sequence>

      {/* Scene 7: Comparison (630-780) */}
      <Sequence from={630} durationInFrames={150}>
        <ComparisonScene />
      </Sequence>

      {/* Scene 8: Converter (780-900) */}
      <Sequence from={780} durationInFrames={120}>
        <ConverterScene />
      </Sequence>

      {/* Scene 9: Text Snaps (900-1060) */}
      <Sequence from={900} durationInFrames={40}>
        <TextSnap text="Compare any 5 coins." />
      </Sequence>
      <Sequence from={940} durationInFrames={40}>
        <TextSnap text="See every metric." color={brand.accent} />
      </Sequence>
      <Sequence from={980} durationInFrames={40}>
        <TextSnap text="Convert to any currency." size={72} />
      </Sequence>
      <Sequence from={1020} durationInFrames={40}>
        <TextSnap text="NGN. USD. EUR. GBP." color={brand.accent} size={72} />
      </Sequence>

      {/* Scene 10: Text Snaps - No Login (1060-1180) */}
      <Sequence from={1060} durationInFrames={40}>
        <TextSnap text="No login." />
      </Sequence>
      <Sequence from={1100} durationInFrames={40}>
        <TextSnap text="No sign up." />
      </Sequence>
      <Sequence from={1140} durationInFrames={40}>
        <TextSnap text="Just open." color={brand.accent} size={120} />
      </Sequence>

      {/* Scene 11: Logo + URL Outro (1180-1330) */}
      <Sequence from={1180} durationInFrames={150}>
        <LogoOutro />
      </Sequence>
    </AbsoluteFill>
  );
};