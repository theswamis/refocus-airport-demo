var refocus = require('promised-rest-client')({
    url: 'http://refocus-public.herokuapp.com/'
});

// Setup API
var DisneyAPI = require("wdwjs");

var MagicKingdom = new DisneyAPI.DisneylandMagicKingdom();

// Get Magic Kingdom wait times
MagicKingdom.GetWaitTimes(function (err, data) {
    if (err)
        return console.error("Error fetching Magic Kingdom wait times: " + err);

    for (index in data) {
        var rideAbsolutePath = "Disneyland";
        var rideName = data[index].name.replace(/[^a-zA-Z]/g, '').substr(0, 20);

        var rideSubject = {
            isPublished: true
            , name: rideName
            , parentAbsolutePath: rideAbsolutePath
        };
        
        /*
        refocus.post({
                url: 'v1/subjects'
                , body: rideSubject
            }).then(function (resp) {
                console.log('Subject inserted ', resp);
            })
            .catch(function (err) {
                console.error('There was an error inserting subjects: ', err);
            });
        */
        
        //if there is a delay then get the details
        var waitTime = data[index].waitTime;
        var rideSubjectPath = rideAbsolutePath + "." + rideName;

        var sampleUpsertBody = {
            "name": rideSubjectPath + "|RIDEWAITTIME"
            , "value": waitTime.toString()
            , "messageCode": waitTime.toString()
        };
        refocus.post({
            url: 'v1/samples/upsert'
            , body: sampleUpsertBody
        }).catch(function (resp) {
            console.log("Error upserting sample...");
            console.log(sampleUpsertBody);
        });
    }
});