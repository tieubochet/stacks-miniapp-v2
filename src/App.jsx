import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { open } from '@reown/appkit' // For opening the modal

const STACKS_RPC_URL = 'https://stacks-node-api.mainnet.stacks.co/v2/accounts/'

function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')

  // Fetch balance when connected (AppKit handles Stacks address)
  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          const response = await fetch(`${STACKS_RPC_URL}${address}`)
          const data = await response.json()
          const stxBalance = parseInt(data.balance) / 1000000 // STX has 6 decimals
          setBalance(stxBalance)
        } catch (err) {
          setError('Failed to fetch balance: ' + err.message)
        }
      }
    }
    fetchBalance()
  }, [address])

  const connectWallet = async () => {
    try {
      await open() // Opens the Reown modal for wallet selection (Leather if installed, or QR)
    } catch (err) {
      setError('Connection failed: ' + err.message)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Stacks Reown AppKit App</h1>
      {!isConnected ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected Address: {address}</p>
          <p>Balance: {balance !== null ? `${balance} STX` : 'Fetching...'}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App