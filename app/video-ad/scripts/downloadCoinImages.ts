import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

const coinImages = {
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
};

const dir = path.join(process.cwd(), 'public/coins');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

Object.entries(coinImages).forEach(([symbol, url]) => {
  const dest = path.join(dir, `${symbol}.png`);
  const file = fs.createWriteStream(dest);
  https.get(url, (res: any) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${symbol}`);
    });
  }).on('error', () => {
    fs.unlink(dest, () => {});
    console.error(`Failed ${symbol}`);
  });
});