'use strict';

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
}

const vcard = ({ res, data: { info, firstName, middleName, lastName, org, title, img, phone, address, email } }) => {

    if (res && !res.headersSent) return vcardServer({ res, data })
    let vcard = `BEGIN:VCARD
    VERSION:3.0
    N:${info}
    FN:${firstName}
    MN:${middleName}
    LN:${lastName}
    ORG:${org}
    TITLE:${title}
    PHOTO;TYPE=JPEG;ENCODING=b:[${img}]
    TEL;TYPE=WORK,VOICE:${phone}
    ADR;TYPE=WORK,PREF:;;${address}
    EMAIL:${email}
    REV:${new Date().toISOString()}
    END:VCARD`;

    downloadToFile(vcard, 'vcard.vcf', 'text/vcard');
}

const vcardServer = ({ res, data }) => {

    if (data.firstName && data.lastName && data.workPhone) {

        // create a new vCard
        const vCard = require("vcards-js")();

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

module.exports = { vcard }