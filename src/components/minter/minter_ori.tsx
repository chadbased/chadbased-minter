"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { nftABI } from "@/assets/nftABI";
import { Alchemy, Network } from "alchemy-sdk";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT;

const contractAddresses = [NFT_CONTRACT];

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: process.env.NEXT_PUBLIC_TESTNET == "true" ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

export default function Minter() {
  const [buttonText, setButtonText] = useState("MINT");
  const [imagePath, setImagePath] = useState("/logo.jpg");

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  
  const { write: mint, isLoading: isMintLoading, data: mintData, error: mintError } = useContractWrite({
    ...nftContract,
    functionName: "mint",
    //@ts-ignore
    args: [1],  // Quantity is now statically set to 1
    onError: (error) => console.error('Minting error:', error),
    onSuccess: (data) => console.log('Minting successful:', data)
  });

  const { isSuccess: isMintSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
    confirmations: 1,
  });

  useEffect(() => {
    if (isMintLoading) {
      setButtonText("Minting...");
      setImagePath("/nftAnimation.gif");
    } else if (isMintSuccess && isConnected) {
const fetchLatestNFT = async () => {
if (address) {
const nfts = await alchemy.nft.getNftsForOwner(address, { contractAddresses: contractAddresses.filter(Boolean) as string[] });
const latestNFT = nfts.ownedNfts.at(-1);
if (latestNFT) {
const imageURL = `https://arweave.net/-sj9dJLb5H3LvvlYoe4tbfdl9HP6DCj2YU2NbLIZKZU/${latestNFT.tokenId}.png`;
setImagePath(imageURL);
}
}
}
      fetchLatestNFT();
    } else {
      setButtonText("MINT");
      setImagePath("/unrevealed.jpg");
    }
  }, [isMintLoading, isMintSuccess, isConnected, address]);

  return (
    <div className="mx-auto h-full w-full max-w-sm flex-col justify-between rounded-lg bg-black px-8 py-16">
      <div className="mx-auto mb-4 w-full max-w-xs overflow-hidden rounded border-2 border-white bg-white">
      <Image
          src={imagePath}
          width={250}
          height={250}
          alt="Chad NFTs"
          style={{
            width: "100%",
            height: "auto",
          }}
          priority
        />        <div className="m-4">
          <div className="m-1 font-bold text-black">{"CHADBASED MINT"}</div>
          <div className="m-1 text-black">{"NFT Price: FREE"}</div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => mint()}
          disabled={isMintLoading}
          className="rounded-xl bg-white px-5 py-3 font-bold text-black hover:bg-slate-300">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
