/**
 * Simulates the retrieval of a humidity value, optionally transforming it with a callback function.
 *
 * The humidity is calculated as a base value oscillating with time (to simulate natural variation),
 * plus a small random noise. The result is clamped between 0 and 100.
 *
 * @param {function(number): any} [fn] - Optional callback function to transform the humidity value.
 * @returns {number|any} The simulated humidity value, or the result of the callback function if provided.
 */
function getMoisture(fn) {
	const base = 50 + 20 * Math.sin(Date.now() / 60000);
	const noise = Math.random() * 5 - 2.5;

	const temp = Math.max(0, Math.min(100, base + noise));
	return fn ? fn(temp) : temp;
}

/**
 * Simulates the measurement of soil conductivity (EC value) or the nutrient value of a potted plant.
 *
 * The EC value (electrical conductivity) is calculated as a base value with temporal fluctuation and random noise,
 * to simulate natural changes and measurement inaccuracies. The result is limited to a reasonable range.
 *
 * @param {function(number): any} [fn] - Optional callback to further process the calculated EC value.
 * @returns {number|any} The simulated EC value (in mS/cm, rounded to two decimal places), or the result of the callback.
 */
function getConductivity(fn) {
	const base = 1.2 + 0.5 * Math.sin(Date.now() / 1800000);
	const noise = Math.random() * 0.1 - 0.05;

	const ec = Math.max(0, Math.min(5, base + noise));
	const rounded = +ec.toFixed(2);
	return fn ? fn(rounded) : rounded;
}

/**
 * Calculates a simulated temperature value based on the current time and random noise.
 *
 * @param {function(number): any} [fn] - Optional callback function to process the calculated temperature.
 * @returns {number|any} The calculated temperature (in °C, rounded to one decimal place), or the result of the callback if provided.
 */
function getTemperature(fn) {
	const base = 23 + 5 * Math.sin(Date.now() / 3600000);
	const noise = Math.random() * 0.5 - 0.25;

	const temp = Math.round((base + noise) * 10) / 10;
	return fn ? fn(temp) : temp;
}

/**
 * Calculates a simulated light intensity value (in Lux) based on the current time of day and random noise.
 *
 * The function simulates a daily light cycle, with intensity peaking at midday and dropping to a low value at night.
 * The result is clamped between 0 and 10,000 Lux, with a small random noise added for realism.
 *
 * @param {function(number): any} [fn] - Optional callback function to process the calculated light intensity.
 * @returns {number|any} The simulated light intensity (in Lux, rounded to the nearest integer), or the result of the callback if provided.
 */
function getLight(fn) {
	const now = new Date();
	const hours = now.getHours() + now.getMinutes() / 60;

	const sunrise = 6;
	const sunset = 18;
	const dayLength = sunset - sunrise;

	let daylightFactor;
	if (hours < sunrise || hours > sunset) {
		daylightFactor = 0.05;
	} else {
		const t = (hours - sunrise) / dayLength;
		daylightFactor = Math.sin(t * Math.PI);
	}

	const baseLux = 10000 * daylightFactor;
	const noise = Math.random() * 500 - 250;
	const lux = Math.max(0, Math.min(10000, baseLux + noise));
	const rounded = Math.round(lux);

	return fn ? fn(rounded) : rounded;
}

module.exports = { getMoisture, getConductivity, getTemperature, getLight };
