const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)


exports.findOrCreateUser = async token => {
    // 1: verify auth token
    // 2: check if the user exist with provide google info
    // 3: if user exists, return user; else create new user in db

    // 1:
    const googleUser = await verifyAuthToken(token);

    // 2:
    const user = await checkIfUserExists(googleUser.email);  // Either undef or a google user returned;

    // 3:
    return user ? user : createNewUser(googleUser);
}


const verifyAuthToken = async token => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.OAUTH_CLIENT_ID
        })
        return ticket.getPayload()
    } catch {
        console.error("Error verifying auth token", err)
    }
}

const checkIfUserExists = async email => await User.findOne({ email }).exec()

const createNewUser = googleUser => {
    const { name, email, picture } = googleUser;
    const user = { name, email, picture };
    return new User(user).save();
}