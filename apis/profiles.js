'use strict';
var DocumentDBClient = require('documentdb').DocumentClient;

var Profile = function(config) {
  this.config = Object.assign({}, {
    CollLink: 'dbs/reporting/colls/events',
    }, config);
}

// Gets the full name from the event
Profile.prototype.getNameFromEvent = function(event) {
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
Profile.prototype.getUserPhotoFromEvent = function(event) {
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
Profile.prototype.getUserBirthdayFromEvent = function(event) {
    if (event.response.platform.toLowerCase() === 'facebook') {
        return new Date(event.response.data.birthday);
    }

    if (event.user && event.user.facebook && event.user.facebook.birthday) {
        return new Date(event.user.facebook.birthday);
    }

    return null;
}

// Gets the users gender from the event
Profile.prototype.getUserGenderFromEvent = function(event) {
    if (event.user && event.user.facebook && event.user.facebook.gender) {
        return event.user.facebook.gender;
    }

    return null;
}

// Gets the users twitter hande from the event
Profile.prototype.getTwitterHandleFromEvent = function(event) {
    if (event.user && event.user.twitter && event.user.twitter.username) {
        return event.user.twitter.username;
    }

    return null;
}


// Gets the users instagram hande from the event
Profile.prototype.getInstagramHandleFromEvent = function(event) {
    if (event.user && event.user.instagram && event.user.instagram.username) {
        return event.user.instagram.username;
    }

    return null;
}

// Gets the users instagram hande from the event
Profile.prototype.getFacebookHandleFromEvent = function(event) {
    if (event.user && event.user.facebook && event.user.facebook.$id) {
        return event.user.facebook.$id;
    }

    return null;
}

Profile.prototype.assignIfNotNull = function(object, parameter, value) {
     if (value != null && value !== "") {
         object[parameter] = value;
     }
 }

Profile.prototype.getList = function() {
    return new Promise((resolve, reject) => {
      let data = [];
      const docDbClient = new DocumentDBClient(this.config.Host, { masterKey: this.config.AuthKey });
      const query = 'SELECT * FROM c WHERE c.response.type =\'profile\' ORDER BY c.triggeredOn DESC';
      const options = {
          enableCrossPartitionQuery: true
      }
      docDbClient.queryDocuments(this.config.CollLink, query, options).toArray((err, results) => {
          let profiles = {};
          results.forEach((event) => {
              let userid = event.user.id;
              
              let profile = profiles[userid] || {
                  id: userid,
                  eventCount: 0,

                  mostRecentPlatform: event.response.platform,
                  triggeredOn: new Date(event.triggeredOn),
                  name: this.getNameFromEvent(event),
                  photo: this.getUserPhotoFromEvent(event),
                  birthday: null,
                  social: {
                      twitter: {},
                      facebook: {},
                      instagram: {}
                  }
              };

              profile.eventCount++;

              this.assignIfNotNull(profile, 'gender', this.getUserGenderFromEvent(event));
              this.assignIfNotNull(profile, 'birthday', this.getUserBirthdayFromEvent(event));
              this.assignIfNotNull(profile.social.twitter, 'handle', this.getTwitterHandleFromEvent(event));
              this.assignIfNotNull(profile.social.instagram, 'handle', this.getInstagramHandleFromEvent(event));
              this.assignIfNotNull(profile.social.facebook, 'profile', this.getFacebookHandleFromEvent(event));

              if (event.response.platform === "twitter") {
                let data = event.response.data;
                if (!profile.social.twitter.status) {
                    profile.social.twitter.status = [];
                }
                // Do we already have this status?
                var uniqueStatus = true;
                profile.social.twitter.status.forEach((status) => {
                    if (status.id === data.status.id) {
                        uniqueStatus = false;
                        return;
                    }
                });
                if (uniqueStatus) {
                    profile.social.twitter.status.push({
                        id: data.status.id,
                        id_str: data.status.id_str,
                        text: data.status.text,
                        createdAd: new Date(data.status.created_at),
                        // Source is a link to download the app, we don't need that
                        source: data.status.source.replace(/<[^>]*>/g, ""),
                        geo: data.status.geo,
                        coordinates: data.status.coordinates,
                        place: {
                            type: data.status.place ? data.status.place.place_type : null,
                            name: data.status.place ? data.status.place.full_name : null,
                            country: data.status.place ? data.status.place.country : null
                        }
                    });
                }
              }

              // calculate age (source: http://stackoverflow.com/questions/4060004/calculate-age-in-javascript)
              if (profile.birthday) {
                var ageDifMs = Date.now() - profile.birthday.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                profile.age = Math.abs(ageDate.getUTCFullYear() - 1970);
              }

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

Profile.prototype.get = function(id) {
    // TODO: refactor GetList to seperate profile creation, then direct query for a given profile
    return new Promise((resolve, reject) => {
        this.getList().then((profiles) => {
            profiles.forEach((profile) => {
                if (profile.id === id) {
                    console.log(JSON.stringify(profile, null, 4));
                    resolve(profile);
                }
            });
            reject("Profile not found");
        });
    });
}

module.exports = Profile;