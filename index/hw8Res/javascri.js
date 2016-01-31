(function($,W,D)
{
var JQUERY4U = {};

JQUERY4U.UTIL =
{
setupFormValidation: function()
{
            
 $("#weatherform").validate({
       rules: {
             strAddr: "required",
             city: "required",
             state: {
						minlength: 1,
						required: true
					}
                },
    messages: {
       strAddr: " Please enter street address",
 city: " Please enter city name",
      state: {
      required: " Please select a state</div>",
      minlength: " Please select a state</div>"
      },
},
			
 submitHandler: function(form) {
 GetJSONfromPHP(0);
}
 });
}
}

    
    $(D).ready(function($) {
        JQUERY4U.UTIL.setupFormValidation();
    });

})(jQuery, window, document);

function GetJSONfromPHP(calls)
{
	  
if($("#weatherform").valid()){
                
$.ajax({
url: 'hw8Res/JSONSrc.php',
 data: {
 strAddr : $("#inputAddress").val(),
 city : $("#inputCity").val(),
 state : $("#inputState").val(),
 temperature : $('input[name=temperature]:checked').val()
 },
type: 'GET',
dataType: 'JSON',
success: function(JSONFeed){
                       
document.getElementById("maintab").style.visibility="visible";
document.getElementById("twotab").style.visibility="visible";
document.getElementById("threetab").style.visibility="visible";
    
document.getElementById("errorMsg").innerHTML="";
    
if(calls==0)
{

document.getElementById("maintab").className="active";
document.getElementById("threetab").className="";
document.getElementById("twotab").className="";
document.getElementById("basicMap").innerHTML="";
document.getElementById("maindiv").innerHTML='<div id="now" class="tab-pane fade in active"><div id="current" class="row col-xs-12 col-md-8"></div></div><div id="thisday" class="tab-pane fade " ><div id="day"  class="row col-xs-12 col-md-12"></div></div><div id="thisweek" class="container tab-pane fade"><div id="week"   ></div></div>';

RenderCurrentTable(JSONFeed);
createMap(JSONFeed.latitude, JSONFeed.longitude);
}
						
if(calls==1)
{
document.getElementById("basicMap").innerHTML="";
RenderDayTable(JSONFeed);
}
						
if(calls==2)
{
document.getElementById("basicMap").innerHTML="";
RenderWeekTable(JSONFeed);
}
},
error: function (jqXHR, textStatus, errorThrown) { resetWeatherForm();document.getElementById("errorMsg").innerHTML="Error! No Location Data available for the location.";}
});
}
}

