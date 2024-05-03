"use client";
import React, { useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";

import { nftABI } from "@/assets/nftABI";

import Image from "next/image";
import CopyToClipboard from "../copyToClipboard";
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;

type Props = {};

export default function CollectionInfo({ }: Props) {
  const [totalSupply, setTotalSupply] = useState<number | undefined>(undefined);

  // get chain
  const { chain } = useNetwork();



  // define token contract config
  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  // read current limits
  const { data, isSuccess, isError, isLoading } = useContractRead({
    ...nftContract,
    functionName: "totalSupply",
    watch: true,
    cacheTime: 1000,
  });

  useEffect(() => {
    if (data != undefined) {
      setTotalSupply(Number(data));
    }
  }, [data]);

  function getTotalSupplyString() {
    let text: string = "---";
    if (isLoading) {
      text = "Loading...";
    } else if (isSuccess && totalSupply != undefined) {
      text = `${totalSupply - 1}`;
    } else {
      text = "---";
    }
    return text;
  }

  function getNftsRemainingString() {
    let text: string = "---";
    if (isLoading) {
      text = "Loading...";
    } else if (isSuccess && totalSupply != undefined) {
      text = `${10000 - totalSupply}`;
    } else {
      text = "---";
    }
    return text;
  }

  return (
    <div className="mx-auto w-full pb-8 md:mr-0">
      <div className="mx-auto max-w-sm rounded-md bg-black p-8 ">
        <Image
          className="mb-4 h-20 w-full overflow-hidden object-cover sm:h-28"
          src={"/featured_image.jpg"}
          width={100}
          height={100}
          alt="Chad NFTs"
        />
        <h2 className="mb-4 border-b-2 border-yellow-500 pb-2 text-xl">
          CHADBASED COLLECTION
        </h2>
        <div className="pb-4 text-sm text-slate-600">
          <p>Contract:</p>
          <CopyToClipboard text={NFT_CONTRACT} copyText={NFT_CONTRACT} />
        </div>
        <div className="pb-4 text-xs text-dark">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="text-sm">
                <th>RARITY</th>
                <th>PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>R</td>
                <td>50 %</td>
              </tr>
              <tr>
                <td>SR</td>
                <td>30 %</td>
              </tr>
              <tr>
                <td>SSR</td>
                <td>15 %</td>
              </tr>
              <tr>
                <td>SSR+</td>
                <td>5 %</td>
              </tr>
 
            </tbody>
          </table>
        </div>
        <div className="flex justify-between w-48">
          <h3>Last NFT minted: </h3>
          <p>#{getTotalSupplyString()}</p>
        </div>
        <div className="flex justify-between  w-48">
          <h3>NFTs remaining: </h3>
          <p>{getNftsRemainingString()}</p>
        </div>
      </div>
    </div>
  );
}
