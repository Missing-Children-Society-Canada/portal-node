
exports.creds = {
  identityMetadata: process.env.AADTenant,
  clientID: process.env.AADClient_ID,
  responseType: 'code id_token',
  responseMode: 'form_post',
  redirectUrl: process.env.RedirectUrl,
  allowHttpForRedirectUrl: true,
  clientSecret: process.env.ClientSecret,
  validateIssuer: true,
  issuer: null,
  passReqToCallback: false,
  useCookieInsteadOfSession: true,
  cookieEncryptionKeys: [
    { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
    { 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
  ],
  scope: null,
  loggingLevel: 'info',
  nonceLifetime: null,
  nonceMaxAmount: 5,
  clockSkew: null,
};

exports.resourceURL = 'https://graph.windows.net';
exports.destroySessionUrl = process.env.DestroySessionUrl || 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=http://localhost:3000';
exports.useMongoDBSessionStore = true;
exports.databaseUri = process.env.DataStore || 'mongodb://missingchildrendata:agHqTdTA7xaIlSEnaVU63O0sFCnrSZuZHYcBLLoUgeyPCYC5qYSSFca7eMGbqRFmPaAPeaakJmMxYSy0OvxHog==@missingchildrendata.documents.azure.com:10250/king?ssl=true&sslverifycertificate=false';
exports.mongoDBSessionMaxAge = 24 * 60 * 60;
exports.Port = process.env.PORT || 3000;