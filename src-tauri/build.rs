fn main() {
    // Jawna lista komend aplikacji. Bez niej Tauri 2 dopuszcza kazda
    // zarejestrowana komende z kazdego okna; z nia komenda dziala tylko wtedy,
    // gdy capabilities ja wprost zezwalaja (sek. 12: minimalne uprawnienia).
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "ai_set_key",
                "ai_clear_key",
                "ai_key_status",
                "ai_tutor",
            ]),
        ),
    )
    .expect("blad tauri-build");
}
