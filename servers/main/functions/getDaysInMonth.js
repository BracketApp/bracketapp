module.exports = {
    getDaysInMonth: (stampTime) => {
        return new Date(stampTime.getFullYear(), stampTime.getMonth() + 1, 0).getDate()
    }
}