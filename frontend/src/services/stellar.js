import { Keypair, Horizon, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';

const horizonUrl = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const networkPassphrase = import.meta.env.VITE_STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;
const server = new Horizon.Server(horizonUrl);

export const generateWallet = () => {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
};

export const connectFreighter = async () => {
  const connectedStatus = await isConnected();
  if (connectedStatus.isConnected) {
    const access = await requestAccess();
    if (access.error) {
      throw new Error(access.error);
    }
    return access.address;
  }
  throw new Error("Freighter wallet is not connected atau belum diinstall.");
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

  // Sign dengan Freighter
  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase,
  });

  if (signResult.error) {
    throw new Error(signResult.error);
  }

  // Submit ke Horizon
  const transactionToSubmit = TransactionBuilder.fromXDR(signResult.signedTxXdr, networkPassphrase);
  const response = await server.submitTransaction(transactionToSubmit);
  return response;
};
