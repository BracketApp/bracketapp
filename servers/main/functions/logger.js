const logger = ({ _window: { global }, data: { key, start, end } }) => {
    
    if (!key) return
    if (start) global.__server__[`${key}StartTime`] = (new Date()).getTime()
    else if (end) {

        global.__server__[`${key}EndTime`] = (new Date()).getTime()
        global.__server__[`${key}Duration`] = global.__server__[`${key}EndTime`] - global.__server__[`${key}StartTime`]
        console.log((new Date()).getHours() + ":" + (new Date()).getMinutes() + " " + key.toUpperCase(), global.__server__[`${key}Duration`], global.manifest.host)
    }
}
module.exports = { logger }