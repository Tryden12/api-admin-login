import { getSecretString } from './ssm.mjs';
import pkg from 'jsonwebtoken';

const { sign, verify } = pkg;

async function generateToken(userInfo) {
  const secret = await getJwtSecret()

  if (!userInfo) { return null; }

  return sign(userInfo, secret, {
    expiresIn: '1h'
  })
}

async function verifyToken(username, token) {
    const secret = await getJwtSecret()
    
    return verify(token, secret, (error, response) => {
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
  
const _generateToken = generateToken;
export { _generateToken as generateToken };
const _verifyToken = verifyToken;
export { _verifyToken as verifyToken };
