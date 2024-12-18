import { NextResponse } from "next/server";
import { WebSocketServer } from "ws";
import dgram from "dgram";
import { toBuffer } from "osc-min";

let wss = null;
let clients = [];

export async function GET() {
  if (!wss) {
    console.log("WebSocket server is initializing");

    // 포트번호는 원하는 포트로 변경하여 사용
    wss = new WebSocketServer({ port: 3003 });

    wss.on("connection", (ws) => {
      const clientId = Math.random().toString(36).substring(7); // 고유한 사용자의 ID 값을 임의로 생성, DB를 연동시킨다면 해당 부분을 수정
      clients.push({ id: clientId, ws });
      console.log(`New client connected: ${clientId}`);

      ws.send(JSON.stringify({ type: "id", id: clientId }));

      ws.on("message", (message) => {
        const data = JSON.parse(message);
        console.log(data);
        // 전역으로 메시지 전송
        updateDrum(data.row, data.col, data.val).then(() => {
          console.log("Drum updated");
        });
        clients.forEach((client) => {
          if (client.id !== data.from) {
            client.ws.send(
              JSON.stringify({
                type: "broadcast",
                row: data.row,
                col: data.col,
                val: data.val,
              })
            );
          }
        });
      });

      ws.on("close", () => {
        clients = clients.filter((client) => client.ws !== ws);
        console.log(`Client disconnected: ${clientId}`);
      });
    });
  }

  return NextResponse.json({ message: "WebSocket server is running" });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const updateDrum = async (row, col, val) => {
  try {
    const client = dgram.createSocket("udp4");
    // OSC 메시지 생성
    const oscMessage = toBuffer({
      address: "drum", // OSC 주소
      args: [col, row, val], // OSC 인자
    });

    const udpHost = "127.0.0.1";
    const udpPort = 7400;
    client.send(oscMessage, udpPort, udpHost, (err) => {
      if (err) {
        console.error("UDP 전송 실패:", err);
        client.close();
      } else {
        console.log("UDP 메시지 전송 완료");
        client.close();
      }
    });
  } catch (error) {
    console.error(error);
  }
};
