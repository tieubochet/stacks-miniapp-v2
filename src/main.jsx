import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Import Reown AppKit
import { createAppKit } from '@reown/appkit'
import { stacks } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

// Project ID from the challenge
const projectId = 'e7569b869626086b2a4a61ad701e57ef'

// Configure Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [stacks], // Stacks mainnet
})

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [stacks],
  projectId,
  metadata: {
    name: 'Stacks MiniApp v2',
    description: 'Simple app to connect Stacks wallet and get balance',
    url: window.location.origin,
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  }
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)