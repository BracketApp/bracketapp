const cssStyleKeyNames = require("./cssStyleKeyNames")
const { actions } = require("./kernel")
const { hideSecured, respond } = require("./database")
const { gzip } = require("node-gzip")
const fs = require("fs")
const { logger } = require("./logger")
const { clone } = require("./clone")

const document = async ({ _window, res, stack, props, address, __ }) => {

    let { global: { __refs__, __stacks__, __startAddresses__, ...global }, views } = _window
    let page = global.manifest.page
    let view = views[global.__pageViewID__ || page] || {}

    // head tags
    let language = global.language = view.language || view.lang || "en"
    let direction = view.direction || view.dir || (language === "ar" || language === "fa" ? "rtl" : "ltr")
    let title = view.title || "Bracket App Title"

    // favicon
    let favicon = views.document.favicon && views.document.favicon.url
    let faviconType = favicon && views.document.favicon.type

    // meta
    view.meta = view.meta || {}
    let metaHTTPEquiv = view.meta["http-equiv"] || view.meta["httpEquiv"] || {}
    if (typeof metaHTTPEquiv !== "object") metaHTTPEquiv = {}
    if (!metaHTTPEquiv["content-type"]) metaHTTPEquiv["content-type"] = "text/html; charset=UTF-8"
    let metaKeywords = view.meta.keywords || ""
    let metaDescription = view.meta.description || ""
    let metaTitle = view.meta.title || view.title || ""
    let metaViewport = view.meta.viewport || ""
    let session = clone(global.manifest.session)
    global.manifest.session = session.__props__.id

    // logs
    // global.__server__.logs = stack.logs

    // hide secured
    hideSecured({ __, global })

    actions["stackManager()"]({ _window, stack, props, address, __ })
    
    let doc = `<!DOCTYPE html>
        <html lang="${language}" dir="${direction}" class="html">
            <head>
                <!-- css -->
                <link rel="stylesheet" href="/storage/resources/index.css?sid=${res.serverID}">
                <style>
                    ${views.document.stylesheet ? `${Object.entries(views.document.stylesheet).map(([key, value]) => typeof value === "object" && !Array.isArray(value)
            ? `${key}{
                        ${Object.entries(value).map(([key, value]) => `${cssStyleKeyNames[key] || key}: ${value.toString().replace(/\\/g, '')}`).join(`;
                        `)};
                    }` : "").filter(style => style).join(`
                    `)}` : ""}
                </style>
                
                <!-- Font -->
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend+Deca&display=swap">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400&display=swap">
                
                <!-- title -->
                <title>${title}</title>
                
                <!-- meta -->
                ${metaHTTPEquiv ? Object.entries(metaHTTPEquiv).map(([key, value]) => `<meta http-equiv="${key}" content="${value}">
                `) : ""}
                <meta http-equiv="content-type" content="text/html; charset=utf-8" />
                <meta name="viewport" content= "width=device-width, initial-scale=1.0">
                ${metaViewport ? `<meta name="viewport" content="${metaViewport}">` : ""}
                ${metaKeywords ? `<meta name="keywords" content="${metaKeywords}">` : ""}
                ${metaDescription ? `<meta name="description" content="${metaDescription}">` : ""}
                ${metaTitle ? `<meta name="title" content="${metaTitle}">` : ""}
                
                <!-- favicon -->
                ${favicon ? `<link rel="icon" type="image/${faviconType || "x-icon"}" href="${favicon}"/>` : `<link rel="icon" href="data:,">`}
                
                <!-- views & global -->
                <script id="views" type="application/json">${JSON.stringify(views)}</script>
                <script id="global" type="application/json">${JSON.stringify(global)}</script>
                
                <!-- head tags -->
                ${(views.document.links || []).map(link => !link.body ? `<link ${link.rel ? `rel="${link.rel}"` : ""} ${link.type ? `type="${link.type}"` : ""} href="${link.href}" />` : "").join("")}
  
            </head>
            <body>
                <!-- body tags -->
                ${(views.document.links || []).map(link => link.body ? `<link ${link.rel ? `rel="${link.rel}"` : ""} ${link.type ? `type="${link.type}"` : ""} href="${link.href}" />` : "").join("")}
  
                <!-- html -->
                ${views.body.__html__ || ""}
  
                <!-- engine -->
                <script src="/storage/resources/engine.js?sid=${res.serverID}"></script>
  
                <!-- google icons -->
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Rounded"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Sharp"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp"/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  
                <!-- html2pdf -->
                <script src="https://cdn.jsdelivr.net/npm/js-html2pdf@1.1.4/lib/html2pdf.min.js"></script>
            </body>
        </html>`

    // caching
    createAppCache({ _window, session, doc })

    // encode
    doc = await gzip(doc)

    res.setHeader("Content-Encoding", "gzip")
    res.write(doc)
    res.end()
}

const createAppCache = ({ _window, session, doc }) => {

    logger({ _window, data: { key: "caching", start: true } })

    const cacheID = session.dev ? session.devDB : session.db

    // cache
    if (!fs.existsSync(`cache/${cacheID}`)) fs.mkdirSync(`cache/${cacheID}`)

    // cache app
    fs.writeFileSync(`cache/${cacheID}/${session.__props__.id}`, doc)

    logger({ _window, data: { key: "caching", end: false } })
}

module.exports = document