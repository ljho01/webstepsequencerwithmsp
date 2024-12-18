"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

export default function Home() {
  const [i, setI] = useState("");
  const [loading, setLoading] = useState(true);
  const [volumes, setVolumes] = useState([14, 14, 14, 14, 14, 14, 14, 14, 14]);
  const [fx, setFX] = useState([0, 0]);
  const socketRef = useRef(null);
  useEffect(() => {
    const connectWebSocket = async () => {
      await fetch(`/api/mixer`); // WebSocket 서버 초기화
      const ws = new WebSocket(
        `ws://${process.env.NEXT_PUBLIC_LOCAL_IP}:${
          parseInt(process.env.NEXT_PUBLIC_SOCKET_PORT) + 15
        }`
      );

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "id") {
          setI(data.id);
          setLoading(false);
        }
        if (data.type == "broadcast_volumes") {
          setVolumes(data.volumes);
        }
        if (data.type == "broadcast_fx") {
          setFX(data.fx);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      socketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendVolumes = (volumes) => {
    socketRef.current.send(
      JSON.stringify({ from: i, type: "volumes", volumes })
    );
  };
  const sendFX = (fx) => {
    socketRef.current.send(JSON.stringify({ from: i, type: "fx", fx }));
  };
  return (
    <>
      <Header myId={i} />
      {loading && (
        <div className="flex justify-center items-center w-full h-[200px] text-[#215a26]">
          loading...
        </div>
      )}
      {!loading && (
        <div className="flex flex-col items-center gap-4 mt-4 mb-[200px]">
          {volumeConfig.map(({ type, value }, idx) => (
            <div
              key={idx}
              className="flex flex-col relative w-[calc(100%-16px)]"
            >
              <span className="font-medium text-xs text-[#215a26] mb-1">
                {type}
              </span>
              <div className="flex w-full gap-0 rounded-lg overflow-hidden">
                {value.map((v, idx2) => (
                  <button
                    key={type + idx2}
                    className={`${
                      volumes[idx] < idx2 ? "bg-[#d9eddb]" : "bg-[#53ad5b]"
                    } h-3 grow`}
                    onClick={() => {
                      const newVolumes = [...volumes];
                      newVolumes[idx] = idx2;
                      sendVolumes(newVolumes);
                      setVolumes(newVolumes);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          {fxConfig.map(({ type, value }, idx) => (
            <div
              key={idx}
              className="flex flex-col relative w-[calc(100%-16px)]"
            >
              <span className="font-medium text-xs text-[#215a26] mb-1">
                {type}
              </span>
              <div className="flex w-full gap-0 rounded-lg overflow-hidden">
                {value.map((v, idx2) => (
                  <button
                    key={type + idx2}
                    className={`${
                      fx[idx] < idx2 ? "bg-[#d9eddb]" : "bg-[#53ad5b]"
                    } h-3 grow`}
                    onClick={() => {
                      const newFx = [...fx];
                      newFx[idx] = idx2;
                      sendFX(newFx);
                      setFX(newFx);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const volumeConfig = [
  {
    type: "volume",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "kick",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "snare",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "hihat",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "clap",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "openhat",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "crash",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "bass",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "sub bass",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
];

const fxConfig = [
  {
    type: "reverb",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
  {
    type: "flanger",
    value: [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
      0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
    ],
  },
];
