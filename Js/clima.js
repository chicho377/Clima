const apiKey = 'f19d85b3d25377f09c7b1a1088bb63ca';  // clave api
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchButton = document.getElementById('search-button');
const cityInput = document.getElementById('city-input');
const countrySelect = document.getElementById('country-select');  // Selección del país
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('weather-description');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-cards');  // Corrección en el ID del contenedor

// Función para obtener el clima actual
async function getWeather(city, country) {
    try {
        console.log(`Buscando clima para: ${city}, ${country}`);  // Verifica si la búsqueda se ejecuta
        const weatherResponse = await fetch(`${apiUrl}?q=${city},${country}&appid=${apiKey}&units=metric&lang=es`);
        const weatherData = await weatherResponse.json();

        // Verifica si la respuesta contiene un error
        if (weatherData.cod === '404') {
            alert('Ciudad no encontrada');
            return;
        }

        console.log(weatherData);  // Verifica los datos que devuelve la API

        // Actualiza los elementos con los datos del clima
        const weather = weatherData.weather[0];
        cityName.innerText = weatherData.name;
        description.innerText = weather.description;
        temperature.innerText = `${Math.round(weatherData.main.temp)}°C`;
        
        // Aquí actualizamos el ícono dinámicamente
        weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="Icono del clima">`;

        // Obtener el pronóstico del clima
        getForecast(city, country);

    } catch (error) {
        console.error('Error al obtener los datos del clima:', error);
    }
}

// Función para obtener el pronóstico del clima
async function getForecast(city, country) {
    try {
        console.log(`Buscando pronóstico para: ${city}, ${country}`);  // Verifica si la búsqueda de pronóstico se ejecuta
        const forecastResponse = await fetch(`${forecastApiUrl}?q=${city},${country}&appid=${apiKey}&units=metric&lang=es`);
        const forecastData = await forecastResponse.json();

        console.log(forecastData);  // Verifica los datos del pronóstico

        const forecastList = forecastData.list.slice(0, 5);  // Obtén los primeros 5 pronósticos (cada 3 horas)
        forecastContainer.innerHTML = ''; // Limpia el contenedor de pronósticos

        forecastList.forEach(forecast => {
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');

            const date = new Date(forecast.dt * 1000);
            const hours = date.getHours();

            forecastCard.innerHTML = `
                <h4>${hours}:00</h4>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Icono">
                <p>${Math.round(forecast.main.temp)}°C</p>
            `;
            forecastContainer.appendChild(forecastCard);
        });

    } catch (error) {
        console.error('Error al obtener el pronóstico:', error);
    }
}

// Función para manejar la búsqueda al hacer clic en el botón o presionar enter
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    const country = countrySelect.value;  // Obtén el país seleccionado
    if (city) {
        getWeather(city, country);
    } else {
        console.log('Por favor ingrese una ciudad.');
    }
});

// Permitir búsqueda presionando enter en el campo de texto
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        const country = countrySelect.value;  // Obtén el país seleccionado
        if (city) {
            getWeather(city, country);
        } else {
            console.log('Por favor ingrese una ciudad.');
        }
    }
});

// Predeterminar una ciudad y país para mostrar el clima inicial
getWeather('Alajuela', 'CR');  // Usa Costa Rica como país predeterminado
