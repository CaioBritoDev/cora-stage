import axios from "axios";

function token(request, response) {

  const apiSecret = process.env.CLIENT_ID_STAGE;
  const authKey = process.env.AUTH_KEY;

  let bearer = request.headers["authorization"]

  if (!bearer) return response.status(401).json({ message: "authorization failed" });

  bearer = bearer.replace("Bearer", "").trim();

  if (bearer !== authKey) {
    return response.status(401).json({ message: "authorization failed" });
  }

  const cert = Buffer.from(process.env.CERTIFICATE, 'base64');

  const key = Buffer.from(process.env.PRIVATE_KEY, 'base64');

  const url = "https://matls-clients.api.stage.cora.com.br/token";

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiSecret,
  }).toString();

  // AXIOS REQUEST

  const agent = new https.Agent({
    cert: cert,
    key: key,
  });

  axios
    .post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent: agent,
    })
    .then((res) => {
      return response.status(200).json(
        res.data, // Axios make res.json() and stores in the data
      );
    })
    .catch((error) => {
      return response.status(400).json({
        err: error,
      });
    });

  // XML HTTP REQUEST - NODE

  /*const https = require("https");

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cert: cert,
    key: key,
  };

  const req = https.request(url, options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(JSON.parse(data));
      response.json({
        data: JSON.parse(data)
      })
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error);
    response.json({
      err: error
    })
  });

  req.write(params); // Send the body
  req.end();*/

  // If you want to save the response in cache and perform your endpoint - in 10 seconds, versel make other request and put in the cache - your website never going to crash -> just for generic responses endpoints. Not my case
  // response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')

}

export default token;