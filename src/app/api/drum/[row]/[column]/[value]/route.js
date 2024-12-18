import dgram from "dgram";
import { NextResponse } from "next/server";
import { toBuffer } from "osc-min";

export const GET = async (req) => {
  try {
    const [row, col, val] = req.url.split("/drum/")[1].split("/");
    const client = dgram.createSocket("udp4");
    // OSC 메시지 생성
    const oscMessage = toBuffer({
      address: "drum", // OSC 주소
      args: [Number(col), Number(row), val == "true" ? 1 : 0], // OSC 인자
    });

    const udpHost = "127.0.0.1";
    const udpPort = 7400;
    client.send(oscMessage, udpPort, udpHost, (err) => {
      if (err) {
        console.error("UDP 전송 실패:", err);
        client.close();
        return NextResponse.json({ success: false, error: "UDP 전송 실패" });
      } else {
        console.log("UDP 메시지 전송 완료");
        client.close();
      }
    });
    return NextResponse.json({ success: true, message: "OSC 전송 성공" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: true, message: "OSC 전송 실패" });
  }
};
