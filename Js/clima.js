const apiKey = 'f19d85b3d25377f09c7b1a1088bb63ca';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location-button');  
const cityInput = document.getElementById('city-input');
const countrySelect = document.getElementById('country-select');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('weather-description');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-cards');
const errorMessage = document.getElementById('error-message'); 

// Función para mostrar u ocultar el mensaje de error
function showMessage(type, message) {
    if (type === 'error') {
        errorMessage.innerText = message;
        errorMessage.style.display = 'block'; // Mostrar mensaje
    } else {
        errorMessage.style.display = 'none'; // Ocultar mensaje
    }
}

// Función para obtener el clima actual
async function getWeather(city, country) {
    showMessage(); // Ocultar mensajes previos
    try {
        const weatherResponse = await fetch(`${apiUrl}?q=${city},${country}&appid=${apiKey}&units=metric&lang=es`);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
            showMessage('error', 'Ciudad no encontrada.');
            return;
        }

        updateWeatherUI(weatherData);
        getForecast(city, country); // Obtener el pronóstico
    } catch (error) {
        console.error('Error al obtener el clima:', error);
        showMessage('error', 'Error al obtener los datos. Intente de nuevo.');
    }
}

// Función para obtener el clima de la ubicación actual del usuario
async function getWeatherByLocation(latitude, longitude) {
    showMessage(); // Ocultar mensajes previos
    try {
        const weatherResponse = await fetch(`${apiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=es`);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
            showMessage('error', 'No se pudo obtener el clima para la ubicación actual.');
            return;
        }

        updateWeatherUI(weatherData);
        getForecast(weatherData.name, weatherData.sys.country); // Obtener el pronóstico
    } catch (error) {
        console.error('Error al obtener el clima:', error);
        showMessage('error', 'Error al obtener los datos. Intente de nuevo.');
    }
}

// Función para obtener el pronóstico del clima
async function getForecast(city, country) {
    try {
        const forecastResponse = await fetch(`${forecastApiUrl}?q=${city},${country}&appid=${apiKey}&units=metric&lang=es`);
        const forecastData = await forecastResponse.json();

        if (forecastData.cod !== "200") {
            showMessage('error', `Error: ${forecastData.message}`);
            return;
        }

        // Filtrar los pronósticos solo para el día actual (los que están en el mismo día)
        const today = new Date().toLocaleDateString('es-ES'); // Obtener la fecha actual en formato de día/mes/año
        const todayForecasts = forecastData.list.filter(item => {
            const forecastDate = new Date(item.dt * 1000).toLocaleDateString('es-ES');
            return forecastDate === today; // Filtrar por fecha
        });

        updateForecastUI(todayForecasts); // Pasar los pronósticos de hoy a la UI
    } catch (error) {
        console.error('Error al obtener el pronóstico:', error);
        showMessage('error', 'Error al obtener el pronóstico. Intente de nuevo.');
    }
}

// Actualizar UI del clima actual
function updateWeatherUI(data) {
    cityName.innerText = data.name;
    description.innerText = data.weather[0].description;
    temperature.innerText = `${Math.round(data.main.temp)}°C`;
    weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Icono del clima">`;
}

// Actualizar UI del pronóstico (varios pronósticos del día actual)
function updateForecastUI(forecasts) {
    forecastContainer.innerHTML = ''; // Limpiar pronóstico anterior

    forecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <h4>${new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h4>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Icono">
            <p>${Math.round(forecast.main.temp)}°C</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

// Obtener la ubicación actual
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByLocation(latitude, longitude); // Obtener clima usando las coordenadas
        }, () => {
            showMessage('error', 'No se pudo obtener la ubicación actual.');
        });
    } else {
        showMessage('error', 'La geolocalización no es compatible con este navegador.');
    }
}

// Manejo de eventos
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    const country = countrySelect.value;
    if (city) {
        getWeather(city, country); // Buscar clima y pronóstico
    } else {
        showMessage('error', 'Por favor ingrese una ciudad.');
    }
});

// Evento del botón de ubicación actual
currentLocationButton.addEventListener('click', getCurrentLocation); // Obtener clima de la ubicación actual

// Carga inicial
getWeather('Alajuela', 'CR');
