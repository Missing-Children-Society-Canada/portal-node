'use strict';

var DocumentDBClient = require('documentdb').DocumentClient;

var Profile = function (config) {
    this.config = Object.assign({}, {
        CollLink: 'dbs/reporting/colls/events',
    }, config);
}

// Gets the full name from the event
Profile.prototype.getNameFromEvent = function (event) {
    switch (event.response.platform.toLowerCase()) {
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
Profile.prototype.getUserPhotoFromEvent = function (event) {
    switch (event.response.platform.toLowerCase()) {
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
Profile.prototype.getUserBirthdayFromEvent = function (event) {
    if (event.response.platform.toLowerCase() === 'facebook') {
        return new Date(event.response.data.birthday);
    }

    if (event.user && event.user.facebook && event.user.facebook.birthday) {
        return new Date(event.user.facebook.birthday);
    }

    return null;
}

// Gets the users gender from the event
Profile.prototype.getUserGenderFromEvent = function (event) {
    if (event.user && event.user.facebook && event.user.facebook.gender) {
        return event.user.facebook.gender;
    }

    return null;
}

// Gets the users gender from the event
Profile.prototype.getEmailFromEvent = function (event) {
    if (event.user && event.user.facebook && event.user.facebook.email) {
        return event.user.facebook.email;
    }

    return null;
}

// Gets the users twitter handle from the event
Profile.prototype.getTwitterHandleFromEvent = function (event) {
    if (event.user && event.user.twitter && event.user.twitter.username) {
        return event.user.twitter.username;
    }

    return null;
}


// Gets the users instagram handle from the event
Profile.prototype.getInstagramHandleFromEvent = function (event) {
    if (event.user && event.user.instagram && event.user.instagram.username) {
        return event.user.instagram.username;
    }

    return null;
}

// Gets the users instagram handle from the event
Profile.prototype.getFacebookHandleFromEvent = function (event) {
    if (event.user && event.user.facebook && event.user.facebook.$id) {
        return event.user.facebook.$id;
    }

    return null;
}

Profile.prototype.assignIfNotNull = function (object, parameter, value) {
    if (value != null && value !== "") {
        object[parameter] = value;
    }
}

Profile.prototype.extractTwitterSocialInformation = function (profile, event) {
    if (event.response.platform !== "twitter") {
        return;
    }

    this.ensureTwitterStatusAdded(profile, event.response.data.status, true);
}

Profile.prototype.ensureTwitterStatusAdded = function (profile, status, triggerStatus) {
    if (!profile.social.twitter.status) {
        profile.social.twitter.status = [];
    }

    // Do we already have this status?
    var uniqueStatus = true;
    profile.social.twitter.status.forEach((s) => {
        if (s.id === status.id) {
            uniqueStatus = false;
            return;
        }
    });

    if (uniqueStatus) {
        profile.social.twitter.status.push({
            id: status.id,
            id_str: status.id_str,
            text: status.text,
            createdAt: new Date(status.created_at),
            // Source is a link to download the app, we don't need that
            source: status.source.replace(/<[^>]*>/g, ""),
            geo: status.geo,
            coordinates: status.coordinates,
            place: {
                type: status.place ? status.place.place_type : null,
                name: status.place ? status.place.full_name : null,
                country: status.place ? status.place.country : null
            },
            triggerStatus: triggerStatus
        });
    }
}

Profile.prototype.extractFacebookSocialInformation = function (profile, event) {
    if (event.response.platform !== "facebook") {
        return;
    }

    let data = event.response.data;
    if (!profile.social.facebook.status) {
        profile.social.facebook.posts = [];
    }
    // Do we already have this post?
    let postLookup = {};
    profile.social.facebook.posts.forEach((post) => {
        postLookup[post.id] = true;
    });

    data.posts.data.forEach((post) => {
        if (!postLookup[post.id]) {
            profile.social.facebook.posts.push({
                id: post.id,
                created_time: new Date(post.created_time),
                message: post.message,
                story: post.story
            });

            postLookup[post.id] = true;
        }
    });
}

Profile.prototype.extractInstagramSocialInformation = function (profile, event) {
    if (event.response.platform !== "instagram") {
        return;
    }

    // Do something for just the profile?
    if (event.response.type !== "media") {
        return;
    }
    this.ensureInstagramPostAdded(profile, event.response.data);
}

Profile.prototype.ensureInstagramPostAdded = function (profile, post) {
    if (!profile.social.instagram.posts) {
        profile.social.instagram.posts = [];
    }

    // Do we already have this status?
    var uniqueData = true;
    profile.social.instagram.posts.forEach((s) => {
        if (s.id === post.id) {
            uniqueData = false;
            return;
        }
    });

    if (uniqueData) {
        profile.social.instagram.posts.push({
            id: post.id,
            text: post.caption === undefined || post.caption === null ? '' : post.caption.text,
            // Convert to Milliseconds!
            createdAt: new Date(post.created_time*1000),
            source: post.link,
            image: post.images === undefined || post.images === null ? '' : post.images.standard_resolution.url,
            likes: post.likes === undefined || post.likes === null ? 0 : post.likes.count,
            location : post.location
        });
    }
}

// build user profile(s) for use on both the list and detail pages.
Profile.prototype.buildProfiles = function (events) {
    let profiles = {};

    events.forEach((event) => {
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

        this.assignIfNotNull(profile, 'email', this.getEmailFromEvent(event));
        this.assignIfNotNull(profile, 'gender', this.getUserGenderFromEvent(event));
        this.assignIfNotNull(profile, 'birthday', this.getUserBirthdayFromEvent(event));
        this.assignIfNotNull(profile.social.twitter, 'handle', this.getTwitterHandleFromEvent(event));
        this.assignIfNotNull(profile.social.instagram, 'handle', this.getInstagramHandleFromEvent(event));
        this.assignIfNotNull(profile.social.facebook, 'profile', this.getFacebookHandleFromEvent(event));

        // calculate age (source: http://stackoverflow.com/questions/4060004/calculate-age-in-javascript)
        if (profile.birthday) {
            var ageDifMs = Date.now() - profile.birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            profile.age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        profiles[userid] = profile;
    });

    return profiles;
}

Profile.prototype.addHistoricalStatuses = function (resolve, reject, profile, docDbClient) {
    var querySpec = {
        query: 'SELECT * FROM c WHERE c.response.type =\'media\' AND c.user.id = @id ORDER BY c.triggeredOn DESC', 
        parameters: [{name: '@id',  value: profile.id}]
    };

    const options = {
        enableCrossPartitionQuery: true
    };

    docDbClient.queryDocuments(this.config.CollLink, querySpec, options).toArray((err, results) => {

        results.forEach((event) => {
            if (event.response.platform === "twitter") {
                // Earlier documents during development don't include tweetHistoryData.
                if (event.response.data.tweetHistoryData) {
                    event.response.data.tweetHistoryData.statuses.forEach((status) => {
                        this.ensureTwitterStatusAdded(profile, status, false);
                    });
                }
            }
            if (event.response.platform === "instagram") {
                // Instagrams doesn't pull in a clump with the profile so each individual piece of media needs to be added
                if (event.response.data) {
                    // TODO: Add triggered information like Twitter?
                    this.ensureInstagramPostAdded(profile, event.response.data);
                }
            }
        });

        resolve(profile);
    });
}

Profile.prototype.getList = function () {
    return new Promise((resolve, reject) => {
        const docDbClient = new DocumentDBClient(this.config.Host, { masterKey: this.config.AuthKey });

        const query = 'SELECT * FROM c WHERE c.response.type =\'profile\' ORDER BY c.triggeredOn DESC';

        const options = {
            enableCrossPartitionQuery: true
        };

        docDbClient.queryDocuments(this.config.CollLink, query, options).toArray((err, results) => {
            let profiles = this.buildProfiles(results);

            // convert to array
            let profileArray = [];
            for (var key in profiles) {
                profileArray.push(profiles[key]);
            }

            resolve(profileArray);
        });
    });
}

Profile.prototype.get = function (id) {
    return new Promise((resolve, reject) => {
        const docDbClient = new DocumentDBClient(this.config.Host, { masterKey: this.config.AuthKey });

        var querySpec = {
            query: 'SELECT * FROM c WHERE c.response.type =\'profile\' AND c.user.id = @id ORDER BY c.triggeredOn DESC', 
            parameters: [{name: '@id',  value: id}]
        };

        const options = {
            enableCrossPartitionQuery: true
        };

        docDbClient.queryDocuments(this.config.CollLink, querySpec, options).toArray((err, results) => {
            // Build the core profile.
            let profiles = this.buildProfiles(results);

            let profile = profiles[id];

            if (!profile) {
                reject("Profile not found");
                return;
            }

            // Add triggering statuses to the profile.
            results.forEach((event) => {
                if (event.response.platform === "twitter") {
                    this.extractTwitterSocialInformation(profile, event);
                }
                else if (event.response.platform === "facebook") {
                    this.extractFacebookSocialInformation(profile, event);
                }
                else if (event.response.platform === "instagram") {
                    this.extractInstagramSocialInformation(profile, event);
                }
            });

            // Add historical statuses to the profile.
            // TODO: Add media too.
            this.addHistoricalStatuses(resolve, reject, profile, docDbClient);
        });
    });
}

module.exports = Profile;