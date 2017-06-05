
exports.creds = {
  identityMetadata: process.env.IdentityMetadata, //v2 tenant-specific endpoint https://login.microsoftonline.com/your_tenant_name.onmicrosoft.com/v2.0/.well-known/openid-configuration
  clientID: process.env.ClientID,
  clientSecret: process.env.ClientSecret,
  responseType: 'code id_token',
  responseMode: 'form_post',
  redirectUrl: process.env.RedirectUrl || 'http://localhost:3000/auth/openid/return',
  allowHttpForRedirectUrl: true,
  validateIssuer: true,
  issuer: null,
  passReqToCallback: false,
  useCookieInsteadOfSession: true,
  cookieEncryptionKeys: [
    { 'key': process.env.cookieEncryptionKey, 'iv': process.env.cookieEncryptionIv }
  ],
  scope: ['profile', 'offline_access' ],
  loggingLevel: 'info',
  nonceLifetime: 3600,
  nonceMaxAmount: 5,
  clockSkew: null,
};

// Object Id of the Azure AD Group the user must be a member of to to access the portal
exports.requiredAADGroupId = process.env.RequiredAADGroupId;

exports.destroySessionUrl = process.env.DestroySessionUrl || 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=http://localhost:3000'
exports.databaseUri = process.env.DataStore;
exports.Port = process.env.PORT || 3000;
exports.AppInsights = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;

// Configuration required for DocumentDB
exports.docDB = {
  Host: process.env.DocDbHost,
  AuthKey: process.env.DocDbAuthKey
};

// Notification Function
exports.notifyPoliceUrl = process.env.NotifyPoliceUrl; // Azure Function Url for emailing police & generating access tokens
exports.validateTokenUrl = process.env.ValidateTokenUrl;

// Validate Config
var validateConfig = function (config, envKey, messageIfNotFound) {
  if (!config || config === "") {
    console.log(messageIfNotFound ? messageIfNotFound : "Error: process.env." + envKey + " not set, please set or see config.js.");
    process.exit(-1);
  }
}

// Validated required AAD/Passport config
validateConfig(exports.creds.identityMetadata, "IdentityMetadata");
validateConfig(exports.creds.clientID, "ClientID");
validateConfig(exports.creds.redirectUrl, "RedirectUrl");
validateConfig(exports.destroySessionUrl, "DestroySessionUrl");

// Validate required Documment DB config
validateConfig(exports.docDB.Host, "DocDbHost");
validateConfig(exports.docDB.AuthKey, "DocDbAuthKey");

// Validate required Azure Functions config
validateConfig(exports.notifyPoliceUrl, "NotifyPoliceUrl");
validateConfig(exports.validateTokenUrl, "ValidateTokenUrl");

// Validate required authorization config
validateConfig(exports.requiredAADGroupId, "RequiredAADGroupId");