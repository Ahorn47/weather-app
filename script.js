
// Global Variables
var apiKey = "613ac7c9a9c25a5e24e3f56aa241b660";
var units = "imperial";

currentCity = localStorage.getItem("current"); 
let cities = JSON.parse(localStorage.getItem("history"));
if (!cities) {
  cities = { history: [] };
}


function updateHistory() {


	$("#history").empty();
	cities.history.forEach((city) => {
	  // create city element
	  const cityEl = $("<div>")
		.attr("data-city", city)
		.addClass("text-muted p-2 bg-white border city-history")
		.text(city);
	  // add delete button
	  cityEl.append(
		$("<span>")
		  .addClass(
			"text-danger px-1 float-right border border-danger rounded city-delete"
		  )
		  .html("&times;")
	  );
	  
	  $("#history").append(cityEl);
	});
	
	localStorage.setItem("history", JSON.stringify(cities));
  }
  
  function deleteCity(city) {
	const delIndex = cities.history.indexOf(city);
	cities.history.splice(delIndex, 1);
	updateHistory();
  }
  
  function getWeather(city) {
	const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`; // current weather api from openweathermap.org
  
	// openweathermap.org Current Weather API
	$.ajax({
	  url: currentURL,
	  method: "GET",
	}).then(function (response) {
	  const lat = response.coord.lat,
		lon = response.coord.lon, 
		parts = "minutely,hourly", 
		oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=${parts}&appid=${apiKey}`,
		todaysDate = moment.unix(response.dt).format("MM/DD/YYYY"),
		currentIconURL = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`,
		currentIconAlt = response.weather[0].description;
	  let cityName = response.name;
  
	  if (city.includes(",")) {
		const stateCountry = city.split(",");
		for (let i = 1; i < stateCountry.length; i++) {
		  cityName += `, ${stateCountry[i].trim().toUpperCase()}`;
		}
	  }
	  // update city name and date
	  $("#city-name").text(`${cityName} (${todaysDate})`);
	  $("#city-name").append(
		$("<img>")
		  .attr("src", currentIconURL)
		  .attr("alt", currentIconAlt)
		  .attr("width", 75)
	  );
  
	  // save city name to local storage
	  localStorage.setItem("current", cityName);
	  if (!cities.history.includes(cityName)) {
		cities.history.push(cityName);
		cities.history.unshift(cityName);
	  }
	  updateHistory(); 
  
	  // openweathermap.org One Call API
	  $.ajax({
		url: oneCallURL,
		method: "GET",
	  }).then(function (response) {
		// update city current weather data
		$("#current-temp").text(response.current.temp.toFixed(1));
		$("#current-humid").text(response.current.humidity);
		$("#wind").text(response.current.wind_speed);
		$("#UV").text(response.current.uvi);
		// color-code UV index
		if (response.current.uvi <= 5) {
		  // UV is low
		  $("#UV").removeClass("bg-danger bg-warning").addClass("bg-success");
		} else if (response.current.uvi >= 8) {
		  // UV is high
		  $("#UV").removeClass("bg-success bg-warning").addClass("bg-danger");
		} else {
		  // UV is middle
		  $("#UV").removeClass("bg-danger bg-success").addClass("bg-warning");
		}
  
		// update 5-day forecast for city
		$("#forecast").empty(); // this worked as well: $("#forecast").html("");
		for (let i = 1; i <= 5; i++) {

		  const data = response.daily[i],
			date = moment.unix(data.dt).format("MM/DD/YY"),
			iconURL = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
			iconAlt = data.weather[0].description,
			temp = `Temp: ${data.temp.day.toFixed(1)} &deg;F`,
			humid = `Humidity: ${data.humidity}%`,
			// displays card for each day
			cardEl = $("<div>").addClass(
			  "card bg-primary text-light p-2 m-2 mx-md-auto"
			);
  
		  // add data to the forecast card
		  cardEl.append($("<p>").addClass("card-text text-center").text(date));
		  cardEl.append(
			$("<img>")
			  .attr("src", iconURL)
			  .attr("alt", iconAlt)
			  .attr("width", 50)
			  .addClass("mx-auto d-block")
		  );
		  cardEl.append(
			$("<p>").addClass("card-text text-center small").html(temp)
		  );
		  cardEl.append(
			$("<p>").addClass("card-text text-center small").text(humid)
		  );
  
		  // added card to forecast
		  $("#forecast").append(cardEl);
		}
	  });
	});
  }
  
  // Main
  
  if (currentCity) {
	getWeather(currentCity);
  } else {
	getWeather("San Antonio, TX, US");
  }
  // saw this worked for bootstrap 4.5.3
  $(document).ready(function () {
	$(".toast").toast("show");
  });
  
  // add event listeners
  
  $("#search").click(function (event) {
	event.preventDefault();
	// user form 
	const cityForm = $("#city").val().trim(),
	  stateForm = $("#state").val().trim(),
	  countryForm = $("#country").val().trim();
	let search4city = cityForm;
  
	if (stateForm) {
	  search4city = `${cityForm}, ${stateForm}, US`;
	} else if (countryForm) {
	  search4city = `${cityForm}, ${countryForm}`;
	}
  
	getWeather(search4city);
	// clear search fields
	$("#city").val("");
	$("#state").val("");
	$("#country").val("");
  });
  
 // event listeners
  $("#history").on("click", ".city-history", function () {
	getWeather($(this).attr("data-city"));
  });
  
  
  $("#history").on("click", ".city-delete", function (event) {
	event.stopPropagation();
	deleteCity($(this).parent().attr("data-city"));
  });

















































































































