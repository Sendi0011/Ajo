# Ajo 🌍  
### Bringing Africa’s Trusted Savings Circles Onchain  

**Ajo** is a decentralized community savings and payout platform built on **Base**, designed to bring Africa’s age-old group savings system — known as *Ajo*, *Esusu*, *Stokvel*, or *Chama* — into the digital age.  
It enables trusted circles to automate contributions, payouts, and transparency using smart contracts.  

---

## 🚀 Overview  

Across Africa, millions of people rely on informal savings groups to pool money and support one another.  
While these systems foster trust and cooperation, they often face problems like missed payments, fraud, and lack of transparency.  

**Ajo solves this by putting savings groups onchain.**  
Funds are managed by smart contracts — not people — ensuring automation, transparency, and fairness for everyone.  

---

## 💡 Key Features  

### 🔐 Onchain Trust  
Every group is governed by a smart contract escrow.  
No central collector. No manual records. Just code enforcing group rules.  

### ⚡ Automated Contributions & Payouts  
Contributions and payouts happen automatically on schedule — no delays, no disputes.  

### 📊 Transparent Tracking  
Every transaction is verifiable onchain, ensuring full visibility for all group members.  

### 💰 Flexible Savings Modes  
- **Rotational Mode** – Members take turns receiving payouts.  
- **Target Pool Mode** – Groups save toward a shared goal.  
- **Flexible Pool Mode** – Members deposit anytime and optionally earn yield through DeFi integrations.  

### 📈 Optional Yield Generation  
Idle funds can be staked via Base DeFi protocols (like Aave) to generate passive income for members.  

### 🌐 Accessibility  
Supports multiple wallets and will integrate **zkLogin** for social/email onboarding.  

---

## 🧱 Tech Stack  

**Smart Contracts (Solidity)**  
- `GroupFactory.sol` – Deploys new savings groups  
- `RotationalSavings.sol` – Handles rotational cycles and payouts  
- `TargetPool.sol` – Goal-based savings  
- `FlexiblePool.sol` – Flexible deposits with optional yield  
- `ReputationRegistry.sol` – Tracks user savings behavior  

**Frontend**  
- **Next.js** + **Tailwind CSS** – Responsive, mobile-first interface  
- **Wagmi + RainbowKit** – Wallet connection and onchain interaction  
- **Supabase** – Off-chain metadata and chat  

**Infrastructure**  
- **Base Network** – Low-cost, fast, and scalable for microtransactions  
- **Foundry** – Smart contract development and testing  

---

## 🪙 Current Setup  

For now, Ajo uses a **mock USDT token** for contributions and payouts:  
NEXT_PUBLIC_TOKEN_ADDRESS=0x408d5D0C25E588875D818f3161b3326D5d18EcAd


---

## 🧩 Why Onchain?  

Ajo is built onchain to solve trust and transparency issues in traditional savings systems.  
- **Smart contracts** manage funds safely and automatically.  
- **Transparency** ensures every member can verify group activity.  
- **Global participation** allows members anywhere to join and contribute.  

We’re not eliminating traditional savings circles — we’re **redefining them** and **onboarding communities into a secure, inclusive, and borderless financial system.**

---

## 🧠 Challenges  

During development, we ran into:  
- **State management issues** when trying to display groups for a newly added member.  
- **Mock token limitations** while testing payment flows.  
- **Time constraints**, which limited some UI and integration polish.  

These will be improved as we continue to refine the project.  

---

## 🎯 Roadmap  

**Phase 1 – MVP (Current)**  
- Group creation & contributions  
- Rotational/Target/Flexible modes  
- Wallet connection and basic dashboard  

**Phase 2 – Enhancement (Q1 2026)**  
- Yield integrations with DeFi protocols  
- Mobile app  
- Group chat (XMTP)  
- Reputation system  

**Phase 3 – Scale (Q2–Q4 2026)**  
- zkLogin social onboarding  
- Fiat on-ramp (Paystack/MoonPay)  
- Microloan marketplace  
- DAO governance for verified groups  

---

## 👥 Target Users  

- Community cooperatives and trade associations  
- Family and friend savings circles  
- Women’s groups and youth collectives  
- Faith-based and social organizations  

---

## 🏆 Why Ajo  

Ajo digitizes Africa’s most trusted financial culture — not to replace it, but to **enhance** it.  
By combining familiar community savings with blockchain’s automation and transparency, Ajo builds a bridge between **tradition and technology**, empowering millions to save, invest, and grow together.  

---

## 🔗 Links  

- **Live App:** [app.ajo.xyz](https://ajo-eight.vercel.app)
- **GitHub:** [github.com/ajo-onchain](https://github.com/Sendi0011/Ajo)  

---

### Built with ❤️ for African communities.  
### Powered by Base.  
