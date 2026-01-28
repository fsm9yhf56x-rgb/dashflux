'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/landing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00204a]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#DFFF00]"></div>
    </div>
  );
}