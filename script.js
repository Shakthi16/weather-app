const apiKey = '9282ff1e1c22969e722f59422593d3eb'; // Replace with your OpenWeatherMap API key
const ipGeoApiKey = 'a07ab465e684499eb065a5087d85bcb4'; // Replace with your IPGeolocation API key

document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
        displayWeatherConversation(data);
        getSolarLunarPhases(data.coord.lat, data.coord.lon);
        getWeatherAlerts(data.coord.lat, data.coord.lon);
        displayHealthActivitySuggestions(data);
    } catch (error) {
        alert(error.message);
    }
}

function displayCurrentWeather(data) {
    const customIcon = getCustomIcon(data.weather[0].icon);
    const currentWeather = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${customIcon}" alt="${data.weather[0].description}" />
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    document.getElementById('current-weather').innerHTML = currentWeather;
}

async function getForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        displayForecast(data.list);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

function displayForecast(forecastList) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    forecastList.forEach((item, index) => {
        if (index % 8 === 0) {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const customIcon = getCustomIcon(item.weather[0].icon);

            const forecastDay = `
                <div class="forecast-day">
                    <h3>${dayName}</h3>
                    <img src="${customIcon}" alt="${item.weather[0].description}">
                    <p>Temp: ${item.main.temp}°C</p>
                    <p>${item.weather[0].description}</p>
                </div>
            `;
            forecastContainer.innerHTML += forecastDay;
        }
    });
}

function displayWeatherConversation(data) {
    const weatherConversation = document.getElementById('weather-conversation');
    const messages = {
        'Clear': `It's a bright and sunny day in ${data.name}. Enjoy the clear skies! ☀️`,
        'Clouds': `Expect some clouds in ${data.name} today. Might be a bit gloomy. ☁️`,
        'Rain': `Rain showers are expected in ${data.name}. Don't forget your umbrella! 🌧️`,
        'Snow': `Snow is on the way in ${data.name}. Time for some winter fun! ❄️`,
        'Thunderstorm': `A thunderstorm is brewing in ${data.name}. Stay safe and indoors if possible! ⛈️`
    };

    const weatherCondition = data.weather[0].main;
    const message = messages[weatherCondition] || `The weather in ${data.name} is currently ${data.weather[0].description}.`;

    weatherConversation.innerHTML = `<p>${message}</p>`;
}

function getCustomIcon(iconCode) {
    const iconMap = {
        '01d': 'clear sky night.png',
        '01n': 'clearskynight.png',
        '02d': 'cloudysun.png',
        '02n': 'cloudnight.png',
        '03d': 'scatterted.png',
        '03n': 'cloudnight.png',
        '04d': 'day.png',
        '04n': 'nih.png',
        '09d': 'showerrain.png',
        '09n': 'rain nigjht.png',
        '10d': 'rain.png',
        '10n': 'rain cloud.png',
        '11d': 'thunderstom day.png',
        '11n': 'thunderstom night.png',
        '13d': 'snow cloud.png',
        '13n': 'snow night.png',
        '50d': 'mist day.png',
        '50n': 'mist night.png'
    };
    return iconMap[iconCode] || `http://openweathermap.org/img/wn/${iconCode}.png`;
}

async function getSolarLunarPhases(lat, lon) {
    try {
        const response = await fetch(`https://api.ipgeolocation.io/astronomy?apiKey=${ipGeoApiKey}&lat=${lat}&long=${lon}`);
        const data = await response.json();
        displaySolarLunarPhases(data);
    } catch (error) {
        console.error('Error fetching solar/lunar phases:', error);
    }
}

function displaySolarLunarPhases(data) {
    const solarLunarPhases = document.getElementById('solar-lunar-phases');
    const phases = `
        <h3>Solar and Lunar Phases</h3>
        <p>Sunrise: ${data.sunrise}</p>
        <p>Sunset: ${data.sunset}</p>
        <p>Moonrise: ${data.moonrise}</p>
        <p>Moonset: ${data.moonset}</p>
        <p>Moon Phase: ${data.moon_phase}</p>
    `;
    solarLunarPhases.innerHTML = phases;
}

async function getWeatherAlerts(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/alerts?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        displayWeatherAlerts(data);
    } catch (error) {
        console.error('Error fetching weather alerts:', error);
    }
}

function displayWeatherAlerts(data) {
    const weatherAlerts = document.getElementById('weather-alerts');
    if (data.alerts && data.alerts.length > 0) {
        const alerts = data.alerts.map(alert => `
            <div class="alert">
                <h3>${alert.event}</h3>
                <p>${alert.description}</p>
                <p>Start: ${new Date(alert.start * 1000).toLocaleString()}</p>
                <p>End: ${new Date(alert.end * 1000).toLocaleString()}</p>
            </div>
        `).join('');
        weatherAlerts.innerHTML = `
            <h3>Weather Alerts</h3>
            ${alerts}
        `;
    } else {
        weatherAlerts.innerHTML = '<p>No weather alerts at the moment.</p>';
    }
}

function displayHealthActivitySuggestions(data) {
    const healthActivitySuggestions = document.getElementById('health-activity-suggestions');
    let suggestions = '';
    if (data.main.temp > 30) {
        suggestions = '<p>It\'s quite hot outside! Stay hydrated and wear light clothing.</p>';
    } else if (data.main.temp < 0) {
        suggestions = '<p>It\'s freezing out there! Dress warmly and stay indoors if possible.</p>';
    } else if (data.weather[0].main === 'Rain') {
        suggestions = '<p>It\'s raining. Don\'t forget your umbrella and consider indoor activities.</p>';
    } else if (data.weather[0].main === 'Clear') {
        suggestions = '<p>The weather is clear. It\'s a great day for outdoor activities!</p>';
    } else {
        suggestions = '<p>Check the weather and dress appropriately for the conditions.</p>';
    }
    healthActivitySuggestions.innerHTML = `
        <h3>Health and Activity Suggestions</h3>
        ${suggestions}
    `;
}
