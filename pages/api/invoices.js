import axios from "axios";
const https = require("https");

function invoices(request, response) {

  const authKey = process.env.AUTH_KEY;

  let bearer = request.headers["authorization"];

  if (!bearer)
    return response.status(401).json({ message: "authorization failed" });

  bearer = bearer.replace("Bearer", "").trim();

  if (bearer !== authKey) {
    return response.status(401).json({ message: "authorization failed" });
  }

  const cert = Buffer.from(process.env.CERTIFICATE, "base64");

  const key = Buffer.from(process.env.PRIVATE_KEY, "base64");

  const url = "https://matls-clients.api.stage.cora.com.br/invoices";

  const params = JSON.stringify({
    code: "meu_id",
    customer: {
      name: "Fulano da Silva",
      email: "fulano@email.com",
      document: {
        identity: "34052649000178",
        type: "CNPJ",
      },
      address: {
        street: "Rua Gomes de Carvalho",
        number: "1629",
        district: "Vila Olímpia",
        city: "São Paulo",
        state: "SP",
        complement: "N/A",
        zip_code: "00111222",
      },
    },
    services: [
      {
        name: "Nome do serviço",
        description: "Descrição do serviço",
        amount: 250,
      },
    ],
    payment_terms: {
      due_date: "2024-08-25",
      fine: { // Multa - Amount tem precedência sobre rate, quando definir rate, amount = 0
        amount: 20,
      },
      interest: { // Juros - Amount tem precedência sobre rate, quando definir rate, amount = 0
        rate: 3.67, // Valor percentual a ser cobrado
      },
      discount: {
        type: "PERCENT", // "PERCENT" or "FIXED". In fixed: R$ 20,50 = 2050
        value: 1.5,
      },
    },
    notifications: {
      channels: ["EMAIL"],
      destination: { // Para quem será enviado a notificação de e-mail
        name: "Fulano da Silva",
        email: "fulano@email.com"
      }, 
      rules: ["NOTIFY_ON_DUE_DATE", "NOTIFY_TWO_DAYS_AFTER_DUE_DATE", "NOTIFY_FIVE_DAYS_AFTER_DUE_DATE"] // https://developers.cora.com.br/reference/emiss%C3%A3o-de-boleto-registrado#enum-de-tipos-de-notifica%C3%A7%C3%A3o
    }
  });

  // AXIOS REQUEST

  const agent = new https.Agent({
    cert: cert,
    key: key,
  });

  return response.json({
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": request.body._id,
      "Authorization": `Bearer ${request.body.token}`
    },
    httpsAgent: agent,
  })

  axios
    .post(url, params, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Idempotency-Key": request.body._id,
        "Authorization": `Bearer ${request.body.token}`
      },
      httpsAgent: agent,
    })
    .then((res) => {
      return response.status(200).json(
        res.data // Axios make res.json() and stores in the data
      );
    })
    .catch((error) => {
      return response.status(400).json(
        error
      );
    });
}

export default invoices;
