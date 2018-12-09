// Options
const CLIENT_ID = '724027028949-hspc4h146jsa3hhtkoeitupdtq7pf2rd.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

/*Grab stuff from the DOM*/
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const countryForm = document.getElementById('country-form');
const countryInput = document.getElementById('country-input');
const videoContainer = document.getElementById('video-container');
const jumbo = document.getElementById('jumbo');
const initial = document.getElementById('initial');

let selectOptions = document.getElementById('sort-options');
let sortIndex = 2;
if (selectOptions != undefined)
    sortIndex = document.getElementById('sort-options').value;


const defaultCountry = 'India';
let countryCode = 'IN';
let country = 'India';
// Form submit and change country
window.onload = function() {
    country = localStorage.getItem("current_country");
    if (country !== null || country!== undefined){
      $('country-input').val(country);
    } 
    else{
        $('country-input').val(defaultCountry);
    }
}


countryForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('Done')
    country = countryInput.value;
    countryCode = getCountryCode(country);
    console.log(countryCode);
    if (!countryCode){
        country='India';
        countryCode='IN';
    }
    getTrendingVideos(country, countryCode);
});

//Funtion to get a country code
function getCountryCode(country) {
    for (let i = 0; i < countryList.length; i++) {
        if (countryList[i]['snippet'].name.toLowerCase() == country.toLowerCase())
            return countryList[i]['snippet'].gl;
    }
}

// Load auth2 library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}


// Init API client library and set up sign in listeners
function initClient() {
    gapi.client
        .init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        })
        .then(() => {
            // Listen for sign in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle initial sign in state
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        initial.style.display = 'none';
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        jumbo.style.display = 'none';
        /*If logged in API calls are made to fetch video data */
        getTrendingVideos(country, countryCode);
    } else {
        initial.style.display = 'block';
        jumbo.style.display = 'block';
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';
    }
}

// Handle login
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

// Display country data
function showcountryData(data) {
    const countryData = document.getElementById('country-data');
    countryData.innerHTML = data;
}


function getTrendingVideos(country, countryCode) {
    console.log(country, countryCode);
    defineVideoRequest(countryCode);

}

function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
        var value = properties[p];
        if (p && p.substr(-2, 2) == '[]') {
            var adjustedName = p.replace('[]', '');
            if (value) {
                normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
        }
    }
    for (var p in normalizedProps) {
        // Leave properties that don't have values out of inserted resource.
        if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            var propArray = p.split('.');
            var ref = resource;
            for (var pa = 0; pa < propArray.length; pa++) {
                var key = propArray[pa];
                if (pa == propArray.length - 1) {
                    ref[key] = normalizedProps[p];
                } else {
                    ref = ref[key] = ref[key] || {};
                }
            }
        };
    }
    return resource;
}

function removeEmptyParams(params) {
    for (var p in params) {
        if (!params[p] || params[p] == 'undefined') {
            delete params[p];
        }
    }
    return params;
}

function executeRequest(request) {
    console.log(request);
    request.execute(function(response) {
        //This is where we call the function for displaying videos
        console.log(response);
        localStorage.setItem('response_object', JSON.stringify(response));
        localStorage.setItem('current_country', country);
        //let responseResult = response.items[0].snippet.title;
        //console.log(responseResult);
        displayResponse(response);

    });
}

function buildApiRequest(requestMethod, path, params, properties) {
    params = removeEmptyParams(params);
    var request;
    if (properties) {
        var resource = createResource(properties);
        request = gapi.client.request({
            'body': resource,
            'method': requestMethod,
            'path': path,
            'params': params
        });
    } else {
        request = gapi.client.request({
            'method': requestMethod,
            'path': path,
            'params': params
        });
    }
    //If the country is same then no need to execute request
    if (localStorage.getItem('current_country') == country) {
        //console.log(localStorage.getItem('current_country'));
        //console.log(JSON.parse(localStorage.getItem('response_object')).items[0].snippet['publishedAt']);
        let response = JSON.parse(localStorage.getItem('response_object'));
        displayResponse(response);
        console.log('API DISABLED');

    } else
        executeRequest(request);
}

function displayResponse(response){
        sortIndex = document.getElementById('sort-options').value;
        if (response) {
            //Sort by number of likes
            if(sortIndex == 3){
                console.log('dsdasads');
                let output = `<br><h4 class="center-align">Top trending videos in ${country} sorted by likes</h4>`;
                let like_id_map=new Map();
                for (let i = 0; i < response.items.length; i++) {
                    let likes = response.items[i].snippet["statistics"]["likeCount"];
                    let videoId = response.items[i].id;
                    like_id_map.set(likes, videoId);
                    console.log(response.items[i].snippet['title']+" "+likes);
                }
                //Sort the map by key
                let sorted_map = new Map([...like_id_map.entries()].sort());
                //console.log(sorted_map);
                for (let [key, value] of sorted_map) {
                    let id = value;
                    //console.log(key);
                    if (id) {
                        output += `
            <div class="col s3">
            <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
          `;
                    }
                }
                // Output videos
                videoContainer.innerHTML = output;

            }
            //Deafult option
            else if (sortIndex == 0 || sortIndex == null) {
                let output = `<br><h4 class="center-align">Top trending videos in ${country}</h4>`;
                // Loop through videos and append output
                for (let i = 0; i < response.items.length; i++) {
                    const videoId = response.items[i].id;
                    if (videoId) {
                        output += `
            <div class="col s3">
            <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
          `;
                    }
                }
                // Output videos
                videoContainer.innerHTML = output;
            } else if (sortIndex == 1) { //Sort by name
                let output = `<br><h4 class="center-align">Top trending videos in ${country}</h4>`;
                let name_id_map = new Map(); //Create a map of id and name
                for (let i = 0; i < response.items.length; i++) {
                    let name = response.items[i].snippet['title'];
                    let videoId = response.items[i].id;
                    name_id_map.set(name, videoId);
                }

                //Sort the map by key
                let sorted_map = new Map([...name_id_map.entries()].sort());
                //console.log(sorted_map);
                for (let [key, value] of sorted_map) {
                    let id = value;
                    //console.log(key);
                    if (id) {
                        output += `
            <div class="col s3">
            <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
          `;
                    }
                }
                // Output videos
                videoContainer.innerHTML = output;

            } else { //Sort by published date
                let output = `<br><h4 class="center-align">Top trending videos in ${country}</h4>`;
                let date_id_map = new Map(); //Create a map of date and id
                for (let i = 0; i < response.items.length; i++) {
                    let date = response.items[i].snippet['publishedAt'];
                    let videoId = response.items[i].id;
                    date_id_map.set(date, videoId);
                }

                //Sort the map by key
                let sorted_map = new Map([...date_id_map.entries()].sort());
                //console.log(sorted_map);
                for (let [key, value] of sorted_map) {
                    let id = value;
                    //console.log(key);
                    if (id) {
                        output += `
            <div class="col s3">
            <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
          `;
                    }
                }
                // Output videos
                videoContainer.innerHTML = output;
            }
        }
        else {
            defineVideoRequest('IN');
            //videoContainer.innerHTML = 'No Uploaded Videos';
        }
}

function defineVideoRequest(countryCode) {
    buildApiRequest('GET', '/youtube/v3/videos', {
        'part': 'snippet,contentDetails,statistics',
        'chart': 'mostPopular',
        'regionCode': countryCode,
        'maxResults': '20'
    });

}


