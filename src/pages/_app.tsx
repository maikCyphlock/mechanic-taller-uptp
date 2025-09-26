import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { api } from "~/utils/api";
import { Navbar } from "~/components/layout/navbar";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session} refetchInterval={60}>
      <div className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <Component {...pageProps} />
        </main>
        <Toaster richColors />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);