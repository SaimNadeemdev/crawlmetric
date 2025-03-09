import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <h2 className="mb-4 text-2xl font-bold">Page Not Found</h2>
      <p className="mb-8 text-gray-400">The page you are looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  )
}

