"use client";
import {nftABI} from "@/assets/nftABI";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { Alchemy, Network } from "alchemy-sdk";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${ string }`;

const contractAddresses = [NFT_CONTRACT];

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: process.env.NEXT_PUBLIC_TESTNET == "true" ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

export default function Minter() {
  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [maxPerWallet, setMaxPerWallet] = useState<number>(2);
  const [batchLimit, setBatchLimit] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [buttonText, setButtonText] = useState<string>("MINT");
  const [imagePath, setImagePath] = useState<string>("/logo.gif");

  const { address, isConnecting, isDisconnected, isConnected } = useAccount({});
  const { chain } = useNetwork();

  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  const { data: nftData, isError: isNftError, isLoading: isNftLoading } = useContractReads({
    contracts: [
      { ...nftContract, functionName: "balanceOf", args: [address as `0x${ string }`] },
      { ...nftContract, functionName: "batchLimit" },
      { ...nftContract, functionName: "maxPerWallet" },
      { ...nftContract, functionName: "totalSupply" },
    ],
    enabled: isConnected && address != null,
    watch: true,
  });

  useEffect(() => {
    if (nftData != undefined) {
      setNftBalance(Number(nftData?.[0].result));
      setBatchLimit(Number(nftData?.[1].result));
      setMaxPerWallet(Number(nftData?.[2].result));
      setTotalSupply(Number(nftData?.[3].result));
    }
  }, [nftData]);

  // Static quantity for minting
  const quantity = "1";

  const { config: mintConfig } = usePrepareContractWrite({
    ...nftContract,
    functionName: "mint",
    args: [BigInt(quantity)],
    
  });

  const { data: mintData, error: mintError, isError: isMintError, write: mint } = useContractWrite(mintConfig);

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } = useWaitForTransaction({
    confirmations: 1,
    hash: mintData?.hash,
  });

  useEffect(() => {

      mint?.();
  });

  useEffect(() => {
    if (isMintLoading) setButtonText("Minting...");
    else setButtonText("MINT NOW");
  }, [isMintLoading]);

  return (
    <div className="mx-auto h-full w-full max-w-sm flex-col justify-between rounded-lg bg-black px-8 py-16 md:max-w-none">
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
        />
        <div className="m-4">
          <div className="m-1 font-bold text-black">{"CHADBASED MINT"}</div>
          <div className="m-1 text-black">{"NFT Price: FREE"}</div>
        </div>
      </div>
      <div className="pt-2 ">
        <div className="flex justify-center">
          <button
            className="rounded-xl bg-white px-5 py-3 font-bold text-black hover:bg-slate-300"
            disabled={isMintLoading}
            onClick={() => mint?.()}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
