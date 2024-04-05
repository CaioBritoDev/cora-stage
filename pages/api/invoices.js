import axios from "axios";
const https = require("https");

function invoices(request, response) {

  const authKey = process.env.AUTH_KEY;

  const bearer = request.headers["authorization"];

  if (!bearer)
    return response
      .status(401)
      .json({ message: "authorization failed in endpoint stage - header without authorization" });

  const endpointKey = bearer.replace("Bearer", "").trim();

  if (endpointKey !== authKey) {
    return response
      .status(401)
      .json({ message: "authorization failed in endpoint stage - invalid endpoint key" });
  }

  const cert = Buffer.from(process.env.CERTIFICATE, "base64");

  const key = Buffer.from(process.env.PRIVATE_KEY, "base64");

  const url = "https://matls-clients.api.stage.cora.com.br/invoices";

  const params = JSON.stringify({
    code: request.body._id,
    customer: request.body.customer,
    services: request.body.services,
    payment_terms: request.body.payment_terms,
    notifications: request.body.notifications,
    payment_forms: request.body.payment_forms
  });

  // AXIOS REQUEST

  const agent = new https.Agent({
    cert: cert,
    key: key,
  });

  axios
    .post(url, params, {
      headers: {
        // "Accept": "application/json",
        "Content-Type": "application/json",
        "Idempotency-Key": request.body._id,
        Authorization: `Bearer ${request.body.token}`,
      },
      httpsAgent: agent,
    })
    .then((res) => {
      // Always 200 status code
      return response.status(200).json(
        res.data // Axios make res.json() and stores in the data
      );
    })
    .catch((error) => {
      return response.status(499).json(error);
    });
}

export default invoices;
