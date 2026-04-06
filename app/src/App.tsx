import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { MarketOverview } from '@/pages/MarketOverview';
import { CoinDetail } from '@/pages/CoinDetail';
import { Watchlist } from '@/pages/Watchlist';
import { Trending } from '@/pages/Trending';
import { Compare } from '@/pages/Compare';
import { GainersLosers } from '@/pages/GainersLosers';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<MarketOverview />} />
            <Route path="/gainers-losers" element={<GainersLosers />} />
            <Route path="/coin/:id" element={<CoinDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
