/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    // Handle Node.js modules
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Handle Node.js modules that might be required by dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      path: false,
      stream: false,
      zlib: false,
      crypto: false,
      http: false,
      https: false,
      os: false,
      buffer: false,
      url: false,
      querystring: false,
      util: false,
      assert: false,
      events: false,
      string_decoder: false,
      timers: false,
      process: false,
      vm: false,
      constants: false,
      module: false,
      domain: false,
      punycode: false,
      async_hooks: false,
      perf_hooks: false,
      worker_threads: false,
      wasi: false,
      readline: false,
      repl: false,
      v8: false,
      inspector: false,
      'node:fs': false,
      'node:path': false,
      'node:stream': false,
      'node:zlib': false,
      'node:http': false,
      'node:https': false,
      'node:crypto': false,
      'node:os': false,
      'node:buffer': false,
      'node:url': false,
      'node:querystring': false,
      'node:util': false,
      'node:assert': false,
      'node:events': false,
      'node:string_decoder': false,
      'node:timers': false,
      'node:process': false,
      'node:vm': false,
      'node:constants': false,
      'node:module': false,
      'node:domain': false,
      'node:punycode': false,
      'node:async_hooks': false,
      'node:perf_hooks': false,
      'node:worker_threads': false,
      'node:wasi': false,
      'node:readline': false,
      'node:repl': false,
      'node:v8': false,
      'node:inspector': false,
      'puppeteer-core': false,
      'puppeteer': false
    };

    // Exclude PDF.js from being processed by Next.js
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        publicPath: '/_next/',
      },
    });
    
    // Add a rule to handle PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash].worker.js',
      },
    });
    
    return config;
  },
}

export default nextConfig;
