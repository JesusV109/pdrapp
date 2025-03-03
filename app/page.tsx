import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Middle row: main content */}
      <main className="row-start-2 flex flex-col gap-8 items-center sm:items-center">
        <Image
          src="/ordex.png"
          alt="ordex logo"
          width={180}
          height={38}
          priority
        />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {/* All Orders Button */}
          <Link
            href="/orders"
            className="border border-gray-300 px-4 py-2 rounded transition transform duration-300 hover:scale-105"
          >
            All Orders
          </Link>
          {/* Create New Order Button */}
          <Link
            href="/newOrder"
            className="border border-gray-300 px-4 py-2 rounded transition transform duration-300 hover:scale-105"
          >
            Create New Order
          </Link>
        </div>
      </main>

      {/* Bottom row: footer (optional) */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* You can remove or customize these links as you like */}
      </footer>
    </div>
  );
}
