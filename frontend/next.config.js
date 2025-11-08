const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/langgraph/:path*',
        destination: `${process.env.LANGGRAPH_API_URL || 'http://localhost:8123'}/:path*`,
      },
    ]
  },
})