import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo standalone para Docker
  output: 'standalone',

  // Permitir acceso desde IPs de red local (celular, otras PCs)
  allowedDevOrigins: ['10.100.1.85', '192.168.1.*', '26.59.116.163'],
};

export default nextConfig;
