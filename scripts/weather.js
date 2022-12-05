
/******wheather widgit*******/

// latitude & longitude variables
var posLat = localStorage['latitude'];
var posLong = localStorage['longitude'];
var hasLocation = posLat && posLong ? true : false;

function getLocation() {
    if (hasLocation) {
        return;
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            posLat = position.coords.latitude;
            posLong = position.coords.longitude;
            hasLocation = true;
            
            localStorage['latitude'] = posLat;
            localStorage['longitude'] = posLong;

            setTimeout(refreshData, 100);
        }, error);
    } else {
        error()
    }    
}

function error() {
    console.log("Location Unknown");
    var div = document.createElement('div');
    div.innerText ="Location Unknown, please enable location to get the current weather information";
    var widget = document.getElementById('widget');
    widget.innerHTML = "";
    widget.appendChild(div);
}

function getJSON(url,data){
    return new Promise(function(resolve,reject)
      {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onreadystatechange = function () {
          if (req.readyState == 4) {
            if(req.status == 200)
              resolve(req.responseText);
            else
              reject(Error(req.statusText));
          }
        };
        req.onerror = function() {
          reject(Error("network error"));
        };
        req.send(data);
      });
  };

function refreshData() {
    if (!hasLocation) {
        getLocation();
        return;
    }
    var lastRefresh = new Date(localStorage['last_refresh']);
    if (lastRefresh < new Date(new Date() - 3600000) || lastRefresh.getHours() != new Date().getHours()) {

        var x = getJSON("https://api.the-global-weather.com/weather/?lat="+posLat+"&lon="+posLong)
            .then(function(json) {
                localStorage['weather'] = json;
            });

        var y = getJSON("https://api.the-global-weather.com/data/?lat="+posLat+"&lon="+posLong)
            .then(function(json) {
                localStorage['forcast'] = json;
            });
        
        Promise.all([x, y]).then(function(){
            localStorage['last_refresh'] = new Date();

            drawWeatherWidget();
        });
        
    } else {
        drawWeatherWidget();
    }
}

function drawWeatherWidget() {
	
    var weather = JSON.parse(localStorage['weather']);
    var temp = Math.round((weather.main.temp + Number.EPSILON) * 10) / 10;
    var location = weather.weather[0].main + " in " + weather.name;
    var icon = weather.weather[0].icon;

    var weatherElement = document.createElement('div');
    weatherElement.setAttribute('class', 'widget-content widget-content-left');
    weatherElement.setAttribute('id', 'weather');
    weatherElement.innerHTML = "" +
"<div class=\"widget-top\">" +
"    <div class=\"widget-content widget-content-left\">" +
"    <i style=\"background: url(images/weather/" + icon + ".svg) no-repeat;background-size: contain;width: 57px;height: 57px;\"></i>" +
"    </div>" +
"    <div class=\"widget-content widget-content-right\">" +
"    <span class=\"temp\">" + temp + " <span class=\"small\">°F</span><br></span>" +
"    </div>" +
"</div>" +
"<div class=\"widget-bottom\">" + location + "</div>" +
"<div class=\"widget-buttons\"><button id='show_forcast' class=\"weather-more\">Show Forcast</button></div>" +
"<div class=\"widget-more\"></div>" +
"    "; 

    var widget = document.getElementById('widget');
    widget.innerHTML = "";
    widget.appendChild(weatherElement);

    document.getElementById('show_forcast').addEventListener("click", showForcast);
}

function showForcast() {
    event.stopPropagation();
    var obj = JSON.parse(localStorage['forcast']);

    var ul = document.createElement('ul');
    var count = 0;
    for (var i in obj.hourly) 
    {
        if (count++ >= 12) {
            continue;
        }
        var hour = obj.hourly[i];
        var date = new Date(hour.dt * 1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var formattedTime = hours + ':' + minutes.substr(-2);

        var li = document.createElement('li');
        li.innerHTML = "<div></div> <div class=\"time\">" + formattedTime + "</div>" +
        "<div class=\"icon\">" +
        "<i alt=\"" + hour.weather[0].description + "\" style=\"background: url(images/weather/" + hour.weather[0].icon + ".svg) no-repeat;background-size: contain; display: inline-block; width: 57px; height: 57px;\"></i>" +
        "</div>" +
        "<div class=\"tmp\">" + Math.round((hour.temp + Number.EPSILON) * 10) / 10 + " <span class=\"small\">°F</span></div>";
        
        ul.appendChild(li);
    }
    var more = document.querySelector('.widget-more');
    more.innerHTML = "<div class=\"container\"><h2>Hourly Forcast</h2><div class=\"hourly\"></div><h2>Forcast</h2><div class=\"daily\"></div></div>";
    
    var hourly = more.querySelector('.container .hourly');
    hourly.appendChild(ul);
    hourly.addEventListener('wheel', function(event) {
        const toLeft  = event.deltaY < 0 && hourly.scrollLeft > 0
        const toRight = event.deltaY > 0 && hourly.scrollLeft < hourly.scrollWidth - hourly.clientWidth

        if (toLeft || toRight) {
            event.preventDefault()
            hourly.scrollLeft += event.deltaY
        }
    });


    var ul = document.createElement('ul');
    for (var i in obj.daily) 
    {
        if (i > 5) continue;
        var day = obj.daily[i];
        var date = new Date(day.dt * 1000);
        
        var li = document.createElement('li');
        li.innerHTML = "<div></div> <div class=\"time\">" + days[date.getDay()] + "</div>" +
        "<div class=\"icon\">" +
        "<i alt=\"" + day.weather[0].description + "\" style=\"background: url(images/weather/" + day.weather[0].icon + ".svg) no-repeat;background-size: contain; display: inline-block; width: 57px; height: 57px;\"></i>" +
        "</div>" +
        "<div class=\"tmp\">" + Math.round((day.temp.max + Number.EPSILON) * 10) / 10 + " <span class=\"small\">°F</span><br/><span style=\"color: #bababa\">" + Math.round((day.temp.min + Number.EPSILON) * 10) / 10 + " <span class=\"small\">°F</span></span></div>";
        
        ul.appendChild(li);
    }
    more.querySelector('.container .daily').appendChild(ul);
    open = true;
}
var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
var open = false;
function close() {
    if (open) {
        open = false;

        var more = document.querySelector('.widget-more');
        more.innerHTML = "";
    }
}

document.onclick = close;

refreshData();
