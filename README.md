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
backend/ # FastAPI app
api/routes.py
db/{database.py, models.py}
utils/{blockchain.py, id_generator.py, security.py}
artifacts/{CaseFactory.json, CaseContract.json} # ABIs used by backend
main.py, schemas.py, requirements.txt
.env.example # ← create your .env from this

frontend/ # Vite + React + Tailwind UI
public/
src/
package.json, vite.config.js, tailwind.config.js, postcss.config.js

blockchain/ # Hardhat + Solidity
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

### 1) Install dependencies
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

###2) Start a local blockchain & deploy contracts

