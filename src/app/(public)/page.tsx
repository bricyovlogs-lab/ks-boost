import "./home.css";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import { HomeContent } from "@/components/story/home-content";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--vx-font-display" });
const body = Inter({ subsets: ["latin"], variable: "--vx-font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--vx-font-mono" });

export default function HomePage() {
  return <HomeContent fontClassName={`${display.variable} ${body.variable} ${mono.variable}`} />;
}
