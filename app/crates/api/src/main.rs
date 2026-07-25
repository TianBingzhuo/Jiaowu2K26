use j2k26_adapters_sqlite::SqliteRepository;
use j2k26_api::{GOLDEN_FIXTURE, build_router};
use j2k26_application::SmartCourseService;
use std::net::SocketAddr;
use std::sync::Arc;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let database_url = std::env::var("J2K26_DATABASE_URL").unwrap_or_else(|_| {
        let _ = std::fs::create_dir_all(".data");
        "sqlite://.data/j2k26-phase0.db?mode=rwc".to_owned()
    });
    let repository = Arc::new(SqliteRepository::connect(&database_url).await?);
    let service = SmartCourseService::new(repository);
    service.seed_fixture(GOLDEN_FIXTURE).await?;

    let bind = std::env::var("J2K26_BIND").unwrap_or_else(|_| "127.0.0.1:3000".to_owned());
    let address: SocketAddr = bind.parse()?;
    let listener = tokio::net::TcpListener::bind(address).await?;
    tracing::info!(%address, data_mode = "fixture", "University2K26 Phase 0 API listening");
    axum::serve(listener, build_router(service))
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    if let Err(error) = tokio::signal::ctrl_c().await {
        tracing::warn!(%error, "failed to install Ctrl+C handler");
    }
}
