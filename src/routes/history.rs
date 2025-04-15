use axum::{extract::State, Json};
use sqlx::SqlitePool;

use crate::models::history::QueryHistory;
use crate::utils::db::fetch_query_history;

pub async fn get_history(State(pool): State<SqlitePool>) -> Json<Vec<QueryHistory>> {
    let history = fetch_query_history(&pool).await;
    Json(history)
}
