use axum::{response::Json, http::StatusCode};
use serde_json::{json, Value};

pub async fn health_check() -> Result<Json<Value>, StatusCode> {
    Ok(Json(json!({
        "status": "healthy",
        "service": "Solana Volume Bot",
        "version": "2.0.0",
        "timestamp": chrono::Utc::now()
    })))
}