const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const client = require('./conn');

module.exports = {
    checkUsers,
    validateToken,
    getHashPassword,
    getUser,
    isUserAdmin
};

const JWT_SECRET_KEY = 'mirrornotalwaysshowyouwhatyouwanttosee';


function getHashPassword(password){
    var salt = crypto.randomBytes(16).toString('hex');
  
    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
    var hash = crypto.pbkdf2Sync(password, salt, 
    1000, 64, `sha512`).toString(`hex`);

    return [salt, hash];
}

function checkHashPassword(password,salt,hashPassword){
    var checkresult = crypto.pbkdf2Sync(password, salt, 
    1000, 64, `sha512`).toString(`hex`);

    if(hashPassword==checkresult){
        return true;
    }
    return false;
}

async function getUser(username) {
    return client.query("select * from users WHERE username=$1", [username]);
}

async function isUserAdmin(user_id) {
    return client.query("select * from users WHERE id=$1 AND isadmin=true", [user_id]);
}


function checkUsers(user, res) {
    const isUser=checkHashPassword(user.password,user.salt,user.hashPassword);
    if(isUser){
        const token= jwt.sign({ sub: user.id }, JWT_SECRET_KEY, { expiresIn: '7d' });
        res.json({
            token
        });
    }else{
        res.json({
            status: 400,
            msg:"Incorrect username or password"
        })
    }
}

function validateToken(req) {
    let jwtSecretKey = JWT_SECRET_KEY;
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ")[1];

        const remindTime=jwt.verify(bearerToken, jwtSecretKey);
        if((remindTime.exp-remindTime.iat) > 0){
            return true;
        }
        return false;
    } else {
        return false
    }
}
