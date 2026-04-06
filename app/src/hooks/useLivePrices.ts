import { useState, useEffect, useCallback, useRef } from 'react';

interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
}

interface UseLivePricesReturn {
  prices: Record<string, PriceUpdate>;
  isConnected: boolean;
  lastUpdate: number;
}

export function useLivePrices(symbolList: string[] = []): UseLivePricesReturn {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map standard IDs back to Binance symbols
  const idToBinanceSymbol = useCallback((id: string): string => {
    const mapping: Record<string, string> = {
      'bitcoin': 'BTCUSDT',
      'ethereum': 'ETHUSDT',
      'tether': 'USDTUSDT',
      'binancecoin': 'BNBUSDT',
      'solana': 'SOLUSDT',
      'usd-coin': 'USDCUSDT',
      'xrp': 'XRPUSDT',
      'dogecoin': 'DOGEUSDT',
      'cardano': 'ADAUSDT',
      'tron': 'TRXUSDT',
      'avalanche-2': 'AVAXUSDT',
      'shiba-inu': 'SHIBUSDT',
      'polkadot': 'DOTUSDT',
      'chainlink': 'LINKUSDT',
      'bitcoin-cash': 'BCHUSDT',
      'near': 'NEARUSDT',
      'matic-network': 'MATICUSDT',
      'litecoin': 'LTCUSDT',
      'internet-computer': 'ICPUSDT',
      'dai': 'DAIUSDT',
      'uniswap': 'UNIUSDT',
      'ethereum-classic': 'ETCUSDT',
      'monero': 'XMRUSDT',
      'stellar': 'XLMUSDT',
      'okb': 'OKBUSDT',
      'filecoin': 'FILUSDT',
      'cosmos': 'ATOMUSDT',
      'hedera-hashgraph': 'HBARUSDT',
      'cronos': 'CROUSDT',
      'aptos': 'APTUSDT',
      'arbitrum': 'ARBUSDT',
      'vechain': 'VETUSDT',
      'algorand': 'ALGOUSDT',
    };
    return mapping[id]?.toUpperCase() || `${id.toUpperCase()}USDT`;
  }, []);

  useEffect(() => {
    if (symbolList.length === 0) return;

    // Convert IDs to Binance symbols
    const binanceSymbols = symbolList
      .map(id => idToBinanceSymbol(id))
      .filter(symbol => symbol !== 'USDTUSDT'); // Filter out USDT

    if (binanceSymbols.length === 0) return;

    const connectWebSocket = () => {
      try {
        // Binance WebSocket for real-time price streams
        const streams = binanceSymbols.map(s => `${s.toLowerCase()}@trade`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Live price WebSocket connected');
          setIsConnected(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { s: symbol, p: priceStr } = data;
            const price = parseFloat(priceStr);
            
            // Find the corresponding ID
            const id = symbol.replace('USDT', '').toLowerCase();
            
            setPrices(prev => {
              const prevPrice = prev[id]?.price || 0;
              const priceChange = ((price - prevPrice) / prevPrice) * 100;
              
              return {
                ...prev,
                [id]: {
                  symbol: id,
                  price,
                  change24h: prev[id]?.change24h || priceChange,
                }
              };
            });
            
            setLastUpdate(Date.now());
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket closed, reconnecting...');
          setIsConnected(false);
          
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [symbolList, idToBinanceSymbol]);

  return { prices, isConnected, lastUpdate };
}

// Hook for a single coin's live price
export function useLivePrice(coinId: string | null) {
  const [price, setPrice] = useState<number>(0);
  const [prevPrice, setPrevPrice] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!coinId) return;

    // Map ID to Binance symbol
    const mapping: Record<string, string> = {
      'bitcoin': 'btcusdt',
      'ethereum': 'ethusdt',
      'tether': 'usdtusdt',
      'binancecoin': 'bnbusdt',
      'solana': 'solusdt',
      'usd-coin': 'usdcusdt',
      'xrp': 'xrpusdt',
      'dogecoin': 'dogeusdt',
      'cardano': 'adausdt',
      'tron': 'trxusdt',
      'avalanche-2': 'avaxusdt',
      'shiba-inu': 'shibusdt',
      'polkadot': 'dotusdt',
      'chainlink': 'linkusdt',
      'bitcoin-cash': 'bchusdt',
      'near': 'nearusdt',
      'matic-network': 'maticusdt',
      'litecoin': 'ltcusdt',
      'internet-computer': 'icpusdt',
      'dai': 'daiusdt',
      'uniswap': 'uniusdt',
      'ethereum-classic': 'etcusdt',
      'monero': 'xmrusdt',
      'stellar': 'xlmusdt',
      'okb': 'okbusdt',
      'filecoin': 'filusdt',
      'cosmos': 'atomusdt',
      'hedera-hashgraph': 'hbarusdt',
      'cronos': 'crousdt',
      'aptos': 'aptusdt',
      'arbitrum': 'arbusdt',
      'vechain': 'vetusdt',
      'algorand': 'algousdt',
    };

    const binanceSymbol = mapping[coinId] || `${coinId.toLowerCase()}usdt`;
    
    if (binanceSymbol === 'usdtusdt') return;

    const connectWebSocket = () => {
      try {
        const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log(`Live price WebSocket connected for ${coinId}`);
          setIsConnected(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.p);
            setPrevPrice(price);
            setPrice(price);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [coinId]);

  return { price, prevPrice, isConnected, priceChange: price - prevPrice };
}