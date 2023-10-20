import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Narukami Mappool",
    description: "Mappool Scene for Narukami Tournament",
    viewport: "width=device-width, initial-scale=1",
    icons: "/Logo.svg",
};

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
    return <>{children}</>;
}
