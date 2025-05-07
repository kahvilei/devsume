"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  const showSession = () => {
    if (status === "authenticated") {
      return (
          <button
              className="border border-solid border-black rounded"
              onClick={() => {
                signOut({ redirect: false }).then(() => {
                  router.push("/");
                });

              }}
          >
            Sign Out
          </button>
      )
    } else if (status === "loading") {
      return (
          <span className="text-[#888] text-sm mt-7">Loading...</span>
      )
    } else {
      return (
          <Link
              href="/login"
              className="border border-solid border-black rounded"
          >
            Sign In
          </Link>
      )
    }
  }
  return (
      <section>
        <h1 className="text-h1">Home</h1>
        {showSession()}
      </section>
  );
}