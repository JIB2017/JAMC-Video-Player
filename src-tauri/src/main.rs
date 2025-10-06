// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::command;

#[derive(serde::Serialize)]
struct VideoFile {
    name: String,
    path: String,
}

#[command]
fn get_videos(dir: String) -> Vec<VideoFile> {
    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let path = entry.path();
                    if let Some(ext) = path.extension() {
                        if ext == "mp4" {
                            list.push(VideoFile {
                                name: path.file_name().unwrap().to_string_lossy().to_string(),
                                path: path.to_string_lossy().to_string(),
                            });
                        }
                    }
                }
            }
        }
    }
    list
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_videos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
