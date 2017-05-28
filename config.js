
exports.creds = {
  identityMetadata: process.env.AADTenant || 'https://login.microsoftonline.com/6044a321-e0b8-4797-8651-e2722761fad9/.well-known/openid-configuration',
  clientID: process.env.AADClient_ID || '08db5440-cada-4a70-a224-a2b8024d2cab',
  responseType: 'code id_token',
  responseMode: 'form_post',
  redirectUrl: process.env.RedirectUrl || 'http://localhost:3000/auth/openid/return',
  allowHttpForRedirectUrl: true,
  clientSecret: process.env.ClientSecret || 'o9hfEmFr5NzAeHvPWJNkR2q',
  validateIssuer: true,
  issuer: null,
  passReqToCallback: false,
  useCookieInsteadOfSession: true,
  cookieEncryptionKeys: [
    { 'key': '12345678901234567890123456789012', 'iv': '123456789012' }
  ],
  scope: null,
  loggingLevel: 'info',
  nonceLifetime: 3600,
  nonceMaxAmount: 5,
  clockSkew: null,
};

exports.resourceURL = 'https://graph.windows.net';
exports.destroySessionUrl = process.env.DestroySessionUrl || 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=http://localhost:3000';
exports.useMongoDBSessionStore = false;
exports.databaseUri = process.env.DataStore;
exports.mongoDBSessionMaxAge = 24 * 60 * 60;
exports.Port = process.env.PORT || 3000;

// Configuration required for DocumentDB
exports.docDB = {
  Host: process.env.DocDb_Host,
  AuthKey: process.env.DocDb_AuthKey
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

validateConfig(exports.docDB.Host, "DocDb_Host");
validateConfig(exports.docDB.AuthKey, "DocDb_AuthKey");
validateConfig(exports.notifyPoliceUrl, "NotifyPoliceUrl");
validateConfig(exports.validateTokenUrl, "validateTokenUrl");