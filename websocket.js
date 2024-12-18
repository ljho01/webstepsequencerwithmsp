import { WebSocketServer } from "ws";
import dgram from "dgram";
import { toBuffer } from "osc-min";
let front2node = null;
let clients = [];
let node2max = null;
let drums = [];
console.log("UDP server is initializing");
// 포트번호는 원하는 포트로 변경하여 사용
node2max = dgram.createSocket("udp4");
node2max.bind(3004);
node2max.on("message", (msg, rinfo) => {
  console.log(msg.toString(), msg.toString().length);
  const flatArray = msg.toString().slice(0, 191).split(" ");
  console.log(flatArray);
  const flatArr = flatArray.map((item) => item == 1);
  // 행렬 생성
  const matrix = [];
  for (let i = 0; i < 6; i++) {
    matrix.push(flatArr.slice(i * 16, (i + 1) * 16));
  }
  if (front2node) {
    clients.forEach((client) => {
      client.front.send(JSON.stringify({ type: "drumUpdate", matrix }));
    });
  }
});

console.log("WebSocket server is initializing");

// 포트번호는 원하는 포트로 변경하여 사용
front2node = new WebSocketServer({
  port: 3003,
});

front2node.on("connection", (front) => {
  const clientId =
    id + "-" + (Math.random() * 10000).toString().substring(0, 3);
  clients.push({ id: clientId, front });
  console.log(`New client connected: ${clientId}`);
  getDrumFromMax();

  front.send(JSON.stringify({ type: "id", id: clientId, drums }));

  front.on("message", (message) => {
    const data = JSON.parse(message);
    // 전역으로 메시지 전송
    updateDrum(data.row, data.col, data.val).then(() => {
      console.log("Drum updated");
    });
    clients.forEach((client) => {
      if (client.id !== data.from) {
        client.front.send(
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

  front.on("close", () => {
    clients = clients.filter((client) => client.front !== front);
    console.log(`Client disconnected: ${clientId}`);
  });
});

const getDrumFromMax = (asd) => {
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "getdrum", // OSC 주소
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

const updateDrum = async (row, col, val) => {
  try {
    if (node2max) {
      // OSC 메시지 생성
      const oscMessage = toBuffer({
        address: "drum", // OSC 주소
        args: [col, row, val], // OSC 인자
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
