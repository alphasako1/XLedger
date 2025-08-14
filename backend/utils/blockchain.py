from web3 import Web3
import json
import os
from dotenv import load_dotenv
from fastapi import HTTPException
from datetime import datetime


# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

# Env variables
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
FACTORY_ADDRESS = os.getenv("FACTORY_ADDRESS")

if not WEB3_PROVIDER or not PRIVATE_KEY or not FACTORY_ADDRESS:
    raise ValueError("Missing one or more required environment variables: WEB3_PROVIDER, PRIVATE_KEY, FACTORY_ADDRESS")

# Load ABIs
with open(os.path.join(ARTIFACTS_DIR, "CaseFactory.json"), "r") as f:
    FACTORY_ABI = json.load(f)["abi"]

with open(os.path.join(ARTIFACTS_DIR, "CaseContract.json"), "r") as f:
    CASE_ABI = json.load(f)["abi"]

w3 = None
factory_contract = None
try:
    temp_w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
    if temp_w3.is_connected():
        w3 = temp_w3
        factory_contract = w3.eth.contract(address=FACTORY_ADDRESS, abi=FACTORY_ABI)
        print("✅ Connected to Ethereum")
    else:
        print("⚠️ Blockchain not reachable. Blockchain features disabled.")
except Exception as e:
    print(f"⚠️ Blockchain init failed: {e}")
    
def ensure_blockchain():
    if not w3 or not factory_contract:
        raise HTTPException(status_code=503, detail="Blockchain service unavailable. Please try again later.")


def _build_and_send_tx(contract_fn, acct, **kwargs):
    """Helper to build, sign, and send a transaction."""
    tx = contract_fn.build_transaction({
        'from': acct.address,
        'nonce': w3.eth.get_transaction_count(acct.address),
        'gas': kwargs.get('gas', 300000),
        'gasPrice': w3.eth.gas_price
    })
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)  # v6 uses raw_transaction
    return w3.eth.wait_for_transaction_receipt(tx_hash)


def create_case_on_chain(case_id, lawyer_email, client_email):
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    case_contract = factory_contract
    hashed_lawyer = Web3.keccak(text=lawyer_email)
    hashed_client = Web3.keccak(text=client_email)

    tx = case_contract.functions.createCase(case_id, hashed_lawyer, hashed_client).build_transaction({
        'from': acct.address,
        'nonce': w3.eth.get_transaction_count(acct.address),
        'gas': 1000000,
        'gasPrice': w3.eth.gas_price
    })
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex(), receipt


def update_case_status_on_chain(case_address, new_status):
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    case_contract = w3.eth.contract(address=case_address, abi=CASE_ABI)
    return _build_and_send_tx(
        case_contract.functions.updateStatus(new_status),
        acct,
        gas=200000
    )


def add_log_to_case(case_address, log_hash):
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    case_contract = get_case_contract(case_address)  # <--- correct contract
    return _build_and_send_tx(
        case_contract.functions.addLog(log_hash),
        acct, gas=150000
    )

def add_log_version_to_case(case_address, parent_index, new_log_hash):
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    case_contract = get_case_contract(case_address)
    return _build_and_send_tx(
        case_contract.functions.addLogVersion(parent_index, new_log_hash),
        acct,
        gas=200000
    )


def finalize_case_on_chain(case_address, final_hash):
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    case_contract = w3.eth.contract(address=case_address, abi=CASE_ABI)
    return _build_and_send_tx(case_contract.functions.finalizeCase(final_hash), acct, gas=150000)

def get_case_contract(case_address):
    return w3.eth.contract(address=case_address, abi=CASE_ABI)

def generate_log_string(case_id: str, log_id: str, description: str, time_spent: int, timestamp: datetime) -> str:
    # Use the exact same canonical format everywhere
    return f"{case_id}|{log_id}|{description}|{time_spent}|{timestamp.replace(tzinfo=None).isoformat()}"

def generate_log_hash(case_id: str, log_id: str, description: str, time_spent: int, timestamp: datetime) -> bytes:
    log_string = generate_log_string(case_id, log_id, description, time_spent, timestamp)
    return Web3.keccak(text=log_string)