function RenderCurrentTable(JSONFeed)
{
document.getElementById("day").innerHTML="";
document.getElementById("week").innerHTML="";

var tempUnit=" <sup><sup>o</sup>F</sup>";
	
	var Prec=1;
	if($('input[name=temperature]:checked', '#weatherform').val()=="si")
	{
		tempUnit=" <sup><sup>o</sup>C</sup>";
		WindUnit=" m/s"
		dewPointUnit=" <sup>o</sup>C";
		VisibUnit=" km";
		pressUnit=" hPa"
		Prec=25.4;
		dispUnit="C";
	}
	else if($('input[name=temperature]:checked', '#weatherform').val()=="us")
	{
		tempUnit=" <sup><sup>o</sup>F</sup>";
		WindUnit=" mph"
		dewPointUnit=" <sup>o</sup>F";
		Prec=1;
		VisibUnit=" mi";
		pressUnit=" mb"
		Prec=1;
		dispUnit="F";
	}
	
	var SunRiseTime=new Date(JSONFeed.daily.data[0].sunriseTime);
	SunRiseTime.setTime(JSONFeed.daily.data[0].sunriseTime*1000);

	var SunSetTime=new Date(JSONFeed.daily.data[0].sunsetTime);
	SunSetTime.setTime(JSONFeed.daily.data[0].sunsetTime *1000);
	
	var writehtml= '<div class="container-fluid currentTablebck">'+
		'<div class="row">'+
		'<div class="col-sm-6" >'+
		'<center><br/><br/>'+
							
	'<img src="http://cs-server.usc.edu:45678/hw/hw8/images/'+ FetchIcon(JSONFeed.currently.icon) + '" alt ="'+ JSONFeed.currently.summary +'" title ="'+ JSONFeed.currently.summary +'" width=30%; height=30%; /><br/><br/>'+
								'</center>'+
	'</div>'+
	'<div class="col-sm-6 col-xmI" >'+
	'<center>'+
	'<table align="center">'+
    '<tr>'+
	'<td colspan=2><span style="color:white;font-size:12px;"><b>' + JSONFeed.currently.summary + ' in ' + $("#inputCity").val() +', '+ $("#inputState").val() + '</b></span></td>'+
	'</tr>'+
	'<tr>'+		
	'<td colspan=2 style="color:white;"><h1><center><b>' +  Math.round(JSONFeed.currently.temperature) + tempUnit +'</b1></center></h1></td>'+
	'</tr>'+ 
	'<tr colspan="2">'+
	'<td ><span style="color:blue;">L: ' + Math.round(JSONFeed.daily.data[0].temperatureMin) + '<sup>o</sup> </span> <span style="color:green;"><span style="color:black;">| </span>H: 	'+ Math.round(JSONFeed.daily.data[0].temperatureMax) + '<sup>o</sup></span>' + 
    '<td><img  src="http://cs-server.usc.edu:45678/hw/hw8/images/fb_icon.png" title="Facebook Post" onclick="postToFeed(\'' + JSONFeed.currently.summary + '\',\'' + FetchIcon(JSONFeed.currently.icon) + '\',\'' + Math.round(JSONFeed.currently.temperature) + " &deg\;" + dispUnit + '\',\'' + $("#inputCity").val() +', '+ $("#inputState").val() + '\')" length="30" width="30" ></td>' +
	'</tr></table>'+
	'</center>'+
	'</div></div></div>'+
							
    '<div class="table-responsive"><table class="table table-striped current">'+
    '<tr><td>Precipitation</td><td>' + GetPrecip(JSONFeed.currently.precipIntensity,Prec) + '</td></tr>'+
	'<tr><td>Chance of Rain</td><td>' + Math.round(JSONFeed.currently.precipProbability)*100 + ' %</td></tr>'+
	'<tr><td>Wind Speed</td><td>' + (JSONFeed.currently.windSpeed).toFixed(2)+ WindUnit + ' </td></tr>'+
	'<tr><td>Dew Point</td><td>' + (JSONFeed.currently.dewPoint).toFixed(2) + dewPointUnit + '</td></tr>'+
	'<tr><td>Humidity</td><td>' + Math.round(JSONFeed.currently.humidity * 100) + ' %</td></tr>'+
	'<tr><td>Visibility</td><td>' + (JSONFeed.currently.visibility).toFixed(2) + VisibUnit + '</td></tr>'+
	'<tr><td>Sunrise</td><td>' + moment.tz(SunRiseTime, JSONFeed.timezone.toString()).format("hh:mm A")+ '</td></tr>'+
    '<tr><td>Sunset</td><td>' + moment.tz(SunSetTime, JSONFeed.timezone.toString()).format("hh:mm A") + '</td></tr>'+
	'</table>'+
	'</div>';

document.getElementById("current").innerHTML=writehtml;
document.getElementById("now").className="active";
								 

}
function RenderDayTable(JSONFeed)
{
	var tempUnit=" <sup>o</sup>F";
	document.getElementById("current").innerHTML="";
    document.getElementById("week").innerHTML="";
	var Prec=1;
	if($('input[name=temperature]:checked', '#weatherform').val()=="si")
	{
		tempUnit=" <sup>o</sup>C";
		WindUnit=" m/s"
		dewPointUnit=" <sup>o</sup>C";
		VisibUnit=" km";
		pressUnit=" hPa"
		Prec=25.4;
	}
	else if($('input[name=temperature]:checked', '#weatherform').val()=="us")
	{
		tempUnit=" <sup>o</sup>F";
		WindUnit=" mph"
		dewPointUnit=" <sup>o</sup>F";
		Prec=1;
		VisibUnit=" mi";
		pressUnit=" mb"
		Prec=1;
	}
	
	var HourlyTime=new Date();
					
var writehtml = '<div class="table-responsive"><table class="daily table table-striped "><tr style="color:white;"><th style="background-color: #3071A9;">Time</th><th style="background-color: #3071A9;">Summary</th><th style="background-color: #3071A9;">Cloud Cover</th><th style="background-color: #3071A9;">Temp ('+ tempUnit +')</th><th style="background-color: #3071A9;">View Details</th></tr>';
		for(var i = 1; i < 25; i++) {
					
						HourlyTime.setTime(JSONFeed.hourly.data[i].time*1000);
	writehtml += '<tr><td>' + moment.tz(HourlyTime, JSONFeed.timezone.toString()).format("hh:mm A") + '</td><td>' + '<img src="http://cs-server.usc.edu:45678/hw/hw8/images/'+ FetchIcon(JSONFeed.hourly.data[i].icon ) + '" alt ="'+ JSONFeed.hourly.data[i].summary +'" title ="'+ JSONFeed.hourly.data[i].summary  +'" width=90px; height=80px; style="display:block;" /></td><td>' + (JSONFeed.hourly.data[i].cloudCover * 100).toFixed(0) + ' %</td><td>' + JSONFeed.hourly.data[i].temperature + '</td><td><span class="glyphicon glyphicon-plus" data-toggle="collapse" data-target="#viewDetail'+ i +'" aria-expanded="false" aria-controls="viewDetail'+ i +'" aria-hidden="true"></span></td></tr>';
								writehtml += '<tr class="collapse" id="viewDetail'+ i +'"><td colspan="5">';
								writehtml += '<div class="table-responsive"><table class="table table-striped"><tr><th>Wind</th><th>Humidity</th><th>Visibility</th><th>Pressure</th></tr>';
								writehtml += '<tr><td>' + (JSONFeed.hourly.data[i].windSpeed).toFixed(2) +WindUnit +'</td><td>' + Math.round(JSONFeed.hourly.data[i].humidity * 100) + ' %</td><td>' + (JSONFeed.hourly.data[i].visibility).toFixed(2) + VisibUnit +'</td><td>' + JSONFeed.hourly.data[i].pressure +pressUnit +'</td></tr>';
								writehtml += '</table></div>';
								writehtml += '</td></tr>';
		}	
								writehtml += '</table></div>';	
								$('#day').html(writehtml);
								 

}

