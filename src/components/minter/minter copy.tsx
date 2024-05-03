"use client";
import {nftABI} from "@/assets/nftABI";
import React, {useEffect, useState} from "react";
import Image from "next/image";

import {
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import {Alchemy, Network} from "alchemy-sdk";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${ string }`;

const contractAddresses = [NFT_CONTRACT];

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network:
    process.env.NEXT_PUBLIC_TESTNET == "true"
      ? Network.BASE_SEPOLIA
      : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

interface NFTMeta {
  name: string;
  description: string;
  path: string;
  id: number;
}

type Props = {};

export default function Minter({}: Props) {
  const [quantity, setQuantity] = useState<string>("1");

  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [maxPerWallet, setMaxPerWallet] = useState<number>(2);
  const [batchLimit, setBatchLimit] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [buttonText, setButtonText] = useState<string>("MINT");

  const [imagePath, setImagePath] = useState<string>("/logo.jpg");

  // get account address
  const {address, isConnecting, isDisconnected, isConnected} = useAccount({});

  // get chain
  const {chain} = useNetwork();



  // define token contract config
  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };


  // read nft balance
  const {
    data: nftData,
    isError: isNftError,
    isLoading: isNftLoading,
  } = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${ string }`],
      },
      {
        ...nftContract,
        functionName: "batchLimit",
      },
      {
        ...nftContract,
        functionName: "maxPerWallet",
      },
      {
        ...nftContract,
        functionName: "totalSupply",
      },
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



  // mint nfts
  const {config: mintConfig} = usePrepareContractWrite({
    ...nftContract,
    functionName: "mint",
    args: [BigInt(quantity)],
    enabled:
      Number(quantity) > 0 &&
      isConnected &&
      nftBalance != undefined &&
      nftBalance + Number(quantity) <= maxPerWallet 
  });
  const {
    data: mintData,
    error: mintError,
    isError: isMintError,
    write: mint,
  } = useContractWrite(mintConfig);

  const {isLoading: isMintLoading, isSuccess: isMintSuccess} =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });

  useEffect(() => {
    if (
      nftBalance != undefined &&
      nftBalance + Number(quantity) < maxPerWallet
    )
      mint?.();
  }, );



  // ============================================================================
  // display elements

  // set image path
  useEffect(() => {
    async function getNFT() {
      const nfts = await alchemy.nft.getNftsForOwner(address as string, {
        contractAddresses,
      });
      const nftLatest = nfts["ownedNfts"].at(-1);
      if (nftLatest != undefined) {
        let imageURL: string = "/unrevealed.jpg";

        const res = await fetch(
          `https://bafybeieokkbwo2hp3eqkfa5chypmevxjii275icwxnuc7dmuexi3qsuvu4.ipfs.nftstorage.link/${ nftLatest.tokenId }`,
        );
        const json = await res.json();
        const [prefix, separator, url, color, name] = json.image.split("/");
        imageURL = `https://bafybeifzdbsgwpnj37c3tzj4pkut3b2pgf2u75mf3zmbto657ep2ubwf6a.ipfs.nftstorage.link/${ color }/${ name }`;
        setImagePath(imageURL);
      } else {
        console.log("nft fetch failed");
        setImagePath("/logo.jpg");
      }
    }

    if (isMintLoading && isConnected) {
      setImagePath("/nftAnimation.gif");
    } else if (!isMintLoading && isMintSuccess && isConnected) {
      getNFT();
    } else {
      setImagePath("/logo.jpg");
    }
  }, [address, isConnected, isMintLoading, isMintSuccess]);

  useEffect(() => {
    if (isMintLoading) setButtonText("Minting...");
    else if (
      Number(quantity) > 0 
    )
      setButtonText("MINT NOW");
    else setButtonText("MINT");
  }, [
    isMintLoading,
    quantity,
  ]);

  function mintButton() {
    if (isDisconnected && batchLimit) {
      return <div>Connect your wallet to mint</div>;
    } else   {
        // minting enabled
        return (
          <button
            className="rounded-xl bg-white px-5 py-3 font-bold text-black hover:bg-slate-300"
            disabled={
              isMintLoading
            }
            onClick={(e) => {
                mint?.();
              
            }}
          >
            {buttonText}
          </button>
        );
      
    }
  }

  function mintPanel(canMint: number) {
      return (
        <div className="pt-2 ">
          <div className="my-4 justify-center text-center">
            <form>
              <label>
                Enter number of NFTs:
                <input
                  className="mx-auto ml-2 rounded bg-gray-800 p-1 text-right"
                  type="number"
                  value={quantity}
                  max={batchLimit}
                  min="1"
                  placeholder="1"
                  onChange={(e) => {
                    setQuantity(e.target.value);
                  }}
                />
              </label>
            </form>
          </div>
          <div className="flex justify-center">{mintButton()}</div>
        </div>
      );
    
  }

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
      {mintPanel(batchLimit)}
    </div>
  );
}
