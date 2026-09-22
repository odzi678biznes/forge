// Zapobiega dodatkowemu oknu konsoli na Windows w wersji release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    forge_lib::run();
}
