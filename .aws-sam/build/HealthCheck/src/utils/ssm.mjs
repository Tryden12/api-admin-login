import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient()
const env = process.env.ENV
const project = process.env.PROJECT
const module = process.env.MODULE

async function getSecretString(name) {
  const params = {
    Name: `/${project}/${env}/${module}/${name}`,
    WithDecryption: true,
  }

  const command = new GetParameterCommand(params)
  try {
    const response = await client.send(command);
    return response.Parameter.Value
  } catch (error) {
      console.error('There is an error saving user: ', error);
  }
}

const _getSecretString = getSecretString;
export { _getSecretString as getSecretString };