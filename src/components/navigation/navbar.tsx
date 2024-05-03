import Image from "next/image";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="mx-auto mb-8 mt-3 flex justify-between gap-5 align-middle md:w-full">
      <div className="my-auto h-fit w-fit flex-row rounded-md border-2 border-white bg-white font-bold text-black hover:bg-slate-400 sm:w-36 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex items-center text-right align-middle text-lg uppercase sm:gap-4 lg:p-0"
          href="https://chadbased.com"
          rel="noopener noreferrer"
        >
          <Image
            src="/featured_image.jpg"
            alt="CHAD logo"
            className="ml-0 h-10 w-auto overflow-hidden rounded-md"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 sm:w-fit sm:scale-100">Home</div>
        </a>
      </div>

     
    </nav>
  );
}
