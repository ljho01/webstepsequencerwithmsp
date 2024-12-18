"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

const bassInfo = [
  { name: "bass", row: 0 },
  { name: "sub bass", row: 1 },
];

export default function Home() {
  const [i, setI] = useState("");
  const [loading, setLoading] = useState(true);
  const [bass, setBass] = useState(
    Array(2)
      .fill(null)
      .map(() => Array(16).fill(false))
  );
  const [adsr, setADSR] = useState([1, 2, 3, 4, 3]);
  const socketRef = useRef(null);
  useEffect(() => {
    const connectWebSocket = async () => {
      await fetch(`/api/bass`); // WebSocket 서버 초기화
      const ws = new WebSocket(
        `ws://${process.env.NEXT_PUBLIC_LOCAL_IP}:${
          parseInt(process.env.NEXT_PUBLIC_SOCKET_PORT) + 10
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
        if (data.type == "broadcast_seq") {
          setBass((prevDrum) => {
            const newDrum = [...prevDrum];
            newDrum[data.row][data.col] = data.val ? true : false;
            return newDrum;
          });
        }
        if (data.type == "broadcast_ADSR") {
          console.log(data);
          setADSR(data.adsr);
        }

        if (data.type == "bassUpdate") {
          console.log(data);
          setBass(data.matrix);
          setADSR(data.adsr);
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

  const sendSeq = (row, col, val) => {
    socketRef.current.send(
      JSON.stringify({ from: i, type: "bassSeq", row, col, val })
    );
  };
  const sendADSR = (adsr) => {
    socketRef.current.send(JSON.stringify({ from: i, type: "bassADSR", adsr }));
  };
  return (
    <>
      <Header myId={i} />
      {!loading ? (
        bassInfo.map(({ name, row }) => (
          <div key={name} className="mt-4">
            <h1 className="font-medium ml-2 text-xs text-[#367ea0] mb-1">
              {name}
            </h1>
            <div className="flex w-full justify-between px-2">
              {[...Array(16)].map((_, col) => (
                <button
                  className={`size-5 md:size-12 ${
                    bass[row][col]
                      ? "bg-[#4c8fae]"
                      : Math.floor(col / 4) % 2 == 1
                      ? "bg-[#d4e5ee]"
                      : "bg-[#bcd4e0]"
                  } overflow-hidden`}
                  key={col}
                  data-col={col}
                  onClick={() => {
                    sendSeq(row, col, !bass[row][col]);
                    const newBass = [...bass];
                    newBass[row][col] = !newBass[row][col];
                    setBass(newBass);
                  }}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center w-full h-[200px] text-[#367ea0]">
          loading...
        </div>
      )}
      {!loading && (
        <div className="flex flex-col items-center gap-4 mt-4">
          {adsrConfig.map(({ type, value }, idx) => (
            <div
              key={idx}
              className="flex flex-col relative w-[calc(100%-16px)]"
            >
              <span className="font-medium text-xs text-[#367ea0] mb-1">
                {type}
              </span>
              <div className="flex w-full gap-0.5 rounded-lg overflow-hidden">
                {value.map((v, idx2) => (
                  <button
                    key={type + idx2}
                    className={`${
                      adsr[idx] < idx2 ? "bg-[#d0e3ed]" : "bg-[#4c8fae]"
                    } h-3 grow`}
                    onClick={() => {
                      const newADSR = [...adsr];
                      newADSR[idx] = idx2;
                      sendADSR(newADSR);
                      setADSR(newADSR);
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

const adsrConfig = [
  { type: "attack", value: [10, 60, 100, 120, 150, 200] },
  { type: "decay", value: [10, 30, 70, 100, 130, 160] },
  { type: "sustain", value: [0.4, 0.5, 0.6, 0.8, 1.0, 1.2] },
  { type: "release", value: [20, 40, 60, 80, 100, 120] },
  { type: "note length", value: [60, 80, 100, 120, 140, 160] },
];
