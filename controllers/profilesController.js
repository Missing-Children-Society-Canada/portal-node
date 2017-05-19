'use strict';

/*
 * Profiles list.
 */
const DocumentDBClient = require('documentdb').DocumentClient;
const config = {
    CollLink: 'dbs/reporting/colls/events',
    Host: process.env.DocDb_Host,
    AuthKey: process.env.DocDb_AuthKey,
};

// Gets the full name from the event
function getNameFromEvent(event) {
    switch(event.response.platform.toLowerCase()) {
        case 'instagram':
            return event.response.data.full_name;
        case 'facebook':
            return event.response.data.first_name + ' ' + event.response.data.last_name;
        case 'twitter':
            return event.response.data.name;
        default:
            return "unknown";
    }
}

// Gets the users profile photo from the event
function getUserPhotoFromEvent(event) {
    switch(event.response.platform.toLowerCase()) {
        case 'instagram':
            return event.response.data.profile_picture;
        case 'facebook':
            return event.response.data.picture.data.url;
        case 'twitter':
            // by removing '_normal' you get a much higher resolution image from Twitter
            return event.response.data.profile_image_url.replace('_normal.', '.');
        default:
            return null;
    }
}

// Gets the users birthday from the event
function getUserBirthdayFromEvent(event) {
    if (event.response.platform.toLowerCase() === 'facebook') {
        return event.response.data.birthday;
    }

    if (event.user && event.user.facebook && event.user.facebook.birthday) {
        return event.user.facebook.birthday;
    }

    return null;
}

// Gets the users gender from the event
function getUserGenderFromEvent(event) {
    if (event.user && event.user.facebook && event.user.facebook.gender) {
        return event.user.facebook.gender;
    }

    return null;
}

// Gets the users twitter hande from the event
function getTwitterHandleFromEvent(event) {
    if (event.user && event.user.twitter && event.user.twitter.username) {
        return event.user.twitter.username;
    }

    return null;
}


// Gets the users instagram hande from the event
function getInstagramHandleFromEvent(event) {
    if (event.user && event.user.instagram && event.user.instagram.username) {
        return event.user.instagram.username;
    }

    return null;
}

// Gets the users instagram hande from the event
function getFacebookHandleFromEvent(event) {
    if (event.user && event.user.facebook && event.user.facebook.$id) {
        return event.user.facebook.$id;
    }

    return null;
}

function assignIfNotNull(object, parameter, value, replace = true) {
    if (value != null && value !== "" && replace === true) {
        object[parameter] = value;
    }
}

function getProfiles() {
    return new Promise(function(resolve, reject) {
      let data = [];

      const docDbClient = new DocumentDBClient(config.Host, { masterKey: config.AuthKey });
      const query = 'SELECT * FROM c WHERE c.response.type =\'profile\' ORDER BY c.triggeredOn DESC';
      const options = {
          enableCrossPartitionQuery: true
      }
      docDbClient.queryDocuments(config.CollLink, query, options).toArray(function (err, results) {
          let profiles = {};
          results.forEach(function (event) {
              let userid = event.user.id;
              
              let profile = profiles[userid] || {
                  id: userid,
                  eventCount: 0,
                  mostRecentPlatform: event.response.platform,
                  triggeredOn: event.triggeredOn,
                  name: getNameFromEvent(event),
                  photo: getUserPhotoFromEvent(event),
                  birthday: null,
                  social: {}
              };

              profile.eventCount++;

              assignIfNotNull(profile, 'gender', getUserGenderFromEvent(event));
              assignIfNotNull(profile, 'birthday', getUserBirthdayFromEvent(event));
              assignIfNotNull(profile.social, 'twitter', getTwitterHandleFromEvent(event));
              assignIfNotNull(profile.social, 'instagram', getInstagramHandleFromEvent(event));
              assignIfNotNull(profile.social, 'facebook', getFacebookHandleFromEvent(event));

              profiles[userid] = profile;
          });

          // convert to array
          let profileArray = [];
          for (var key in profiles) {
              profileArray.push(profiles[key]);
          }

          resolve(profileArray);
      });
    });
}

exports.list = function(req, res){
  var profiles = getProfiles().then(function(profiles) {
    res.json(profiles);
  });
};