function RenderWeekTable(JSONFeed)
{
	var tempUnit=" <sup>o</sup>F";
	document.getElementById("current").innerHTML="";
	document.getElementById("day").innerHTML="";
    
	var Prec=1;
	if($('input[name=temperature]:checked', '#weatherform').val()=="si")
	{
		tempUnit=" <sup>o</sup>C";
		WindUnit=" m/s"
		dewPointUnit=" <sup>o</sup>C";
		VisibUnit=" km";
		pressUnit=" hPa"
		Prec=25.4;
	}
	else if($('input[name=temperature]:checked', '#weatherform').val()=="us")
	{
		tempUnit=" <sup>o</sup>F";
		WindUnit=" mph"
		dewPointUnit=" <sup>o</sup>F";
		Prec=1;
		VisibUnit=" mi";
		pressUnit=" mb"
		Prec=1;
	}
	
var SunRiseTime=new Date();
var SunSetTime=new Date();

var writehtml = "",lastStr="";
							
writehtml="<div class='row ' style='padding:10px;' >";
var colorarray=["367BB2","EF414D","E28C55","A6A433","9572A2","F07C7D","BD4B6F"];

for(var j = 1; j < 8; j++) 
{
SunRiseTime.setTime(JSONFeed.daily.data[j].sunriseTime*1000);
SunSetTime.setTime(JSONFeed.daily.data[j].sunsetTime *1000);

var icon7days = "";
	
switch(JSONFeed.daily.data[j].icon)
{
case 'clear-day': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/clear.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>";
            break;
case 'clear-night': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>";
            break;
case 'rain': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/rain.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
case 'snow': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/snow.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
case 'sleet': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
case 'wind': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/wind.png'title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
case 'fog':	icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/fog.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
case 'cloudy': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
case 'partly-cloudy-night':	icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;		 
case 'partly-cloudy-day': icon7days="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png' title='"+JSONFeed.daily.data[j].summary+"' length='35' width='55' style='display:block;align:center'>"; 
            break;
    }
								
var icon7days1 = "";
switch(JSONFeed.daily.data[j].icon)
{
case 'clear-day': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/clear.png' title='"+JSONFeed.daily.data[j-1].summary+"'  length='75' width='95' style='display:block;align:center'>";	
        break;
case 'clear-night': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'rain': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/rain.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'snow': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/snow.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'sleet': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'wind': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/wind.png'title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'fog':	icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/fog.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'cloudy': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'partly-cloudy-day': icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;
case 'partly-cloudy-night':	icon7days1="<img src='http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png' title='"+JSONFeed.daily.data[j].summary+"'  length='75' width='95' style='display:block;align:center'>"; 
        break;		 
								}
								
var visibility7Days = "N/A";					
if (JSONFeed.daily.data[j].visibility != undefined) 
{
visibility7Days = (JSONFeed.daily.data[j].visibility).toFixed(2) + VisibUnit;
}
							
								
writehtml += '<div class="row col-xs-12 col-sm-12 col-md-2 col-lg-2" style="top:-8px;left:3px;background-color:#2E3337;"><center><div class="well" data-toggle="modal" style="background:#'+colorarray[j-1]+';z-index=1" data-target="#myModal'+j+'"><center><span style="color:white;"><b><span style="font-size:12px;>"' + getTimeStampDay(JSONFeed.daily.data[j].time) +'</span></b><br>'+ getTimeStampMonthDate(JSONFeed.daily.data[j].time) +'<br>'+ icon7days +'<br> Min <br> Temp <br><h2><b>'+ Math.round(JSONFeed.daily.data[j].temperatureMin) +'&deg</b></h2> Max <br> Temp <br><h2><b>'+ Math.round(JSONFeed.daily.data[j].temperatureMax) + '&deg</b></h2></span></center></div></center></div>';
								
writehtml += '<div class="modal fade" id="myModal'+j+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">';
writehtml += '<div class="modal-dialog" role="document">';
writehtml += '<div class="modal-content">';
writehtml += '<div class="modal-header">';
writehtml += '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
writehtml += '<h4 class="modal-title" id="myModalLabel">Weather in '+ $("#inputCity").val() + ' on ' + getTimeStampMonthDate(JSONFeed.daily.data[j].time) +'</h4>';
writehtml += '</div>';
writehtml += '<div class="modal-body"><center>';
writehtml += icon7days1 + '<br><h3>' + getTimeStampDay(JSONFeed.daily.data[j].time) + ':<span style="color:orange;">' + JSONFeed.daily.data[j].summary+"</span></h3>";
writehtml += '<table class="table">';
writehtml += '<tr><th>Sunrise Time</th><th>Sunset Time</th><th>Humidity</th></tr>';
writehtml += '<tr><td>' + moment.tz(SunRiseTime, JSONFeed.timezone.toString()).format("hh:mm A") + '</td><td>' + moment.tz(SunSetTime, JSONFeed.timezone.toString()).format("hh:mm A") + '</td><td>' + Math.round(JSONFeed.daily.data[j].humidity * 100) + '%</td></tr>';
writehtml += '</table>';
writehtml += '<table class="table">';
writehtml += '<tr><th>Wind Speed</th><th>Visibility</th><th>Pressure</th></tr>';
writehtml += '<tr><td>' + (JSONFeed.daily.data[j].windSpeed).toFixed(2) + WindUnit+ '</td><td>' + visibility7Days + '</td><td>' + JSONFeed.daily.data[j].pressure + pressUnit+'</td></tr>';
writehtml += '</table>';							
writehtml += '</center></div>';
writehtml += '<div class="modal-footer">';
writehtml += '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';
writehtml += '</div>';
writehtml += '</div>';
writehtml += '</div>';
writehtml += '</div>';
}

writehtml += '<div class="col-xs-12 col-sm-12 col-md-2 col-lg-2"></div><div class="col-xs-12 col-sm-12 col-md-2 col-lg-2"></div><div class="col-xs-12 col-sm-12 col-md-2 col-lg-2"></div>';
writehtml+="</div >";
$('#week').html(writehtml);

document.getElementById("thisweek").className="active";    
}



