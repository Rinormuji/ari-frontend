import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { paths } from "../routes/paths";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-gray-50 px-6 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#A98836]">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-[#0F4638]">Faqja nuk u gjet</h1>
      <p className="mx-auto mt-4 max-w-md text-gray-600">
        Adresa që kërkuat nuk ekziston ose është zhvendosur.
      </p>
      <Link
        to={paths.home}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#EFD391] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#D9BF7B]"
      >
        <Home size={17} />
        Kthehu në ballinë
      </Link>
    </main>
  );
}
