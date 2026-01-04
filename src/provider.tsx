import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from '@privy-io/wagmi';
import { arbitrumSepolia } from 'viem/chains';
import { config } from './wagmi';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "cmizj8el103ffjr0cgulg50fo"}
      clientId={import.meta.env.VITE_PRIVY_CLIENT_ID || "client-WY6TRAJHMg6YPRGJcNSngv8Hr2WfGPinoJY4KiqZZPDSY"}
      config={{
        // Create embedded wallets for all users
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
        defaultChain: arbitrumSepolia,
        supportedChains: [arbitrumSepolia],
        appearance: {
          theme: 'dark',
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
            {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}