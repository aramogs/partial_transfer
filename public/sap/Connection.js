const Pool = require("node-rfc").Pool;

const abapSystem = {
    user: process.env.RFC_USER,
    passwd:  process.env.RFC_PASSWD,
    ashost:  process.env.RFC_ASHOST,
    sysnr:  process.env.RFC_SYSNR,
    client: process.env.RFC_CLIENT,
    lang:  process.env.RFC_LANG,
};

function createSapRfcPool() {
    return new Pool({
        connectionParameters: abapSystem,
        clientOptions: {},
        poolOptions: { low: 0, high: 15 },
    });
}

module.exports = createSapRfcPool;