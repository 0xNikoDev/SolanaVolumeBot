use crate::models::*;
use crate::database::Database;
use crate::solana::SolanaClient;
use crate::errors::Result;
use std::sync::Arc;
use tokio::time::{sleep, Duration};
use tracing::{info, error, warn};

pub struct TradingService {
    db: Arc<Database>,
    solana_client: Arc<SolanaClient>,
}

impl TradingService {
    pub fn new(db: Arc<Database>, rpc_url: String) -> Self {
        let solana_client = Arc::new(SolanaClient::new(rpc_url));
        Self { db, solana_client }
    }
    
    pub async fn buy_tokens(&self, request: TradingRequest) -> Result<String> {
        info!("Executing buy order for wallet {}", request.wallet_id);
        
        // Get wallet details
        let wallet = self.get_wallet_by_id(request.wallet_id).await?;
        
        // Execute buy transaction
        let signature = self.solana_client.buy_tokens(
            &wallet.private_key,
            &request.token_address,
            request.amount,
            request.slippage.unwrap_or(5.0)
        ).await?;
        
        // Record transaction
        self.record_transaction(
            request.wallet_id,
            &request.token_address,
            TransactionType::Buy,
            request.amount,
            0.0, // Will be updated after confirmation
            0.0, // Price will be calculated
            &signature
        ).await?;
        
        info!("Buy transaction executed: {}", signature);
        Ok(signature)
    }
    
    pub async fn sell_tokens(&self, request: TradingRequest) -> Result<String> {
        info!("Executing sell order for wallet {}", request.wallet_id);
        
        let wallet = self.get_wallet_by_id(request.wallet_id).await?;
        
        let signature = self.solana_client.sell_tokens(
            &wallet.private_key,
            &request.token_address,
            request.amount,
            request.slippage.unwrap_or(5.0)
        ).await?;
        
        self.record_transaction(
            request.wallet_id,
            &request.token_address,
            TransactionType::Sell,
            request.amount,
            0.0,
            0.0,
            &signature
        ).await?;
        
        info!("Sell transaction executed: {}", signature);
        Ok(signature)
    }
    
    pub async fn start_automated_trading(&self, settings: TradingSettings, token_address: String) -> Result<()> {
        info!("Starting automated trading for token: {}", token_address);
        
        // Spawn background task for automated trading
        let db = self.db.clone();
        let solana_client = self.solana_client.clone();
        let settings = Arc::new(settings);
        
        tokio::spawn(async move {
            if let Err(e) = Self::automated_trading_loop(db, solana_client, settings, token_address).await {
                error!("Automated trading error: {}", e);
            }
        });
        
        Ok(())
    }
    
    async fn automated_trading_loop(
        db: Arc<Database>,
        solana_client: Arc<SolanaClient>,
        settings: Arc<TradingSettings>,
        token_address: String
    ) -> Result<()> {
        while settings.is_active {
            // Get active wallets
            let wallets = Self::get_active_wallets(&db).await?;
            
            for wallet in wallets {
                match settings.mode {
                    TradingMode::Buy => {
                        if let Err(e) = Self::execute_buy_trade(&solana_client, &wallet, &token_address, &settings).await {
                            error!("Buy trade failed: {}", e);
                        }
                    },
                    TradingMode::Sell => {
                        if let Err(e) = Self::execute_sell_trade(&solana_client, &wallet, &token_address, &settings).await {
                            error!("Sell trade failed: {}", e);
                        }
                    },
                    TradingMode::PumpAndDump => {
                        if let Err(e) = Self::execute_pump_and_dump(&solana_client, &wallet, &token_address, &settings).await {
                            error!("Pump and dump failed: {}", e);
                        }
                    },
                    TradingMode::MarketMaking => {
                        if let Err(e) = Self::execute_market_making(&solana_client, &wallet, &token_address, &settings).await {
                            error!("Market making failed: {}", e);
                        }
                    },
                }
                
                // Random delay between trades
                let delay = Self::calculate_random_delay();
                sleep(Duration::from_millis(delay)).await;
            }
            
            // Check stop conditions
            if Self::should_stop_trading(&db, &token_address, &settings).await? {
                info!("Stop condition met, halting automated trading");
                break;
            }
            
            sleep(Duration::from_secs(1)).await;
        }
        
        Ok(())
    }
    
