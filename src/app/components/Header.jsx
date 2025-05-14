import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          TripWeaver
        </Link>
        <nav className="flex space-x-4">
          <Link href="/" className="link">
            Home
          </Link>
          <Link href="/discover" className="link">
            Discover
          </Link>
          <Link href="about" className="link">
            About
          </Link>
        </nav>
        <div>Account</div>
      </div>
    </header>
  );
}
