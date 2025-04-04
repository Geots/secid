/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.dicebear.com',
        pathname: '/api/**',
      },
    ],
  },
  // Using the new option name for external packages
  serverExternalPackages: ['crypto']
};

export default nextConfig; 