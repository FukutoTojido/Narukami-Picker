import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Be_Vietnam_Pro } from "next/font/google";

const bvn = Be_Vietnam_Pro({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <main className={bvn.className}>
            <Component {...pageProps} />
        </main>
    );
}
