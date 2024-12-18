"use client";
import { usePathname } from "next/navigation";

export default function Tabs({ myId }) {
  const path = usePathname();
  const color = colors[path.slice(1)] || "#000";
  return (
    <div className="flex flex-col items-center">
      <h1 className={`font-bold text-2xl text-[${color}]`}>{path.slice(1)}</h1>
      {myId && (
        <p className={`text-sm text-[${color}] opacity-80`}>your id: {myId}</p>
      )}
    </div>
  );
}

const colors = {
  bass: "#367ea0",
  drum: "#c26537",
  mixer: "#215a26",
};
