const { generate } = require("./generate")
const { toArray } = require("./toArray")
const { isEqual } = require("./isEqual")
const { gzip } = require("node-gzip")

// database
const fs = require("fs")
const util = require('util')
const { spawn } = require("child_process")
const vcards = require("vcards-js")
const { clone } = require("./clone")
const { toValue } = require("./kernel")
const { override } = require("./merge")

// project DB
require('dotenv').config()
const bracketDB = process.env.BRACKETDB

const database = ({ _window = { global: { manifest:{} } }, req, res, action, preventDefault, data, stack, props, __, verified, unpopulate, checkExistsForSave }) => {

    data = JSON.parse(JSON.stringify(data))
    let timer = (new Date()).getTime(), global = _window.global, responses = []
    
    // authorize
    let authorizations = authorizeDB({ _window, global, action: action.slice(0, -2), data })
    if (!authorizations) return respond({ res, stack, props, global, __, response: { success: false, message: "Not authorized!" } })

    for (let index = 0; index < authorizations.length; index++) {

        let data = authorizations[index]

        if (action === "search()") {

            if (data.doc && data.collection && !checkExistsForSave && global.__queries__[data.collection] && global.__queries__[data.collection][data.doc]) responses.push(searchResponse({ data, global }))
            else responses.push(getData({ _window, req, res, preventDefault, search: data, action, verified, unpopulate, checkExistsForSave }))

        } else if (action === "save()") responses.push(postData({ _window, req, res, preventDefault, save: data, action, verified }))
        else if (action === "erase()") responses.push(deleteData({ _window, req, res, preventDefault, erase: data, action, verified }))
    }

    let time = (new Date()).getHours() + ":" + (new Date()).getMinutes()
    
    // log
    global.manifest.session && console.log(time, action.slice(0, -2).toUpperCase(), (data.collection || "*") + (data.doc ? `/${data.doc}` : ""), (new Date()).getTime() - timer, global.manifest.session.subdomain || "", global.manifest.session.username || "");
    
    // end
    return syncData({ global, action, responses, data })
}

const getData = ({ _window = {}, req, res, search, action = "search()", verified, collectionProps, unpopulate, checkExistsForSave }) => {

    let global = _window.global
    let response = { success: false, message: "Something went wrong!" }
    var datastore = search.datastore || "bracketDB" || global.manifest.datastore,
        db = search.db = search.db || global.manifest.session.db,
        collection = search.collection,
        doc = search.doc,
        docs = search.docs,
        populate = search.populate,
        select = search.select,
        deselect = search.deselect,
        assign = search.assign,
        find = search.find,
        findOne = search.findOne,
        limit = search.limit || 1000,
        skip = search.skip || 0,
        data = {}, 
        success = true, 
        message = "Data queried successfully!",
        single

    if ("url" in search) {

        try {

            //data = await axios.get(search.url, { timeout: 1000 * 40 }).catch(err => err)

            data = data.data
            success = true
            message = `Search done successfuly!`

        } catch (err) {

            data = {}
            success = false
            message = err
        }

        return response = { data, success, message }

    }

    if (!collectionProps) var { path, dbProps, collectionProps, liveDB, success, message } = checkParams({ data: search, action, datastore })
    if (!success) return { success, message, dev: search.dev, search }
    
    // no collection => return collection names
    if (!collection) {

        var data = getFolderNames(path)

        var propsIndex = data.findIndex(coll => coll === "__props__")
        data.splice(propsIndex, 1)

        return ({ id: generate(), data, message: "Collection names sent successfully!", success: true, single, dev: search.dev, search })
    }

    // schema
    if (doc === "__schema__") return getSchema({ search, liveDB, collection, collectionProps, dbProps })

    // chunk details
    let chunkIndex = collectionProps.lastChunk
    let chunkName = "chunk" + chunkIndex
    let chunksRunout = false, endSearch = false
    
    // findOne
    if ("findOne" in search) {

        search.find = find = search.findOne
        limit = 1
        single = true
    }

    if ("doc" in search) {
        
        if (fs.existsSync(`${path}/collection1/${doc}.json`)) {

            data = { [doc]: JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`)) }
            single = true

            // doc does not exist in collection
        } else data = undefined
    }

    else if ("docs" in search) {

        var foundDocs = []
        toArray(docs).map(doc => {
            if (fs.existsSync(`${path}/collection1/${doc}.json`)) {
                data[doc] = JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`))
                foundDocs.push(doc);
            }
        })
    }

    else if ("findAny" in search) {

        var value = toArray(search.findAny)
        for (let index = collectionProps.lastChunk; index > 0; index--) {

            var chunkProps = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/chunk${index}/__props__.json`))
            var docs = chunkProps.docs

            for (let i = 0; i < docs.length; i++) {

                var doc = docs[i]
                var docData = JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`))

                value.map(value => {

                    delete docData.__props__.active
                    delete docData.__props__.creationDate
                    delete docData.__props__.comments
                    delete docData.__props__.collapsed
                    delete docData.__props__.createdByUserID
                    delete docData.__props__.id
                    delete docData.__props__.doc
                    delete docData.__props__.counter
                    delete docData.__props__.chunk
                    delete docData.__props__.version
                    delete docData.__props__.dirPath
                    delete docData.__props__.collection
                    delete docData.__props__.chunk
                    
                    if (JSON.stringify(docData).includes(value)) {

                        data[doc] = []

                        var list = objectToString(docData).split(value)
                        if (list.length <= 1) return

                        list.map((text, i) => {
                            if (i === 0) return
                            data[doc].push(list[i - 1].split(": ").at(-1).split(",").at(-1).slice(-30) + `<mark>${value}</mark>` + text.split(",")[0])
                        })
                    }
                })
            }
        }
    }

    else { // find or no find

        while (!chunksRunout && !endSearch) {

            if ("find" in search) {

                // find=[] & find=[preventDefault] => do not return all data in collection
                var searchFields = Object.keys(find)
                if ((find.preventDefault && searchFields.length === 1) || searchFields.length === 0) return { data: {}, message: "No find conditions exist!", success: false, single, dev: search.dev, search }
                delete find.preventDefault
                
                // get indexing
                var {success, chunks, docs, message} = checkIndexing({global, path, search, finds: toArray(find), chunkName, collectionProps})
                if (!success) break;

                var i = 0
                
                while (limit > 0 && (i <= docs.length - 1)) {

                    let doc = docs[i]

                    toArray(find).map((find, index) => {

                        if (limit === 0) return
                        delete find.preventDefault
                        let searchFields = Object.keys(find)
                        let push = true
                        let chunk = chunks[index]
                        
                        searchFields.map(searchField => {

                            if (!push) return
                            // equal query without having equal operator
                            if (typeof find[searchField] !== "object" || Array.isArray(find[searchField])) find[searchField] = { equal: find[searchField] }

                            Object.entries(find[searchField]).map(([operator, value]) => {
                                if (!push || !chunk.indexing[doc]) return
                                
                                push = findData({ data: chunk.indexing[doc][searchField], operator: toOperator(operator), value })
                            })
                        })

                        if (push && skip) skip--;
                        else if (push && limit > 0 && !skip) {
                            limit--;
                            data[doc] = JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`))
                        }
                        if (limit === 0) endSearch = true
                    })
                        
                    i++;
                }
            }

            else { // get all

                // get indexing
                var {success, chunks, docs, message} = checkIndexing({db, collection, path, liveDB, finds: toArray(find), chunkName, collectionProps})
                if (!success) break;

                let i = 0

                while (limit > 0 && (i <= docs.length - 1)) {

                    let doc = docs[i]

                    if (!skip) data[doc] = JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`))
                    if (skip) skip--;
                    else limit--;
                    i++;
                }

                if (limit === 0) endSearch = true
            }

            if (chunkIndex === 1 || endSearch) chunksRunout = true
            else {
                chunkIndex--;
                chunkName = "chunk" + chunkIndex
            }
        }
    }
    
    readProps({ collectionProps, dbProps, data, db: liveDB, collection, datastore })

    // schema
    if (!checkExistsForSave) Object.values(data || {}).map(data => {
        
        let schema = override(clone(collectionProps.schema) || {}, data.__props__.schema || {})
        applySchema({ _window, liveDB, db, req, dev: search.dev, schema, data, datastore, collection, action, search, unpopulate })
    })
    
    response = { id: generate(), data, message, success, single, dev: search.dev, search }
    
    // ex: search():[collection=product;docs;populate=:[collection;key;field]] (key is keyname in data, field is the fields to return)
    /*if ((populate || select || deselect || assign) && success) {

        var data = response.data

        // restructure
        if (doc) data = { [doc]: data }

        if (populate) populator({ _window, req, res, db, data, populate, search })
        if (select) data = selector({ data, select })
        else if (deselect) data = deselector({ data, deselect })
        else if (assign) data = assigner({ data, assign })

        // restructure
        if (doc) data = data[doc]
        response.data = data
    }*/

    return response
}

