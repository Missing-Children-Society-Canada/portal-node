# Missing Children Society of Canada

## Description
Portal for visualization of data, for the overview and individual profiles.

## Requirments / Setup

### Azure AD

* You must already have a valid Azure AD Tenant (the default one along with the default Directory provided with your Azure Subscription will do).
* You must [create a group in that directory](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-groups-create-azure-portal), I suggest using the name `MCSC-Portal-Users`
* Save the Group's id (aka the Object ID) for later
* Assign one or more users to this group, these will be the users that will be authorized to log into the portal

### Application Registration for AAD Authentication

If you have not yet created a "Converged Application" (aka Azure AD v2.0 endpoint for AAD sign on) you will need to follow these steps:

1. Navigate to https://apps.dev.microsoft.com/?deeplink=/appList
1. Click `New application registration`
    * NOTE:
      * Be sure to log in with a user that was created in the above Directory that you wish to have this created in.
      * The reason for this is the app is created in the DEFAULT directory of the logged in user, so this is an easy way to ensure the correct Directory is associated to this application.
      * DO NOT use a personal account (outlook, hotmail etc.)
      * I suggest creating an administrative user specific for the tenant and uses those credentials
          * E.g. "admin@<your_tenant>.onmicrosoft.com"
    * Use the naming convention: `MSCS Portal - <DEV/TEST/PROD>`
1. Click `Generate new password` and store it, you will be prompted to change this upon first login.
    * If you wish to change this right away, open a new InPrivate/InCognito browser, navigate to [porta.azure.com](https://portal.azure.com) and login with the new user, you will be prompted to change the password.
1. Click `Add Platform`
    * For `Redirect URLs` add `http://localhost:3000/auth/openid/return`
        * If this is for production, change localhost to the actual domain/subdomain being used.
    * For `Logout URL` add `http://localhost:3000/logout`
        * If this is for production, change localhost to the actual domain/subdomain being used.
1. Click `Save`

## Portal

### Quick start local development of the Portal
- Clone this repo locally

    git clone https://github.com/Missing-Children-Society-Canada/portal-node.git

- Configure environment variables below
    - This project uses [dotenv](https://www.npmjs.com/package/dotenv) so you can place your personal development environemnt variables in a `.env` file in the root (it will not be checked in as it is excluded in `.gitignore`).
- To run

        node server.js

- Navigate to http://localhost:3000

## Required Environment Variables

Use the below variables in your `.env` file or in your [Azure Web Application's App Settings](https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-configure).

    IdentityMetadata=<https://login.microsoftonline.com/{YOUR_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration>
    ClientID=<Your Azure Active Directory client id>
    ClientSecret=<This credential could be client secret or client assertion>
    RedirectUrl=<Reply URL registered in AAD for your app>
    DestroySessionUrl=<https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=http://localhost:3000>
    DocDbHost=<https://{DOC_DB_ACCOUNT_NAME}.documents.azure.com:443>
    DocDbAuthKey=<DOCUMENT_DB_READ_WRITE_ACCESS_KEY>
    NotifyPoliceUrl=<AZURE_FUNCTION_URL_FOR_API_NOTIFY_POLICE>
    ValidateTokenUrl=<AZURE_FUNCTION_URL_FOR_API_VALIDATE_TOKEN>
    RequiredAADGroupId=<AAD_DIRECTORY_GROUP_OBJECT_ID>


More details for the AAD Passport specific settings can be found in the [AAD Passport GitHub page](https://github.com/AzureAD/passport-azure-ad).

### Environment Variables Explained

#### IdentityMetadata

The metadata endpoint provided by the Microsoft Identity Portal that provides the keys and other important information at runtime. Example: `  https://login.microsoftonline.com/your_tenant_name.onmicrosoft.com/v2.0/.well-known/openid-configuration`

#### ClientID

The client ID of your application in AAD (Azure Active Directory). Can be located here: [https://apps.dev.microsoft.com/#/appList](https://apps.dev.microsoft.com/#/appList)

#### RedirectUrl

The openid return URL to continue the authentication process. For development use `http://localhost:3000/auth/openid/return`, however for production this should be `https` and point to the production applications domain.

#### ClientSecret

When you create an application in the [Application Registration Portal](https://apps.dev.microsoft.com/#/appList) you are provided the ability to create a `Password` (Found under Application Secrets).

#### DocDbHost

This is the URL for your DocumentDB instance where the profile data is queried. The portal expects a database called `reporting` and a collection called `events`.

#### DocDbAuthKey

A Read-Write Access key for the above Document DB host.

#### NotifyPoliceUrl

The secure Azure Function URL for the `NotifyPolice` API which allows for the emailing of profiles.

#### ValidateTokenUrl

The secure Azure Function URL for the `ValidateToken` API which allows for authorization validation to view a profile by token ID (instead of standard Passport login authentication).

#### RequiredAADGroupId

The AAD Directory Group id which the authenticated user must be a member of to pass authorization checks. If the user is authenticated (can log in), but is not a member of the configured group then they will be denied access (Status: 401).

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
