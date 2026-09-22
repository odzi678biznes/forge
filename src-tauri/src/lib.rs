use tauri_plugin_sql::{Migration, MigrationKind};

/// Nazwa bazy. Wtyczka rozwiazuje `sqlite:` wzgledem katalogu danych
/// aplikacji, wiec plik ladnie laduje w AppData, a nie obok pliku .exe.
pub const DB_URL: &str = "sqlite:forge.db";

/// Migracje schematu - Blueprint sek. 10.
///
/// Migracje sa dopisywane, nigdy edytowane. Zmiana juz wydanej migracji
/// rozjechalaby bazy uzytkownikow, ktorzy ja wykonali; nowa wersja dostaje
/// wlasny numer.
fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "schemat poczatkowy: kompetencje, proby, misje",
            kind: MigrationKind::Up,
            sql: include_str!("../migrations/001_initial.sql"),
        },
        Migration {
            version: 2,
            description: "plan nauki i preferencje",
            kind: MigrationKind::Up,
            sql: include_str!("../migrations/002_plan.sql"),
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
