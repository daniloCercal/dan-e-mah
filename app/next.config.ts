import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The floating dev badge sits on top of the phone tab bar; build and runtime errors still open the overlay.
  devIndicators: false,
}

export default nextConfig
