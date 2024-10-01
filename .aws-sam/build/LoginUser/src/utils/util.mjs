function buildResponse(statusCode, body) {
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin' : '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
}
  
const _buildResponse = buildResponse;
export { _buildResponse as buildResponse };