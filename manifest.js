module.exports={
    id: "org.community.YourIPTV",
    version: "1.0.0",
    name: "Your IPTV",
    logo: "https://dl.strem.io/addon-logo.png",
    description: "This addon brings your IPTV provider to Stremio",
    types: ["movie", "series","tv","channel"],
    background: "https://dl.strem.io/addon-background.jpg",
    resources: ["movie","series","tv"],
    catalogs: [],
    idPrefixes: ["yiptv:"],
    behaviorHints:{configurable : true, configurationRequired: true },
};