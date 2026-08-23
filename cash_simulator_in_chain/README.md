# On-Chain Cash Flow Simulator & Graph Visualizer (`cash_simulator_in_chain`)

An interactive, physical bubble graph visualizer and real-time transaction simulator for EVM / Anvil blockchain cash flows, wallet cluster grouping, and zero-knowledge commitment tracking.

Built with **Vite**, **React 19**, **TypeScript**, **`d3-force`**, **Viem**, and **Tailwind CSS v4**.

---

## 🌟 Key Features

- **Interactive Physics Bubble Graph**: Visualizes wallets as physical nodes using `d3-force`. Node sizes scale dynamically based on total ETH / token holdings, with interactive dragging, zooming, and cluster auto-grouping.
- **Dual-Mode Operation**:
  - **Live Anvil RPC Mode**: Connects directly to a local EVM node (Anvil at `http://127.0.0.1:8545`) via Viem to fetch real-time wallet balances, block numbers, and on-chain transfer events.
  - **Simulated Dataset Mode**: Pre-loaded mock datasets (`APE`, `USDT`, `ETH`) for offline testing, behavioral analysis, and privacy commitment demonstration.
- **MetaMask & Address Tracking**:
  - Connect your MetaMask browser wallet to view your active account within the graph network.
  - Add custom tracked EVM addresses to monitor specific wallet clusters in real-time.
- **Live On-Chain Transaction Simulator**:
  - Send ETH or ERC-20 tokens directly between Anvil pre-funded accounts or custom addresses.
  - Instant force-directed canvas state update upon block confirmation.
- **Wallet & Cluster Analysis**:
  - Filter graph by keyword search or hide unclustered orphan nodes.
  - Inspect individual wallet details, transaction links, token balances, and privacy tags (e.g. zkBob commitment notes).

---

## ⚙️ Requirements & Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Local EVM Node (Optional for Live Mode)**: [Foundry Anvil](https://getfoundry.sh/) listening at `http://127.0.0.1:8545`

---

## 🚀 How to Run Locally

### 1. Install Dependencies

Navigate to the `cash_simulator_in_chain` directory and install dependencies:

```bash
cd cash_simulator_in_chain
npm install
```

### 2. Launch Development Server

Start the Vite development server:

```bash
npm run dev
```

*The simulator interface will open at [http://localhost:5173](http://localhost:5173).*

### 3. Connect to Local Anvil Blockchain (Optional)

In a separate terminal, launch Anvil:
```bash
anvil
```
Toggle **Live Anvil RPC** mode in the header of the simulator UI to stream real-time block and wallet updates.

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Force-Directed Physics Engine**: `d3-force`
- **Blockchain Connectivity**: Viem v2 (EVM JSON-RPC client)
- **Styling**: Tailwind CSS v4 + Lucide React icons
