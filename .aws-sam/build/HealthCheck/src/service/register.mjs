import { buildResponse } from '../utils/util.mjs';
import { DynamoDB } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"; 

import pkg from 'bcryptjs';
const { hash } = pkg;

// Full DynamoDB Client
const client = new DynamoDB({});

// Full document client
const docClient = DynamoDBDocument.from(client); // client is DynamoDB client

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE;

async function register(userInfo) {
    // Use a random uuidv4 string as a User ID 
    const userId = uuidv4();
    const name = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username;
    const password = userInfo.password;
    if(!username || !name || !email || !password) {
        return buildResponse(401, {
            message: 'All fields are required'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if(dynamoUser && dynamoUser.username) {
        return buildResponse(401, {
            message: 'Username already exists. Please choose a different username.'
        })
    }

    const encryptedPW = hash(password.trim(), 10);
    const user = {
        userId: userId,
        name: name,
        email: email,
        username: username.toLowerCase().trim,
        password: encryptedPW
    }

    const saveUserResponse = await saveUser(user);
    if(!saveUserResponse) {
        return buildResponse(503, {message: 'Server Error. Please try again later.'});
    }

    return buildResponse(200, { username: username });
}

async function getUser(username) {
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }

    return await docClient.get(params).promise().then(response => {
        return response.Item;
    }, error => {
        console.error('There is an error getting user: ', error);
    })
}

async function saveUser(user) {
    const params = {
        TableName: userTable,
        Item: user
    }
    return await docClient.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error('There is an error saving user: ', error)
    });
}

const _register = register;
export { _register as register };