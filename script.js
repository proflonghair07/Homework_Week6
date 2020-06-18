// global variables
var cityName;
var cityList = [];

// loads local storage inputs onto page when page is loaded
onLoadCityList();
onLoadWeather();

// gets the city list array form local storage
function onLoadCityList() {
  var savedCities = JSON.parse(localStorage.getItem("cities"));

  if (savedCities !== null) {
    cityList = savedCities;
  }

  displayCities();
}

// gets current city from local storage to render when page is reloaded
function onLoadWeather() {
  var savedWeather = JSON.parse(localStorage.getItem("currentCity"));

  if (savedWeather !== null) {
    cityName = savedWeather;

    displayWeather();
    displayForecast();
  }
}

// displays user city input into the city-input-list
function displayCities() {
  $("#city-input-list").empty();
  $("#city-input").val("");

  for (i = 0; i < cityList.length; i++) {
    var anchor = $("<a>");
    anchor.addClass(
      "list-group-item list-group-item-action list-group-item-dark city"
    );
    anchor.attr("data-name", cityList[i]);
    anchor.text(cityList[i]);
    $("#city-input-list").prepend(anchor);
  }
}

// saves the city array to local storage
function saveCityArray() {
  localStorage.setItem("cities", JSON.stringify(cityList));
}

// saves the current city to local storage
function saveCity() {
  localStorage.setItem("currentCity", JSON.stringify(cityName));
}

// event listener for the submit-weather button. saves to local storage. adds input to city list. and removes earliest entry if list is more than ten items long.
$("#submit-weather").on("click", function (event) {
  event.preventDefault();

  cityName = $("#city-input").val().trim();
  if (cityName === "") {
    $("#city-input:text").attr("placeholder", "Cannot leave input blank");
  } else if (cityList.length >= 10) {
    cityList.shift();
    cityList.push(cityName);
    $("#city-input:text").attr("placeholder", "City Name");
  } else {
    cityList.push(cityName);
    $("#city-input:text").attr("placeholder", "City Name");
  }

  saveCity();
  saveCityArray();
  displayCities();
  displayWeather();
  displayForecast();
});

// use AJAX to call to Open Weather and display weather, city and daily forecast. gets current weather icon and displays it in card. gets uv index and adds classes depending on severity of condition.
async function displayWeather() {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial&appid=0c610bea5e8565605c67ee170f02782d";

  var response = await $.ajax({
    url: queryURL,
    method: "GET",
  });

  var currentWeatherDisplay = $("<div class='card-body' id='current-weather'>");
  var getCity = response.name;
  var date = new Date();
  var val =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  var getWeatherPng = response.weather[0].icon;
  var displayWeatherPng = $(
    "<img src = http://openweathermap.org/img/wn/" +
      getWeatherPng +
      "@2x.png />"
  );
  var currentCityElement = $("<h2 class = 'card-body'>").text(
    getCity + " (" + val + ")"
  );
  currentCityElement.append(displayWeatherPng);
  currentWeatherDisplay.append(currentCityElement);
  var getTemperature = response.main.temp.toFixed(1);
  var temperatureElement = $("<p class='card-text'>").text(
    "Temperature: " + getTemperature + " °F"
  );
  currentWeatherDisplay.append(temperatureElement);
  var getHumidity = response.main.humidity;
  var humidityElement = $("<p class='card-text'>").text(
    "Humidity: " + getHumidity + "%"
  );
  currentWeatherDisplay.append(humidityElement);
  var getWindSpeed = response.wind.speed.toFixed(1);
  var windSpeed = $("<p class='card-text'>").text(
    "Wind Speed: " + getWindSpeed + " mph"
  );
  currentWeatherDisplay.append(windSpeed);
  var getLongitude = response.coord.lon;
  var getLattitude = response.coord.lat;

  var uvIndexUrl =
    "https://api.openweathermap.org/data/2.5/uvi?appid=0c610bea5e8565605c67ee170f02782d&lon=" +
    getLongitude +
    "&lat=" +
    getLattitude;
  var uvResponse = await $.ajax({
    url: uvIndexUrl,
    method: "GET",
  });

  var getUvIndex = uvResponse.value;
  var uvDisplay = $("<span>");
  if (getUvIndex > 0 && getUvIndex <= 4.99) {
    uvDisplay.addClass("favorable");
  } else if (getUvIndex >= 5 && getUvIndex <= 7.99) {
    uvDisplay.addClass("moderate");
  } else if (getUvIndex >= 8) {
    uvDisplay.addClass("severe");
  }
  uvDisplay.text(getUvIndex);
  var uvIndexElement = $("<p class='card-text'>").text("UV Index: ");
  uvDisplay.appendTo(uvIndexElement);
  currentWeatherDisplay.append(uvIndexElement);
  $("#weather-display").html(currentWeatherDisplay);
}

// use AJAX to call to Open Weather and display the fiveday forecast.  uses for loop to limit to only five days.
async function displayForecast() {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    cityName +
    "&units=imperial&appid=0c610bea5e8565605c67ee170f02782d";

  var response = await $.ajax({
    url: queryURL,
    method: "GET",
  });
  var forecastDisplay = $("<div>");
  var forecastHeader = $("<h3>").text("5 Day Forecast:");
  forecastDisplay.append(forecastHeader);
  var cardDeck = $("<div class='card-deck'>");
  forecastDisplay.append(cardDeck);

  for (i = 0; i < 5; i++) {
    var forecastCard = $("<div class='card mb-3 mt-3'>");
    var cardBody = $("<div class='card-body'>");
    var date = new Date();
    var val =
      date.getMonth() +
      1 +
      "/" +
      (date.getDate() + i + 1) +
      "/" +
      date.getFullYear();
    var forecastDate = $("<h3 class='card-title'>").text(val);

    cardBody.append(forecastDate);
    var getWeatherPng = response.list[i].weather[0].icon;
    var displayWeatherIcon = $(
      "<img src = http://openweathermap.org/img/wn/" + getWeatherPng + ".png />"
    );
    cardBody.append(displayWeatherIcon);
    var getTemperature = response.list[i].main.temp;
    var temperatureElement = $("<p class='card-text'>").text(
      "Temp: " + getTemperature + " °F"
    );
    cardBody.append(temperatureElement);
    var getHumidity = response.list[i].main.humidity;
    var humidityElement = $("<p class='card-text'>").text(
      "Humidity: " + getHumidity + "%"
    );
    cardBody.append(humidityElement);
    forecastCard.append(cardBody);
    cardDeck.append(forecastCard);
  }
  $("#forecast-display").html(forecastDisplay);
}

// allows user to click on the anchors in the city list to run the displayWeather and displayForecast functions with the anchor value as the input
function displayWeatherAnchor() {
  cityName = $(this).attr("data-name");
  displayWeather();
  displayForecast();
}

// event listener that allows the user to click on any one of the anchors and display that anchors content to the weather-display div
$(document).on("click", ".city", displayWeatherAnchor);
