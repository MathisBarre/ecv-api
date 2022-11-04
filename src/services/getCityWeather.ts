import { default as axios } from "axios";

export default async function getCityWeather(searchQuery: string) {
  const { data } = await axios.get(
    `https://www.prevision-meteo.ch/services/json/${searchQuery}`
  );

  if (!data.city_info) {
    throw new Error("UNKOWN_CITY");
  }

  if (Math.random() > 0.8) {
    throw new Error("FAKE_ERROR");
  }

  const hoursKey: string[] = [];
  for (let i = 0; i <= 23; i++) {
    hoursKey.push(i + "H00");
  }

  const daysKey: string[] = [];
  for (let i = 0; i <= 4; i++) {
    daysKey.push("fcst_day_" + i);
  }

  return {
    dataProvider: "http://www.prevision-meteo.ch/",
    currentConditions: {
      datetime:
        data.current_condition.date.split(".").reverse().join("-") +
        "T" +
        data.current_condition.hour +
        "+01:00",
      condition: data.current_condition.condition,
      conditionKey: data.current_condition.condition_key,
      temperature: {
        value: data.current_condition.tmp,
        unit: "°C",
      },
      windSpeed: {
        value: data.current_condition.wnd_spd,
        unit: "km/h",
      },
      humidity: {
        value: data.current_condition.humidity,
        unit: "%",
      },
      icon: data.current_condition.icon,
      iconBig: data.current_condition.icon_big,
    },
    next5DaysConditions: daysKey.map((dayKey) => {
      const thisDay = data[dayKey];
      return {
        date: thisDay.date.split(".").reverse().join("-"),
        condition: thisDay.condition,
        conditionKey: thisDay.condition_key,
        icon: thisDay.icon,
        iconBig: thisDay.icon_big,
        temperature: {
          min: thisDay.tmin,
          max: thisDay.tmax,
          unit: "°C",
        },
        hourly: hoursKey.map((hour) => {
          const hourString = (hour.length === 4 ? "0" + hour : hour).replace(
            "H",
            ":"
          );

          const thisHour = data[dayKey].hourly_data[hour];

          return {
            datetime:
              data[dayKey].date.split(".").reverse().join("-") +
              "T" +
              hourString +
              "+01:00",
            condition: thisHour.CONDITION,
            conditionKey: thisHour.CONDITION_KEY,
            temperature: {
              value: thisHour.TMP2m,
              unit: "°C",
            },
            windSpeed: {
              value: thisHour.WNDSPD10m,
              unit: "km/h",
            },
            humidity: {
              value: thisHour.RH2m,
              unit: "%",
            },
            icon: thisHour.ICON,
          };
        }),
      };
    }),
  };
}
