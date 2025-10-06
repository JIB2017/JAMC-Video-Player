import { useState, useEffect } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { load } from '@tauri-apps/plugin-store';
import "./App.css";

const store = await load(".store.json");

function App() {
  const [videos, setVideos] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [folder, setFolder] = useState<any>(null);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  useEffect(() => {
    async function loadLastFolder() {
      const savedFolder = await store.get<{ value: string }>("lastFolder");
      if (savedFolder && savedFolder.value) {
        setFolder(savedFolder.value);
        loadVideos(savedFolder.value);
      }
    }
    loadLastFolder();
  }, []);

  async function selectFolder() {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected) {
      setFolder(selected);
      await store.set("lastFolder", selected);
      await store.save();
      loadVideos(selected);
    }
  }

  async function loadVideos(dir: string) {
    try {
      const files = await invoke<string[]>("get_videos", {dir});
      setVideos(files);
      if (files.length > 0) setCurrent(files[0]);
    } catch(err) {
      console.error(err);
    }
  }

  return (
    <main className="">
      <div className="flex flex-row h-screen">
        {/* Player */}
        <div className="flex flex-col items-center justify-center bg-black">
          {current ? (
            <>
              <button
                onClick={selectFolder}
                className="flex items-center justify-center bg-blue-600 px-4 py-2 rounded"
              >
                Seleccionar otra carpeta
              </button>
              <video 
              key={current.path}
              src={convertFileSrc(`${current.path}`)} 
              controls
              autoPlay={autoPlay}
              className="h-full w-full rounded-lg"
              />
            </>
          ) : (
            !folder ? (
              <button
                onClick={selectFolder}
                className="items-center justify-center bg-blue-600 px-4 py-2 rounded"
              >
                Selecciona una carpeta
              </button>
            ) : (
              <video 
              key={"empty"}
              src={""} 
              controls
              autoPlay={autoPlay}
              className="h-full w-full rounded-lg"
              />
            )
          )}
        </div>

        {/* Video List */}
        <ul className="relative justify-end min-w-[240px] flex-col gap-1 p-2 overflow-y-auto bg-slate-50">
          {videos.map((video, index) => (
            <li 
              key={index}
              role="button"
              className={`cursor-pointer text-slate-800 pointer p-4 flex w-full items-center rounded-md p-3 transition-all ${
                current.path === video.path ? "bg-slate-700" : "hover:bg-slate-800"
              }`}
              onClick={() => { setCurrent(video); setAutoPlay(true) }}
            >
              {video.name.replace(/\.[^/.]+$/, "")}
            </li>
          ))}
        </ul>
      </div>
      
    </main>
  );
}

export default App;
