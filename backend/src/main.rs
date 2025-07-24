use axum::{
    extract::Extension,
    http::{StatusCode, Method},
    response::Json,
    routing::{get, post},
    Router,
};
use tower_http::cors::{CorsLayer, Any};
use std::sync::Arc;
use tracing::{info, error};

mod config;
mod models;
mod handlers;
mod services;
mod database;
mod solana;
mod utils;
mod errors;

use config::Config;
use database::Database;
use services::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::init();
    
    // Load configuration
    let config = Config::from_env()?;
    info!("Starting Solana Volume Bot v2.0.0");
    
    // Initialize database
    let db = Database::new(&config.database_url).await?;
    db.migrate().await?;
    
    // Initialize services
    let wallet_service = Arc::new(WalletService::new(db.clone()));
    let trading_service = Arc::new(TradingService::new(
        db.clone(), 
        config.solana_rpc_url.clone()
    ));
    let token_service = Arc::new(TokenService::new(
        db.clone(),
        config.clone()
    ));
    let analytics_service = Arc::new(AnalyticsService::new(db.clone()));
    
    // Setup CORS
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any)
        .allow_origin(Any);
    
    // Build application
    let app = Router::new()
        .route("/", get(handlers::health::health_check))
        .route("/api/health", get(handlers::health::health_check))
        
        // Wallet endpoints
        .route("/api/wallets", get(handlers::wallets::get_wallets))
        .route("/api/wallets", post(handlers::wallets::add_wallets))
        .route("/api/wallets/:id", get(handlers::wallets::get_wallet))
        .route("/api/wallets/:id", post(handlers::wallets::update_wallet))
        
        // Token endpoints
        .route("/api/tokens/create", post(handlers::tokens::create_token))
        .route("/api/tokens/:address/update", post(handlers::tokens::update_token))
        .route("/api/tokens/:address", get(handlers::tokens::get_token_info))
        
        // Trading endpoints
        .route("/api/trading/buy", post(handlers::trading::buy_tokens))
        .route("/api/trading/sell", post(handlers::trading::sell_tokens))
        .route("/api/trading/start", post(handlers::trading::start_automated_trading))
        .route("/api/trading/stop", post(handlers::trading::stop_automated_trading))
        
        // Transaction endpoints
        .route("/api/transactions/:token_address", get(handlers::transactions::get_transactions))
        .route("/api/holders/:token_address", get(handlers::transactions::get_holders))
        
        // Analytics endpoints
        .route("/api/portfolio/stats", get(handlers::analytics::get_portfolio_stats))
        .route("/api/analytics/performance", get(handlers::analytics::get_performance))
        
        .layer(cors)
        .layer(Extension(wallet_service))
        .layer(Extension(trading_service))
        .layer(Extension(token_service))
        .layer(Extension(analytics_service));
    
    // Start server
    let addr = format!("{}:{}", config.host, config.port);
    info!("Server starting on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}
