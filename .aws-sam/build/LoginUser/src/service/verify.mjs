import { buildResponse } from '../utils/util.mjs';
import { verifyToken } from '../utils/auth.mjs';

async function verify(requestBody) {
  if (!requestBody.user || !requestBody.user.username || !requestBody.token) {
    return buildResponse(401, { 
      verified: false,
      message: 'incorrect request body'
    })
  }

  const user = requestBody.user;
  const token = requestBody.token;
  const verification = await verifyToken(user.username, token);
  if (!verification.verified) {
    return buildResponse(401, verification);
  }

  return buildResponse(200, {
    verified: true,
    message: 'success',
    user: user,
    token: token
  })
}

const _verify = verify;
export { _verify as verify };