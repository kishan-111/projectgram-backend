const {MongoClient} = require('mongodb')

let dbConnection

const MONGODB_URL = process.env.MONGODB_URL;

module.exports = {
    connectToDb:(cb) =>{
        MongoClient.connect(MONGODB_URL)
        .then(client => {
            dbConnection = client.db()
            return cb()
        })
        .catch(err =>{
            console.log(err);
            return cb(err);
        })
    },
    getDb: () => dbConnection
}