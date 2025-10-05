import { useState, useEffect } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [videos, setVideos] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    const folder = "G:/Videos/Videos JA";
    invoke<string[]>("get_videos", {dir: folder})
      .then((file) => {
        setVideos(file);
        if (file.length > 0) setCurrent(file[0]);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <main className="container">
      <div className="flex h-screen">
        {/* Player */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {current && (
            <video 
            key={current.path}
            src={convertFileSrc(`${current.path}`)} 
            controls
            autoPlay
            className="h-full w-full rounded-lg"
            >
              {/* <source src={`file://${current.path}`} type="video/mp4" />
              Your browser does not support the video tag. */}
            </video>
          )}
        </div>

        {/* Video List */}
        <div className="flex min-w-[240px] flex-col gap-1 p-1.5">
          {videos.map((video, index) => (
            <div 
              key={index}
              role="button"
              className="text-slate-800 pointer flex w-full items-center rounded-md p-3 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
              onClick={() => setCurrent(video)}
            >
              {video.name.replace(/\.[^/.]+$/, "")}
            </div>
          ))}
        </div>
      </div>
      
    </main>
  );
}

export default App;
