# XLedger — Audit-Ready Case Ledger
Tamper-evident case logging with client e-signature and auditor verification.  
**Stack:** FastAPI + SQLAlchemy (SQLite) · Web3.py · Hardhat + Solidity · Vite + React + Tailwind
## Hackathon Project 2025 

Alpha Sako  
Donghoon Kim  
Hussein Elabhar  
Varshini Dilli Babu  
Xuan Pang  
Yuan Zhu  

---

## Features
- **Cases & Contracts:** Lawyer creates a case + contract; client e-signs; contract deploys a case smart contract.
- **On-chain integrity:** Every progress log is hashed and anchored on the case contract; edits create new versions.
- **Status tracking:** Status changes are recorded and can be verified.
- **Auditor mode:** Verify a single log or the whole case history by recomputing hashes and comparing to chain.
- **SQLite by default:** Zero-setup database (override with `DATABASE_URL` if desired).

---

## Repo layout
### backend/ # FastAPI app
api/routes.py

db/{database.py, models.py}

utils/{blockchain.py, id_generator.py, security.py}

artifacts/{CaseFactory.json, CaseContract.json} # ABIs used by backend

main.py, schemas.py, requirements.txt

.env.example # ← create your .env from this

### frontend/ # Vite + React + Tailwind UI
public/

src/

package.json, vite.config.js, tailwind.config.js, postcss.config.js

### blockchain/ # Hardhat + Solidity
contracts/{CaseFactory.sol, CaseContract.sol}

scripts/deploy.js

hardhat.config.js

package.json

.env.example # ← create your .env from this

---

## Quick start (local)

### Prereqs
- Node.js **18+**
- Python **3.11+** (3.13 OK)
- Git

## 1) Install dependencies
```bash
# blockchain
cd blockchain
npm i

# frontend
cd ../frontend
npm i

# backend
cd ../backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Start a local blockchain & deploy contracts
### Open Terminal A:
```bash
cd blockchain
npx hardhat node
# keep running
```
### Open Terminal B:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
# Copy the CaseFactory address that prints (0x...)
```
## 3) Configure environment files
### Create real .env files from the provided examples.
backend/.env
```bash
# Local Hardhat node
WEB3_PROVIDER=http://127.0.0.1:8545

# Use ANY private key printed by `npx hardhat node`
# (the account must have ETH on the local node)
PRIVATE_KEY=0x...

# Paste the address printed by deploy.js above
FACTORY_ADDRESS=0x...

# Optional DB override (defaults to ./test.db)
# DATABASE_URL=sqlite:///./test.db
```
blockchain.env
```bash
WEB3_PROVIDER=http://127.0.0.1:8545
PRIVATE_KEY=0x...   # can match backend .env
```
**Note:** ABIs for the backend are already checked into backend/artifacts/. The blockchain/artifacts/ build output is ignored.

## 4) Run the backend
### Open Terminal C:
```bash
cd backend
# activate your venv if not already
uvicorn backend.main:app --reload --port 8000
# http://localhost:8000
```

## 5) Run the frontend
### Open Terminal D:
```bash
cd frontend
npm run dev
# http://localhost:5173
```

---

## Using the app
### 1) Register three users via the UI (User ID's given by order i.e. first user created = 1):
- Lawyer
- Client
- Auditor

### 2) **Lawyer** signs in → **Create Case** (pending contract is created in DB).
A case ID is generated as "C-Lawyer ID-Client ID-Number of case between this lawyer and client"
A log ID is generated as "L-C-Lawyer ID-Client ID-Number of case between this lawyer and client-Number of log under this case"
### 3) **Client** signs in → **Review & Sign** the contract
Once both sides sign, the CaseFactory deploys a CaseContract and the case status becomes active.

### 4) **Lawyer** logs work
Each log is hashed off-chain and added to the contract. Edits create new versions on-chain.

### 5) **Auditor** signs in → **Verify Log** or **Verify Case**
The app recomputes hashes and compares against on-chain values.
A lawyer must first grant access to the can before an auditor can varify it (In a lawyer's case click grant access and add the auditor email and duration of access).

---

## Environment Variables
### backend/.env
- ```bash WEB3_PROVIDER``` - e.g., ```bash http://127.0.0.1:8545```
- ```bash PRIVATE_KEY``` - account used to send transactions (Hardhat node key is fine)
- ```bash FACTORY_ADDRESS``` - address printed by ```bash scripts/deploy.js```
- ```bash DATABASE_URL``` (optional) — SQLAlchemy URL; defaults to ```bash sqlite:///./test.db```

### blockchain/.env
- ```bash WEB3_PROVIDER```
- ```bash PRIVATE_KEY```
Never commit real ```bash .env``` files. Use the ```bash *.env.example``` files as templates.

---

## CORS / ports
- Backend allows ```bash http://localhost:5173``` by default (see ```bash backend/main.py```).
If you change the frontend port, update CORS accordingly.

---

## Common issues & fixes
### 1) ```bash 503 Blockchain service unavailable```
Hardhat node isn’t running, or ```bash WEB3_PROVIDER``` is wrong.
Start ```bash npx hardhat node``` and verify ```bash http://127.0.0.1:8545```.

### 2) ```bash ContractLogicError: panic code 0x32 (out-of-bounds index)```
You’re reading a log index that doesn’t exist on-chain.

This can happen if logs were created before the contract was deployed (i.e., while the case was still pending).

Create a **fresh active** case (both signatures), then add new logs.
Alternatively, stop the backend and delete ```bash backend/test.db```.

### 3) Windows “only in casing” import error
Ensure your import paths match folder casing exactly (e.g., ```bash components/Marketing/HeroPanel``` vs ```bash marketing/HeroPanel```).

### 4) ```bash Invalid credentials``` shows browser alert
That’s the frontend ```bash alert()``` on a 401 response. Swap to toasts if you prefer inline UI messaging.

### 5) CORS / wrong origin
If the frontend runs on a different host/port, add it to the CORS ```bash allow_origins``` array in ```bash backend/main.py.```

---

## Smart Contracts (overview)
- ### CaseFactory.sol
  - Owner-only ```bash createCase(caseId, lawyerHash, clientHash)```
  - ```bash getCaseAddress(caseId)``` returns the deployed ```bash CaseContract``` address.
- ### CaseContract.sol
  - ```bash addLog(logHash)``` - append a new log (version 1)
  - ```bash addLogVersion(parentIndex, newLogHash)``` - append an edited version linked to the original
  - ```bash updateStatus(statusHash)```
  - ```bash finalizeCase(finalHash)``` - mark case closed with a final hash
  - ```bash getLog(index)``` - returns ```bash (logHash, timestamp, version, parentLogIndex)```
The backend constructs hashes deterministically so auditors can recompute and compare.

## Development Tips
- **Reset DB:** stop backend, delete ``bash backend/test.db```, then restart backend.
- **Switch to a testnet:** set ```bash WEB3_PROVIDER``` to an RPC URL and use a funded testnet key. Update ```bash hardhat.config.js``` to add a testnet network if needed.
- **ABIs:** backend reads from ```bash backend/artifacts/*.json```. If you modify contracts, re-compile and copy updated ABIs there.

---

## Contributing
PRs and issues welcome. Please avoid committing secrets, build output, or databases.

---

## License
MIT License

---

## Acknowlegements
FastAPI · SQLAlchemy · Web3.py · Hardhat · ethers.js · React · Vite · TailwindCSS

