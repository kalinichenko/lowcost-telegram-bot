const fs = require("fs");
const src = require("./airports.json");

const out = src.map(
  ({ name, code, city: { name: cityName }, city: { name: countryName } }) => {
    return (
      `INSERT INTO airports(iata_code, airport_name, city_name, country_name) ` +
      `VALUES (\'${code}\', \'${name}\', \'${cityName}\', \'${countryName}\');\n`
    );
  }
);

fs.writeFileSync("airports.sql", out.join(""), err => {
  // throws an error, you could also catch it here
  if (err) throw err;

  // success case, the file was saved
  console.log("Lyric saved!");
});
