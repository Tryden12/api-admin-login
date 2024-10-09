import { buildResponse } from '../utils/util.mjs';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';
import pkg from 'bcryptjs';

const { hash } = pkg;

const dbclient = new DynamoDBClient();

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE;

async function register(userInfo) {
    // Use a random uuidv4 string as a User ID 
    const userId = uuidv4();
    const tempName = userInfo.name;
    const tempEmail = userInfo.email;
    const tempUsername = userInfo.username.toLowerCase().trim();
    const tempPassword = userInfo.password;
    if(!tempUsername || !tempName || !tempEmail || !tempPassword) {
        return buildResponse(401, {
            message: 'All fields are required',
            body: JSON.stringify(userInfo)
        })
    }

    const encryptedPW = await hash(tempPassword.trim(), 10);
    const user = {
        userId: userId,
        name: tempName,
        email: tempEmail,
        username: tempUsername,
        password: encryptedPW 
    };

    const dynamoUser = await getUser(user.username);
    if(dynamoUser && dynamoUser.username) {
        return buildResponse(401, {
            message: 'Username already exists. Please choose a different username.'
        })
    }

    const saveUserResponse = await saveUser(user);
    if(!saveUserResponse) {
        return buildResponse(503, {message: 'Server Error. Please try again later.'});
    }

    return buildResponse(200, { message: `Username: ${user.username}` });
}

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

async function saveUser(user) {
    const params = {
        "TableName": userTable,
        "Item": {
            "userId": {
                "S": `${user.userId}`
            },
            "name": {
                "S": `${user.name}`
                },
            "email": {
                "S": `${user.email}`
            },
            "username": {
                "S": `${user.username}`
            },
            "password": {
                "S": `${user.password}`
            }
        }
    }

    const command = new PutItemCommand(params);
    try {
        const response = await dbclient.send(command);
        return true
    } catch (error) {
        console.error('There is an error saving user: ', error);
    }
}

const _register = register;
export { _register as register };