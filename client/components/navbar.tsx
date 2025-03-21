import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  return (
    <nav className="bg-gray-800 p-4 z-10">
      <ul className="flex justify-between items-center space-x-4 mr-4">
        <li>
          <a
            href="/"
            className="flex items-center gap-2 text-2xl text-white hover:text-gray-400"
          >
            <Image
              src="/images/votereum_blue_allonge.png"
              alt="logo"
              width={200}
              height={80}
            />
          </a>
        </li>
        <ul className="flex items-center gap-6 text-white">
          {isConnected && address && (
            <>
            <li>
                <a
                  href="/"
                  className="flex items-center gap-2 text-xl text-white hover:text-gray-400"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  className="flex items-center gap-2 text-xl text-white hover:text-gray-400"
                >
                  Admin space
                </a>
              </li>
              <li>
                <a
                  href="/voter"
                  className="flex items-center gap-2 text-xl text-white hover:text-gray-400"
                >
                  Voter space
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    disconnect();
                    router.push("/login");
                  }}
                  className="flex items-center gap-2 text-xl text-white hover:text-gray-400"
                >
                  <LogOut color="red" />
                </button>
              </li>
            </>
          )}
        </ul>
      </ul>
    </nav>
  );
}
