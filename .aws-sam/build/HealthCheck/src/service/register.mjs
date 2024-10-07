import { buildResponse } from '../utils/util.mjs';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';
import pkg from 'bcryptjs';

const { hash } = pkg;

// import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import
// import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import
// const client = new DynamoDBClient({});
// const dbclient = DynamoDBDocumentClient.from(client);
// await dbclient.put({
//     TableName,
//     Item: {
//       userId: user.userId,
//       username: user.username,
//     },
//   });

const dbclient = new DynamoDBClient();

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE;

async function register(userInfo) {
    // Use a random uuidv4 string as a User ID 
    const userId = uuidv4();
    const name = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username.toLowerCase().trim();
    const password = userInfo.password;
    if(!username || !name || !email || !password) {
        return buildResponse(401, {
            message: 'All fields are required',
            body: JSON.stringify(userInfo)
        })
    }

    const encryptedPW = hash(password.trim(), 10);
    const user = {
        "userId": userId,
        "name": name,
        "email": email,
        "username": username,
        "password": encryptedPW 
        // userId: { S: userId },
        // name: { S: name },
        // email: { S: email },
        // username: { S: username },
        // password: { S: encryptedPW }
    }

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

    return buildResponse(200, { username: username });
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
  

    // dbclient
    // .send(new GetItemCommand(params))
    // .then((result) => {
    //     console.log("data:" + result);
    // })
    // .catch((err) => {
    //     console.log("err", err);
    // });
}

async function saveUser(user) {
    const params = {
        TableName: userTable,
        Item: {
            "userId": { S: user.userId },
            "name": { S: user.name },
            "email": { S: user.email },
            "username": { S: user.username },
            "password": { S: user.password }
            // "userId":  user.userId ,
            // "name": { S: user.name },
            // "email": { S: user.email },
            // "username": { S: user.username },
            // "password": { S: user.encryptedPW }
        }
    }

    const command = new PutItemCommand(params);
    try {
        const response = await dbclient.send(command);
        return true
    } catch (error) {
        console.error('There is an error saving user: ', error);
    }

    // return await docClient.send(command).promise().then(() => {
    //     return true;
    // }, error => {
    //     console.error('There is an error saving user: ', error)
    // });
}

const _register = register;
export { _register as register };