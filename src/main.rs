// Main

mod models;
mod routes;
mod utils;

use axum::{
    routing::{get, post},
    Router,
};
use routes::{config::*, execute::*, history::*};
use utils::db::init_sqlite;

#[tokio::main]
async fn main() {
    let pool = init_sqlite().await;

    let app = Router::new()
        .route("/config", get(get_config).post(add_config))
        .route("/execute", post(execute_query))
        .route("/history", get(get_history))
        .with_state(pool);

    println!("Server running on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    axum::serve(listener, app).await.unwrap();
}
