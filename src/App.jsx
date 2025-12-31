import { useState, useEffect } from 'react'
import SignClient from '@walletconnect/sign-client'
import QRCode from 'qrcode.react'

const PROJECT_ID = 'b113be1d4d4bec533241f1af1982e154'
const STACKS_RPC_URL = 'https://stacks-node-api.mainnet.stacks.co/v2/accounts/'

function App() {
  const [signClient, setSignClient] = useState(null)
  const [session, setSession] = useState(null)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState(null)
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize SignClient on mount
  useEffect(() => {
    const init = async () => {
      try {
        const client = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: 'Stacks WalletConnect App',
            description: 'Simple app to connect Stacks wallet and get balance',
            url: window.location.origin,
            icons: ['https://walletconnect.com/walletconnect-logo.png'],
          },
        })
        setSignClient(client)
      } catch (err) {
        setError('Failed to initialize WalletConnect: ' + err.message)
      }
    }
    init()
  }, [])

  // Fetch balance when address is set
  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          const response = await fetch(`${STACKS_RPC_URL}${address}`)
          const data = await response.json()
          const stxBalance = parseInt(data.balance) / 1_000_000 // STX has 6 decimals
          setBalance(stxBalance)
        } catch (err) {
          setError('Failed to fetch balance: ' + err.message)
        }
      }
    }
    fetchBalance()
  }, [address])

  const connectWallet = async () => {
    if (!signClient) {
      setError('WalletConnect not initialized')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          stacks: {
            methods: ['stacks_signMessage'], // Minimal methods; add more if needed (e.g., 'stacks_stx_transfer')
            chains: ['stacks:mainnet'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      })
      if (uri) {
        setUri(uri)
      }
      const session = await approval()
      setSession(session)
      // Extract Stacks address from accounts (format: stacks:mainnet:ST...)
      const stacksAccount = session.namespaces.stacks.accounts[0]
      const [, , addr] = stacksAccount.split(':')
      setAddress(addr)
      setUri('') // Hide QR after connection
    } catch (err) {
      setError('Connection failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    if (session && signClient) {
      try {
        await signClient.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: 'User disconnected' },
        })
        setSession(null)
        setAddress('')
        setBalance(null)
      } catch (err) {
        setError('Disconnect failed: ' + err.message)
      }
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Stacks WalletConnect App</h1>
      {!session ? (
        <button onClick={connectWallet} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected Address: {address}</p>
          <p>Balance: {balance !== null ? `${balance} STX` : 'Fetching...'}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
      {uri && (
        <div style={{ marginTop: '20px' }}>
          <h3>Scan QR to Connect</h3>
          <QRCode value={uri} size={256} />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App