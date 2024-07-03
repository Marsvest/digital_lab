'use client'
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  const {data: session} = useSession()

  console.log(session)

  function handleClick() {
    router.push("/deploy")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {session ? (
          <div>
            <button onClick={handleClick}>Deploy project</button>
          </div>
        ):(
          <div>You shall not path</div>
        )}
    </main>
  );
}
