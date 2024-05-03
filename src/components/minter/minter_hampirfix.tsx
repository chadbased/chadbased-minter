"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { nftABI } from "@/assets/nftABI";
import { Alchemy, Network } from "alchemy-sdk";
import firebase from "firebase/app";
import "firebase/auth";
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, TwitterAuthProvider } from 'firebase/auth';

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT;
const TWITTER_TWEET_ID = "1776670497876619538"; // Replace with your tweet ID

const contractAddresses = [NFT_CONTRACT];

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: process.env.NEXT_PUBLIC_TESTNET == "true" ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

const firebaseConfig = {
  apiKey: "AIzaSyCyoWZS0GheMhdmcOr6b0IMOc0Er5POaoM",
  authDomain: "chadbased-f4111.firebaseapp.com",
  projectId: "chadbased-f4111",
  storageBucket: "chadbased-f4111.appspot.com",
  messagingSenderId: "168102333027",
  appId: "1:168102333027:web:337221e4c548ac99d90656",
  measurementId: "G-F669E8V3LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export default function Minter() {
  const [buttonText, setButtonText] = useState("MINT");
  const [imagePath, setImagePath] = useState("/logo.jpg");
  const [hasRetweeted, setHasRetweeted] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasFollowed, setHasFollowed] = useState(false); // State to track if the user has followed
  const [user, setUser] = useState(null);

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      //@ts-ignore
      setUser(user);
    });

    const checkTweetInteractions = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const twitterAccessToken = await currentUser.getIdToken(true);
        const retweetsResponse = await fetch(`https://api.twitter.com/2/tweets/${TWITTER_TWEET_ID}/retweeted_by?user.fields=created_at`, {
          headers: {
            Authorization: `Bearer ${twitterAccessToken}`,
          },
        });
        const retweetsData = await retweetsResponse.json();
        //@ts-ignore
        const hasRetweeted = retweetsData.data.some((user) => user.id === currentUser.uid);

        const likesResponse = await fetch(`https://api.twitter.com/2/tweets/${TWITTER_TWEET_ID}/liking_users?user.fields=created_at`, {
          headers: {
            Authorization: `Bearer ${twitterAccessToken}`,
          },
        });
        const likesData = await likesResponse.json();
        //@ts-ignore
        const hasLiked = likesData.data.some((user) => user.id === currentUser.uid);

        setHasRetweeted(hasRetweeted);
        setHasLiked(hasLiked);
      }
    };

    checkTweetInteractions();
  }, []);

  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Twitter:", error);
    }
  };

  const { write: mint, isLoading: isMintLoading, data: mintData, error: mintError } = useContractWrite({
    ...nftContract,
    functionName: "mint",
    //@ts-ignore
    args: [1],
    onError: (error) => console.error('Minting error:', error),
    onSuccess: (data) => console.log('Minting successful:', data)
  });

  const { isSuccess: isMintSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
    confirmations: 1,
  });

  const followProfile = async () => {
    // Directly following via API isn't allowed, so prompt the user
    alert("Please follow our profile on Twitter.");
    setHasFollowed(true); // Set to true after user acknowledges the prompt
  };

  const retweetTweet = async () => {
    try {
      const result = await fetch('https://oyster-app-9w37r.ondigitalocean.app/api/retweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetId: TWITTER_TWEET_ID }),
      });

      const data = await result.json();
      if (result.ok) {
        setHasRetweeted(true); // Update state based on successful API call
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      //@ts-ignore
      console.error("Error retweeting:", error.message);
    }
};

  

  const handleRetweet = async () => {
    if (!user) {
      await signInWithTwitter();
    } else {
      await retweetTweet();
    }
  };

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
        />
        <div className="m-4">
          <div className="m-1 font-bold text-black">{"CHADBASED MINT"}</div>
          <div className="m-1 text-black">{"NFT Price: FREE"}</div>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleRetweet}
          className="rounded-xl bg-white px-5 py-3 font-bold text-black">
          Retweet
        </button>
        {hasRetweeted && !hasLiked && (
          <button
          //@ts-ignore
            onClick={handleLike}
            className="rounded-xl bg-white px-5 py-3 font-bold text-black">
            Like
          </button>
        )}
        {hasRetweeted && hasLiked && (
          <button
            onClick={() => mint()}
            disabled={isMintLoading}
            className={`rounded-xl bg-white px-5 py-3 font-bold text-black ${isMintLoading && 'opacity-50 cursor-not-allowed'}`}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}