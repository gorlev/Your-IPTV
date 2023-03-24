module.exports={
    id: "org.community.YourIPTV",
    version: "1.1.1",
    name: "Your IPTV",
    logo: "https://dl.strem.io/addon-logo.png",
    description: "This addon brings all the Live Streams, VOD streams and Series from your IPTV subscription to your Stremio using Xtream API.",
    types: ["movie", "series","tv","channel"],
    background: "https://dl.strem.io/addon-background.jpg",
    resources: ["movie","series","tv"],
    catalogs: [],
    idPrefixes: ["yiptv:"],
    behaviorHints:{configurable : true, configurationRequired: true },
};