import { useState, useEffect } from 'react'
import SignClient from '@walletconnect/sign-client'
import QRCode from 'qrcode.react'
import { showConnect, getDefaultSession } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'

const PROJECT_ID = 'e7569b869626086b2a4a61ad701e57ef'
const STACKS_RPC_URL = 'https://stacks-node-api.mainnet.stacks.co/v2/accounts/'

function App() {
  const [signClient, setSignClient] = useState(null)
  const [session, setSession] = useState(null)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState(null)
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isExtensionAvailable, setIsExtensionAvailable] = useState(false)

  // Initialize SignClient on mount
  useEffect(() => {
    const init = async () => {
      try {
        const client = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: 'Stacks MiniApp v2',
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

  // Detect Leather extension
  useEffect(() => {
    const checkExtension = () => {
      if (window.StacksProvider) {
        setIsExtensionAvailable(true)
      }
    }
    checkExtension()
    // Listen for extension load if not immediate
    window.addEventListener('load', checkExtension)
    return () => window.removeEventListener('load', checkExtension)
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

  const connectWithExtension = async () => {
    setLoading(true)
    setError('')
    try {
      showConnect({
        appDetails: {
          name: 'Stacks WalletConnect App',
          icon: window.location.origin + '/logo.png', // Optional: Add a logo if you have one
        },
        network: new StacksMainnet(),
        onFinished: async (data) => {
          const { stacksAddress } = data.authResponsePayload.profile.stxAddress
          setAddress(stacksAddress.mainnet || stacksAddress) // Fallback to mainnet address
          setSession({}) // Mock session for connected state
          setLoading(false)
        },
        onCancel: () => {
          setError('Connection cancelled')
          setLoading(false)
        },
      })
    } catch (err) {
      setError('Extension connection failed: ' + err.message)
      setLoading(false)
    }
  }

  const connectWithWalletConnect = async () => {
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
            methods: ['stacks_signMessage'],
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
      const stacksAccount = session.namespaces.stacks.accounts[0]
      const [, , addr] = stacksAccount.split(':')
      setAddress(addr)
      setUri('')
    } catch (err) {
      setError('WalletConnect connection failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async () => {
    if (isExtensionAvailable) {
      await connectWithExtension()
    } else {
      await connectWithWalletConnect()
    }
  }

  const disconnectWallet = async () => {
    // For simplicity, just reset states; add proper disconnect if needed
    setSession(null)
    setAddress('')
    setBalance(null)
    setUri('')
    if (signClient && session) {
      try {
        await signClient.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: 'User disconnected' },
        })
      } catch (err) {
        console.error('Disconnect failed:', err)
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