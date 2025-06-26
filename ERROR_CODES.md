# API Error Codes Reference

## Standard Error Codes
| Code | Description | HTTP Status | Possible Causes | Resolution |
|------|-------------|-------------|-----------------|------------|
| `NOT_FOUND` | Requested resource not found | 404 | Invalid ID, Deleted resource | Verify resource ID exists |
| `INVALID_INPUT` | Invalid request parameters | 400 | Missing fields, Invalid formats | Check request body schema |
| `CONFLICT` | Resource state conflict | 409 | Constraint violations | Check dependent resources |
| `SERVER_ERROR` | Internal server error | 500 | Unexpected failure | Retry or report issue |

## Implementation Examples
```graphql
# Sample error response
{
  "errors": [{
    "message": "Team not found",
    "extensions": {
      "code": "NOT_FOUND",
      "teamId": "123"
    }
  }]
}
```

## Resolver Error Handling
```javascript
// Throwing specific error
throw new ApolloError('Team not found', 'NOT_FOUND', { teamId });

// Input validation
throw new UserInputError('Invalid birth year', {
  invalidArgs: ['foundedYear'],
  validRange: '1800-current'
});
```

## Troubleshooting Guide
1. Check error code in response extensions
2. Verify input types match schema
3. Confirm resource IDs exist
4. Retry with simpler query if timeout
## Error Codes

### NOT_FOUND (404)
- Description: Resource not found
- Example: `Team not found`, `Player not found`

### INVALID_INPUT (400)
- Description: Invalid or missing input parameters
- Example: `Team name must be at least 3 characters`, `Player age must be between 16 and 50`

### CONFLICT (409)
- Description: Conflict in request parameters
- Example: `Cannot delete team with players`, `A team cannot play against itself`

### INVALID_TRANSFER (400)
- Description: Invalid transfer operation
- Example: `Player is not part of the source team`, `Transfer fee must be a positive number`