const postData = ({ _window = {}, req, res, save, action = "save()", verified }) => {

    var datastore = save.datastore || "bracketDB" || _window.global.manifest.datastore
    var db = save.db || _window.global.manifest.session.db,
        collection = save.collection,
        doc = save.doc,
        docs = save.docs || [],
        data = save.data,
        find = save.find,
        success = false, 
        message = "Missing data!"

    // update specific fields. ex: update:[name=Goerge;age=28] (it ignores appended data)
    if (save.update) {

        var search = { datastore, db, collection }
        if (doc) search.doc = doc
        else if (find) search.find = find

        var { data: rawData, success, message } = database({ _window, req, action: "search()", data: search })
        if (!success) return ({ success, message })
        data = rawData

        if (doc) data = { [data.__props__.doc]: data }

        // update values for requested keys
        Object.values(data).map(data => Object.entries(save.update).map(([key, value]) => key.split(".").reduce((o, k, i) => { if (i === key.split(".").length - 1) { o[k] = value } else return o[k] }, data)))
        data = Object.values(data)
    }

    // find data
    else if (find) {

        var { data: rawData = {} } = database({ _window, req, res, action: "search()", data: save })
        rawData = Object.values(rawData)
        if (rawData.length > 1) return ({ success: false, message: "Incompatible use of find and save!" })
        else if (rawData.length === 1) {
            data = rawData[0]
            // save.doc = rawData[0].__props__.doc
            if (save.data) {
                Object.entries(save.data).map(([key, value]) => {
                    if (key === "__props__") return
                    data[key] = value
                })
            }
        }
    }

    if (save.publish) {
        var response = publish({ _window, req, data: save })
        return response
    }

    var { path, dbProps, collectionProps, liveDB, success, message } = checkParams({ _window, req, data: save, action })
    if (!success) return { success, message }

    // schema
    if (doc === "__schema__") return saveSchema({ save, liveDB, collection, collectionProps, dbProps })

    // rename collection
    if (save.rename && save.collection) {

        fs.renameSync(path, `bracketDB/${db}/${save.rename}`)

        // edit liveDB collection name
        if (db !== liveDB && save.dev) fs.renameSync(`bracketDB/${liveDB}/${save.collection}`, `bracketDB/${liveDB}/${save.rename}`)

        // props
        dbProps.writes += 1
        collectionProps.writes += 1
        collectionProps.collection = collection = save.rename

        // props
        fs.writeFileSync(`bracketDB/${liveDB}/${collection}/collection1/__props__/__props__.json`, JSON.stringify(collectionProps, null, 4))
        fs.writeFileSync(`bracketDB/${liveDB}/__props__/db.json`, JSON.stringify(dbProps, null, 4))

        // change docs collection name
        var docs = fs.readdirSync(`bracketDB/${db}/${collection}/collection1`)
        docs.map(doc => {
            if (doc === "__props__") return
            var data = JSON.parse(fs.readFileSync(`bracketDB/${db}/${collection}/collection1/${doc}`))
            data.__props__.collection = save.rename
            fs.writeFileSync(`bracketDB/${db}/${collection}/collection1/${doc}`, JSON.stringify(data))
        })

        // update liveDB
        if (save.dev) {
            
            // change docs collection name
            var docs = fs.readdirSync(`bracketDB/${liveDB}/${collection}/collection1`)
            docs.map(doc => {
                if (doc === "__props__") return
                var data = JSON.parse(fs.readFileSync(`bracketDB/${liveDB}/${collection}/collection1/${doc}`))
                data.__props__.collection = save.rename
                fs.writeFileSync(`bracketDB/${liveDB}/${collection}/collection1/${doc}`, JSON.stringify(data))
            })
        }

        return { success: true, message: "Collection name changed successfully!" }
    }

    var chunks = {}, chunkName = `chunk${collectionProps.lastChunk}`
    var length = toArray(data).length
    
    // incompatible payload
    if (("doc" in save && length > 1 && docs.length !== length)) return {success:false, message: "Incompatible payload!"}

    // push doc to docs
    if ("doc" in save && length === 1 && docs.length === 0) docs = [save.doc]

    var dataList = toArray(data)
    
    for (let i = 0; i < dataList.length; i++) {

        let writesCounter = 0, newDocsLength = 0, payloadIn = 0, newDataSize = 0
        var data = dataList[i], createNewDoc = false, existingData = {}, chunkName = `chunk${collectionProps.lastChunk}`

        // check if user is creating a new doc
        var createNewDoc = !data.__props__ || !data.__props__.doc
        
        // check doc by props.doc
        if (!createNewDoc) {
            var response = database({_window, action:"search()", data:{db: liveDB, devDB: save.devDB, dev: save.dev, collection, doc:data.__props__.doc}, checkExistsForSave: true})
            
            if (response.data) existingData = response.data
            else createNewDoc = true
        }
        
        // check doc by given doc
        if (createNewDoc && docs[i] && !verified) {
            var response = database({_window, action:"search()", data:{db: liveDB, devDB: save.devDB, dev: save.dev, collection, doc:docs[i]}, checkExistsForSave: true})
            
            if (response.data) {
                existingData = response.data
                createNewDoc = false
            }
        } else if (verified) {

            existingData = data
            createNewDoc = false
        }
        
        // recheck props
        dbProps = JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/__props__/db.json`))
        collectionProps = JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/${collection}/collection1/__props__/__props__.json`))

        // collection props
        writesCounter++
        if (createNewDoc) {

            newDocsLength++;
            collectionProps.counter++;
        }

        let existingProps = existingData.__props__ || {}
        let newProps = data.__props__ || {}
        let docName = docs[i] || existingProps.doc || (collection.split(".")[collection.split(".").length - 1] + collectionProps.counter)

        // data props
        data.__props__ = {
            // main props: imutable
            id: existingProps.id || generate({ unique: true }),
            doc: docName,
            counter: existingProps.counter || collectionProps.counter,
            creationDate: existingProps.creationDate || (new Date()).getTime(),
            collection,
            chunk: existingProps.chunk || chunkName,
            lastModified: (new Date()).getTime(),
            dev: save.dev || false,
            // other props: mutable
            actions: newProps.actions || existingProps.actions || {},
            comments: newProps.comments || existingProps.comments || [],
            collapsed: newProps.collapsed || existingProps.collapsed || [],
            arrange: newProps.arrange || existingProps.arrange || {},
            schema: newProps.schema || existingProps.schema || {},
            secured: newProps.secured || false,
        }

        // schema
        let schema = override(clone(collectionProps.schema) || {}, data.__props__.schema || {})
        applySchema({ liveDB, db, req, dev: save.dev, schema, data, datastore, collection, action, existingData, save })
        
        // console.log(createNewDoc, collection, data);
        // set data size
        data.__props__.size = JSON.stringify(data).length
        
        // create new db
        if (collection === "project" && db === bracketDB && !existingProps.doc) createDB({ data })

        // create new host
        else if (collection === "host" && db === bracketDB && data.port && !existingProps.doc) data.port.map(port => start(port))

        // clear cache
        else if (req.body.__props__.page === "console" && _window.global.manifest.session && _window.global.manifest.session.db === bracketDB) clearProjectCache({db})

        // reset doc name
        let doc = data.__props__.doc, oldDoc = existingProps.doc, publishing = existingProps.dev && !data.__props__.dev, developing = !existingProps.dev && data.__props__.dev
        
        // get chunk props
        var chunkName = data.__props__.chunk
        if (!chunks[chunkName]) chunks[chunkName] = { props: JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`)), indexings: {} }
        let chunkProps = chunks[chunkName].props
        
        // push/replace doc to sorted docs & update chunk docslength & size
        if (oldDoc && doc !== oldDoc) {
            for (let i = 0; i < chunkProps.docs.length; i++) {
                if (chunkProps.docs[i] === oldDoc) {
                    chunkProps.docs[i] = doc
                    break;
                }
            }
            chunkProps.size -= existingData.__props__.size
        } else if (oldDoc && !publishing && !developing) {
            chunkProps.size -= existingData.__props__.size
        } else if (!oldDoc || publishing || developing) {

            chunkProps.docs.unshift(doc)
            chunkProps.docsLength += 1
            
            // check chunk docs length
            if (chunkProps.docsLength === 1000) {

                collectionProps.lastChunk += 1
                chunkProps.reachedMax = true
                createChunk({ db, collection, chunkName: `chunk${collectionProps.lastChunk}`, collectionProps })
            }
        }

        chunkProps.size += data.__props__.size

        // loop over indexings
        for (let i = 0; i < collectionProps.indexes.length; i++) {
            var indexProps = collectionProps.indexes[i], sameFieldValue = !publishing && !developing, indexingOfDoc = {}

            // indexing expired
            if (indexProps.expiryDate < new Date().getTime()) {
                delete collectionProps.indexes[i]
                fs.rmSync(`${path}/collection1/__props__/${chunkName}/${indexProps.doc}.json`)
                continue;
            }
            
            // loop over find search fields
            for (let j = 0; j < indexProps.find.length; j++) {
                var searchFields = indexProps.find[j]

                // get new data field value 
                var newFieldValue = getFieldValue(searchFields.split("."), data).value
                indexingOfDoc[searchFields] = newFieldValue

                // check prev value
                if (oldDoc && sameFieldValue) {
                    
                    var prevFieldValue = getFieldValue(searchFields.split("."), existingData).value
                    sameFieldValue = isEqual(prevFieldValue, newFieldValue)

                } else sameFieldValue = false
            }

            // update indexing
            if (!sameFieldValue) {

                // get chunk indexing
                if (!chunks[chunkName].indexings[indexProps.doc]) chunks[chunkName].indexings[indexProps.doc] = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/${indexProps.doc}.json`))

                // get indexing
                chunks[chunkName].indexings[indexProps.doc][doc] = indexingOfDoc
            }
        }

        // save data
        fs.writeFileSync(`${path}/collection1/${doc}.json`, JSON.stringify(data, null, 4))

        // props: data size
        let dataSize = JSON.stringify({ [doc]: data }).length
        payloadIn += dataSize
        if (createNewDoc) newDataSize += dataSize

        // props
        postProps({ db: liveDB, collection, collectionProps, dbProps, writesCounter, newDocsLength, payloadIn, newDataSize })
    }

    // save chunk props & indexings
    Object.entries(chunks).map(([chunkName, chunk]) => {
        fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`, JSON.stringify(chunk.props, null, 4))
        Object.entries(chunk.indexings).map(([indexingDoc, indexing]) => {
            fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/${indexingDoc}.json`, JSON.stringify(indexing, null, 4))
        })
    })
    
    return { success: true, message: "Data saved successfully!", data: length === 1 ? data : dataList }
}

