import { useState, useEffect } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
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
      const files = await invoke<string[]>("get_videos", { dir });
      setVideos(files);
      if (files.length > 0) setCurrent(files[0]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="">
      <div className="">
        {/* Player */}
        <div className="relative flex flex-row justify-around h-screen">
          {current ? (
            <>
              <div className="flex flex-col items-center justify-center">
                <video
                  key={current.path}
                  src={convertFileSrc(`${current.path}`)}
                  controls
                  autoPlay={autoPlay}
                  className="w-4xl h-4xl rounded-md"
                />
              </div>
              <div className="flex flex-col ">
                <div className="flex flex-row justify-center gap-4">
                  <div className="flex items-center justify-center rounded-3xl m-2 bg-white/5 pl-3 outline-1 -outline-offset-1 outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-500">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      name="cancion"
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                  <button
                    onClick={selectFolder}
                    className="w-1xl items-center justify-center m-2 py-2 px-5 cursor-ew-resize"
                  >
                    Cambiar de carpeta
                  </button>
                </div>
                {/* Video List */}
                <div className="overflow-y-auto h-screen">
                  <ul className="flex justify-end flex-col ml-2 ">
                    {videos.map((video, index) => (
                      <li
                        key={index}
                        role="button"
                        className="cursor-pointer p-1 rounded-md hover:bg-gray-200"
                        onClick={() => {
                          setCurrent(video);
                          setAutoPlay(true);
                        }}
                      >
                        <p
                          className={`text-l hyphens-auto ${
                            current.path === video.path
                              ? "text-red-700 font-bold italic"
                              : "text-red-400 font-normal"
                          }`}
                        >
                          {video.name.replace(/\.[^/.]+$/, "")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : !folder ? (
            <button onClick={selectFolder} className="">
              Selecciona una carpeta
            </button>
          ) : (
            <video
              key={"empty"}
              src={"null"}
              controls
              autoPlay={autoPlay}
              className=""
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
