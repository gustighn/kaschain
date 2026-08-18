#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, symbol_short};

#[test]
fn test_valid_transaction() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TransactionLogger);
    let client = TransactionLoggerClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Should succeed
    client.record_transaction(&user, &100, &symbol_short!("income"));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TransactionLogger);
    let client = TransactionLoggerClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Amount 0 should fail with Error::InvalidAmount (1)
    client.record_transaction(&user, &0, &symbol_short!("income"));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_invalid_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TransactionLogger);
    let client = TransactionLoggerClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    
    // Invalid flow should fail with Error::InvalidFlow (2)
    client.record_transaction(&user, &100, &symbol_short!("other"));
}
