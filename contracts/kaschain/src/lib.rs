#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Symbol, symbol_short};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidAmount = 1,
    InvalidFlow = 2,
    NotAuthorized = 3,
}

#[contract]
pub struct TransactionLogger;

#[contractimpl]
impl TransactionLogger {
    // Fungsi untuk mencatat transaksi ke dalam blockchain
    pub fn record_transaction(env: Env, user: Address, amount: i128, flow: Symbol) -> Result<(), Error> {
        // Memastikan bahwa pemanggil adalah user yang bersangkutan
        user.require_auth();
        
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        if flow != symbol_short!("income") && flow != symbol_short!("expense") {
            return Err(Error::InvalidFlow);
        }
        
        // Membuat storage key unik berdasarkan address user dan nomor sequence ledger saat ini
        let key = (user.clone(), env.ledger().sequence());
        
        // Menyimpan data transaksi (jumlah dan flow: "income" atau "expense") ke persistent storage
        env.storage().persistent().set(&key, &(amount, flow));

        Ok(())
    }
}

mod test;