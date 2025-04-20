// Main

mod models;
mod routes;
mod utils;

use axum::{
    http::StatusCode,
    routing::{get, post},
    Router,
};
use routes::{config::*, execute::*, history::*};
use tower_http::services::ServeDir;
use utils::db::init_sqlite;

#[tokio::main]
async fn main() {
    let pool = init_sqlite().await;

    let app = Router::new()
        .route("/config/list", get(get_config))
        .route("/config/add", post(add_config))
        .route("/execute", post(execute_query))
        .route("/history", get(get_history))
        .fallback_service(
            ServeDir::new("static").not_found_service(axum::routing::get(|| async {
                (StatusCode::NOT_FOUND, "Not Found")
            })),
        )
        .with_state(pool);

    println!("Server running on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001")
        .await
        .unwrap();

    axum::serve(listener, app).await.unwrap();
}
