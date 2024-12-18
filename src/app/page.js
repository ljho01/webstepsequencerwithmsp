"use client";
import Image from "next/image";

export default function Home() {
  const bang = async () => {
    const response = await fetch("./bang");
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button
        onClick={bang}
        className="bg-[#f5f5f5] text-[#333] px-4 py-2 rounded-lg shadow-md"
      >
        bang
      </button>
    </div>
  );
}