function createMap(lat, lon)
{
document.getElementById("basicMap").innerHTML="";
var map = new OpenLayers.Map("basicMap");
var fromProjection = new OpenLayers.Projection("EPSG:4326"); 
var toProjection = new OpenLayers.Projection("EPSG:900913"); 
var position = new OpenLayers.LonLat(lon, lat).transform( fromProjection, toProjection);
var mapnik = new OpenLayers.Layer.OSM();
var layer_cloud = new OpenLayers.Layer.XYZ("clouds","http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png",
{
isBaseLayer: false,
opacity: 0.7,
sphericalMercator: true
}
);

var layer_precipitation = new OpenLayers.Layer.XYZ("precipitation","http://${s}.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png",
{
isBaseLayer: false,
opacity: 0.7,
sphericalMercator: true
}
);
map.addLayers([mapnik, layer_precipitation, layer_cloud]);
map.setCenter( position, 12 );
}


function FetchIcon(icon)
{
if(icon=="clear-day")
{
	return "clear.png";
}
else if(icon=="clear-night")
{
	return "clear_night.png";
}
else if(icon=="rain")
{
	return "rain.png";
}
else if(icon=="snow")
{
	return "snow.png";
}
else if(icon=="sleet")
{
	return "sleet.png";
}
else if(icon=="wind")
{
	return "wind.png";
}
else if(icon=="fog")
{
	return "fog.png";
}
else if(icon=="cloudy")
{
	return "cloudy.png";
}
else if(icon=="partly-cloudy-day")
{
	return "cloud_day.png";
}
else if(icon=="partly-cloudy-night")
{
	return "cloud_night.png";
}
return null;
}
			
