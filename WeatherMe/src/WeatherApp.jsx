import React from "react";
import { useState } from "react";
import "./WeatherApp.css";
import { motion } from "framer-motion"; // biblioteka za animacije

function WeatherApp() {
  const [city, setCity] = useState(""); // trenutna vrednost za input polje
  const [weatherData, setWeatherData] = useState(null); // podaci o trenutnom vremenu
  const [error, setError] = useState(null); // poruka o gresci
  const [forecastData, setForeCastData] = useState([]); // podaci o prognozi
  const [suggestions, setSuggestions] = useState([]); // predlozi gradova

  const apiKey = "3b8e9c9d499b3c7b0870647dabc0c6c7"; // api kljuc koji nam treba za vreme

  const handleChange = async (e) => {
    const input = e.target.value;
    setCity(input); // uzimamo sta korisnik ukuca i azuriramo stanje

    if (input.length < 2) {
      // ako je unos manje od 2 karaktera ne izbacujemo predloge
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        // fetch za predloge gradova
        `http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`
      );
      const data = await response.json();
      setSuggestions(data); // pretvaranje odgovora u json i postavljanje predloga
    } catch (err) {
      console.error("Greska u dohvatanju predloga", err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // funkcija koja se pokrece kada kliknemo na predlog
    const fullCityName = `${suggestion.name}${
      suggestion.state ? ", " + suggestion.state : ""
    }, ${suggestion.country}`;
    setCity(fullCityName); // kada klikne na predlog saljemo ime grada, dela drzave(ako postoji) i drzave
    setSuggestions([]); // postavljamo predloge da ih ne bude kada kliknemo na grad
  };

  const handleSubmit = async (e) => {
    // funkcija koja se izvrsava klikom na Search
    e.preventDefault(); // sprecavamo reload stranice

    try {
      const response = await fetch(
        // trenutni vremenski podaci
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Nema podataka za ovaj grad."); // ispisivanje ako nema info
      }
      const data = await response.json();
      setWeatherData(data); // ponovo pretvaranje u json, i zatim postavljanje trenutnog vremena
      setError(null); // reset greske

      const forecastResponse = await fetch(
        // fetch za visednevnu prognozu
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      const forecastJson = await forecastResponse.json();

      const dailyForecast = forecastJson.list
        .filter((item) => item.dt_txt.includes("12:00:00"))
        .slice(0, 3); // filtriramo samo zapise za 12h, i uzimamo 3 naredna dana

      setForeCastData(dailyForecast); // postavljamo prognozu
    } catch (err) {
      // u slucaju da dodje do greske, resetujemo sve i prikazujemo gresku
      setForeCastData([]);
      setWeatherData(null);
      setError(err.message);
    }
  };
  const getBackgroundColor = (weather) => {
    // postavljamo pozadinsku boju u zavisnosti od vremena
    if (!weather) return "#f0f0f0"; // difolt vreme (pocetno)
    const main = weather.weather[0].main.toLowerCase(); // uzimamo tip vremena

    switch (
      main // najlakse mi je bilo preko svica da postavim pozadine
    ) {
      case "clear":
        return "#ffe680";
      case "clouds":
        return "#cfd8dc";
      case "rain":
        return "#90a4ae";
      case "snow":
        return "#e0f7fa";
      case "tunderstorm":
        return "#616161";
      default:
        return "#e0e0e0";
    }
  };

  return (
    <>
      <div
        className="weather-container"
        style={{ backgroundColor: getBackgroundColor(weatherData) }}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search City..."
            value={city}
            onChange={handleChange}
            className="input-city"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((sug, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(sug)}
                  className="suggestion-item"
                >
                  {sug.name}
                  {sug.state ? `, ${sug.state}` : ""}, {sug.country}
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
        {error && (
          <p style={{ color: "red" }} className="text-greska">
            {error}
          </p>
        )}

        {weatherData && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="weather-box"
            >
              <h2 className="weather-box-heading">{weatherData.name}</h2>
              <p className="weather-box-info1">
                Temperatura: {weatherData.main.temp}°C
              </p>
              <p className="weather-box-info2">
                Opis: {weatherData.weather[0].description}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="Ikonica vremena"
              />
            </motion.div>
            {forecastData.length > 0 && (
              <div className="forecast-container">
                {forecastData.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className="forecast-card"
                  >
                    <p>
                      {new Date(day.dt_txt).toLocaleDateString("sr-Latn-RS", {
                        weekday: "long",
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt="ikona"
                      className="forecast-icon"
                    />
                    <p>{Math.round(day.main.temp)}°C</p>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default WeatherApp;
