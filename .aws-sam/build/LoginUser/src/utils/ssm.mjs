import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient()
const env = process.env.ENV
const project = process.env.PROJECT
const module = process.env.MODULE
const { JwtSsmParameterPath } = process.env

async function getSecretString() {

  const params = {
    Name: "/apr/dev/api-admin-login/jwt-secret",
    WithDecryption: false,
  }

  const command = new GetParameterCommand(params)
  try {
    const response = await client.send(command);
    return response.Parameter.Value
  } catch (error) {
      console.error(`There is an error fetching parameter from path ${parameterPath}: `, error);
  }
}

const _getSecretString = getSecretString;
export { _getSecretString as getSecretString };