const deleteData = ({ _window = {}, req, res, erase, action = "erase()", verified }) => {

    var global = _window.global
    var collection = erase.collection,
        datastore = erase.datastore || "bracketDB" || _window.global.manifest.datastore,
        db = erase.db || global.manifest.session.db,
        docs = toArray(erase.docs || erase.doc),
        find = erase.find,
        data = {},
        success = true, 
        message = "Documents erased successfully!"

    var { path, dbProps, collectionProps, liveDB, success, message } = checkParams({ data: erase, action })
    if (!success) return { success, message }

    // erase collection
    if (!("docs" in erase) && !("doc" in erase) && !("find" in erase)) {

        if (fs.existsSync(path)) {

            fs.rmSync(path, { recursive: true, force: true })

            dbProps.deletes += 1
            dbProps.collectionsLength -= 1
            dbProps.docsLength -= collectionProps.docsLength
            dbProps.size -= collectionProps.size

            deleteProps({ db: liveDB, collection, collectionProps, dbProps })
        }

        var collections = getFolderNames(`${datastore}/${db}`)
        collections.map(coll => {
            if (coll.split(collection)[1] && !coll.split(collection)[0]) {

                collectionProps = JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/${coll}/collection1/__props__/__props__.json`))
                fs.rmSync(`${datastore}/${db}/${coll}`, { recursive: true, force: true })

                dbProps.deletes += 1
                dbProps.collectionsLength -= 1
                dbProps.docsLength -= collectionProps.docsLength
                dbProps.size -= collectionProps.size

                deleteProps({ db: liveDB, collection, collectionProps, dbProps })
            }
        })

        return ({ success: true, message: "Collection erased successfully!" })
    }

    // find => get docs
    if ("find" in erase || "findOne" in erase) {

        var searchOptions = { datastore, db, collection, find }
        if (erase.findOne) {
            searchOptions.find = erase.findOne
            searchOptions.limit = 1
        }
        find.preventDefault = true
        
        var { data } = database({ _window, req, action: "search()", data: searchOptions })
        docs = Object.keys(data)
        // docs.map(doc => data[doc] = "erased")
    }

    if (docs.length === 0) {

        message = "No data found!"
        collectionProps.deletes += 1
        dbProps.deletes += 1

    } else {

        var docsLength = 0, dataSize = 0, chunks = {}

        // remove docs
        docs.map(doc => {
            if (fs.existsSync(`${path}/collection1/${doc}.json`)) {

                // get data
                var docData = JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`)), chunkName = docData.__props__.chunk
                if (!chunks[chunkName]) chunks[chunkName] = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`))

                // remove from docs
                var index = chunks[chunkName].docs.indexOf(doc)
                if (index > -1) chunks[chunkName].docs.splice(index, 1)
                    
                // case: delete project
                if (collection === "project" && db === bracketDB) {
                    if (fs.existsSync(`bracketDB/${docData.db}`)) fs.rmSync(`bracketDB/${docData.db}`, { recursive: true, force: true })
                    if (fs.existsSync(`bracketDB/${docData.devDB}`)) fs.rmSync(`bracketDB/${docData.devDB}`, { recursive: true, force: true })
                }

                // props: length, size
                docsLength++;
                dataSize += docData.__props__.size
                data[doc] = docData
                
                // last doc => decrement counter
                if (collectionProps.counter === docData.__props__.counter) collectionProps.counter--

                // update chunk props
                chunks[chunkName].size -= docData.__props__.size
                chunks[chunkName].docsLength -= 1
                
                // remove doc
                fs.unlinkSync(`${path}/collection1/${doc}.json`)

            } else delete data[doc]
        })
        
        // reset docs according to erased 
        var docs = Object.keys(data)

        // update indexing & chunk props
        Object.entries(chunks).map(([chunkName, chunkProps]) => {

            // remove doc from indexing
            collectionProps.indexes.map(({ doc: indexName }) => {
                var indexing = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/${indexName}.json`))
                docs.map(doc => delete indexing[doc])
                fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/${indexName}.json`, JSON.stringify(indexing, null, 4))
            })

            // save chunk props
            fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`, JSON.stringify(chunkProps, null, 4))
        })
    }

    // props
    deleteProps({ db: liveDB, collection, collectionProps, dbProps, docsLength, dataSize })

    return ({ success, message, data })
}

