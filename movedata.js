var data = require('promised-rest-client')({
    url: 'http://services.faa.gov/'
})

data.get({
    url: 'airport/list'
    , qs: {
        format: 'application/json'
    }
}).then(function (resp) {
    for (i = 0; i < resp.length; i++) {
        console.log(resp[i].CITY + '-' + resp[i].STATE);
        var iata = resp[i].IATA;
        
        //if there is a delay then get the details
        if (resp[i].DELAYCOUNT > 0) {
            data.get({
                url: 'airport/status/' + iata
                , qs: {
                    format: 'application/json'
                }
            }).then(function (resp) {
                //push data to refocus
                console.log(resp);
            }).catch(function (err) {
                console.error(err);
            })
        }
    }
}).catch(function (err) {
    console.error(err);
})