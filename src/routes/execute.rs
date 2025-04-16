use axum::{extract::State, Json};
use serde::Deserialize;
use sqlx::{postgres::PgPoolOptions, Column, Row, SqlitePool, TypeInfo};

use crate::models::history::QueryHistory;
use crate::utils::db::{fetch_db_url, store_query_history};

#[derive(Deserialize)]
pub struct ExecuteInput {
    pub db_name: String,
    pub query: String,
}

pub async fn execute_query(
    State(pool): State<SqlitePool>,
    Json(input): Json<ExecuteInput>,
) -> Json<Vec<serde_json::Value>> {
    let db_url = fetch_db_url(&pool, &input.db_name).await;
    let pg_pool = PgPoolOptions::new()
        .connect(&db_url)
        .await
        .expect("Failed to connect to Postgres");

    let rows = sqlx::query(&input.query)
        .fetch_all(&pg_pool)
        .await
        .expect("Query failed");

    let mut result = Vec::new();
    for row in rows {
        let mut map = serde_json::Map::new();
        for column in row.columns() {
            let name = column.name().to_string();
            let value = match column.type_info().name() {
                "TEXT" | "VARCHAR" | "CHAR" => row
                    .try_get::<String, _>(column.name())
                    .map(serde_json::Value::String),
                "INT4" | "INT8" | "INTEGER" => row
                    .try_get::<i64, _>(column.name())
                    .map(serde_json::Value::from),
                "FLOAT4" | "FLOAT8" => row
                    .try_get::<f64, _>(column.name())
                    .map(serde_json::Value::from),
                "BOOL" => row
                    .try_get::<bool, _>(column.name())
                    .map(serde_json::Value::from),
                "TIMESTAMP" | "TIMESTAMPTZ" => row
                    .try_get::<chrono::NaiveDateTime, _>(column.name())
                    .map(|dt| serde_json::Value::String(dt.to_string())),
                _ => Ok(serde_json::Value::Null),
            };

            map.insert(name, value.unwrap_or(serde_json::Value::Null));
        }
        result.push(serde_json::Value::Object(map));
    }

    let history = QueryHistory {
        query: input.query,
        result: serde_json::to_string(&result).unwrap(),
    };

    store_query_history(&pool, &history).await;

    Json(result)
}
