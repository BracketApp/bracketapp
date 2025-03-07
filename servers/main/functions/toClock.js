module.exports = {
    toClock: (data) => {

        let timestamp, day, hr = true, min = true, sec, format = "format1"
        if (typeof data === "number") timestamp = data
        else {
            timestamp = data.timestamp
            day = data.day !== undefined ? data.day : day
            hr = data.hr !== undefined ? data.hr : hr
            min = data.min !== undefined ? data.min : min
            sec = data.sec !== undefined ? data.sec : sec
            format = data.format !== undefined ? data.format : format
        }

        if (!timestamp) return "00:00"
        let days_ = Math.floor(timestamp / 86400000) + ""
        let _days = timestamp % 86400000
        let hrs_ = Math.floor(_days / 3600000) + ""
        let _hrs = _days % 3600000
        let mins_ = Math.floor(_hrs / 60000) + ""
        let _mins = _hrs % 60000
        let secs_ = Math.floor(_mins / 1000) + ""

        if (days_.length === 1) days_ = "0" + days_
        if (hrs_.length === 1) hrs_ = "0" + hrs_
        if (mins_.length === 1) mins_ = "0" + mins_
        if (secs_.length === 1) secs_ = "0" + secs_

        if (format === "format1") return (day ? days_ + ":" : "") + (hr ? hrs_ + ":" : "") + (min ? mins_ : "") + (sec ? ":" + secs_ : "")
        if (format === "format2") return (day ? days_ + "d:" : "") + (hr ? hrs_ + "h:" : "") + (min ? mins_ + "m" : "") + (sec ? ":" + secs_ : "")
    }
}