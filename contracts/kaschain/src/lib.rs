#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[contract]
pub struct TransactionLogger;

#[contractimpl]
impl TransactionLogger {
    // Fungsi untuk mencatat transaksi ke dalam blockchain
    pub fn record_transaction(env: Env, user: Address, amount: i128, flow: Symbol) {
        // Memastikan bahwa pemanggil adalah user yang bersangkutan
        user.require_auth();
        
        // Membuat storage key unik berdasarkan address user dan nomor sequence ledger saat ini
        let key = (user.clone(), env.ledger().sequence());
        
        // Menyimpan data transaksi (jumlah dan flow: "income" atau "expense") ke persistent storage
        env.storage().persistent().set(&key, &(amount, flow));
    }
}

mod test;