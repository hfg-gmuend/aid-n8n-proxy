const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { fal } = require("@fal-ai/client");
const cors = require("cors");
const {
	getMoisture,
	getConductivity,
	getTemperature,
	getLight,
} = require("./js/functions.cjs");

dotenv.config({
	quiet: true,
});

const EXPRESS_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const FAL_QWEN_IMAGE_EDIT = "fal-ai/qwen-image-edit";
const VOLUME_FOLDER = path.join(__dirname, "volume");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/volume", express.static(VOLUME_FOLDER));

// Simple healthcheck
app.get("/health", (req, res) => {
	res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

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

// Dummy bearer auth middleware for /fal
function falAuth(req, res, next) {
	const auth = req.headers.authorization || "";
	const expected = process.env.FAL_DUMMY_BEARER || "dummy-token";
	if (!auth.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Missing bearer token" });
	}
	const token = auth.substring("Bearer ".length);
	if (token !== expected) {
		return res.status(403).json({ error: "Invalid token" });
	}
	next();
}

app.post("/fal", falAuth, async (req, res) => {
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

// Lightweight API docs endpoint
app.get("/", (req, res) => {
	const docs = {
		name: "aid-n8n-proxy API",
		version: "1.0",
		endpoints: [
			{
				method: "GET",
				path: "/health",
				description: "Service health status",
				response: { status: "ok", uptime: "<seconds>", timestamp: "<ms epoch>" }
			},
			{
				method: "GET",
				path: "/sensor",
				description: "Simulated sensor readings",
				response: {
					moisture: { value: 0, unit: "%" },
					conductivity: { value: 0, unit: "mS/cm" },
					temperature: { value: 0, unit: "°C" },
					light: { value: 0, unit: "Lux" }
				}
			},
			{
				method: "POST",
				path: "/fal",
				auth: "Bearer token in Authorization header (FAL_DUMMY_BEARER)",
				body: { prompt: "string", image_url: "string" },
				query: { fal_webhook: "optional webhook URL" },
				description: "Proxy to FAL AI image edit model",
				notes: "Returns requestId and data from model subscription"
			},
			{
				method: "GET",
				path: "/volume/*",
				description: "Static files served from volume directory"
			}
		]
	};

	if (req.accepts("html")) {
		const rows = docs.endpoints.map(e => `
			<tr>
				<td><code>${e.method}</code></td>
				<td><code>${e.path}</code></td>
				<td>${e.description || ""}</td>
				<td>${e.auth || "-"}</td>
			</tr>`).join("");
		return res.send(`<!DOCTYPE html><html><head><meta charset='utf-8'/><title>API Docs</title>
			<style>body{font-family:system-ui,Arial,sans-serif;padding:1rem;max-width:960px;margin:auto;background:#fafafa;color:#222} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ccc;padding:.5rem .75rem;text-align:left;} th{background:#eee;} code{background:#eee;padding:2px 4px;border-radius:4px;font-size:.9em;} h1{margin-top:0;} .muted{color:#666;font-size:.85em;}</style>
			</head><body><h1>aid-n8n-proxy API</h1>
			<p class='muted'>Content negotiation: <code>/docs</code> returns JSON by default, HTML when <code>Accept: text/html</code>.</p>
			<h2>Endpoints</h2>
			<table><thead><tr><th>Method</th><th>Path</th><th>Description</th><th>Auth</th></tr></thead><tbody>${rows}</tbody></table>
			<h2>Auth</h2>
			<p><strong>/fal</strong> requires <code>Authorization: Bearer &lt;FAL_DUMMY_BEARER&gt;</code>. Configure via <code>.env</code>.</p>
			<h2>Examples</h2>
			<pre><code>curl -H "Accept: application/json" http://localhost:${EXPRESS_PORT}/health
curl http://localhost:${EXPRESS_PORT}/sensor
curl -X POST http://localhost:${EXPRESS_PORT}/fal \\
	-H "Authorization: Bearer $FAL_DUMMY_BEARER" \\
	-H "Content-Type: application/json" \\
	-d '{"prompt":"desc","image_url":"https://..."}'
			</code></pre>
			</body></html>`);
	}
	res.json(docs);
});

app.listen(EXPRESS_PORT, () => {
	console.log(`Server running at http://localhost:${EXPRESS_PORT}`);
});
