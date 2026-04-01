import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fbqwsfkpytexbdsfgqbr.supabase.co' },
      { protocol: 'https', hostname: 'vnjcaluifbmlbupamqwc.supabase.co' },
    ],
  },
};

export default nextConfig;
