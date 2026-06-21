import React, { useState, useEffect } from 'react';
import { generateWallet, connectWallet, fundWithFriendbot, getBalance, sendTransaction, WALLETS } from '../services/stellar';
import { recordTransactionOnChain } from '../services/contract';
import { saveTransaction, subscribeToTransactions } from '../services/firebase';
import { extractTransactionData } from '../services/ai';

const Home = () => {
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Transfer state
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');

  // AI & Transaction state
  const [chatInput, setChatInput] = useState('');
  const [transactions, setTransactions] = useState([]);

  const fetchBalance = async (pubKey) => {
    try {
      const bal = await getBalance(pubKey);
      setBalance(bal);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (publicKey) {
      const unsubscribe = subscribeToTransactions(publicKey, (data) => {
        setTransactions(data);
      });
      return () => unsubscribe();
    }
  }, [publicKey]);

  const handleGenerateWallet = () => {
    const { publicKey, secretKey } = generateWallet();
    setPublicKey(publicKey);
    setSecretKey(secretKey);
    setBalance('0');
    setStatus({ type: 'success', message: 'Wallet created successfully! Save your Secret Key.' });
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const pubKey = await connectWallet();
      setPublicKey(pubKey);
      setSecretKey(''); // Sembunyikan secret key
      await fetchBalance(pubKey);
      setStatus({ type: 'success', message: 'Wallet connected successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async () => {
    if (!publicKey) return;
    try {
      setLoading(true);
      setStatus({ type: 'info', message: 'Requesting funds from Friendbot...' });
      await fundWithFriendbot(publicKey);
      await fetchBalance(publicKey);
      setStatus({ type: 'success', message: '10,000 XLM added successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to fund wallet. Has it been funded already?' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTransaction = async (e) => {
    e.preventDefault();
    if (!publicKey || !destination || !amount) return;
    try {
      setLoading(true);
      setStatus({ type: 'info', message: 'Signing & sending transaction...' });
      const tx = await sendTransaction(publicKey, destination, amount);
      setStatus({ type: 'success', message: `Transaction Successful! Hash: ${tx.hash}` });
      await fetchBalance(publicKey);
      setDestination('');
      setAmount('');
    } catch (err) {
      setStatus({ type: 'error', message: `Failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !publicKey) return;

    try {
      setLoading(true);
      setStatus({ type: 'info', message: 'AI is analyzing your message...' });
      
      const parsedData = await extractTransactionData(chatInput);
      
      // Attempt on-chain contract log
      setStatus({ type: 'info', message: 'Recording transaction to Smart Contract...' });
      const txHash = await recordTransactionOnChain(publicKey, parsedData.amount, parsedData.flow);
      
      // Save to Firestore
      setStatus({ type: 'info', message: 'Saving transaction to Firestore...' });
      await saveTransaction(publicKey, { ...parsedData, onChainHash: txHash });

      setStatus({ type: 'success', message: 'Transaction successfully recorded & saved.' });
      setChatInput('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to process AI chat' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Ambient Light Blobs */}
      <div className="ambient-blob ambient-blob-1"></div>
      <div className="ambient-blob ambient-blob-2"></div>

      <div className="min-h-screen text-[var(--color-text-primary)] font-body p-6 md:p-12 relative z-10">
        <div className="max-w-2xl mx-auto space-y-10">
          
          {/* Header */}
          <header className="flex flex-col items-center text-center space-y-3 pt-8 pb-4">
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight font-display text-[var(--color-text-primary)]">
              KasChain
            </h1>
            <p className="text-[var(--color-text-muted)] text-base font-medium tracking-wide">
              Decentralized Financial Tracker
            </p>
          </header>

          {/* Status Toast */}
          {status.message && (
            <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 transition-all ${
              status.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              status.type === 'success' ? 'bg-[#16E0A8]/10 text-[#16E0A8] border-[#16E0A8]/20' : 
              'bg-[#5B6CFF]/10 text-[#5B6CFF] border-[#5B6CFF]/20'
            }`}>
              <span>{status.type === 'error' ? '⚠️' : status.type === 'success' ? '✓' : 'ℹ️'}</span>
              {status.message}
            </div>
          )}

          {/* Wallet Section */}
          <section className="glass-card glass-card--elevated p-6 md:p-8">
            <h2 className="text-lg font-semibold font-display text-white mb-6 flex items-center gap-2">
              Wallet Selection
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button 
                onClick={handleConnectWallet}
                disabled={loading}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-glow)] text-white px-5 py-3 rounded-[12px] font-semibold text-sm transition-all disabled:opacity-70"
              >
                Connect Wallet
              </button>
              <button 
                onClick={handleGenerateWallet}
                className="flex-1 bg-transparent border border-[var(--color-text-muted)] hover:border-white text-white px-5 py-3 rounded-[12px] font-semibold text-sm transition-all"
              >
                Generate New
              </button>
            </div>

            {publicKey && (
              <div className="space-y-6">
                <div className="p-4 bg-[rgba(0,0,0,0.2)] rounded-[12px] border border-[rgba(255,255,255,0.05)] space-y-4">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Public Key</p>
                    <p className="font-mono text-sm break-all">{publicKey}</p>
                  </div>
                  
                  {secretKey && (
                    <div>
                      <p className="text-xs font-medium text-[var(--color-expense)] mb-1 uppercase tracking-wider">Secret Key (Do Not Share)</p>
                      <p className="font-mono text-sm text-[#FF6B7A] break-all">{secretKey}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[rgba(91,108,255,0.05)] rounded-[16px] border border-[rgba(91,108,255,0.15)]">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Available Balance</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight font-mono">{balance}</p>
                      <span className="text-[var(--color-stellar)] font-medium font-display">XLM</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleFundWallet}
                    disabled={loading || parseFloat(balance) > 0}
                    className="w-full sm:w-auto text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-glow)] text-white disabled:opacity-50 disabled:hover:bg-[var(--color-primary)] px-4 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Fund Testnet
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* AI Chat Section */}
          {publicKey && (
            <section className="glass-card glass-card--elevated p-6 md:p-8">
              <h2 className="text-lg font-semibold font-display text-white mb-6 flex items-center gap-2">
                AI Tracker (Gemini)
              </h2>
              <form onSubmit={handleChatSubmit} className="space-y-4">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Example: buy food 35" 
                  className="w-full bg-[rgba(0,0,0,0.15)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[#16E0A8] focus:border-transparent transition-all"
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#16E0A8] hover:bg-[#16E0A8]/80 text-black px-4 py-3 rounded-[12px] font-semibold text-sm transition-all"
                >
                  {loading ? 'Processing...' : 'Record Transaction'}
                </button>
              </form>
            </section>
          )}

          {/* Real-time Transactions list */}
          {publicKey && (
            <section className="glass-card glass-card--elevated p-6 md:p-8">
              <h2 className="text-lg font-semibold font-display text-white mb-6">
                Transaction History (Real-time)
              </h2>
              {transactions.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] italic text-center py-4">No transactions yet.</p>
              ) : (
                <ul className="space-y-3">
                  {transactions.map(tx => (
                    <li key={tx.id} className="flex justify-between items-center p-4 bg-[rgba(0,0,0,0.2)] rounded-[12px] border border-[rgba(255,255,255,0.05)]">
                      <div>
                        <p className="font-medium text-white text-sm capitalize">{tx.description} ({tx.category})</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono break-all">On-chain: {tx.onChainHash || 'None'}</p>
                      </div>
                      <div className={`font-mono font-bold text-sm ${tx.flow === 'income' ? 'text-[#16E0A8]' : 'text-[#FF6B7A]'}`}>
                        {tx.flow === 'income' ? '+' : '-'}{tx.amount}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Transfer Section */}
          {publicKey && (
            <section className="glass-card glass-card--elevated p-6 md:p-8">
              <h2 className="text-lg font-semibold font-display text-white mb-6 flex items-center gap-2">
                Send XLM
              </h2>
              <form onSubmit={handleSendTransaction} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-text-muted)] ml-1">Destination Address</label>
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="G..." 
                    className="w-full bg-[rgba(0,0,0,0.15)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-text-muted)] ml-1">Amount (XLM)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    step="0.0000001"
                    className="w-full bg-[rgba(0,0,0,0.15)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-mono"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-glow)] text-white disabled:opacity-50 disabled:hover:bg-[var(--color-primary)] px-4 py-3.5 rounded-[12px] font-semibold text-sm transition-all active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : 'Send Transaction'}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
