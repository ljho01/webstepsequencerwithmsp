"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

export default function Tabs() {
  const path = usePathname();
  const color = colors[path.slice(1)];
  const textColor = textColors[path.slice(1)];
  const { myId } = useId();
  return (
    <>
      <div
        className={`text-[${textColor}] border-${path.slice(
          1
        )} fixed left-1/2 -translate-x-1/2 flex bottom-10 h-10 p-6 items-center gap-4 z-10 transition-all`}
      >
        <Link
          href={`/`}
          className={`text-sm border-b-2 font-semibold ${
            path.slice(1) == ""
              ? "border-black opacity-80"
              : "!border-transparent opacity-40"
          }`}
        >
          main
        </Link>
        <Link
          href="/drum"
          className={`text-sm border-b-2 font-semibold ${
            path.slice(1) == "drum"
              ? "border-black opacity-80"
              : "!border-transparent opacity-40"
          }`}
        >
          drum
        </Link>
        <Link
          href="bass"
          className={`text-sm border-b-2 font-semibold ${
            path.slice(1) == "bass"
              ? "border-black opacity-80"
              : "!border-transparent opacity-40"
          }`}
        >
          bass
        </Link>
        <Link
          href="mixer"
          className={`text-sm border-b-2 font-semibold ${
            path.slice(1) == "mixer"
              ? "border-black opacity-80"
              : "!border-transparent opacity-40"
          }`}
        >
          mixer
        </Link>
      </div>
      <div
        className={`flex z-[-1] h-[100dvh] w-[100dvw] bg-[${color}] fixed top-0 left-0 transition-all`}
      />
      <div className="bg-[#F2FFF3]" />
      <div className="bg-[#F3FBFF]" />
      <div className="bg-[#FFF7F3]" />
    </>
  );
}

const colors = { drum: "#FFF7F3", bass: "#F3FBFF", mixer: "#F2FFF3" };
const textColors = { drum: "#c26537", bass: "#367ea0", mixer: "#215a26" };
