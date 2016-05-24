var refocus = require('promised-rest-client')({
    url: 'http://refocus.internal.salesforce.com/'
});

// Setup API
var DisneyAPI = require("wdwjs");

var MagicKingdom = new DisneyAPI.DisneylandMagicKingdom();

// Get Magic Kingdom wait times
MagicKingdom.GetWaitTimes(function (err, data) {
    if (err)
        return console.error("Error fetching Magic Kingdom wait times: " + err);

    for (index in data) {
        var rideAbsolutePath = "Salesforce.Demos.DisneyLand";
        var rideName = data[index].name.replace(/[^a-zA-Z]/g, '');

        var rideSubject = {
            isPublished: true
            , name: rideName
            , parentAbsolutePath: rideAbsolutePath
        };

        refocus.post({
            url: 'v1/subjects'
            , body: rideSubject
        });

        //if there is a delay then get the details
        var waitTime = data[index].waitTime;
        var rideSubjectPath = rideAbsolutePath + "." + rideName;

        var sampleUpsertBody = {
            "name": rideSubjectPath + "|RIDEWAITTIME"
            , "value": waitTime.toString()
        };
        refocus.post({
            url: 'v1/samples/upsert'
            , body: sampleUpsertBody
        }).catch(function(resp){
            console.log("Error upserting...");
            console.log(sampleUpsertBody);
        });
    }
});