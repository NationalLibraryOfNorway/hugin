import {withSentryConfig} from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: "standalone",
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    experimental: {
        instrumentationHook: true
    },
    async rewrites() {
        return [
            {
                source: `${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalog/:path*`,
                destination: `${process.env.CATALOGUE_API_PATH}/:path*`,
                basePath: false
            }
        ];
    }
};

export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    url: process.env.SENTRY_URL
}, {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true
});
