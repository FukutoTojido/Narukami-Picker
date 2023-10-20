import "../styles/globals.css";
import type { Metadata } from "next";
import { MuseoModerno } from "next/font/google";

const mm = MuseoModerno({
    weight: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <html lang="en">
            <body className={mm.className}>{children}</body>
        </html>
    );
}
