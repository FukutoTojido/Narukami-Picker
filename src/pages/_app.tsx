import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MuseoModerno } from "next/font/google";

const mm = MuseoModerno({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <main className={mm.className}>
            <Component {...pageProps} />
        </main>
    );
}
