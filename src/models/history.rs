use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct QueryHistory {
    pub query: String,
    pub result: String,
}
