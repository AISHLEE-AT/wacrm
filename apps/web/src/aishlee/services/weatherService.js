export const weatherService = {
  getTNWeather: async () => {
    try {
      // Defaulting to Chennai coordinates (Latitude: 13.0827, Longitude: 80.2707)
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto"
      );
      
      if (!response.ok) throw new Error("Weather API failed");
      
      const data = await response.json();
      
      const currentTemp = data.current_weather.temperature;
      const isDay = data.current_weather.is_day;

      
      // Daily forecasts (taking index 0 for today)
      const maxTemp = data.daily.temperature_2m_max[0];
      const minTemp = data.daily.temperature_2m_min[0];
      const rainProb = data.daily.precipitation_probability_max[0];
      const maxWind = data.daily.windspeed_10m_max[0];
      
      // Simple weather code mapping for Agri-Alerts
      let alertMsg = "சீரான வானிலை. விவசாயப் பணிகளை தொடரலாம்.";
      let alertLevel = "normal"; // normal, warning, danger
      
      if (rainProb > 70) {
        alertMsg = "கனமழைக்கு வாய்ப்பு! அறுவடை செய்த பயிர்களை பாதுகாக்கவும்.";
        alertLevel = "danger";
      } else if (maxTemp > 40) {
        alertMsg = "கடுமையான வெயில்! பயிர்களுக்கு தகுந்த நீர் பாய்ச்சவும்.";
        alertLevel = "warning";
      } else if (maxWind > 30) {
        alertMsg = "பலத்த காற்று வீசக்கூடும். வாழைகள் மற்றும் மரங்களை பாதுகாக்கவும்.";
        alertLevel = "warning";
      }

      return {
        currentTemp: Math.round(currentTemp),
        maxTemp: Math.round(maxTemp),
        minTemp: Math.round(minTemp),
        rainProbability: rainProb,
        windSpeed: Math.round(maxWind),
        isDay: isDay === 1,
        alertMsg,
        alertLevel
      };

    } catch (error) {
      console.error("Failed to fetch weather:", error);
      return null;
    }
  }
};