const checkParams = ({ _window, req, data, action, datastore = "bracketDB" }) => {

    var collection = data.collection, db = data.db
    var path = `${datastore}/${db}`
    var liveDB = data.dev ? data.liveDB : db

    // props
    if (!fs.existsSync(`${datastore}/${liveDB}`)) return ({ success: false, message: "Props error!" })

    // publish
    if (data.publish) return ({ success: true, path })

    if (!fs.existsSync(path)) return ({ success: false, message: "Project does not exist!" })

    // collection
    if (collection) {

        path += `/${collection}`
        if (!fs.existsSync(path) && action !== "save()") {
            
            // erase collection=account but there is no collection=account however there is a collection=account.user
            if (action === "erase()" && !("docs" in data) && !("doc" in data) && !("find" in data)) {
                
                var dbProps = JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/__props__/db.json`))
                return { collection, path, dbProps, liveDB, success: true, dev: data.dev }
            }
            return ({ success: false, message: "Collection does not exist!" }) // save without collection creates collection
        }

    } else if (action !== "search()") return ({ success: false, message: "No collection!" }) // search without collection gets collections

    if (!fs.existsSync(`${datastore}/${liveDB}`)) return ({ success: false, message: "Props error!" })

    var dbProps = JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/__props__/db.json`))
    var collectionProps = collection && fs.existsSync(`${datastore}/${liveDB}/${collection}`) && JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/${collection}/collection1/__props__/__props__.json`))

    // create collection
    if (!collectionProps && action === "save()") collectionProps = createCollection({ _window, req, db, collection, liveDB, data, dev: liveDB !== db, datastore })
    // devdb and create collection
    else if (collectionProps && action === "save()" && liveDB !== db && (!fs.existsSync(path) || getDocNames(path).length === 0)) createCollection({ _window, req, db, collection, liveDB, collectionProps, datastore, dev: true })
    // erase
    if (!collectionProps && action === "erase()") return { success: false }
    
    return { collection, path, dbProps, collectionProps, liveDB, success: true, dev: data.dev }
}

const hideSecured = ({ global, __ }) => {

    if (!global) return
    const lookupServerAction = (collection, doc) => global.manifest.lookupServerActions && global.manifest.lookupServerActions.collection === collection && global.manifest.lookupServerActions.doc === doc

    Object.keys(global.__queries__).map(collection => {
        Object.keys(global.__queries__[collection]).map(doc => {
            let data = global.__queries__[collection][doc]
            if (data.__props__ && data.__props__.secured && !global.__authorized__[collection][doc]) {

                Object.keys(data).map(key => {
                    if (key === "__props__") {

                        let found = false
                        if (lookupServerAction(collection, doc)) {

                            found = true

                            let path = global.manifest.lookupServerActions.path || [], lastIndex = path.length - 1

                            path.reduce((o, k, i) => {
                                if (!(k in o) || !found) return found = false
                                else if (typeof o[k] !== "object" && i !== lastIndex) found = false
                                else return o[k]
                            }, data.__props__.actions)

                            // reset actions
                            data.__props__.actions = {}

                            path.reduce((o, k, i) => {

                                if (i === lastIndex && !found) o[k] = false
                                else if (i === lastIndex && found) o[k] = true
                                else return o[k] = {}

                            }, data.__props__.actions)

                        } else data.__props__.actions = {}

                        delete data.__props__.collapsed
                        delete data.__props__.comments

                    } else delete data[key]
                })
            }
        })
    })
}

const populator = ({ _window, req, data, db, populate }) => {

    let populatedData = {}
    let populates = toArray(populate)

    // get data by IDs
    let responses = populates.map((populate, i) => {

        if (typeof populate === "string") populates[i] = populate = { db, collection: populate, field: populate, find: "id", deselect: [] }
        if (!populate.collection) populate.collection = populate.field
        if (!populate.find) populate.find = "id"

        // get values from queried data
        var IDSet = new Set()
        Object.values(data).map(data => IDSet.add(data[populate.field]))

        // add find conditions
        if (populate.find === "doc") {
            populate.docs = Array.from(IDSet)
            delete populate.find
        } else populate.find = { [populate.find]: { in: Array.from(IDSet) } }

        var response = database({ _window, req, action: "search()", data: populate })
        populatedData = { ...populatedData, ...response.data }
        return response
    })

    // populate
    populates.map(populate => {

        // assign a value to key. ex: name instead of ID
        if (populate.assign) {
            Object.values(data).map(data => {
                if (populatedData[data[populate.find]]) data[populate.find] = populatedData[data[populate.find]][populate.assign]
            })
        }

        // select. return the doc with specific find. (considering data and populatedData are many docs)
        else if (populate.select) data = selector({ data, key: populate.find, select: populate.select, populatedData })

        // select. return the doc with specific find. (considering data and populatedData are many docs)
        else if (populate.deselect) data = deselector({ data, key: populate.find, deselect: populate.deselect, populatedData })
    })

    return data
}

const selector = ({ data, key, select, populatedData }) => {

    // select with populate
    if (key && populatedData) {

        Object.values(data).map(data => {
            var doc = data[key]
            if (populatedData[doc]) {
                data[key] = {}
                toArray(select).map(select => data[key][select] = populatedData[doc][select])
            }
        })

        // select
    } else {

        var clonedData = clone(data)
        data = {}
        Object.keys(clonedData).map(doc => {
            data[doc] = {}
            toArray(select).map(select => data[doc][select] = clonedData[doc][select])
        })
    }

    return data
}

const deselector = ({ data, key, deselect, populatedData }) => {

    // deselect with populate
    if (key && populatedData) {

        Object.values(data).map(data => {
            let doc = data[key]
            if (populatedData[doc]) {
                data[key] = populatedData[data[key]]
                toArray(deselect).map(deselect => delete data[key][deselect])
            }
        })

        // deselect
    } else {

        Object.keys(data).map(doc => {
            toArray(deselect).map(deselect => delete data[doc][deselect])
        })
    }

    return data
}

const assigner = ({ data, assign }) => {
    Object.keys(data).map(doc => data[doc] = data[doc][assign])
}

const mongoOptions = ({ find }) => {

    let options = {}

    if (Array.isArray(find)) {

        // init
        options = { $or: [] }

        find.map(find => options["$or"].push(mongoOptions({ find })))

    } else {

        Object.entries(find).map(([key, valueAndOperator]) => {

            if (typeof valueAndOperator !== "object") valueAndOperator = { equal: valueAndOperator }

            let operator = toOperator(Object.keys(valueAndOperator)[0])
            let value = Object.values(valueAndOperator)[0]

            options[key] = options[key] || {}

            if (operator === "==") options[key]["$eq"] = value
            else if (operator === "!=") options[key]["$ne"] = value
            else if (operator === ">") options[key]["$gt"] = value
            else if (operator === "<") options[key]["$lt"] = value
            else if (operator === ">=") options[key]["$gte"] = value
            else if (operator === "<=") options[key]["$lte"] = value
            else if (operator === "in" && Array.isArray(value)) options[key]["$in"] = value
            else if (operator === "notin" && Array.isArray(value)) options[key]["$nin"] = value
            else if (operator === "regex") options[key]["$regex"] = value
            else if (operator === "inc") options[key] = value
            else if (operator === "incall") options[key]["$all"] = value
            else if (operator === "length") options[key]["$size"] = value
            else if (operator === "find") options[key] = { $elemMatch: mongoOptions({ find: value }) }
        })
    }

    return options
}

const getFolderNames = path =>
    fs.readdirSync(path, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name)

const getDocNames = path =>
    fs.readdirSync(path, { withFileTypes: true })
        .filter(dir => !dir.isDirectory())
        .map(dir => dir.name)

const flattenObject = (obj, parentKey = '') => {
    let flattened = {};

    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            let nestedObj = flattenObject(obj[key], parentKey + key + ': ');
            flattened = { ...flattened, ...nestedObj };
        } else {
            flattened[parentKey + key] = Array.isArray(obj[key]) ? obj[key].join(', ') : obj[key];
        }
    }

    return flattened;
}

const objectToString = (obj) => {
    let flattenedObj = flattenObject(obj);
    let str = '';

    let usedKeys = {}; // Keep track of used parent keys

    for (let key in flattenedObj) {
        let parts = key.split(': '); // Split the key into parts by ': '
        let parentKey = parts.slice(0, -1).join(': '); // Get the parent key
        let lastKey = parts[parts.length - 1]; // Get the last part of the key

        // Check if the parent key has been used before
        if (!usedKeys[parentKey]) {
            // If not used, add the parent key and the last key with value
            str += parentKey + ': ' + lastKey + ': ' + flattenedObj[key] + ', ';
            usedKeys[parentKey] = true; // Mark the parent key as used
        } else {
            // If used, just add the last key with value
            str += lastKey + ': ' + flattenedObj[key] + ', ';
        }
    }

    // Remove the trailing comma and space
    str = str.slice(0, -2);

    return str;
}

const readProps = ({ collectionProps, dbProps, data, db, collection, datastore = "bracketDB" }) => {

    if (!collectionProps || !dbProps) return

    var reads = data ? Object.keys(data).length : 1
    var payloadOut = data ? JSON.stringify(data).length : 0
    
    // remove expired indexes
    for (let i = collectionProps.indexes.length - 1; i >= 0; i--) {
        if (collectionProps.indexes[i].expiryDate < new Date().getTime()) collectionProps.indexes.splice(i, 1)
    }

    // save collection props
    collectionProps.reads += reads
    collectionProps.payloadOut += payloadOut
    fs.writeFileSync(`${datastore}/${db}/${collection}/collection1/__props__/__props__.json`, JSON.stringify(collectionProps, null, 4))

    dbProps.reads += reads
    dbProps.payloadOut += payloadOut
    fs.writeFileSync(`${datastore}/${db}/__props__/db.json`, JSON.stringify(dbProps, null, 4))
}

const postProps = ({ db, collection, collectionProps, dbProps, writesCounter, newDocsLength, payloadIn, newDataSize, datastore = "bracketDB" }) => {

    if (!collectionProps || !dbProps) return
    
    // remove expired indexes
    for (let i = collectionProps.indexes.length - 1; i >= 0; i--) {
        if (collectionProps.indexes[i].expiryDate < new Date().getTime()) collectionProps.indexes.splice(i, 1)
    }

    collectionProps.writes += writesCounter
    collectionProps.docsLength += newDocsLength
    collectionProps.payloadIn += payloadIn
    collectionProps.size += newDataSize
    fs.writeFileSync(`${datastore}/${db}/${collection}/collection1/__props__/__props__.json`, JSON.stringify(collectionProps, null, 4))

    dbProps.writes += writesCounter
    dbProps.docsLength += newDocsLength
    dbProps.payloadIn += payloadIn
    dbProps.size += newDataSize
    fs.writeFileSync(`${datastore}/${db}/__props__/db.json`, JSON.stringify(dbProps, null, 4))
}

const deleteProps = ({ db, collection, collectionProps, dbProps, docsLength = 0, dataSize = 0, datastore = "bracketDB" }) => {

    if (!collectionProps || !dbProps) return
    
    // remove expired indexes
    for (let i = collectionProps.indexes.length - 1; i >= 0; i--) {
        if (collectionProps.indexes[i].expiryDate < new Date().getTime()) collectionProps.indexes.splice(i, 1)
    }

    // props
    collectionProps.docsLength -= docsLength
    collectionProps.size -= dataSize
    dbProps.docsLength -= docsLength
    dbProps.size -= dataSize

    if (!collectionProps.docsLength) collectionProps.counter = 0

    // props
    if (fs.existsSync(`${datastore}/${db}/${collection}`)) fs.writeFileSync(`${datastore}/${db}/${collection}/collection1/__props__/__props__.json`, JSON.stringify(collectionProps, null, 4))
    fs.writeFileSync(`${datastore}/${db}/__props__/db.json`, JSON.stringify(dbProps, null, 4))
}

const queries = ({ global, data, search, collection }) => {

    if (!global || !global.__queries__ || (search.preventDefault || {}).queries) return
    
    global.__queries__[collection] = global.__queries__[collection] || {}
    global.__authorized__[collection] = global.__authorized__[collection] || {}
    if (!data) global.__queries__[collection][search.doc] = false
    else if (!Array.isArray(data)) {
        Object.entries(data).map(([doc, data]) => {
            if (Array.isArray(data) || typeof data !== "object") return
            global.__queries__[collection][doc] = data
            if (search.unsecure) global.__authorized__[collection][doc] = true
        })
    }
}

const authorizeDB = ({ _window, global, action, data }) => {

    let authorizations = []

    // devDB => add authorizations
    if (data.devDB && data.db && data.dev !== false && !data.liveDB) {
        authorizations.push({ ...data, db: data.devDB, devDB: data.devDB, dev: true, liveDB: data.db })
        if (action === "save" || action === "upload") return authorizations
    }

    if (data.db) {
        authorizations = [...authorizations, data]
        return authorizations
    }

    // no session yet
    if (!global.manifest.session) return authorizations

    // devDB => add authorizations
    if (global.manifest.session.dev) {
        authorizations.unshift({ ...data, db: global.manifest.session.devDB, devDB: global.manifest.session.devDB, dev: true, liveDB: global.manifest.session.db })
        if (action === "save" || action === "upload") return authorizations
    }
    authorizations.push({ ...data, db: global.manifest.session.db })

    // special case
    if (data.uncheckPlugins) return authorizations

    // get accessabilities from session
    let accessabilities = global.manifest.session.accessabilities || []

    // no plugin found
    if (accessabilities.length === 0) return authorizations

    // check authority
    let authPlugins = accessabilities.filter(plugin => pluginAuthConditions(plugin, action))

    // not authorized
    if (authPlugins.length === 0) return authorizations

    let queryOptions = []
    authPlugins.map(plugin => {

        if (plugin.db) return authPlugins.push({ ...data, db: plugin.db, plugin })

        // get db through projectID
        let { data: project = {} } = getData({ _window, search: { db: bracketDB, collection: "project", findOne: { "__props__.id": plugin.projectID }, preventDefault: { queries: true } } })
        project = Object.values(project)[0]
        if (!project) return queryOptions.push(false)
        queryOptions.push({ ...data, db: project.db, plugin })
    })

    // query options
    return [...authorizations, ...queryOptions.filter(options => options)]
}

const pluginAuthConditions = ({ collection, collections, doc, docs, actions = [] }, action) => (

    actions.includes(action) &&
    // collection
    (collections ? (typeof collections === "boolean" ? true : (Array.isArray(collections) && data.collection) ? collections.includes(data.collection) : false) : (collection && data.collection) ?
        // doc
        (collection === data.collection && (docs ? (typeof docs === "boolean" ? true : (Array.isArray(docs) && data.doc) ? docs.includes(data.doc) : false) : (doc && data.doc) ? doc === data.doc : false)) : false)
)

const start = (port, serverID) => {

    var child = spawn("node", ["index.js", port, serverID])
    
    // running server
    // database({ action: "save()", data: { db: bracketDB, collection: "runningServer", find: { port, serverID }, data: { port, serverID, creationDate: new Date().getTime(), closes: [] } } })

    child.stdout.on("data", function (data) {
        //start(port, true)
        console.log(child.spawnargs[2], data.toString())
    })
    child.stderr.on("data", function (data) {
        //start(port, true)
        console.log(child.spawnargs[2], data.toString())
    })
    child.on("close", function (data) {
        // start(port, true);

        // update running server
        //let { data: runningServer } = database({ action: "search()", data: { db: bracketDB, collection: "runningServer", findOne: { port, serverID } } })
        //runningServer.closes.push(new Date().getTime())
        //database({ action: "save()", data: { db: bracketDB, collection: "runningServer", data: runningServer } })

        // start server again
        start(child.spawnargs[2], serverID)
    })
}

const saveLogs = () => {

    // save logs to file
    var logFile = fs.createWriteStream('log.txt', { flags: 'a' }); // w to clear on new process
    var logStdout = process.stdout;
    var logSterr = process.stderr;

    console.log = function () {
        logFile.write(util.format.apply(null, arguments) + '\n');
        logStdout.write(util.format.apply(null, arguments) + '\n');
        logSterr.write(util.format.apply(null, arguments) + '\n');
    }

    console.error = console.log
}

const publishCollection = ({ _window, req, collection, liveDB, devDB }) => {
        
    var collectionProps = JSON.parse(fs.readFileSync(`bracketDB/${liveDB}/${collection}/collection1/__props__/__props__.json`))
    for (let i = collectionProps.lastChunk; i > 0; i--) {
        
        var chunkProps = JSON.parse(fs.readFileSync(`bracketDB/${devDB}/${collection}/collection1/__props__/chunk${i}/__props__.json`))

        // save docs in liveDB and remove from devDB
        for (let j = chunkProps.docs.length - 1; j >= 0; j--) {
            var data = JSON.parse(fs.readFileSync(`bracketDB/${devDB}/${collection}/collection1/${chunkProps.docs[j]}.json`))
            publishDoc({ _window, req, collection, doc: chunkProps.docs[j], data, liveDB, devDB })
        }
    }
}

const publishDoc = ({ _window, req, collection, doc, data, liveDB, devDB }) => {
    postData({ _window, req, save: {db: liveDB, devDB, dev: false, collection, data, doc } })
    deleteData({ _window, req, erase: {db: devDB, liveDB, dev: true, collection, doc } })
}

const publish = ({ _window, req, data }) => {

    var devDB = data.devDB, liveDB = data.liveDB
    if (!fs.existsSync(`bracketDB/${devDB}`) || !fs.existsSync(`bracketDB/${liveDB}`)) return ({ success: false, message: "Wrong DB!" })

    if (data.collection) {

        if (!data.doc) publishCollection({ _window, req, collection, liveDB, devDB })
        else publishDoc({ _window, req, data: data.data, collection: data.collection, doc: data.doc, liveDB, devDB })

        return ({ success: true, message: "Data published successfully!" })
    }

    var collections = fs.readdirSync(`bracketDB/${devDB}`)

    for (let index = 0; index < collections.length; index++) {

        var collection = collections[index]
        if (collection === "__props__") return

        publishCollection({ _window, req, collection })
    }

    // remove removed devData from liveData
    // ... (later)

    return ({ success: true, message: "Data published successfully!" })
}

const findData = ({ data, operator, value }) => {

    var push = false

    // list => loop
    if (Array.isArray(data) && operator !== "inc") return push = data.find(data => findData({ data, operator, value })) || false

    if (operator === "==") {
        if (data === value) push = true
    } else if (operator === "!=") {
        if (data !== value) push = true
    } else if (operator === ">=") {
        if (data >= value) push = true
    } else if (operator === "<=") {
        if (data <= value) push = true
    } else if (operator === "<") {
        if (data < value) push = true
    } else if (operator === ">") {
        if (data > value) push = true
    } else if (operator === "inc") {
        if (typeof data === "string" && data.includes(value)) push = true
        else if (toArray(data).includes(value)) push = true
    } else if (operator === "in") {
        if (toArray(value).includes(data)) push = true
    } else if (operator === "regex") {
        if (value.test(data)) push = true
    } else if (operator === "exists") {
        if (data !== undefined) push = true
    } else if (operator === "doesnotexist") {
        if (data === undefined) push = true
    }

    return push
}

const toFirebaseOperator = (string) => {
    if (!string || string === 'equal' || string === 'equals' || string === 'equalsTo' || string === 'equalTo' || string === 'is') return '=='
    if (string === 'notEqual' || string === 'notequal' || string === 'isnot') return '!='
    if (string === 'greaterOrEqual' || string === 'greaterorequal') return '>='
    if (string === 'lessOrEqual' || string === 'lessorequal') return '<='
    if (string === 'less' || string === 'lessthan' || string === 'lessThan') return '<'
    if (string === 'greater' || string === 'greaterthan' || string === 'greaterThan') return '>'
    if (string === 'contains') return 'array-contains'
    if (string === 'containsany') return 'array-contains-any'
    if (string === 'doesnotContain' || string === 'doesnotcontain') return 'array-contains-any'
    else return string
}

const toOperator = (string) => {
    if (!string || string === 'equal' || string === 'eq') return '=='
    if (string === 'notequal' || string === 'neq') return '!='
    if (string === 'greaterorequal' || string === 'gte') return '>='
    if (string === 'lessorequal' || string === 'lte') return '<='
    if (string === 'less' || string === 'lt') return '<'
    if (string === 'greater' || string === 'gt') return '>'
    if (string === 'contains') return 'inc'
    if (string === 'containsall' || string === "incall") return 'inc'
    if (string === 'doesnotcontain' || string === "doesnotinclude") return 'notinc'
    else return string
}

const syncData = ({ global, responses, action, response, data }) => {

    if (!global.manifest.session || action !== "search()") response = responses[0]
    else {

        // get main response
        response = responses.find(res => res.dev || (global.manifest.session.dev ? res.db === global.manifest.session.devDB : res.db === global.manifest.session.db))

        // not db related response (reading from another db)
        if (!response) response = responses[0]

        // no data in main response
        if (!response.data && responses.find(({ data, success }) => data && success)) response = { ...response, data: {}, success: true }

        responses.map(res => {
            if (res.id !== response.id && res.data) Object.entries(res.data).map(([doc, data]) => { if (!response.data[doc]) response.data[doc] = data })
        })
    }
    
    // __queries__
    if (action === "search()") queries({ global, data: response.data, search: response.search, collection: response.search.collection })

    response.docs = Object.keys(response.data || {})

    let resolve = { success: response.success, message: response.message, data: response.data }

    // single
    if (responses.find(({ single }) => single)) {
        resolve.doc = Object.keys(response.data || {})[0]
        resolve.data = Object.values(response.data || {})[0]
    } else if (response.search && response.search.doc) resolve.doc = response.doc
    else resolve.docs = response.docs

    return resolve
}

const checkIndexing = ({ global, path, search, finds, chunkName, collectionProps }) => {

    var chunks = [], message, success = true
    // get chunk props
    let chunkProps = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`))
    // get docs arrangement 
    let docs = chunkProps.docs

    for (let index = 0; index < finds.length; index++) {

        if (!success) break;
        let find = finds[index];

        let searchFields = Object.keys(find), indexing = {}

        // undefined field name
        let wrongFields = searchFields.find(field => field.includes("undefined"))
        if (wrongFields) {
            success = false
            message = "Wrong find keynames! Includes undefined"
            break;
        }

        // check if indexed else create index
        var indexProps = collectionProps.indexes.find(findProps => searchFields.length === findProps.find.length && !searchFields.find(field => !findProps.find.includes(field)))
        
        // not indexed => create an index
        if (!indexProps) {
            
            var {success, message, indexProps} = createIndex({ collectionProps, searchFields, path, search })
            
            if (search.dev) createIndex({ collectionProps, searchFields, path: `bracketDB/${search.liveDB}/${search.collection}`, indexed: true })
            else if (!global.manifest.dev && global.manifest.session && global.manifest.session.devDB && search.liveDB) 
                createIndex({ collectionProps, searchFields, path: `bracketDB/${global.manifest.session.devDB}/${search.collection}`, indexed: true })
        }
    
        // get index
        indexing = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/${indexProps.doc}.json`))

        // read index
        fs.readFileSync(`${path}/collection1/__props__/${chunkName}/${indexProps.doc}.json`)
        
        chunks[index] = { indexing, find: searchFields }
    }
    
    return { success, message, chunks, docs }
}

const getFieldValue = (fields, object) => {

    let breakRequest = false
    let lastIndex = fields.length - 1
    let success = true, message = "Index created successfully!"

    let answer = fields.reduce((o, k, i) => {

        if (breakRequest || !o) return o
        
        if (Array.isArray(o) && !isNumber(k)) {
            breakRequest = true
            return o.map(o => getFieldValue(fields.slice(i), o).value).filter(value => value !== undefined)
        }
        else if (i === lastIndex && o[k] !== undefined) return o[k]
        else if (k.slice(-2) === "()") return actions[k]({o})
        else if (i !== lastIndex) {
            if (typeof o !== "object") {
                breakRequest = true
                success = false
                message = "Accessing a non object through field " + k + "!"
                return
            }
            return o[k]
        }
    }, object)

    return { success, value: answer, message }
}

const createDB = ({ data }) => {

    data.db = generate({ universal: true })
    data.devDB = generate({ universal: true })
    data.storage = generate({ universal: true })

    var newProjectProps = {
        creationDate: 0,
        collectionsLength: 0,
        docsLength: 0,
        reads: 0,
        writes: 0,
        deletes: 0,
        size: 0,
        payloadIn: 0,
        payloadOut: 0
    }

    // devDB
    fs.mkdirSync(`bracketDB/${data.devDB}`)

    // db
    fs.mkdirSync(`bracketDB/${data.db}`)
    fs.mkdirSync(`bracketDB/${data.db}/__props__`)
    fs.writeFileSync(`bracketDB/${data.db}/__props__/db.json`, JSON.stringify(newProjectProps, null, 4))

    // storage
    fs.mkdirSync(`storage/${data.storage}`)
    fs.mkdirSync(`storage/${data.storage}/__props__`)
    fs.writeFileSync(`storage/${data.storage}/__props__/db.json`, JSON.stringify(newProjectProps, null, 4))

    // cache
    fs.mkdirSync(`cache/${data.db}`)
    fs.mkdirSync(`cache/${data.devDB}`)
}

const createCollection = ({ _window, req, db, chunkName = "chunk1", collection, liveDB, collectionProps = {}, dev, datastore = "bracketDB" }) => {

    if (fs.existsSync(`${datastore}/${liveDB}/${collection}`)) return

    fs.mkdirSync(`${datastore}/${liveDB}/${collection}`)
    fs.mkdirSync(`${datastore}/${liveDB}/${collection}/collection1`)
    fs.mkdirSync(`${datastore}/${liveDB}/${collection}/collection1/__props__`)
    fs.mkdirSync(`${datastore}/${liveDB}/${collection}/collection1/__props__/chunk1`)
    fs.writeFileSync(`${datastore}/${liveDB}/${collection}/collection1/__props__/chunk1/__props__.json`, JSON.stringify({ docs: [], chunk: "chunk1", docsLength: 0, size: 0 }, null, 4))

    if (datastore === "storage") fs.mkdirSync(`${datastore}/${liveDB}/${collection}/bucket1`)

    // props
    var collectionProps = {
        creationDate: new Date().getTime(),
        collection,
        maxSize: 1000,
        lastChunk: 1,
        collection: 1,
        docsLength: 0,
        counter: 0,
        reads: 0,
        writes: 1,
        deletes: 0,
        size: 0,
        payloadIn: 0,
        payloadOut: 0,
        indexes: [],
        lastIndex: 0,
        schema: {__props__: {actions: {}}, hideProps: false, schema: {}}
    }

    // collection props
    fs.writeFileSync(`${datastore}/${liveDB}/${collection}/collection1/__props__/__props__.json`, JSON.stringify(collectionProps, null, 4))

    // db props
    var dbProps = JSON.parse(fs.readFileSync(`${datastore}/${liveDB}/__props__/db.json`))

    dbProps.writes += 1
    db.collectionsLength += 1

    fs.writeFileSync(`${datastore}/${liveDB}/__props__/db.json`, JSON.stringify(dbProps, null, 4))

    if (datastore === "storage") return collectionProps

    // collection props has chunk and devDB does not have => create collection and chunk

    if (_window.global.manifest.session && (_window.global.manifest.session.devDB || dev)) {

        var devDB = _window.global.manifest.session.devDB || db
        // create collection dir
        if (fs.existsSync(`${datastore}/${devDB}/${collection}`)) return

        fs.mkdirSync(`${datastore}/${devDB}/${collection}`)
        fs.mkdirSync(`${datastore}/${devDB}/${collection}/collection1`)
        fs.mkdirSync(`${datastore}/${devDB}/${collection}/collection1/__props__`)

        createChunk({ db: devDB, collection, chunkName, collectionProps })
    }

    // create view collection
    if (collection === "view") {

        var data = [{
            view: "Action?id=server",
            children: [
                {
                    view: "Action?[manifest:().action]()"
                }
            ],
            __props__: {
                secured: true
            }
        }, {
            view: "View?id=document",
            children: [
                {
                    view: "View?id=head"
                },
                {
                    view: "View?id=body",
                    children: [
                        {
                            view: "root"
                        }
                    ]
                }
            ]
        }, {
            view: "View?id=root",
            children: [
                {
                    view: "droplist"
                },
                {
                    view: "note"
                },
                {
                    view: "tooltip"
                },
                {
                    view: "loader"
                },
                {
                    view: "@view.page.[manifest:().page]"
                }
            ]
        }, {
            view: "View?id=main;class=flexbox;style:[height=100vh;width=100vw;gap=3rem];data=@view.schema.mainPageSchema",
            children: [
                {
                    view: "Text?text=_.welcomeStatement;style:[fontSize=4rem]"
                }
            ]
        }, {
            welcomeStatement: "Welcome to Bracket Technologies!"
        }]

        
        database({ _window, req, action: "save()", data: { db: liveDB, devDB: dev ? db : undefined, collection: "view.application", data: data[0], doc: "server" } })
        database({ _window, req, action: "save()", data: { db: liveDB, devDB: dev ? db : undefined, collection: "view.application", data: data[1], doc: "document" } })
        database({ _window, req, action: "save()", data: { db: liveDB, devDB: dev ? db : undefined, collection: "view.application", data: data[2], doc: "root" } })
        database({ _window, req, action: "save()", data: { db: liveDB, devDB: dev ? db : undefined, collection: "view.page", data: data[3], doc: "main" } })
        database({ _window, req, action: "save()", data: { db: liveDB, devDB: dev ? db : undefined, collection: "view.schema", data: data[4], doc: "mainPageSchema" } })
    }

    return collectionProps
}

const createChunk = ({ db, collection, chunkName, collectionProps, datastore = "bracketDB" }) => {

    var chunkProps = { docs: [], chunk: chunkName, docsLength: 0, size: 0 }
    fs.mkdirSync(`${datastore}/${db}/${collection}/collection1/__props__/${chunkName}`)

    // create indexes in chunk1
    if (fs.existsSync(`${datastore}/${db}/${collection}`))
        collectionProps.indexes.map(({ doc }) => fs.writeFileSync(`${datastore}/${db}/${collection}/collection1/__props__/${chunkName}/${doc}.json`, JSON.stringify({}, null, 4)))

    fs.writeFileSync(`${datastore}/${db}/${collection}/collection1/__props__/${chunkName}/__props__.json`, JSON.stringify(chunkProps, null, 4))
    
    for (let i = 0; i < collectionProps.indexes.length; i++) {
        fs.writeFileSync(`${datastore}/${db}/${collection}/collection1/__props__/${chunkName}/${collectionProps.indexes[i].doc}.json`, JSON.stringify({}, null, 4))
    }
}

const createIndex = ({ collectionProps, searchFields, path, indexed = false }) => {

    var success = true, message = "", indexProps = {}

    if (!indexed) {
        collectionProps.lastIndex += 1
        indexProps = { find: searchFields, doc: "index" + collectionProps.lastIndex }
        collectionProps.indexes.push(indexProps)
    }

    for (let index = 1; index <= collectionProps.lastChunk; index++) {

        let chunkName = "chunk" + index
        let chunkProps = JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`))
        let { docs } = chunkProps
        let indexing = {}
        
        // loop over all docs
        for (let i = 0; i < docs.length; i++) {

            let doc = docs[i];
            if (!success) break;

            // loop over find fields
            for (let j = 0; j < searchFields.length; j++) {
                let field = searchFields[j];

                // get value
                var { success, value, message } = getFieldValue(field.split("."), JSON.parse(fs.readFileSync(`${path}/collection1/${doc}.json`)))
                if (!success) break;

                if (j === 0) indexing[doc] = {}

                // push values to indexing
                if (value !== undefined) indexing[doc][field] = value
            }
        }
    
        // save index dev
        fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/index${collectionProps.lastIndex}.json`, JSON.stringify(indexing, null, 4))
    }

    return { success, message, indexProps }
}

const mail = async ({ _window, req, res, action, data, stack, props, __ }) => {

    if (action === "sendEmail()") {
        let transporter = require("nodemailer").createTransport({
            service: data.service || "Gmail",
            host: data.host || "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: data.user || 'komikbenim@gmail.com',
                pass: data.pass || 'zcybkidtudibysxh'
            }
        });
        
        // Email options
        let mailOptions = {
            from: 'komikbenim@gmail.com',
            to: data.to,
            subject: data.subject || "",
            text: data.text || "",
            html: data.html || ""
        };
        
        // Send the email
        var info = await transporter.sendMail(mailOptions)/*, (error, info) => {
            if (error) {
                console.log('Error:', error);
                resolve(error)
            } else {
                console.log('Email sent:', info.response);
                resolve(info)
            }
        })*/
        console.log('Email sent:', info.response);
       return info
    }
}

const saveToLogs = ({ _window, logs }) => {
    logs.shift()
    database({ _window, action: "save()", data: { collection: "logs", data: { logs } } })
}

const respond = async ({ res, stack, props, global, response, __ }) => {

    if (!res || res.headersSent) return

    if (stack && typeof response === "object") {

        var executionDuration = (new Date()).getTime() - stack.executionStartTime
        stack.terminated = true

        // logs
        console.log((new Date()).getHours() + ":" + (new Date()).getMinutes() + " " + "SEND " + stack.action, executionDuration, global.manifest.session.subdomain || "", global.manifest.session.username || "")
        stack.logs.push(stack.logs.length + " SEND " + stack.action + " (" + executionDuration + ")")

        // props
        response.__props__ = {
            cookies: global.manifest.cookies,
            action: stack.action,
            session: global.manifest.session.__props__.id,
            executionDuration,
            executedActions: stack.executedActions
        }

        // hide secured
        hideSecured({ global, __ })
    }

    if (typeof response === "object") {

        // respond
        res.setHeader('Content-Type', 'application/json')
        res.setHeader("Content-Encoding", "gzip")
        // encode
        let data = await gzip(JSON.stringify(response))
        res.write(data)

    } else {
        res.setHeader("Content-Encoding", "gzip")
        let data = await gzip(response)
        res.write(data)
    }

    res.end()
}

const clearProjectCache = ({ db }) => {
    
    if (!fs.existsSync(`cache/${db}`)) return
    
    getDocNames(`cache/${db}`).map(id => {
        fs.unlinkSync(`cache/${db}/${id}`)
    })
}

const vcard = ({ res, data }) => {

    if (data.firstName && data.lastName && data.workPhone) {

        // create a new vCard
        const vCard = vcards();

        vCard.firstName = data.firstName || "";
        vCard.middleName = data.middleName || "";
        vCard.lastName = data.lastName || "";
        vCard.organization = data.organization || "";
        if (data.photo) vCard.photo.attachFromUrl(data.photo)
        if (data.logo) vCard.logo.attachFromUrl(data.logo)

        // dd/mm/yyyy
        if (data.birthday && data.birthday.split("/")[0] !== undefined && data.birthday.split("/")[1] !== undefined && data.birthday.split("/")[2] !== undefined)
            vCard.birthday = new Date(parseInt(data.birthday.split("/")[2]), parseInt(data.birthday.split("/")[1] - 1), parseInt(data.birthday.split("/")[0]));


        delete data.firstName
        delete data.lastName
        delete data.middleName
        delete data.photo
        delete data.logo
        delete data.birthday

        Object.entries(data).map(([key, value]) => {
            vCard[key] = value
        })

        res.setHeader('Content-Type', `text/vcard; name="${(data.firstName || "") + " " + (data.lastName || "")}.vcf"`);
        res.setHeader('Content-Disposition', `inline; filename="${(data.firstName || "") + " " + (data.lastName || "")}.vcf"`);

        res.end(vCard.getFormattedString())
    }
}

const qrCode = async ({ _window, id, req, res, data: qrData, __, e, stack, props, lookupActions, address }) => {

    let text = qrData.text || qrData.url
    if (qrData.wifi) text = wifiQrText({ data: qrData })

    let qrcode = await require('qrcode').toDataURL(text)
    let data = { message: "QR generated successfully!", data: qrcode, success: true }

    actions["stackManager()"]({ _window, lookupActions, id, e, asyncer: true, address, stack, props, req, res, __, _: data })
}

const wifiQrText = ({ data }) => `WIFI:S:${data.name || data.ssid || ""};T:${data.type || "WPA"};P:${data.password || ""};;${data.url || ""}`

const passport = async ({ _window, lookupActions, stack, props, address, id, e, __, req, res, data }) => {

    if (!_window) return console.log("Passport is a serverside action!")

    if (data.facebook) data.provider = "facebook"
    else if (data.gmail) data.provider = "gmail"

    if (data.auth) data.action = "auth"
    else if (data.login) data.action = "login"

    if (data.provider === "facebook" && data.action === "auth") {

        const params = [
            `client_id=429088239479513`,
            `scope=email`,
            `display=popup`
        ];

        var href = `https://www.facebook.com/v4.0/dialog/oauth?${params.join("&")}`
        
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.writeHead(302, { Location: href });
        res.end();

    } else if (data.provider === "facebook" && data.action === "login") {
        
        var global = _window.global
        var { data: project } = await getData({ _window, req, search: { db: bracketDB, collection: "project", doc: global.manifest.session.projectName } })

        if (data.provider === "facebook" && !project.facebook) return
        else if (data.provider === "gmail" && !project.gmail) return

        const params = [
            `client_id=${project.facebook.appID}`,
            `client_secret=${project.facebook.appSecret}`,
            `code=${data.code || ""}`,
            `redirect_uri=${data.redirectUri || ""}`
        ];

        try {

            // Exchange authorization code for access token
            const facebookLoginURL = `https://graph.facebook.com/v13.0/oauth/access_token?${params.join("&")}`;
            var { data: { access_token } } = await getData({ _window, req, res, search: { url: facebookLoginURL } })

            // Use access_token to fetch user profile
            var { data: profile } = await getData({ _window, req, res, search: { url: `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}` } })

            // Code to handle user authentication and retrieval using the profile data
            console.log(profile);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    // await params
    actions["stackManager()"]({ _window, lookupActions, stack, props, id, e, address, req, res, _: data, __ })
}

const saveSchema = ({ save, liveDB, collection, collectionProps, dbProps }) => {

    collectionProps.schema = save.data

    // props
    postProps({ db: liveDB, collection, collectionProps, dbProps, writesCounter: 1, newDocsLength: 0, payloadIn: save.data.length, newDataSize: 0 })

    return { success: true, message: "Schema saved successfully!", data: save.schema }
}

const getSchema = ({ search, liveDB, collection, collectionProps, dbProps }) => {

    // props
    readProps({ collectionProps, dbProps, db: liveDB, collection })
    let data = collectionProps.schema || {__props__: {actions: {}}, schema: {}, hideProps: false}

    return { id: generate(), data, message: "Data queried successfully!", success: true, dev: search.dev, search }
}

const applySchema = ({ _window, liveDB, req, dev, schema = {schema: {}}, data = {}, datastore = "bracketDB", collection, action, db, search = {}, unpopulate = [], existingData, save }) => {
    
    Object.entries(schema.schema || {}).map(([key, props]) => {

        // props is value
        if (typeof props !== "object" && !Array.isArray(props)) props = { default: props, strict: true }

        if (action === "search()" && !search.unsecure) applySearchSchemaForValue({ _window, liveDB, db, key, req, dev, props, data, datastore, collection, action, existingData, search, unpopulate: [...unpopulate, ...(schema.unpopulate || [])] })
        else if (action === "save()") applySaveSchemaForValue({ _window, liveDB, db, key, req, dev, props, data, datastore, collection, action, existingData, save })
    })
    
    if (action === "search()" && !search.unsecure && !schema.__map__) {
        if (schema.hideComments !== false) delete data.__props__.comments
        if (schema.hideArrange !== false) delete data.__props__.arrange
        if (schema.hideCollapsed !== false) delete data.__props__.collapsed
        if (schema.hideSchema !== false) delete data.__props__.schema
        if (schema.hideProps) delete data.__props__
    }

    return data
}

const applySaveSchemaForValue = ({ _window, liveDB, db, key, req, dev, props, data, datastore, collection, action, existingData, save }) => {

    let value = data[key]

    // value
    if (props.required !== false) data[key] = value = value !== undefined ? value : props.default

    // default
    if (props.strict && props.default !== undefined) data[key] = props.default

    // type
    if (props.type === "boolean") {
        
        if (typeof value !== "boolean" && props.required !== false) data[key] = false

    } else if (props.type === "text") {

        if (typeof value !== "string" && props.required !== false) data[key] = props.default !== undefined ? props.default : (props.options ? props.options[0] : "")
        else if (value && props.options && !props.options.includes(value)) data[key] = props.default !== undefined ? props.default : (props.options[0])

    } else if (props.type === "email") {
        
        if (typeof value !== "string" && props.required !== false) data[key] = ""

    } else if (props.type === "id") {
        if (typeof value !== "string" && props.required !== false) data[key] = generate({universal:true})
    } else if (props.type === "number") {

        if (typeof value !== "number" && props.required !== false) data[key] = 0
        if (props.min && value < props.min) data[key] = value.min 
        if (props.max && value > props.max) data[key] = value.max

    } else if (props.type === "map") {

        if (typeof value !== "object" && props.required !== false) data[key] = {}
        if (props.value) data[key] = applySchema({ _window, liveDB, db, schema: { schema: props.value }, data: data[key], datastore, collection, action, existingData: existingData[key] })
        else if (props.schema) {}

    } else if (props.type === "list") {

        if (!Array.isArray(value) && props.required !== false) data[key] = []
        if (props.value && value) data[key].map((d, i) => applySaveSchemaForValue({ _window, liveDB, db, key: i, props: props.value, data: data[key], datastore, collection, action, existingData: existingData[key] }))

    } else if (props.type === "timestamp") {

        if (typeof value !== "number" && props.required !== false) data[key] = new Date().getTime()

    } else if (props.type === "date") {

        if (typeof value !== "text" && props.required !== false) data[key] = new Date().toISOString()

    } else if (props.type === "document") {

        if (!props.collection) props.collection = collection

        if (!fs.existsSync(`${datastore}/${liveDB}/${props.collection}`)) createCollection({ _window, db, req, dev, collection: props.collection, liveDB, data, datastore })
        // if (!value && props.required !== false) data[key] = ""

        // update data that populated but we dont want to save the populated, instead we want to save the docname
        if (data[key] && typeof data[key] === "string") {
            //let document = database({ _window, action: "search()", data: { ...save, collection: props.collection, doc: data[key] } }).data
            //if (!document) delete data[key]
        } else if (existingData[key] && typeof existingData[key] === "string") data[key] = existingData[key]
    }
}

const applySearchSchemaForValue = ({ _window, liveDB, db, key, props, data, datastore, collection, action, existingData, search, unpopulate }) => {

    if (data[key] === undefined) return

    // document
    if (props.type === "document" && props.collection && props.populate !== false) {

        // unpopulate
        if (unpopulate.find(({key: keyname, collection: collectionName}) => keyname === key && collection === collectionName)) {}
        // populate
        else data[key] = database({ _window, action: "search()", data: { ...search, collection: props.collection, doc: data[key] }, unpopulate }).data || data[key]

        if (props.hideProps) delete data[key].__props__

    // list
    } else if (props.type === "list" && Array.isArray(data[key])) {


        // unpopulate
        if (unpopulate.find(({key: keyname, collection: collectionName}) => keyname === key && collection === collectionName)) {}
        // populate
        else data[key].map((doc, i) => applySearchSchemaForValue({ _window, liveDB, db, key: i, props: props.value, data: data[key], datastore, collection, action, existingData, search, unpopulate }))

    // map
    } else if (props.type === "map" && props.value) data[key] = applySchema({ _window, liveDB, db, schema: { __map__:true, schema: props.value }, data: data[key], datastore, collection, action, unpopulate })

    // action
    else if (props.action) {
        // let value = toValue()
    }
}

const searchResponse = ({ data, global }) => {
    return ({ id: generate(), data: { [data.doc]: global.__queries__[data.collection][data.doc]}, message: "Data queried successfully!", success: true, single: true, dev: data.dev, search: data })
}

module.exports = {
    hideSecured,
    database,
    getData,
    postData,
    deleteData,
    start,
    saveLogs,
    respond,
    checkParams,
    createChunk,
    getFieldValue,
    postProps,
    vcard,
    qrCode,
    passport,
    getFolderNames,
    getDocNames
}