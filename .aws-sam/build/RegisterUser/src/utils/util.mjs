function buildResponse(statusCode, body) {
    return {
      statusCode: statusCode,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        'Access-Control-Allow-Origin' : "*",
        'Access-Control-Allow-Methods': "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT",
        'Content-Type': "application/json"
      },
      body: JSON.stringify(body)
    }
}
  
const _buildResponse = buildResponse;
export { _buildResponse as buildResponse };