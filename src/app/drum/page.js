"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

const drumInfo = [
  { name: "kick", row: 0 },
  { name: "snare", row: 1 },
  { name: "hihat", row: 2 },
  { name: "clap", row: 3 },
  { name: "openhat", row: 4 },
  { name: "crash", row: 5 },
];

export default function Home() {
  const [i, setI] = useState("");
  const [loading, setLoading] = useState(true);
  const [drum, setDrum] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(16).fill(false))
  );
  const socketRef = useRef(null);
  useEffect(() => {
    const connectWebSocket = async () => {
      await fetch(`/api/drum`); // WebSocket 서버 초기화
      const ws = new WebSocket(
        `ws://${process.env.NEXT_PUBLIC_LOCAL_IP}:${process.env.NEXT_PUBLIC_SOCKET_PORT}`
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
        if (data.type == "broadcast") {
          setDrum((prevDrum) => {
            const newDrum = [...prevDrum];
            newDrum[data.row][data.col] = data.val ? true : false;
            return newDrum;
          });
        }
        if (data.type == "drumUpdate") {
          setDrum(data.matrix);
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
    try {
      connectWebSocket();
    } catch (e) {
      console.log(e);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (row, col, val) => {
    socketRef.current.send(JSON.stringify({ from: i, row, col, val }));
  };
  return (
    <>
      <Header myId={i} />
      {!loading ? (
        drumInfo.map(({ name, row }) => (
          <div key={name} className="mt-4">
            <h1 className="font-medium ml-2 text-xs text-[#c26537] mb-1">
              {name}
            </h1>
            <div className="flex w-full justify-between px-2">
              {[...Array(16)].map((_, col) => (
                <button
                  className={`size-5 md:size-12 ${
                    drum[row][col]
                      ? "bg-[#e5753d]"
                      : Math.floor(col / 4) % 2 == 1
                      ? "bg-[#f8c6ad]"
                      : "bg-[#fad8c7]"
                  } overflow-hidden`}
                  key={col}
                  data-col={col}
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
        <div className="flex justify-center items-center w-full h-[200px] text-[#c26537]">
          loading...
        </div>
      )}
    </>
  );
}
