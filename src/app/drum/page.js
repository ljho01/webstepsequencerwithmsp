"use client";
import { useState, useEffect, useRef } from "react";

const drumInfo = [
  { name: "kick", row: 0 },
  { name: "snare", row: 1 },
  { name: "hihat", row: 2 },
  { name: "clap", row: 3 },
  { name: "openhat", row: 4 },
  { name: "cymbal", row: 5 },
];

export default function Home() {
  const [myId, setMyId] = useState(null);
  const [drum, setDrum] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(16).fill(false))
  );
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  useEffect(() => {
    const connectWebSocket = async () => {
      await fetch("/api/drum"); // WebSocket 서버 초기화
      const ws = new WebSocket("ws://192.168.0.17:3003");

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "id") {
          setMyId(data.id);
        }
        if (data.type == "broadcast") {
          setDrum((prevDrum) => {
            const newDrum = [...prevDrum];
            newDrum[data.row][data.col] = data.val ? true : false;
            return newDrum;
          });
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

  const sendMessage = (row, col, val) => {
    socketRef.current.send(JSON.stringify({ from: myId, row, col, val }));
  };
  return (
    <div className="absolute left-1/2 -translate-x-1/2 h-[100v] w-[100vw] md:w-[864px] pt-14">
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-2xl">Drum</h1>
        {myId && <p className="text-sm text-gray-500">your id: {myId}</p>}
      </div>

      {myId ? (
        drumInfo.map(({ name, row }) => (
          <div key={name} className="mt-4">
            <h1 className="font-medium ml-2 text-xs text-gray-500 mb-1">
              {name}
            </h1>
            <div className="flex w-full justify-between px-2">
              {[...Array(16)].map((_, col) => (
                <button
                  className={`size-5 md:size-12 ${
                    drum[row][col] ? "bg-gray-600" : "bg-gray-200"
                  } overflow-hidden`}
                  key={col}
                  onClick={() => {
                    sendMessage(row, col, !drum[row][col]);
                    const newDrum = [...drum];
                    newDrum[row][col] = !newDrum[row][col];
                    setDrum(newDrum);
                  }}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center w-full h-[200px] text-gray-500">
          loading...
        </div>
      )}
    </div>
  );
}
