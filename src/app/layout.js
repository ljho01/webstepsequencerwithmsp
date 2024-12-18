import localFont from "next/font/local";
import "./globals.css";
import Tabs from "@/components/Tabs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "musictechnology",
  description: "hi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 transition-all`}
      >
        <Tabs />
        <div className="absolute left-1/2 -translate-x-1/2 h-[100v] w-[100vw] md:w-[864px] pt-14">
          {children}
        </div>
      </body>
    </html>
  );
}