    async fn execute_buy_trade(
        solana_client: &SolanaClient,
        wallet: &Wallet,
        token_address: &str,
        settings: &TradingSettings
    ) -> Result<()> {
        let amount = Self::calculate_random_amount(settings.amount_from, settings.amount_to);
        let slippage = Self::calculate_random_slippage(settings.slippage_from, settings.slippage_to);
        
        let _signature = solana_client.buy_tokens(
            &wallet.private_key,
            token_address,
            amount,
            slippage
        ).await?;
        
        Ok(())
    }
    
    async fn execute_sell_trade(
        solana_client: &SolanaClient,
        wallet: &Wallet,
        token_address: &str,
        settings: &TradingSettings
    ) -> Result<()> {
        let amount = Self::calculate_random_amount(settings.amount_from, settings.amount_to);
        let slippage = Self::calculate_random_slippage(settings.slippage_from, settings.slippage_to);
        
        let _signature = solana_client.sell_tokens(
            &wallet.private_key,
            token_address,
            amount,
            slippage
        ).await?;
        
        Ok(())
    }
    
    async fn execute_pump_and_dump(
        _solana_client: &SolanaClient,
        _wallet: &Wallet,
        _token_address: &str,
        _settings: &TradingSettings
    ) -> Result<()> {
        // TODO: Implement pump and dump strategy
        Ok(())
    }
    
    async fn execute_market_making(
        _solana_client: &SolanaClient,
        _wallet: &Wallet,
        _token_address: &str,
        _settings: &TradingSettings
    ) -> Result<()> {
        // TODO: Implement market making strategy
        Ok(())
    }
    
    // Helper methods
    async fn get_active_wallets(db: &Database) -> Result<Vec<Wallet>> {
        let wallets = sqlx::query_as!(
            Wallet,
            r#"
            SELECT id, address, private_key, wallet_type as "wallet_type: WalletType",
                   sol_balance, token_balance, is_active, created_at, updated_at
            FROM wallets 
            WHERE is_active = true AND wallet_type = 'trading'
            "#
        )
        .fetch_all(&db.pool)
        .await?;
        
        Ok(wallets)
    }
    
    async fn should_stop_trading(_db: &Database, _token_address: &str, settings: &TradingSettings) -> Result<bool> {
        // TODO: Implement stop conditions based on volume, time, etc.
        Ok(!settings.is_active)
    }
    
    fn calculate_random_amount(from: f64, to: f64) -> f64 {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        rng.gen_range(from..=to)
    }
    
    fn calculate_random_slippage(from: f64, to: f64) -> f64 {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        rng.gen_range(from..=to)
    }
    
    fn calculate_random_delay() -> u64 {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        rng.gen_range(1000..=10000) // 1-10 seconds
    }
    
    async fn get_wallet_by_id(&self, wallet_id: i32) -> Result<Wallet> {
        let wallet = sqlx::query_as!(
            Wallet,
            r#"
            SELECT id, address, private_key, wallet_type as "wallet_type: WalletType",
                   sol_balance, token_balance, is_active, created_at, updated_at
            FROM wallets WHERE id = $1
            "#,
            wallet_id
        )
        .fetch_one(&self.db.pool)
        .await?;
        
        Ok(wallet)
    }
    
    async fn record_transaction(
        &self,
        wallet_id: i32,
        token_address: &str,
        transaction_type: TransactionType,
        sol_amount: f64,
        token_amount: f64,
        price: f64,
        signature: &str
    ) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO transactions (wallet_id, token_address, transaction_type, sol_amount, token_amount, price, tx_signature, block_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            "#,
            wallet_id,
            token_address,
            transaction_type as TransactionType,
            sol_amount,
            token_amount,
            price,
            signature
        )
        .execute(&self.db.pool)
        .await?;
        
        Ok(())
    }
}
