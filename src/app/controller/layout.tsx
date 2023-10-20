import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Narukami Controller",
    description: "Master Controller for Narukami Tournament",
    viewport: "width=device-width, initial-scale=1",
    icons: "/Logo.svg",
};

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
    return <>{children}</>;
}
