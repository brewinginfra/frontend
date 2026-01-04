import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { MainApp } from './components/MainApp';
import LandingPage from './components/LandingPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/mainpage" element={<MainApp />} />
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}