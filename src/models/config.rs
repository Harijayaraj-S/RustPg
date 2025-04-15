use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DbConfig {
    pub name: String,
    pub url: String,
}
