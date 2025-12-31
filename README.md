# Stacks Reown AppKit App

This is a simple React web app built with Vite that integrates Reown AppKit (formerly WalletConnect) for connecting to Stacks wallets (e.g., Leather extension or mobile via QR code). It allows users to connect their wallet and view their STX balance on the Stacks mainnet.

The app is designed to meet the Builder Challenge requirements by using Reown AppKit SDK.

## Features
- Connect to Stacks wallet using Reown AppKit modal (supports Leather browser extension directly if installed).
- Fetch and display the connected address and STX balance.
- Disconnect functionality.
- Optimized for deployment on Vercel.

## Prerequisites
- Node.js (v18 or later) for local development (optional, since deploy is via Git to Vercel).
- A Reown/WalletConnect project ID.
- Leather Wallet extension installed on Chrome for direct connection testing.

## Installation
1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd stacks-reown-appkit-app
   ```
2. Install dependencies:
   ```
   npm install
   ```

## Running Locally
```
npm run dev
```
Open `http://localhost:5173` in your browser.

## Deployment to Vercel
1. Push the code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), create a new project, and import your Git repo.
3. Vercel will automatically detect the Vite/React setup and deploy. No additional configuration needed.
4. Add your deployed domain (e.g., `https://your-app.vercel.app`) to the Reown dashboard allowlist for WalletConnect to work.

## Usage
- Click "Connect Wallet" to open the Reown modal.
- If Leather extension is installed, select it for direct connection.
- Otherwise, use QR code for mobile wallets.
- After connection, the app displays the address and STX balance.
- Click "Disconnect" to reset.

## Configuration
- **Project ID**: Set in `src/main.jsx` – update if using a different Reown project.
- **Stacks RPC**: Uses public mainnet API for balance fetching.
- For testnet, update `stacks` import to testnet config in Reown docs.

## Troubleshooting
- **WalletConnect Errors**: Ensure domain is allowlisted in Reown dashboard (wait 15 mins after adding).
- **Balance Fetch Fail**: Check if address is valid STX format and API is accessible.
- **Extension Not Detected**: Reload page or ensure Leather is enabled.

## Dependencies
- `@reown/appkit`: For wallet connection modal.
- `@reown/appkit-adapter-wagmi`: Wagmi integration.
- `@tanstack/react-query`: For query management.
- `wagmi` & `viem`: Blockchain interactions.
- See `package.json` for full list.

## Extending for Builder Challenge
- **Smart Contracts**: Add contract interactions (e.g., via AppKit's signing) to track users/fees.
- **GitHub Contributions**: Host on public repo for tracking.
- **Leaderboard**: Integrate API calls for daily updates (future feature).

## License
MIT License. Feel free to use and modify.