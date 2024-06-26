"use client";
import React, {useEffect, useState} from "react";
import {useAccount, useContractReads, useNetwork} from "wagmi";
import {nftABI} from "@/assets/nftABI";
import Image from "next/image";
import {Alchemy, Network} from "alchemy-sdk";
import Link from "next/link";

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

export default function Nfts({ }: Props) {
const [totalSupply, setTotalSupply] = useState<number | undefined>(undefined);
const [maxPerWallet, setMaxPerWallet] = useState<number | undefined>(
undefined,
);
const [nftsOwned, setNftsOwned] = useState<NFTMeta[] | null>(null);

// get account address
const { address, isConnecting, isDisconnected, isConnected } = useAccount({});

// get chain
const { chain } = useNetwork();

// define token contract config
const nftContract = {
address: NFT_CONTRACT,
abi: nftABI,
chainId: chain?.id,
};

const { data, isSuccess, isError, isLoading } = useContractReads({
contracts: [
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
if (data != undefined) {
setMaxPerWallet(Number(data[0].result));
setTotalSupply(Number(data[1].result));
}
}, [data]);

// set image path
useEffect(() => {
async function getNFT() {
const nfts = await alchemy.nft.getNftsForOwner(address as string, {
contractAddresses,
});

let nftArray: NFTMeta[] = [];
const maxShow = maxPerWallet != undefined && maxPerWallet <= 3 ? maxPerWallet : 3;
for (let index = 1; index <= maxShow; index++) {
const nft = nfts["ownedNfts"].at(-index);
if (nft != undefined) {
let imageURL: string = "/unrevealed.jpg";

const res = await fetch(
`https://arweave.net/-sj9dJLb5H3LvvlYoe4tbfdl9HP6DCj2YU2NbLIZKZU/${nft.tokenId}.png`,
);
const json = await res.json();
const [prefix, separator, url, color, name] = json.image.split("/");
imageURL = `https://arweave.net/-sj9dJLb5H3LvvlYoe4tbfdl9HP6DCj2YU2NbLIZKZU/${color}/${name}`;

let iNft: NFTMeta = {
name: nft.title,
description: nft.description,
id: Number(nft.tokenId),
path: imageURL,
};
nftArray.push(iNft);
} else {
let iNft: NFTMeta = {
name: "CHADBASE #?",
description: "nft.description",
id: index + 11000,
path: "/unrevealed.jpg",
};
nftArray.push(iNft);
}
}
setNftsOwned(nftArray);
}

if (isConnected) {
getNFT();
}
}, [isConnected, totalSupply, address, maxPerWallet]);

return (
<div className="mx-auto h-full w-full pb-8 md:ml-0">
<div className="mx-auto max-w-sm rounded-md bg-black p-8 sm:w-full h-full">
<h2 className="border-b-2 border-yellow-500 pb-2 text-xl uppercase">
Your NFTs
</h2>
<div className="my-4 min-h-max">
<div className="grid grid-cols-3 place-content-center gap-4 ">
{nftsOwned != null &&
nftsOwned.map(function (nft) {
let hover: string = "";
if (nft.id <= 10000) hover = "  hover:border-yellow-500";
return (
<Link
key={nft.id}
href={`${NFT_CONTRACT}:${nft.id}`}
>
<div
className={
"my-2 overflow-hidden rounded-md border-2 border-white bg-white shadow" +
hover
}
>
{
<Image
alt={nft.name || ""}
src={`${nft.path}` as string}
width={100}
height={100}
style={{
width: "100%",
height: "auto",
}}
/>
}
<div className="m-2 text-xs font-bold text-black">
{nft.name}
</div>
</div>
</Link>
);
})}
</div>
</div>
</div>
</div>
);
}
