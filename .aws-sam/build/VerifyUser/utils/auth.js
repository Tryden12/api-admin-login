const jwt = require('jsonwebtoken');
const { getSecretString } = require('../utils/ssm')


async function generateToken(userInfo) {
  const secret = await getJwtSecret()

  if (!userInfo) { return null; }

  return jwt.sign(userInfo, secret, {
    expiresIn: '1h'
  })
}

async function verifyToken(username, token) {
    const secret = await getJwtSecret()
    
    return jwt.verify(token, secret, (error, response) => {
      if (error) {
        return {
          verified: false,
          message: 'invalid token'
        }
      }
  
      if (response.username !== username) {
        return {
          verified: false,
          message: 'invalid user'
        }
      }
  
      return {
        verified: true,
        message: 'verifed'
      }
    })
}

const getJwtSecret = async () => {
  return await getSecretString('jwt-secret')
}
  
module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
