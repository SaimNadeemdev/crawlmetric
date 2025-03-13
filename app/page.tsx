"use client"

import { HomeClientWrapper } from "@/components/home-client-wrapper"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomeClientWrapper />
}
