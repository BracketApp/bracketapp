module.exports = {
    toOperator: (string) => {
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
}

// in, notin, 