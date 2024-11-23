const apiKey = 'f19d85b3d25377f09c7b1a1088bb63ca';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchButton = document.getElementById('search-button');
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
        getForecast(city, country);
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

        const dailyForecasts = groupForecastByDay(forecastData.list);
        updateForecastUI(dailyForecasts);
    } catch (error) {
        console.error('Error al obtener el pronóstico:', error);
        showMessage('error', 'Error al obtener el pronóstico. Intente de nuevo.');
    }
}

// Agrupar pronóstico por día
function groupForecastByDay(forecastList) {
    const grouped = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(item);
    });
    return Object.entries(grouped).slice(0, 5);
}

// Actualizar UI del clima actual
function updateWeatherUI(data) {
    cityName.innerText = data.name;
    description.innerText = data.weather[0].description;
    temperature.innerText = `${Math.round(data.main.temp)}°C`;
    weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Icono del clima">`;
}

// Actualizar UI del pronóstico
function updateForecastUI(forecasts) {
    forecastContainer.innerHTML = '';
    forecasts.forEach(([day, forecast]) => {
        const dayCard = document.createElement('div');
        dayCard.classList.add('forecast-card');
        dayCard.innerHTML = `
            <h4>${day}</h4>
            <img src="http://openweathermap.org/img/wn/${forecast[0].weather[0].icon}@2x.png" alt="Icono">
            <p>${Math.round(forecast[0].main.temp)}°C</p>
        `;
        forecastContainer.appendChild(dayCard);
    });
}

// Manejo de eventos
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    const country = countrySelect.value;
    if (city) {
        getWeather(city, country);
    } else {
        showMessage('error', 'Por favor ingrese una ciudad.');
    }
});

// Carga inicial
getWeather('Alajuela', 'CR');