function GetPrecip(precipIntensity,Prec)
{
var precipValue=parseFloat(precipIntensity);
precipValue/=Prec;
if(precipValue>=0 && precipValue<0.002)
{
return "None";
}
else if(precipValue>=0.002 && precipValue<0.017)
{
return "Very Light";
}
else if(precipValue>=0.017 && precipValue<0.1)
{
return "Light";
}
else if(precipValue>=0.1 && precipValue<0.4)
{
return "Moderate";
}
else if(precipValue>=0.4 )
{
return "Heavy";
}
return null;
}

function GetTime(hours,min)
{
var sign=" AM";
if(hours>12)
{
	hours-=12;
	sign=" PM";
}
else if(hours==0)
{
	hours=12;
	sign=" AM";
}
else if(hours==12)
{
	sign=" PM";
}
if((hours+"").length<2)
{
	hours="0"+hours;
}
if((min+"").length<2)
{
	min="0"+min;
}

return hours+":"+min+sign;
}

function getTimeStampMonthDate(dateTime) 
{
var d = new Date(dateTime * 1000);
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var date = d.getDate();
			
return monthNames[d.getMonth()] + " " + date;
}
			
function getTimeStampDay(dateTime)
{
var d = new Date(dateTime * 1000);
var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var n = weekday[d.getDay()];
return n;
}
			
function resetWeatherForm()
{
var validator = $('#weatherform').validate();
validator.resetForm();

document.getElementById("errorMsg").innerHTML="";    
document.getElementById("Fahr").checked=true;
document.getElementById("basicMap").innerHTML="";
document.getElementById("current").innerHTML="";
document.getElementById("day").innerHTML="";
document.getElementById("week").innerHTML="";
document.getElementById("maintab").style.visibility="hidden";
document.getElementById("twotab").style.visibility="hidden";
document.getElementById("threetab").style.visibility="hidden";
}


function postToFeed(summary,icon,temperature,citydetails)
{
FB.ui({
method: 'feed',
'link': "http://forecast.io",
'picture': 'http://cs-server.usc.edu:45678/hw/hw8/images/' +  icon,
'name': "Current Weather at " + citydetails,
'description': '' + summary + "\, "+ temperature 	
}, 
      
function(response) 
{
if (response && response.post_id) 
{
alert("Posted successfully!");
} 
else 
{
alert("The post was not published.");
} 
});
}
 
window.fbAsyncInit = function() 
{
FB.init({
appId  : '1522755218049950',
xfbml  : true,
version  : 'v2.5'
});
};

(function(d, s, id)
 {
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) {return;}
js = d.createElement(s); js.id = id;
js.src = "//connect.facebook.net/en_US/sdk.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));