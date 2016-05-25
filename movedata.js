var data = require('promised-rest-client')({
    url: 'http://services.faa.gov/'
});

var refocus = require('promised-rest-client')({
    url: 'http://refocus.internal.salesforce.com/'
});

var iataList = {};

function updateMessage(iata) {
    data.get({
        url: 'airport/status/' + iata
        , qs: {
            format: 'application/json'
        }
    }).then(function (resp) {
        refocus.post({
            url: 'v1/samples/upsert'
            , body: {
                "name": iataList[resp.IATA].sample
                 , "messageCode": resp.status.reason.substr(0,5)
                , "messageBody": resp.status.reason + " // " + resp.status.type
            }
        });
    }).catch(function (resp) {
        console.log("Error: " + resp.message);
    });
}


data.get({
    url: 'airport/list'
    , qs: {
        format: 'application/json'
    }
}).then(function (resp) {
    for (i = 0; i < resp.length; i++) {
        var state = resp[i].STATE.replace(/\s/g, '');
        var stateAbsolutePath = "Salesforce.Demos.Airports";
        var stateSubject = {
            isPublished: true
            , name: state
            , parentAbsolutePath: stateAbsolutePath
        };

        var city = resp[i].CITY.replace(/[^a-zA-Z]/g, '');
        var cityAbsolutePath = stateAbsolutePath + "." + state;
        var citySubject = {
            isPublished: true
            , name: city
            , parentAbsolutePath: cityAbsolutePath
        };

        var iata = resp[i].IATA;

        var airport = iata;
        var airportAbsolutePath = cityAbsolutePath + "." + city;
        var airportSubject = {
            isPublished: true
            , name: airport
            , parentAbsolutePath: airportAbsolutePath
        };

        /*	
        refocus.post({
            url: 'v1/subjects'
            , body: stateSubject
        });

        refocus.post({
            url: 'v1/subjects'
            , body: citySubject
        });

        refocus.post({
            url: 'v1/subjects'
            , body: airportSubject
        });
	*/

        //if there is a delay then get the details
        var hasDelay = "true";
        if (resp[i].DELAYCOUNT > 0) {
            hasDelay = "false";
        }

        var airportSubjectPath = airportSubject.parentAbsolutePath + "." + airportSubject.name;
        var links = [{
            "name": airportSubject.name + " Delays"
            , "url": resp[i].URI + "?format=application/json"
        }];
        var sampleName = airportSubjectPath + "|AIRPORTDELAY";
        var sampleUpsertBody = {
            "name": sampleName
            , "relatedLinks": links
            , "value": hasDelay
        };
        refocus.post({
            url: 'v1/samples/upsert'
            , body: sampleUpsertBody
        });

        if (hasDelay == "false") {
            iataList[iata] = {
                "sample": sampleName
            };
        }

    }
}).then(function (resp) {
    for (iata in iataList) {
        updateMessage(iata);
    }
}).catch(function (err) {
    console.error(err);
})