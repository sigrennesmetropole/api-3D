const { Pool  } = require('pg')

const pgQuery = (query) => new Promise(
    async (resolve, reject) => {
        try {
            const pool = new Pool({
                user: process.env.DB_USERNAME,
                host: process.env.DB_HOST,
                database: process.env.DB_DATABASE,
                password: process.env.DB_PASSWORD,
                port: process.env.DB_PORT,
              })
            
            pool.on('error', (err, client) => {
                console.error('Unexpected error on idle client', err)
                process.exit(-1)
              })

            pool.query(query)
                .then(res => {
                    resolve(res);
                })
                .catch(err =>
                    setImmediate(() => {
                    throw err
                    })
                )
        } catch (e) {
            console.log(e.message);
            reject(`error: ${e.message}`
            );
        }
    }
);

module.exports= {pgQuery}