const { postData, deleteData, getData } = require("./kernel")
const { generate } = require("./generate")

// config
require('dotenv').config()
    
// project DB
var bracketDB = process.env.BRACKETDB
var accDB = process.env.ACCDB

var _window = { global: { manifest: { datastore: "bracketDB" } } }

const moveData = (datastore) => {

    const fromFirebaseToBracketDB = () => {

        // doc is document name (__props__.doc) and is unique per collection
    
        // project id
        var accProjectID = "f1m7R0f878N8V7g0c1w8W9u1C6"
        var bracketProjectID = "K1x7d0l898q817C0w1W9c2j4d6"
    
        // account
        var accAccountID = "1197B078m8x8q4e9T5X949d858"
        var bracketAccountID = "k1A7R0N8X8Y8l7c030q8S8W7O3"
    
        // session
        var sessionID = "61Q7V0B8j8I887D0P1e8q9Y7C7"
    
        // user
        var obeidUserID = "41V7H078W8I8I780z1m9Y2E4Y2"
    
        // permission
        var obeidPermissionID = generate({ unique: true })
    
        // token package
        var tokenPackageID = generate({ unique: true })
    
        // plugin
        var pluginID = "x1u7J0X8a8K8c7H0I14901G9B3"
    
        // subscription
        var subscriptionID = "81z7k0f878H897v0N1a8z9R9G7"
    
        // account
        var accBillingAccountID = "21w710Q828V8p7u0J1z9p0n3n7"
        var bracketBillingAccountID = "31v7G0g8u8O817H0Y0S9d1W0c0"
    
        // payment method
        var paymentMethodID = "F1A7q0r8T8l8o7C0K1v9Z0M629"
    
        // voucher
        var voucherID = "H1Q7f0a828R8d7d0Q060p1E5l2"
    
        // exchange rate
        var exchangeRateID = "X1L7p0V8W89846J9Z9Y58584F5"
    
        // bill
        var billID = "I1C7Z0t8z8F8d6K999b9c7M5d5"
    
        // transaction
        var debitBracketReleaseTransactionID = "a1W7x0t8a818j7n0B0P8I7n3V0"
        var creditAccTransactionID = "78RzUgdMSRNoXBTKCfD3"
        var debitAccTransactionID = "Jb01zikhk6B5gQcORcFC"
        var creditBracketTransactionID = "vPkyWcnarNF2gp4kOoqU"
        var debitBracketTransactionID = "wro8HuFn08gbek8KLM99"
        var encryptionKey = generate()

        // db per project, collection forAll projects (collections: ✓project, ✓account, ✓session, ✓user, ✓view, ✓permission, ✓password, ✓billingAccount, ✓transactions, ✓paymentMethod, ✓exchangeRate, ✓tokenPackage, ✓settings, ✓plugin, ✓bill, ✓voucher)
        deleteData({ _window, erase: { db: bracketDB, collection: "account" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "session" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "user" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "permission" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "password" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "billingAccount" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "transaction" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "paymentMethod" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "exchangeRate" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "tokenPackage" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "counters" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "plugin" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "subscription" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "bill" } });
        deleteData({ _window, erase: { db: bracketDB, collection: "voucher" } });
        // deleteData({ _window, erase: { db: bracketDB, collection: "project" } });
        // deleteData({ _window, erase: { db: bracketDB, collection: "view" } });
        deleteData({ _window, erase: { db: accDB } }); // ✓

        deleteData({ _window, erase: { db: "tokens" } }); // ✓release 100,000 token/year on launch for Bracket Account (collectionID is releaseDate, doc per token)
        deleteData({ _window, erase: { db: "blocks" } }); // ✓transaction of each token (collectionID is TokenID)
        // deleteData({ _window, erase: { db: "analysis" } }); // data analysis per project (doc per day): search, save, erase, requestSize, responseSize

        var counter = {}
        const settings = () => {
            counter = { // total = 18
                db: bracketDB,
                collections: {
                    counter: 1,
                    project: 0,
                    account: 0,
                    session: 0,
                    permission: 0,
                    password: 0,
                    user: 0,
                    billingAccount: 0,
                    transaction: 0,
                    token: 0,
                    block: 0,
                    exchangeRate: 0,
                    tokenPackage: 0,
                    voucher: 0,
                    paymentMethod: 0,
                    view: 0,
                    plugin: 0,
                    storage: 0,
                    data: 0,
                    subscription: 0,
                    bill: 0,
                },
                __props__: {
                    id: generate({ unique: true }),
                    doc: "counter1",
                    creationDate: new Date().getTime(),
                    active: true,
                    counter: 1,
                }
            }

            postData({ _window, save: { data: counter, db: bracketDB, collection: "counters", doc: counter.__props__.doc } })
        }
        settings();

        // create account
        const creatAccounts = () => {
            counter.collections.account++
            var data = {
                email: "ceo@brackettechnologies.com",
                __props__: {
                    id: bracketAccountID,
                    doc: "bracketAccount",
                    creationDate: new Date().getTime(),
                    active: true,
                    counter: counter.collections.account
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `account`, doc: data.__props__.doc } })
            counter.collections.account++
            var data = {
                email: "acc@brackettechnologies.com",
                __props__: {
                    id: accAccountID,
                    doc: "accAccount",
                    creationDate: new Date().getTime(),
                    active: true,
                    counter: counter.collections.account
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `account`, doc: data.__props__.doc } })
        }
        creatAccounts();

        // create project
        datastore.firebaseDB.collection("_project_").doc("acc").get().then(doc => {

            counter.collections.project++
            // docs.forEach(doc => postData({ _window, save: { data: doc.data(), collection: "_project_", doc: doc.id } }))
            var data = doc.data()
            data.__props__ = {
                id: accProjectID,
                doc: "acc",
                creationDate: new Date().getTime(),
                active: true,
                createdByUserID: obeidUserID,
                counter: counter.collections.project
            }

            // confidential: database access keys, publicID, and account ID
            data.accountID = accAccountID
            data.db = accDB

            // project details
            data.subdomain = doc.id
            var collections = data.datastore.collections

            delete data["creation-date"]
            delete data.clooossseeed
            delete data.hezzzyawezzz
            delete data.functions
            delete data.datastore
            delete data.id

            postData({ _window, save: { data, db: bracketDB, collection: `project`, doc: data.__props__.doc } })

            var accCounter = {
                db: accDB,
                collections: {},
                __props__: {
                    id: generate({ unique: true }),
                    doc: "counter2",
                    creationDate: new Date().getTime(),
                    active: true,
                    counter: 2,
                }
            }
            
            collections.map(collection => accCounter.collections[collection] = 0)
            postData({ _window, save: { data: accCounter, db: bracketDB, collection: "counters", doc: accCounter.__props__.doc } })

            createData(doc.id, collections, accCounter)
        })

        // create billing account
        const createBillingAccounts = () => {
            counter.collections.billingAccount++
            // Bracket Account: start 0 TOKEN
            var data = {
                name: "Token",
                currency: "TOKEN",
                creditLimit: 0,
                paymentTerms: "Monthly",
                organizationName: "Bracket Technologies",
                country: "Lebanon",
                accountType: "Business",
                organizationAddress: "Hazmieh Village",
                languagePreference: "English",
                accountID: accAccountID,
                lastTransactionID: creditAccTransactionID,
                __props__: {
                    id: accBillingAccountID,
                    doc: "accBillingAccount",
                    creationDate: new Date().getTime(),
                    createdByUserID: obeidUserID,
                    active: true,
                    counter: counter.collections.billingAccount
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `billingAccount`, doc: data.__props__.doc } })
            counter.collections.billingAccount++
            // Bracket Account: start 100,000 TOKEN
            var data = {
                name: "Token",
                currency: "TOKEN",
                creditLimit: 0,
                paymentTerms: "Monthly",
                organizationName: "Bracket Technologies",
                country: "Lebanon",
                accountType: "Business",
                organizationAddress: "Hazmieh Village",
                languagePreference: "English",
                accountID: bracketAccountID,
                lastTransactionID: debitBracketTransactionID,
                __props__: {
                    id: bracketBillingAccountID,
                    doc: "bracketBillingAccount",
                    creationDate: new Date().getTime(),
                    createdByUserID: obeidUserID,
                    active: true,
                    counter: counter.collections.billingAccount
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `billingAccount`, doc: data.__props__.doc } })
        }
        createBillingAccounts();

        // create payment method
        const createPaymentMethod = () => {
            counter.collections.paymentMethod++
            const data = {
                name: "My Card",
                type: "Master Card",
                primary: true, // backup: true
                expiryMonth: "05",
                expiryYear: "31",
                cvc: "123",
                holderName: "Mohamad Baker Obeid",
                cardNumber: "1234 5678 9000 0000",
                addressLine1: "",
                addressLine2: "",
                city: "Beirut",
                postalCode: "12345",
                accountID: accAccountID,
                billingAccountID: accBillingAccountID,
                __props__: {
                    id: paymentMethodID,
                    doc: "paymentMethod1",
                    creationDate: new Date().getTime(),
                    createdByUserID: obeidUserID,
                    active: true,
                    counter: counter.collections.paymentMethod
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `paymentMethod`, doc: data.__props__.doc } })
        }
        createPaymentMethod();

        // create acc users
        (["78RzUgdMSRNoXBTKCfD3", "Jb01zikhk6B5gQcORcFC", "vPkyWcnarNF2gp4kOoqU", "wro8HuFn08gbek8KLM99"]).map(doc => {
            datastore.firebaseDB.collection("_account_").doc(doc).get().then(doc => {

                var data = doc.data()
                counter.collections.user++
                data.__props__ = {
                    doc: (data["first-name"].toLowerCase() + data["last-name"].toLowerCase()) || generate({ unique: true }),
                    id: data["last-name"] === "Obeid" ? obeidUserID : generate({ unique: true }),
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.user
                }

                data.accountID = accAccountID
                data.firstName = data["first-name"]
                data.lastName = data["last-name"]
                data.username = data.lastName

                delete data.id
                delete data["creation-date"]
                delete data.clooossseeed
                delete data.hezzzyawezzz
                delete data.functions
                delete data["first-name"]
                delete data["last-name"]
                delete data.projects

                postData({ _window, save: { data, db: bracketDB, collection: `user`, doc: data.__props__.doc } })

                counter.collections.permission++

                // permission
                var id = generate({ unique: true })
                var permission = {
                    userID: data.__props__.id,
                    accountID: accAccountID,
                    admin: true,
                    __props__: {
                        id,
                        doc: "permission" + counter.collections.permission,
                        creationDate: new Date().getTime(),
                        active: true,
                        createdByUserID: obeidUserID,
                        counter: counter.collections.permission
                    }
                }

                // create permission
                postData({ _window, save: { data: permission, db: bracketDB, collection: `permission`, doc: permission.__props__.doc } })

                // password
                counter.collections.password++

                var id = generate({ unique: true })
                var password = {
                    userID: data.__props__.id,
                    accountID: accAccountID,
                    admin: true,
                    __props__: {
                        id,
                        doc: id,
                        creationDate: new Date().getTime(),
                        active: true,
                        createdByUserID: obeidUserID,
                        counter: counter.collections.password
                    }
                }


                if (data["last-name"] === "Obeid") password.password = "Obeid@123"
                else if (data["last-name"] === "Al Zoghbi") password.password = "Mohamad@Z"
                else if (data["last-name"] === "Hassan") password.password = "Mohamad@H"
                else if (data["last-name"] === "Assaf") password.password = "Assaf@T"

                // create password
                postData({ _window, save: { data: password, db: bracketDB, collection: "password", doc: password.__props__.doc } })
            })
        });

        // create bracket user: obeidUser
        const createBracketUser = () => {
            counter.collections.user++
            var data = {
                firstName: "Mohamad Baker",
                lastName: "Obeid",
                password: "a",
                email: "a@brackettechnologies.com",
                username: "a",
                accountID: accAccountID,
                admin: true,
                __props__: {
                    id: obeidUserID,
                    doc: "obeidBracketUser",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.user
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `user`, doc: data.__props__.doc } })
            counter.collections.permission++
            var permission = {
                userID: obeidUserID,
                accountID: bracketAccountID,
                admin: true,
                __props__: {
                    id: obeidPermissionID,
                    doc: "obeidUserPermission",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.permission
                }
            }

            postData({ _window, save: { data: permission, db: bracketDB, collection: `permission`, doc: permission.__props__.doc } })
        }
        createBracketUser();

        // create session
        const createSession = () => {
            counter.collections.session++;
            // if user opens different project a new session is created
            const data = {
                accountID: bracketAccountID,
                projectID: bracketProjectID,
                userID: obeidUserID,
                permissionID: obeidPermissionID,
                permissions: {},
                db: bracketDB,
                domain: "localhost",
                expiryDate: 9999999999999,
                encryptionKey,
                subscriptions: [{
                    plugins: [{
                        db: bracketDB,
                        collection: "view",
                        doc: "console"
                    }],
                    expiryDate: 9999999999999,
                    subscriptionID
                }],
                __props__: {
                    id: sessionID,
                    doc: "session1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.session
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `session`, doc: "session1" } })
        }
        createSession();

        // create exchangeRate
        const createExchangeRate = () => {
            counter.collections.exchangeRate++
            const data = {
                fromUnit: "TOKEN",
                fromAmount: 1,
                toAmount: 1,
                toUnit: "USD",
                __props__: {
                    id: exchangeRateID,
                    doc: "exchangeRate1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.exchangeRate
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `exchangeRate`, doc: data.__props__.doc } })
        }
        createExchangeRate();

        // create token package
        const createTokenPackage = () => {
            counter.collections.tokenPackage++
            const data = {
                minimumTokens: 0,
                freeTokens: 0,
                releaseDate: 0,
                expiryDate: 9999999999999,
                status: "Confirmed",
                approved: true,
                __props__: {
                    id: tokenPackageID,
                    doc: "tokenPackage1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.tokenPackage
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `tokenPackage`, doc: data.__props__.doc } })
        }
        createTokenPackage();

        // create plugin
        const createPlugin = () => {
            counter.collections.plugin++
            const data = {
                accountID: bracketAccountID,
                projectID: bracketProjectID,
                plugins: [{
                    db: bracketDB,
                    collection: "view",
                    doc: "console"
                }],
                price: 100,
                unit: "TOKEN",
                subscriptionDuration: 2592000000, // 1month
                releaseDate: 0,
                expiryDate: 9999999999999,
                status: "Confirmed",
                approved: true,
                __props__: {
                    id: pluginID,
                    doc: "plugin1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.plugin
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: `plugin`, doc: "plugin1" } })
        }
        createPlugin();

        // create subscription
        const createSubscription = () => {
            counter.collections.subscription++
            const data = {
                accountID: accAccountID,
                projectID: accProjectID,
                pluginID,
                subscriptionDate: 0,
                expiryDate: 9999999999999,
                status: "Confirmed",
                __props__: {
                    id: subscriptionID,
                    doc: "subscription1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.subscription
                }
            }

            postData({ _window, save: { db: bracketDB, collection: "subscription", data, doc: "subscription1" } })
        }
        createSubscription();

        // create bill
        const createBill = () => {
            counter.collections.bill++;
            const data = {
                accountID: accAccountID,
                projectID: accProjectID,
                pluginID,
                subscriptionID,
                dueDate: 9999999999999,
                amount: 100,
                unit: "TOKEN",
                status: "Confirmed",
                __props__: {
                    id: billID,
                    doc: "bill1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.bill
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: "bill", doc: "bill1" } })
        }
        createBill();

        // create voucher
        const createVoucher = () => {

            counter.collections.voucher++

            const data = {
                accountID: accAccountID,
                billID,
                voucherDate: 9999999999999,
                amount: 100,
                unit: "TOKEN",
                status: "Confirmed",
                __props__: {
                    id: voucherID,
                    doc: "voucher1",
                    creationDate: new Date().getTime(),
                    active: true,
                    createdByUserID: obeidUserID,
                    counter: counter.collections.voucher
                }
            }

            postData({ _window, save: { data, db: bracketDB, collection: "voucher", doc: "voucher1" } })
        }
        createVoucher();

        // create 4 transactions: 1 Bill and 1 Voucher: 2 billingAccount, 2 TokenAccount
        const createTransactions = () => {
            [
                debitBracketReleaseTransactionID, // release tokens
                creditBracketTransactionID, // vouhcer: client charges his account
                debitAccTransactionID, // vouhcer: client charges his account
                creditAccTransactionID, // bill: client subscribes
                debitBracketTransactionID // bill: client subscribes

            ].map((transactionID, i) => {
                counter.collections.transaction++

                var data = {
                    accountID: (i === 0 || i === 1 || i === 4) ? bracketAccountID : accAccountID,
                    billingAccountID: (i === 0 || i === 1 || i === 4) ? bracketBillingAccountID : accBillingAccountID,
                    transactionDate: new Date().getTime(),
                    debit: 0,
                    credit: 0,
                    balance: 0,
                    unit: "TOKEN",
                    status: "Confirmed",
                    debits: 0,
                    credits: 0,
                    exchangeRate: {
                        fromUnit: "TOKEN",
                        fromAmount: 1,
                        toUnit: "USD",
                        toAmount: 1
                    },
                    __props__: {
                        id: transactionID,
                        doc: "transaction" + (i + 1),
                        creationDate: new Date().getTime(),
                        active: true,
                        createdByUserID: obeidUserID,
                        counter: counter.collections.transaction
                    }
                }

                if (i === 0) {
                    data.debit = 100 // DR Bracket (release)
                    data.balance = 100
                    data.debits = 100
                    data.credits = 0
                } else if (i === 1) {
                    data.credit = 100 // CR Bracket (voucher)
                    data.balance = 0
                    data.debits = 100
                    data.credits = 100
                } else if (i === 2) {
                    data.debit = 100 // DR Acc (voucher)
                    data.balance = 100
                    data.debits = 100
                    data.credits = 0
                } else if (i === 3) {
                    data.credit = 100 // CR Acc (bill)
                    data.balance = 0
                    data.debits = 100
                    data.credits = 100
                } else if (i === 4) {
                    data.debit = 100 // DR Bracket (bill)
                    data.balance = 100
                    data.debits = 200
                    data.credits = 100
                }

                // payment voucher
                if (i === 1 || i === 2) data.voucherID = voucherID
                // bill invoice
                else if (i === 3 || i === 4) data.billID = billID

                postData({ _window, save: { data, db: bracketDB, collection: "transactions", doc: data.__props__.doc } })
            })
        }
        createTransactions();

        /////////////////////////////////////// Collection Per Project ///////////////////////////////////////////

        // create views
        (["acc"]).map(project => {
            datastore.firebaseDB.collection(`view-${project}`).get().then(docs => {

                docs.forEach(doc => {

                    var data = doc.data()
                    counter.collections.view++

                    data.__props__ = {
                        id: generate({ unique: true }),
                        doc: doc.id,
                        creationDate: new Date().getTime(),
                        active: true,
                        createdByUserID: obeidUserID,
                        actions: data.functions,
                        collapsed: [...(data.clooossseeed || []), ...(data.functions.clooossseeed || [])],
                        comments: [...(data.hezzzyawezzz || []), ...(data.functions.hezzzyawezzz || [])],
                        dirPath: [],
                        version: 0,
                        counter: counter.collections.view,
                        secure: data._secure_ || false
                    }

                    delete data["creation-date"]
                    delete data.creationDate
                    delete data.clooossseeed
                    delete data.hezzzyawezzz
                    data.__props__.actions && delete data.__props__.actions.clooossseeed
                    data.__props__.actions && delete data.__props__.actions.hezzzyawezzz
                    delete data.functions
                    delete data.id
                    delete data._secure_
                    delete data._view_

                    // add id to view
                    if (!data.view.split("?")[0].split(":")[1]) {
                        var before = data.view.split("?")[0]
                        var after = data.view.split("?").slice(1).join("?")
                        data.view = before + ":" + doc.id + "?" + after
                    }

                    postData({ _window, save: { data, db: accDB, collection: "view", doc: data.__props__.doc } })
                })
            });
        });

        // create storage
        (["acc"]).map(project => {
            datastore.firebaseDB.collection(`storage-${project}`).get().then(docs => {

                docs.forEach(doc => {

                    var data = doc.data()
                    counter.collections.storage++;

                    data.__props__ = {
                        id: generate({ unique: true }),
                        creationDate: new Date().getTime(),
                        active: true,
                        createdByUserID: obeidUserID,
                        doc: doc.id,
                        counter: counter.collections.storage
                    }

                    delete data["creation-date"]
                    delete data.id

                    postData({ _window, save: { db: accDB, collection: "storage", data, doc: data.__props__.doc } })
                })
            });
        });

        // create data
        const createData = (project, collections, counter) => {
            project === "acc" && collections.map(collection => {
                datastore.firebaseDB.collection(`collection-${collection}-${project}`).get().then(docs => {

                    docs.forEach(doc => {

                        var data = doc.data()
                        counter.collections[collection]++;

                        data.__props__ = {
                            id: generate({ unique: true }),
                            doc: doc.id,
                            creationDate: new Date().getTime(),
                            active: true,
                            createdByUserID: obeidUserID,
                            collapsed: [...(data.clooossseeed || []), ...((data.functions || {}).clooossseeed || [])],
                            comments: [...(data.hezzzyawezzz || []), ...((data.functions || {}).hezzzyawezzz || [])],
                            dirPath: [],
                            actions: {},
                            counter: counter.collections[collection]
                        }

                        delete data["creation-date"]
                        delete data.clooossseeed
                        delete data.hezzzyawezzz
                        delete data.functions

                        postData({ _window, save: { data, db: accDB, collection, doc: data.__props__.doc } })
                        postData({ _window, save: { data: counter, db: bracketDB, collection: "counters", doc: counter.__props__.doc } })
                    })
                })
            })
        }

        /////////////////////////////////////// Seperated Projects /////////////////////////////////////////

        // release 100 token
        var tokens = []
        const createTokens = () => {
            var releaseDate = new Date().getTime()
            for (let i = 0; i < 100; i++) {
                counter.collections.token++;

                var data = {
                    token: generate({ universal: true, timestamp: releaseDate }),
                    releaseDate,
                    __props__: {
                        id: generate({ unique: true }),
                        doc: "token" + (i + 1),
                        creationDate: new Date().getTime(),
                        active: true,
                        createdByUserID: obeidUserID,
                        counter: counter.collections.token
                    }
                }
                tokens.push(data)

                postData({ _window, save: { data, db: "tokens", collection: releaseDate, doc: data.__props__.doc } })
            }
        }
        createTokens();

        // create 300: 100 deposit to Bracket => 100 move to Acc => 100 move back to Bracket
        const createBlocks = () => {

            var prevBlockID
            tokens.map(token => {
                for (let i = 0; i <= 2; i++) {
                    counter.collections.block++;
                    var data = {
                        accountID: (i === 0 || i === 2) ? bracketAccountID : accAccountID,
                        billingAccountID: (i === 0 || i === 2) ? bracketBillingAccountID : accBillingAccountID,
                        transactionID: i === 0 ? debitBracketReleaseTransactionID : i === 1 ? debitAccTransactionID : i === 2 && debitBracketTransactionID,
                        token: token.token,
                        blockDate: new Date().getTime(),
                        status: "Confirmed",
                        price: i === 0 ? 0 : 1,
                        unit: "USD",
                        __props__: {
                            id: generate({ unique: true }),
                            doc: "block" + counter,
                            creationDate: new Date().getTime(),
                            active: true,
                            createdByUserID: obeidUserID,
                            counter: counter.collections.block
                        }
                    }
                    if (i !== 0) data.prevBlockID = prevBlockID
                    prevBlockID = data.__props__.id

                    // assign token package on acc purchase
                    if (i === 1) data.tokenPackageID = tokenPackageID

                    if (i === 2) { // update token lastBlockID
                        token.lastBlockID = data.id
                        postData({ _window, save: { data: token, db: "tokens", collection: token.releaseDate, doc: token.__props__.doc } })
                    }
                    postData({ _window, save: { data, db: "blocks", collection: token.token, doc: data.__props__.doc } })
                }
            })
        }
        createBlocks();
    }
    // fromFirebaseToBracketDB()

    const fromBracketDBToMongoDB = async () => {
        
        // bracket data
        var { data } = await getData({ _window, search: { db: bracketDB } })
        Object.entries(data).map(([collection, docs]) => {
            datastore.mongoDB.db(bracketDB).collection(collection).insertMany(Object.values(docs))
        })
        
        // acc data
        var { data } = await getData({ _window, search: { db: accDB } })
        Object.entries(data).map(([collection, docs]) => {
            datastore.mongoDB.db(accDB).collection(collection).insertMany(Object.values(docs))
        })
        
        // tokens
        /*var { data } = await getData({ _window, search: { db: accDB } })
        Object.entries(data).map(([collection, docs]) => {
            datastore.mongoDB.db("tokens").collection(collection).insertMany(Object.values(docs))
        })
        
        // blocks
        var { data } = await getData({ _window, search: { db: accDB } })
        Object.entries(data).map(([collection, docs]) => {
            datastore.mongoDB.db("blocks").collection(collection).insertMany(Object.values(docs))
        })*/
    }
    // fromBracketDBToMongoDB()
}

module.exports = moveData