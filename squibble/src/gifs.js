//Tenor API functions are mostly based on their documentation: https://tenor.com/gifapi/documentation

import './gifs.css';
import { useEffect, useState } from 'react'
export default function PreviewGif() {
    const [currentSearchTerm, setCurrentSearchTerm] = useState('')
    const [searchPageNum, setSearchPageNum] = useState(0)

    //URLs (img src) of the full "shareable" versions of the GIFs to be added to the canvas
    const [shareGif1, setShareGif1] = useState()
    const [shareGif2, setShareGif2] = useState()
    const [shareGif3, setShareGif3] = useState()
    const [shareGif4, setShareGif4] = useState()

    //Hide GIF results unless searching; reset page when changing search
    useEffect(() => {
        const pageCounter = document.getElementById('pageCounter');
        if (currentSearchTerm) {
            //var GIFsearchTerm={document.getElementById("GIFsearchbar").value}
            //setCurrentSearchTerm(GIFsearchTerm)
            grab_data(currentSearchTerm)
            setSearchPageNum(0)
            pageCounter.style.display = 'flex';
        } else if (!currentSearchTerm) {
            pageCounter.style.display = 'none';
            setSearchPageNum(0)
        }
      }, [currentSearchTerm])

      //Keep search pages in range 
      useEffect(() => {
        const backButton = document.getElementById('backButton');
        const forwardButton = document.getElementById('forwardButton');

        if (searchPageNum == 0) {
            console.log("why no work")
            backButton.style.visibility = 'hidden';
        }

        if (searchPageNum == 9) {
            forwardButton.style.visibility = 'hidden';
        }

        else {
            backButton.style.visibility = 'visible';
            forwardButton.style.visibility = 'visible';  
        }
        grab_data(currentSearchTerm)
        console.log(searchPageNum)
    }, [searchPageNum])


    return (
    <div className = "GIFsection">
    <input type="text" placeholder="Search for a GIF" id="GIFsearchbar" onChange={event => setCurrentSearchTerm(event.target.value)}></input>
    <br/>
    <div className="previewGIFContainer">
    <img id="preview_gif1" className="previewGIF" src="" alt="" style={{width: 100, verticalAlign: "top"}}/>
    <img id="preview_gif2" className="previewGIF" src="" alt="" style={{width: 100, verticalAlign: "top"}}/>
    <img id="preview_gif3" className="previewGIF" src="" alt="" style={{width: 100, verticalAlign: "top"}}/>
    <img id="preview_gif4" className="previewGIF" src="" alt="" style={{width: 100, verticalAlign: "top"}}/>
    </div>
    <br/>
    <div id="pageCounter">
    <button id="backButton" onClick={() => setSearchPageNum(searchPageNum-1)}>Back</button>
    <div id="displayPageNum">Page {searchPageNum + 1}</div>
    <button id="forwardButton" onClick={() => setSearchPageNum(searchPageNum+1)}>More</button>
    </div>
    </div>
    )


// url Async requesting function
async function httpGet(theUrl, callback)
{
    // create the request object
    var xmlHttp = new XMLHttpRequest();

    // set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            callback(xmlHttp.responseText);
        }
    }

    // open as a GET call, pass in the url and set async = True
    console.log(theUrl);
    xmlHttp.open("GET", theUrl, true);

    // call send with no params as they were passed in on the url string
    xmlHttp.send(null);

    return;
}

// callback for the top GIFs of search
function tenorCallback_search(responsetext)
{
    // Parse the JSON response
    var response_objects = JSON.parse(responsetext);

    //console.log(responsetext)

    const top_10_gifs = response_objects["results"];

    // load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (gif)
    if (0 <= searchPageNum <= 15) {
    document.getElementById("preview_gif1").src = top_10_gifs[0 + (4*searchPageNum)]["media_formats"]["nanogif"]["url"];
    document.getElementById("preview_gif2").src = top_10_gifs[1 + (4*searchPageNum)]["media_formats"]["nanogif"]["url"];
    document.getElementById("preview_gif3").src = top_10_gifs[2 + (4*searchPageNum)]["media_formats"]["nanogif"]["url"];
    document.getElementById("preview_gif4").src = top_10_gifs[3 + (4*searchPageNum)]["media_formats"]["nanogif"]["url"];

    setShareGif1(top_10_gifs[0 + (4*searchPageNum)]["media_formats"]["gif"]["url"]);
    setShareGif2(top_10_gifs[2 + (4*searchPageNum)]["media_formats"]["gif"]["url"]);
    setShareGif3(top_10_gifs[3 + (4*searchPageNum)]["media_formats"]["gif"]["url"]);
    setShareGif4(top_10_gifs[4 + (4*searchPageNum)]["media_formats"]["gif"]["url"]);
    }

    return;

}


// function to call the trending and category endpoints
function grab_data(search_term)
{
    // set the apikey and limit
    var apikey = "AIzaSyD8LHpYh7fz4LAEDcKJJNEfvXK17TJJarQ";
    var clientkey = "Squibble";
    var lmt = 50;

    // test search term
    //var search_term = document.getElementById("GIFsearchbar").value;

    // using default locale of en_US
    var search_url = "https://tenor.googleapis.com/v2/search?q=" + search_term + "&key=" +
            apikey +"&client_key=" + clientkey +  "&limit=" + lmt;

    httpGet(search_url,tenorCallback_search);

    // data will be loaded by each call's callback
    return;
}
}

