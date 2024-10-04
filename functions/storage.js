
const { getData, respond, checkParams, database, createChunk, getFieldValue, postProps } = require("./database")
const { toArray } = require("./toArray")
const { generate } = require("./generate")
const { isEqual } = require("./isEqual")
const fs = require("fs")
const mime = require('mime-types')

const storage = async ({ _window, req, res, action, preventDefault, data, stack, props, __ }) => {

    var timer = (new Date()).getTime(), global = _window.global
    data.datastore = "storage"
    if (action === "search()") var response = getData({ _window, req, res, preventDefault, search: data, action })
    else if (action === "save()") var response = await uploadFile({ _window, req, upload: data, action })
    else if (action === "erase()") var response = await eraseFile({ _window, req, upload: data, action })

    var time = (new Date()).getHours() + ":" + (new Date()).getMinutes()
    
    // log
    global.manifest.session && console.log(time, action.slice(0, -2).toUpperCase(), data.collection || "*", (new Date()).getTime() - timer, global.manifest.session.subdomain || "", global.manifest.session.username || "");
    return respond({ res, stack, props, global, response, __ })
}

const uploadFile = async ({ _window = {}, req, upload, action = "save()" }) => {

    var datastore = "storage",
        db = upload.db || _window.global.manifest.session.storage,
        collection = upload.collection,
        doc = upload.doc,
        docs = upload.docs || [],
        data = upload.data,
        success = false, 
        message = "Missing data!"

    var { path, dbProps, collectionProps, success, message } = checkParams({ _window, req, data: upload, action, datastore })
    if (!success) return { success, message, upload }

    // rename collection
    if (upload.rename && upload.collection) {

        fs.renameSync(path, `storage/${db}/${upload.rename}`)

        // props
        dbProps.writes += 1
        collectionProps.writes += 1
        collectionProps.collection = collection = upload.rename

        // props
        fs.writeFileSync(`storage/${db}/${collection}/collection1/__props__/__props__.json`, JSON.stringify(collectionProps, null, 4))
        fs.writeFileSync(`storage/${db}/__props__/db.json`, JSON.stringify(dbProps, null, 4))

        return { success: true, message: "Collection name changed successfully!", upload }
    }

    var writesCounter = 0, newDocsLength = 0, payloadIn = 0, newDataSize = 0, chunks = {}, chunkName = `chunk${collectionProps.lastChunk}`
    var length = toArray(data).length

    // incompatible payload
    if (("doc" in upload && length > 1 && docs.length !== length)) return {success:false, message: "Incompatible payload!"}

    // push doc to docs
    if ("doc" in upload && length === 1 && docs.length === 0) docs = [upload.doc]

    var dataList = toArray(data)

    for (let i = 0; i < dataList.length; i++) {

        var { data: file, ...data } = dataList[i], createNewDoc = false, existingData = {}, chunkName = `chunk${collectionProps.lastChunk}`

        // check if user is creating a new doc
        var createNewDoc = !data.__props__ || !data.__props__.doc
        // check doc by props.doc
        if (!createNewDoc) {
            var response = database({_window, action:"search()", data:{datastore: "storage", db, collection, doc:data.__props__.doc}})
            if (response.data) existingData = response.data
            else createNewDoc = true
        }
        
        // check doc by given doc
        if (createNewDoc && docs[i]) {
            var response = database({_window, action:"search()", data:{datastore: "storage", db, collection, doc:docs[i]}})
            if (response.data) {
                existingData = response.data
                createNewDoc = false
            }
        }

        // collection props
        writesCounter++
        if (createNewDoc) {

            newDocsLength++;
            collectionProps.counter++;
        }

        if (!file && createNewDoc) continue;

        var existingProps = existingData.__props__ || {}

        // data props
        data.__props__ = {
            // main props: imutable
            id: existingProps.id || generate({ unique: true }),
            doc: docs[i] || existingProps.doc || (collection + collectionProps.counter),
            file: existingProps.file || (generate({ universal: true }) + `.${mime.extension(data.type)}`),
            counter: existingProps.counter || collectionProps.counter,
            creationDate: existingProps.creationDate || (new Date()).getTime(),
            collection: existingProps.collection || collection,
            chunk: existingProps.chunk || chunkName,
            bucket: existingProps.bucket || "bucket1",
            extension: existingProps.extension || mime.extension(data.type),
            charset: existingProps.charset || mime.charset(data.type),
            lastModified: (new Date()).getTime(),
            secured: false
        }

        // url
        if (createNewDoc) data.url = `/storage/${db}/${collection}/${data.__props__.bucket}/${data.__props__.file}`

        // set data size
        data.__props__.size = JSON.stringify(data).length + data.size

        // reset doc name
        var doc = data.__props__.doc, oldDoc = existingProps.doc
        
        // get chunk props
        var chunkName = data.__props__.chunk
        if (!chunks[chunkName]) chunks[chunkName] = { props: JSON.parse(fs.readFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`)), indexings: {} }
        var chunkProps = chunks[chunkName].props
        
        // push/replace doc to sorted docs & update chunk docslength & size
        if (oldDoc && doc !== oldDoc) {
            for (let i = 0; i < chunkProps.docs.length; i++) {
                if (chunkProps.docs[i] === oldDoc) chunkProps.docs[i] = doc
            }
            chunkProps.size -= existingData.__props__.size
        } else if (oldDoc) {
            chunkProps.size -= existingData.__props__.size
        } else if (!oldDoc) {

            chunkProps.docs.unshift(doc)
            chunkProps.docsLength += 1
            
            // check chunk docs length
            if (chunkProps.docsLength === 1000) {

                collectionProps.lastChunk += 1
                chunkProps.reachedMax = true
                createChunk({ db, collection, chunkName: `chunk${collectionProps.lastChunk}`, collectionProps })
            }
        }

        // size
        chunkProps.size += data.__props__.size

        // upload data
        if (createNewDoc) var { success, message } = await createWriteStream({ file, path: `storage/${db}/${collection}/${data.__props__.bucket}/${data.__props__.file}` })
        fs.writeFileSync(`${path}/collection1/${doc}.json`, JSON.stringify(data, null, 4))

        // loop over indexings
        for (let i = 0; i < collectionProps.indexes.length; i++) {

            var indexProps = collectionProps.indexes[i], sameFieldValue = true, indexingOfDoc = {}

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

        // props: data size
        var dataSize = data.__props__.size
        payloadIn += dataSize
        if (createNewDoc) newDataSize += dataSize
    }

    // upload chunk props & indexings
    Object.entries(chunks).map(([chunkName, chunk]) => {
        fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/__props__.json`, JSON.stringify(chunk.props, null, 4))
        Object.entries(chunk.indexings).map(([indexingDoc, indexing]) => {
            fs.writeFileSync(`${path}/collection1/__props__/${chunkName}/${indexingDoc}.json`, JSON.stringify(indexing, null, 4))
        })
    })
    
    // props
    postProps({ db, collection, collectionProps, dbProps, writesCounter, newDocsLength, payloadIn, newDataSize, datastore })
    
    return { success: true, message: "Data uploaded successfully!", data }
}

const createWriteStream = async ({file, path}) => new Promise((resolve) => {

    file = file.split(';base64,').pop();
    const buffer = Buffer.from(file, 'base64')
    const writeStream = fs.createWriteStream(path)
    writeStream.write(buffer) // base64 buffer
    writeStream.end();

    writeStream.on('finish', () => {
        resolve({ success: true, message: "File uploaded successfully!"})
    })
  
    writeStream.on('error', (err) => {
        resolve({ success: false, message: "Failed to upload file!"})
    })
})

module.exports = {storage}