const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose');
require('dotenv').config();

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { findOrCreateUser } = require('./controllers/userController');

//----TEST MONGO DB CONNECTION----
// require('dotenv').config();
// const MongoClient = require('mongodb').MongoClient;
// // const uri = "mongodb+srv://kay:myRealPassword@cluster0.mongodb.net/test?w=majority";
// const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//  // perform actions on the collection object
//   client.close();
// });
//========



mongoose
    .connect(process.env.MONGO_URI, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true 
    })
    .then(() => console.log('\n\t$$ DB connected!\n'))
    .catch(err => console.log('\n\t!! WOOPS !!', err))


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let authToken = null;
        let currentUser = null;
        try {
            authToken = req.headers.authorization
            if (authToken) {
                // find or create user:
                currentUser = await findOrCreateUser(authToken);
            }
        } catch (err) {
            console.error(`Unable to authenticate user with token ${authToken}`)
        }
        return { currentUser }
    }
});

// server.listen();
server.listen({ port: process.env.PORT || 4000 }).then( ({ url }) => {
    console.log(`\n\tHi Panda - Server listening on ${url}\n`)
});

