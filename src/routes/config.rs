use axum::{extract::State, Json};
use sqlx::SqlitePool;

use crate::models::config::DbConfig;
use crate::utils::db::{add_db_config, fetch_db_configs};

pub async fn add_config(
    State(pool): State<SqlitePool>,
    Json(payload): Json<DbConfig>,
) -> Json<&'static str> {
    add_db_config(&pool, &payload).await;
    Json("Config added")
}

pub async fn get_config(State(pool): State<SqlitePool>) -> Json<Vec<DbConfig>> {
    let configs = fetch_db_configs(&pool).await;
    Json(configs)
}
