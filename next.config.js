/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: [
      "bafybeifzdbsgwpnj37c3tzj4pkut3b2pgf2u75mf3zmbto657ep2ubwf6a.ipfs.nftstorage.link",
      "arweave.net",
      "arweave.net/-sj9dJLb5H3LvvlYoe4tbfdl9HP6DCj2YU2NbLIZKZU/"

    ],
  },
};

module.exports = nextConfig
