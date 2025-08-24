const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { fal } = require("@fal-ai/client");
const {
	getMoisture,
	getConductivity,
	getTemperature,
	getLight,
} = require("./js/functions.cjs");

dotenv.config({
	quiet: true,
});

const EXPRESS_PORT = 3000;
const FAL_QWEN_IMAGE_EDIT = "fal-ai/qwen-image-edit";
const VOLUME_FOLDER = path.join(__dirname, "volume");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/volume", express.static(VOLUME_FOLDER));

fal.config({
	credentials: process.env.FAL_KEY,
});

app.get("/sensor", (_, res) => {
	const fn = (num) => +num.toFixed(2);

	const moisture = getMoisture(fn);
	const conductivity = getConductivity(fn);
	const temperature = getTemperature(fn);
	const light = getLight(fn);

	res.json({
		moisture: {
			value: moisture,
			unit: "%",
		},
		conductivity: {
			value: conductivity,
			unit: "mS/cm",
		},
		temperature: {
			value: temperature,
			unit: "°C",
		},
		light: {
			value: light,
			unit: "Lux",
		},
	});
});

app.post("/fal", async (req, res) => {
	try {
		const { prompt, image_url } = req.body;
		const { fal_webhook } = req.query;

		if (!prompt || !image_url) {
			return res.status(400).json({ error: "/fal: Missing parameters" });
		}

		const { data, requestId } = await fal.subscribe(FAL_QWEN_IMAGE_EDIT, {
			input: { prompt, image_url },
			onQueueUpdate: async (update) => {
				const {
					status,
					request_id,
					response_url,
					status_url,
					cancel_url,
					metrics,
				} = update;

				switch (status) {
					case "IN_QUEUE":
						break;
					case "IN_PROGRESS":
						console.log("In progress ...", request_id);
						break;
					case "COMPLETED":
						console.log("Inference time: ", metrics.inference_time);
						break;
				}
			},
		});

		if (fal_webhook) {
			await fetch(fal_webhook, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data,
					requestId,
				}),
			});
		}

		res.json({ data, requestId });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

app.listen(EXPRESS_PORT, () => {
	console.log(`Server running at http://localhost:${EXPRESS_PORT}`);
});
