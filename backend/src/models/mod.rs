use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Wallet {
    pub id: i32,
    pub address: String,
    pub private_key: String, // Encrypted
    pub wallet_type: WalletType,
    pub sol_balance: f64,
    pub token_balance: f64,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "wallet_type", rename_all = "lowercase")]
pub enum WalletType {
    Trading,
    Creation,
    Bundle,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Transaction {
    pub id: Uuid,
    pub wallet_id: i32,
    pub token_address: String,
    pub transaction_type: TransactionType,
    pub sol_amount: f64,
    pub token_amount: f64,
    pub price: f64,
    pub tx_signature: String,
    pub block_time: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "transaction_type", rename_all = "UPPERCASE")]
pub enum TransactionType {
    Buy,
    Sell,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Token {
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image_url: String,
    pub twitter: Option<String>,
    pub telegram: Option<String>,
    pub website: Option<String>,
    pub created_at: DateTime<Utc>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingSettings {
    pub mode: TradingMode,
    pub slippage_from: f64,
    pub slippage_to: f64,
    pub amount_from: f64,
    pub amount_to: f64,
    pub stop_volume: f64,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TradingMode {
    Buy,
    Sell,
    PumpAndDump,
    MarketMaking,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HolderData {
    pub wallet_address: String,
    pub cost_sol: f64,
    pub tokens_held: f64,
    pub avg_cost: f64,
    pub unrealized_profit: f64,
    pub potential_sell: f64,
    pub is_our_wallet: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTokenRequest {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image: String,
    pub twitter: Option<String>,
    pub telegram: Option<String>,
    pub website: Option<String>,
    pub initial_buy_amount: f64,
    pub auto_bundle_buy: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingRequest {
    pub wallet_id: i32,
    pub amount: f64,
    pub token_address: String,
    pub slippage: Option<f64>,
}
