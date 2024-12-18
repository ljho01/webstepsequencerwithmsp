import { NextResponse } from "next/server";
import { WebSocketServer } from "ws";
import dgram from "dgram";
import { toBuffer } from "osc-min";

let front2node = null;
let clients = [];
let node2max = null;
let basses = { bass: [], adsr: [] };

const adsrConfig = [
  { type: "attack", value: [10, 60, 100, 120, 150, 200] },
  { type: "decay", value: [10, 30, 70, 100, 130, 160] },
  { type: "sustain", value: [0.4, 0.5, 0.6, 0.8, 1.0, 1.2] },
  { type: "release", value: [20, 40, 60, 80, 100, 120] },
  { type: "note length", value: [60, 80, 100, 120, 140, 160] },
];

export async function GET(req) {
  if (!node2max) {
    // 포트번호는 원하는 포트로 변경하여 사용
    node2max = dgram.createSocket("udp4");
    node2max.bind(parseInt(process.env.NEXT_PUBLIC_SOCKET_PORT) + 11);
    console.log("node2max for bass is initializing");
    node2max.on("message", (msg, rinfo) => {
      console.log(msg.toString(), msg.toString().length);
      const flatArray = msg.toString().split("\0")[0].split(" ");
      const flatArr = [...flatArray].slice(0, 32).map((item) => item == 1);
      const adsr = [...flatArray]
        .slice(-5)
        .map((item, idx) =>
          adsrConfig[idx].value.findIndex((v) => v == item) < 0
            ? 0
            : adsrConfig[idx].value.findIndex((v) => v == item)
        );
      // 행렬 생성
      const matrix = [];
      for (let i = 0; i < 2; i++) {
        matrix.push(flatArr.slice(i * 16, (i + 1) * 16));
      }
      if (front2node) {
        clients.forEach((client) => {
          client.front.send(
            JSON.stringify({ type: "bassUpdate", matrix, adsr })
          );
        });
      }
    });
  }
  if (!front2node) {
    console.log("front2node for bass is initializing");

    // 포트번호는 원하는 포트로 변경하여 사용
    front2node = new WebSocketServer({
      port: parseInt(process.env.NEXT_PUBLIC_SOCKET_PORT) + 10,
    });

    front2node.on("connection", (front) => {
      const clientId = (Math.random() * 100000000).toString().substring(0, 6);
      clients.push({ id: clientId, front });
      console.log(`New client connected: ${clientId}`);
      getBassFromMax();
      front.send(JSON.stringify({ type: "id", id: clientId }));

      front.on("message", (message) => {
        const data = JSON.parse(message);
        console.log(data);
        if (data.type == "bassSeq") {
          console.log("bassSeq");
          updateBassSeq(data.row, data.col, data.val);
          clients.forEach((client) => {
            if (client.id !== data.from) {
              client.front.send(
                JSON.stringify({
                  type: "broadcast_seq",
                  row: data.row,
                  col: data.col,
                  val: data.val,
                })
              );
            }
          });
        } else if (data.type == "bassADSR") {
          updateBassADSR(data.adsr);
          clients.forEach((client) => {
            if (client.id !== data.from) {
              client.front.send(
                JSON.stringify({
                  type: "broadcast_ADSR",
                  adsr: data.adsr,
                })
              );
            }
          });
        }
        // 전역으로 메시지 전송
      });

      front.on("close", () => {
        clients = clients.filter((client) => client.front !== front);
        console.log(`Client disconnected: ${clientId}`);
      });
    });
  }

  return NextResponse.json({ message: "WebSocket server is running" });
}

const getBassFromMax = (asd) => {
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "getbass", // OSC 주소
        args: [], // OSC 인자
      });
      const udpHost = "127.0.0.1";
      const udpPort = 7400;
      node2max.send(oscMessage, udpPort, udpHost, (err) => {
        if (err) {
          console.error("UDP 전송 실패:", err);
        } else {
          console.log("UDP 메시지 전송 완료");
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateBassSeq = async (row, col, val) => {
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "setbass", // OSC 주소
        args: [col, row, val], // OSC 인자
      });

      const udpHost = "127.0.0.1";
      const udpPort = 7400;
      node2max.send(oscMessage, udpPort, udpHost, (err) => {
        if (err) {
          console.error("UDP 전송 실패:", err);
        } else {
          console.log("server2max updateBassSeq request...");
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateBassADSR = async (adsr) => {
  console.log(adsr);
  const newADSR = adsr.map((item, idx) => adsrConfig[idx].value[item]);
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "setbassADSR", // OSC 주소
        args: newADSR, // OSC 인자
      });

      const udpHost = "127.0.0.1";
      const udpPort = 7400;
      node2max.send(oscMessage, udpPort, udpHost, (err) => {
        if (err) {
          console.error("UDP 전송 실패:", err);
        } else {
          console.log("server2max updateBassADSR request...");
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};
