import React from "react";
import { useState } from "react";
import "./WeatherApp.css";
import { motion } from "framer-motion";

function WeatherApp() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const apiKey = "3b8e9c9d499b3c7b0870647dabc0c6c7";

  const handleChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Nema podataka za ovaj grad.");
      }
      const data = await response.json();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setWeatherData(null);
      setError(err.message);
    }
  };
  const getBackgroundColor = (weather) => {
    if (!weather) return "#f0f0f0";
    const main = weather.weather[0].main.toLowerCase();

    switch (main) {
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
        )}
      </div>
    </>
  );
}

export default WeatherApp;
