import type { Metadata } from "next";
import "./globals.css";
import { Provider } from  "./provider";
import Header from "@/app/_layouts/header";
import Footer from "@/app/_layouts/footer";
import {ReactNode} from "react";


export const metadata: Metadata = {
  title: "Devsume",
  description: "a light resume cms",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
        <Provider>
            <body>
                 <div id="page-top">
                    <Header/>
                    <main>
                        {children}
                    </main>
                 </div>
                <Footer/>
            </body>
        </Provider>
    </html>
  );
}
