// Common neighbourhoods from OpenStreetMap, used while the query is too short for live search.
export const INITIAL_AREAS = [
  ["Clifton", "Karachi", 24.8190552, 67.0262397],
  ["F-10", "Islamabad", 33.6918206, 73.0066844],
  ["Gulberg", "Lahore", 31.5119955, 74.3430178],
  ["Gulshan-e-Iqbal", "Karachi", 24.9067294, 67.0986573],
  ["Model Town", "Lahore", 31.483627, 74.3259916],
  ["North Nazimabad", "Karachi", 24.9424616, 67.0477185],
  ["Saddar", "Karachi", 24.859649, 67.0308157],
  ["Samanabad", "Lahore", 31.5395453, 74.3016998],
  ["Satellite Town", "Rawalpindi", 33.6384026, 73.0696929],
  ["Shah Faisal Colony 3 Number", "Karachi", 24.8813414, 67.1550422],
  ["Sohrab Goth", "Karachi", 24.9505443, 67.0897399],
].map(([name, city, lat, lng]) => {
  const label = `${name}, ${city}`;
  return { name, city, lat, lng, label, key: label.toLowerCase() };
});
