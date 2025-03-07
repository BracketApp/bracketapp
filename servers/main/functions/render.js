const { toView } = require("./kernel");
const { addresser } = require("./kernel");
const { logger } = require("./logger");
const { getData } = require("./kernel");

require("dotenv").config();

const render = async ({ _window, id, req, res, stack, props, address, lookupAction, data }) => {
}

module.exports = { render }

/* 
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.0/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.0/html2pdf.bundle.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.0/html2pdf.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.0/html2pdf.min.js"></script>
*/