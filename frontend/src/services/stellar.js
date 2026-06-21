import { Keypair, Horizon, TransactionBuilder, Networks as SDKNetworks, Asset, Operation } from '@stellar/stellar-sdk';
import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';

export const FREIGHTER_ID = 'freighter';
export const XBULL_ID = 'xbull';
export const ALBEDO_ID = 'albedo';

export const WALLETS = {
  FREIGHTER: FREIGHTER_ID,
  XBULL: XBULL_ID,
  ALBEDO: ALBEDO_ID,
};

const horizonUrl = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const isPublic = import.meta.env.VITE_STELLAR_NETWORK === 'PUBLIC';
const networkPassphrase = isPublic ? SDKNetworks.PUBLIC : SDKNetworks.TESTNET;
const kitNetwork = isPublic ? Networks.PUBLIC : Networks.TESTNET;
const server = new Horizon.Server(horizonUrl);

StellarWalletsKit.init({
  network: kitNetwork,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule()
  ]
});

export const kit = StellarWalletsKit;

export const generateWallet = () => {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
};

export const connectWallet = async () => {
  try {
    // kit.authModal() opens the kit's built-in UI for users to select their wallet
    // It handles the connection and returns the selected address
    const { address } = await kit.authModal();
    return address;
  } catch (e) {
    console.error("Wallet connection error:", e);
    throw new Error("Wallet connection failed: " + (e.message || "Make sure the wallet extension is installed."));
  }
};

export const fundWithFriendbot = async (publicKey) => {
  const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  return response.json();
};

export const getBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find(b => b.asset_type === 'native');
    return balance ? balance.balance : '0';
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return '0'; // Akun belum aktif
    }
    throw error;
  }
};

export const sendTransaction = async (sourcePublicKey, destinationPublicKey, amount) => {
  try {
    const account = await server.loadAccount(sourcePublicKey);
    
    const transaction = new TransactionBuilder(account, {
      fee: await server.fetchBaseFee(),
      networkPassphrase,
    })
      .addOperation(Operation.payment({
        destination: destinationPublicKey,
        asset: Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    const result = await kit.signTransaction(transaction.toXDR(), {
      networkPassphrase,
      address: sourcePublicKey
    });
    
    const signedTxXdr = result.signedTxXdr;
    
    const transactionToSubmit = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    const response = await server.submitTransaction(transactionToSubmit);
    return response;
  } catch (error) {
    const errMsg = error?.message?.toLowerCase() || "";
    
    // Check 3 error types specified in requirements
    if (error?.response?.status === 400 || error?.response?.data?.extras?.result_codes?.operations?.includes("op_underfunded") || errMsg.includes("underfunded")) {
      throw new Error("Insufficient balance");
    }
    if (errMsg.includes("reject") || errMsg.includes("decline") || errMsg.includes("user declined") || errMsg.includes("cancelled")) {
      throw new Error("Signature rejected by user");
    }
    if (errMsg.includes("timeout") || error?.code === "ETIMEDOUT") {
      throw new Error("Network timeout");
    }
    
    throw new Error(error.message || "An error occurred while sending the transaction");
  }
};
