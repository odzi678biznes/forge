mod ai;

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
        Migration {
            version: 3,
            description: "kopie bezpieczenstwa przed zmiana",
            kind: MigrationKind::Up,
            sql: include_str!("../migrations/003_backups.sql"),
        },
        Migration {
            version: 4,
            description: "kurs: lekcje i fiszki",
            kind: MigrationKind::Up,
            sql: include_str!("../migrations/004_course.sql"),
        },
        Migration {
            version: 5,
            description: "wyniki arkuszy CKE",
            kind: MigrationKind::Up,
            sql: include_str!("../migrations/005_exam_results.sql"),
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Klucz API wylacznie w pamieci procesu (sek. 11-12).
        .manage(ai::AiState::default())
        .invoke_handler(tauri::generate_handler![
            ai::ai_set_key,
            ai::ai_clear_key,
            ai::ai_key_status,
            ai::ai_tutor
        ])
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        // Otwieranie oficjalnych arkuszy CKE w przegladarce systemowej.
        // Zakres adresow ogranicza capability (tylko https://cke.gov.pl/*).
        .plugin(tauri_plugin_opener::init())
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
