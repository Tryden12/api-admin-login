import { SSMClient, ListAssociationsCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient()
const env = process.env.ENV
const project = process.env.PROJECT

export async function getSecretString(name) {
  const params = {
    Name: `/${project}/${env}/${name}`,
    WithDecryption: true,
  }

  return (await ssm.getParameter(params).promise()).Parameter.Value
}