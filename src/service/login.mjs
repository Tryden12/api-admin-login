import { buildResponse } from '../utils/util.mjs';
import { generateToken } from '../utils/auth.mjs';
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

import pkg from 'bcryptjs';
const { compare } = pkg;

const dbclient = new DynamoDBClient();

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE;

async function login(user) {
    const username = user.username;
    const password = user.password;

    if (!user || !username || !password) {
        return buildResponse(401, {
            message: 'Username and password are required.'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim())
    if (!dynamoUser || !dynamoUser.username.S) {
        return buildResponse(403, { message: 'user does not exist'});
    }
    
    const passwordsMatch = compare(password, dynamoUser.password.S);
    if (!passwordsMatch) {
        return buildResponse(403, { message: "password is incorrect!"});
    }

    const userInfo = {
        username: dynamoUser.username.S,
        name: dynamoUser.name.S
    }
    const token = generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }
    return buildResponse(200, response);
}

// Get User from Dynamo table by username
async function getUser(username) {
    const params = {
      TableName: userTable,
      Key: {
          "username": { "S": username}
      }
    }
    const command = new GetItemCommand(params);
    try {
        const response = await dbclient.send(command);
        return response.Item
    } catch (error) {
        console.error('There is an error getting user: ', error);
    }
}
  
const _login = login;
export { _login as login };