const { Pool } = require('pg');
const c = require('../../config');
const pool = new Pool(c.pg_config);

const selectData = () => new Promise(
    async (resolve, reject) => {
      try {
        resolve(await pool.query("select * from test"));
      } catch (e) {
        reject(Promise.reject(e));
      }
    }
);

module.exports =  { selectData };