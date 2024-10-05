import { buildResponse } from '../utils/util.mjs';
import { generateToken } from '../utils/auth.mjs';
import { DynamoDB } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"; 

import pkg from 'bcryptjs';
const { compare } = pkg;

// Full DynamoDB Client
const client = new DynamoDB({});

// Full document client
const docClient = DynamoDBDocument.from(client); // client is DynamoDB client

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
    if (!dynamoUser || !dynamoUser.username) {
        return buildResponse(403, { message: 'user does not exist'});
    }
    
    if (!compare(password, dynamoUser.password)) {
        return buildResponse(403, { message: 'password is incorrect'});
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }
    const token = generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }
    return buildResponse(200, response);
}

async function getUser(username) {
    const params = {
      TableName: userTable,
      Key: {
        username: username
      }
    }
  
    return await get(params).promise().then(response => {
      return response.Item;
    }, error => {
      console.error('There is an error getting user: ', error);
    })
}
  
const _login = login;
export { _login as login };