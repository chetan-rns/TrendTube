# TrendTube

TrendTube is a web application that provides the latest trending youtube videos in a country.
TrendTube uses youtube v3 API to fetch the video information and handles user authentication using OAuth 2.0. A search box has been provided to get the input country and an API call is made from the client machine for the given country. Users can also sort the videos based on name and published date without making extra API calls. Web Storage has been used to cache the API responses and improve frontend performance.
## Technology:
1.HTML, CSS, Javascript, Youtube V3 API.

## Files:

1.index.html
- contains the HTML code for the main page of the website.

2.main.js
* contains the code for authentication and API calls.

## API Request:

``` 
GET https://www.googleapis.com/youtube/v3/videos?Parameters

```

## Usage:

* Open the project folder in the terminal and run the following command:

1.Python 2:

```
python -m SimpleHTTPServer 8080

```
2.Python 3:

```
python -m http.server 8080

```

* Open the local host in your browser:

```
localhost:8080
``` 

## Live deployment

You can find the deployed project at:

[TrendTube](https://trendtube.000webhostapp.com/)
