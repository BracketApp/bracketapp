module.exports = {
    toAuth: () => {

        global.authenticated = false
        var auth = document.cookie.split("authentication=")
        
        if (auth[1]) {
        
            auth = JSON.parse(auth[1].split(";")[0])
            global.admin = global.auth = auth
            
        } else return
        
        if (auth.name && auth.password && auth.token === "RaWqA95zHRv3FwpNdndY") 
        return global.authenticated = true
    }
}