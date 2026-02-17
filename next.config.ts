/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['fbqwsfkpytexbdsfgqbr.supabase.co', 'vnjcaluifbmlbupamqwc.supabase.co'],
  },
};

export default nextConfig;
