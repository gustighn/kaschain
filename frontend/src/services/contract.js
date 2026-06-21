import { kit } from './stellar';
import { TransactionBuilder, Networks, Contract, xdr, rpc, Horizon, Keypair, nativeToScVal } from '@stellar/stellar-sdk';

const contractId = import.meta.env.VITE_CONTRACT_ID;
const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';
const horizonUrl = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const networkPassphrase = import.meta.env.VITE_STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;

const rpcServer = new rpc.Server(rpcUrl);

export const recordTransactionOnChain = async (publicKey, amount, flow) => {
  if (!contractId) {
    console.warn("Contract ID not set, skipping on-chain logging.");
    return null;
  }

  try {
    const account = await rpcServer.getAccount(publicKey);
    const contract = new Contract(contractId);

    // Prepare arguments: user (Address), amount (i128), flow (Symbol)
    const args = [
      nativeToScVal(publicKey, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' }),
      nativeToScVal(flow, { type: 'symbol' })
    ];

    const operation = contract.call('record_transaction', ...args);

    let transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Prepare transaction for Soroban (simulates and adds footprint)
    transaction = await rpcServer.prepareTransaction(transaction);
    
    // Since stellar-wallets-kit handles signTransaction:
    const signedTxXdrResult = await kit.signTransaction(transaction.toXDR(), {
      networkPassphrase,
      address: publicKey
    });
    const signedTxXdr = signedTxXdrResult.signedTxXdr;
    
    const transactionToSubmit = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    
    const response = await rpcServer.sendTransaction(transactionToSubmit);
    if (response.status === "ERROR") {
      throw new Error("RPC Error: " + JSON.stringify(response.errorResult || response));
    }
    
    return response.hash;
    
  } catch (error) {
    console.error("Failed to record transaction on chain:", error);
    // Silent fail for on-chain log as it might be complex or testnet issues, but throw if required
    throw new Error("Failed to record transaction in smart contract: " + error.message);
  }
};
