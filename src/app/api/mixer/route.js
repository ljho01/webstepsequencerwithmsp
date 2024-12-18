import { NextResponse } from "next/server";
import { WebSocketServer } from "ws";
import dgram from "dgram";
import { toBuffer } from "osc-min";

let front2node = null;
let clients = [];
let node2max = null;

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

export async function GET() {
  if (!node2max) {
    // 포트번호는 원하는 포트로 변경하여 사용
    node2max = dgram.createSocket("udp4");
    node2max.bind(parseInt(process.env.NEXT_PUBLIC_SOCKET_PORT) + 21);
    console.log("node2max for bass is initializing");
    node2max.on("message", (msg, rinfo) => {
      const flatArray = msg.toString().split("\0")[0].split(" ");
      if (front2node) {
        if (flatArray.length < 4) {
          clients.forEach((client) => {
            client.front.send(
              JSON.stringify({
                type: "broadcast_fx",
                fx: flatArray.map((item, idx) =>
                  fxConfig[idx].value.findIndex((i) => i == parseFloat(item)) <
                  0
                    ? 0
                    : fxConfig[idx].value.findIndex(
                        (i) => i == parseFloat(item)
                      )
                ),
              })
            );
          });
        } else {
          clients.forEach((client) => {
            client.front.send(
              JSON.stringify({
                type: "broadcast_volumes",
                volumes: flatArray.map((item, idx) =>
                  volumeConfig[idx].value.findIndex(
                    (i) => i == parseFloat(item)
                  ) < 0
                    ? 0
                    : volumeConfig[idx].value.findIndex(
                        (i) => i == parseFloat(item)
                      )
                ),
              })
            );
          });
        }
      }
    });
  }
  if (!front2node) {
    console.log("front2node for bass is initializing");

    // 포트번호는 원하는 포트로 변경하여 사용
    front2node = new WebSocketServer({
      port: parseInt(process.env.NEXT_PUBLIC_SOCKET_PORT) + 15,
    });

    front2node.on("connection", (front) => {
      const clientId = (Math.random() * 100000000).toString().substring(0, 6);
      clients.push({ id: clientId, front });
      console.log(`New client connected: ${clientId}`);
      getMixer();

      front.send(JSON.stringify({ type: "id", id: clientId }));

      front.on("message", (message) => {
        const data = JSON.parse(message);
        console.log(data);
        if (data.type == "volumes") {
          updateVolumes(data.volumes);
          clients.forEach((client) => {
            if (client.id !== data.from) {
              client.front.send(
                JSON.stringify({
                  type: "broadcast_volumes",
                  volumes: data.volumes,
                })
              );
            }
          });
        } else if (data.type == "fx") {
          updateFX(data.fx);
          clients.forEach((client) => {
            if (client.id !== data.from) {
              client.front.send(
                JSON.stringify({
                  type: "broadcast_fx",
                  fx: data.fx,
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

export const config = {
  api: {
    bodyParser: false,
  },
};

const getMixer = () => {
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "getMixer", // OSC 주소
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

const updateVolumes = async (volumes) => {
  const newVolumes = volumes.map((item, idx) => volumeConfig[idx].value[item]);
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "setVolumes", // OSC 주소
        args: newVolumes, // OSC 인자
      });

      const udpHost = "127.0.0.1";
      const udpPort = 7400;
      node2max.send(oscMessage, udpPort, udpHost, (err) => {
        if (err) {
          console.error("UDP 전송 실패:", err);
        } else {
          console.log("server2max updateVolumes request...");
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateFX = async (fx) => {
  const newFX = fx.map((item, idx) => fxConfig[idx].value[item]);
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "setFX", // OSC 주소
        args: newFX, // OSC 인자
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
