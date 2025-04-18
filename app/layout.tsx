import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn by Practicing",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
      >
        <body className={`${geistSans.variable} bg-black antialiased`}>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1c1c1c",
                color: "#fff",
                border: "1px solid #333",
              },
              success: {
                iconTheme: {
                  primary: "#f0bb1c",
                  secondary: "#1c1c1c",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ff4b4b",
                  secondary: "#1c1c1c",
                },
              },
            }}
          />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
