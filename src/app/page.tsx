import AccountInfo from "@/components/accountInfo/accountInfo";
import CollectionInfo from "@/components/collectionInfo/collectionInfo";
import Minter from "@/components/minter/minter";
import Navbar from "@/components/navigation/navbar";
import Nfts from "@/components/nfts/nfts";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-hero-pattern bg-scroll p-8 text-white bg-blend-darken">
      <div className="mx-auto w-full flex-col items-center justify-between xl:w-4/5 2xl:w-4/5 h-full">
        <Navbar></Navbar>
        <div className="grid w-full grid-cols-1 justify-between gap-4 md:grid-cols-[28%_40%_28%] h-full">
          <div className="flex flex-col justify-between h-full pb-8">
            <CollectionInfo></CollectionInfo>
            <AccountInfo></AccountInfo>
          </div >
          <div className="pb-8 "><Minter></Minter></div>

        </div>
      </div>
    </main>
  );
}

