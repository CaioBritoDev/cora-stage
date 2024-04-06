import axios from "axios";
const https = require("https");

function invoices(request, response) {

  const authKey = process.env.AUTH_KEY;

  const bearer = request.headers["authorization"];

  if (!request.body) {
    return response.status(400).json({ message: "no body in request" });
  }

  const action = request.body.action;

  if (!action) {
    return response
      .status(400)
      .json({ message: "no action (create, cancel, find) in body" });
  }

  if (!bearer) {
    return response.status(401).json({
      message:
        "authorization failed in endpoint stage - header without authorization",
    });
  }

  const endpointKey = bearer.replace("Bearer", "").trim();

  if (endpointKey !== authKey) {
    return response.status(401).json({
      message: "authorization failed in endpoint stage - invalid endpoint key",
    });
  }

  const cert = Buffer.from(process.env.CERTIFICATE, "base64");

  const key = Buffer.from(process.env.PRIVATE_KEY, "base64");

  if (action === "create") {

    const url = "https://matls-clients.api.stage.cora.com.br/invoices";

    const params = JSON.stringify({
      code: request.body._id,
      customer: request.body.customer,
      services: request.body.services,
      payment_terms: request.body.payment_terms,
      notifications: request.body.notifications,
      payment_forms: request.body.payment_forms,
    });

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

  } else if (action === "cancel") {

    const { invoice_id } = request.query;

    if (!invoice_id) {
      return response.status(400).json({
        message:
          "please, provide a invoice_id to cancel in query params (invoice_id)",
      });
    }

    const url =
      "https://matls-clients.api.stage.cora.com.br/invoices/" + invoice_id;

    const agent = new https.Agent({
      cert: cert,
      key: key,
    });

    axios
      .delete(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${request.body.token}`,
        },
        httpsAgent: agent,
      })
      .then((res) => {
        // Always 200 status code
        return response.status(200).json(
          res // Axios make res.json() and stores in the data
        );
      })
      .catch((error) => {
        return response.status(499).json(error);
      });
  }
}

export default invoices;
