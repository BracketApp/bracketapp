const cssStyleKeyNames = require("./cssStyleKeyNames")
const { hideSecured, respond, actions } = require("./kernel")

module.exports = ({ _window, res, stack, props, address, __ }) => {

    var { global, views } = _window
    var page = global.manifest.page
    var view = views[global.__pageViewID__ || page] || {}

    // head tags
    var language = global.language = view.language || view.lang || "en"
    var direction = view.direction || view.dir || (language === "ar" || language === "fa" ? "rtl" : "ltr")
    var title = view.title || "Bracket App Title"

    // favicon
    var favicon = views.document.favicon && views.document.favicon.url
    var faviconType = favicon && views.document.favicon.type

    // meta
    view.meta = view.meta || {}
    var metaHTTPEquiv = view.meta["http-equiv"] || view.meta["httpEquiv"] || {}
    if (typeof metaHTTPEquiv !== "object") metaHTTPEquiv = {}
    if (!metaHTTPEquiv["content-type"]) metaHTTPEquiv["content-type"] = "text/html; charset=UTF-8"
    var metaKeywords = view.meta.keywords || ""
    var metaDescription = view.meta.description || ""
    var metaTitle = view.meta.title || view.title || ""
    var metaViewport = view.meta.viewport || ""

    global.manifest.session = global.manifest.session.__props__.id

    // logs
    global.__server__.logs = stack.logs

    // hide secured
    hideSecured({ __, global })

    actions["wait()"]({ _window, stack, props, address, __ })
    
    return respond({ res, stack, props, global, __, response: (
        `<!DOCTYPE html>
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
    )})
}