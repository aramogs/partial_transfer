const genericPool = require('generic-pool');
const rfc = require('node-rfc');

const sapConfig = {
  // Your SAP system configuration
  user: process.env.RFC_USER,
  passwd: process.env.RFC_PASSWD,
  ashost: process.env.RFC_ASHOST,
  sysnr: process.env.RFC_SYSNR,
  client: process.env.RFC_CLIENT,
  lang: process.env.RFC_LANG,
};

const factory = {
  create: function () {
    return new Promise((resolve, reject) => {
      const client = new rfc.Client(sapConfig);
      client.connect((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });
  },
  destroy: function (client) {
    return new Promise((resolve, reject) => {
      client.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  validate: function(client) {
    return new Promise((resolve) => {
      client.invoke('RFC_SYSTEM_INFO', {}, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
};

const opts = {
  max: 50, // maximum size of the pool
  min: 10,  // minimum size of the pool
  testOnBorrow: true, // validate resources before giving them to clients
  idleTimeoutMillis: 600000, // remove resources which are idle for more than 10 minutes
  evictionRunIntervalMillis: 60000, // check for idle resources every minute
};

let sapRfcPool = genericPool.createPool(factory, opts);
sapRfcPool.on('factoryCreateError', (err) => console.error('⚠️ SAP RFC Pool Create Error: ', err));
sapRfcPool.on('factoryDestroyError', (err) => console.error('⚠️ SAP RFC Pool Destroy Error: ', err));

module.exports = sapRfcPool;