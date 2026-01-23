import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

export default function Home() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/auth/login");
  }, [router]);
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black"
    >

    </div>
  );
}
