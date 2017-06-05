# Missing Children Society of Canada

## Description
Portal for visualization of data, for the overview and individual profiles.

## Quick start
- Clone
- Configure environment variables
  - This project uses [dotenv](https://www.npmjs.com/package/dotenv) so you can place your environemnt variables in a `.env` file in the root (it will not be checked in)
- node server.js
- http://localhost:3000

### Configuration
* AADTenant: Azure AD Tenant
* AADClient_ID: Azure AD Client ID
* RedirectUrl: URL to bring user back to app
* ClientSecret: Azure AD Secret
* DestroySessionUrl: Azure AD Service, Session Destroyer
* DataStore: Cosmos DB Connection String
* DocDb_Host: Cosmos DB Host
* DocDb_AuthKey: Cosmos DB Authorization Key
* NotifyPoliceUrl: Service for sending Police a notification
* ValidateTokenUrl: Service for validating onetime use tokens