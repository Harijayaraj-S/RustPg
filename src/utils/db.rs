use sqlx::Row;
use sqlx::SqlitePool;

use crate::models::{config::DbConfig, history::QueryHistory};

pub async fn init_sqlite() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite:data/app_data.db")
        .await
        .unwrap();

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS config (
        name TEXT PRIMARY KEY,
        url TEXT NOT NULL
        );
        "#,
    )
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        result TEXT NOT NULL
        );
        "#,
    )
    .execute(&pool)
    .await
    .unwrap();

    pool
}

pub async fn add_db_config(pool: &SqlitePool, config: &DbConfig) {
    sqlx::query("INSERT INTO config (name, url) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET url=excluded.url")
        .bind(&config.name)
        .bind(&config.url)
        .execute(pool)
        .await
        .unwrap();
}

pub async fn fetch_db_configs(pool: &SqlitePool) -> Vec<DbConfig> {
    sqlx::query_as::<_, DbConfig>("SELECT name, url FROM config")
        .fetch_all(pool)
        .await
        .unwrap()
}

pub async fn fetch_db_url(pool: &SqlitePool, name: &str) -> String {
    sqlx::query("SELECT url FROM config WHERE name = $1")
        .bind(name)
        .fetch_one(pool)
        .await
        .unwrap()
        .get::<String, _>("url")
}

pub async fn store_query_history(pool: &SqlitePool, history: &QueryHistory) {
    sqlx::query("INSERT INTO history (query, result) VALUES (?, ?)")
        .bind(&history.query)
        .bind(&history.result)
        .execute(pool)
        .await
        .unwrap();
}

pub async fn fetch_query_history(pool: &SqlitePool) -> Vec<QueryHistory> {
    sqlx::query_as::<_, QueryHistory>("SELECT query, result FROM history ORDER BY id DESC")
        .fetch_all(pool)
        .await
        .unwrap()
}
