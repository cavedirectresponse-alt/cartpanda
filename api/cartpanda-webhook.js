module.exports.config = {
  runtime: "nodejs",
  api: {
    bodyParser: true,
  },
};

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    console.log("Webhook recebido da CartPanda:", req.body);

    const body = req.body || {};
    const event = body.event;

    if (event !== "order.paid") {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const data = body.data || {};
    const customerId = data.customer_id;
    const paymentMethodId = data.payment_method_id;

    if (!customerId || !paymentMethodId) {
      console.error("Faltando customer_id ou payment_method_id");
      return res.status(400).json({ error: "Missing fields" });
    }

    const response = await fetch("https://cartpanda.com/api/v1/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CARTPANDA_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        variant_id: 202602407,
        quantity: 1,
        interval_unit: "month",
        interval_count: 1,
        price: 16900,
        status: "active",
        start_date: null
      })
    });

    const json = await response.json();
    console.log("Resposta CartPanda:", json);

    return res.status(200).json({ ok: true, subscription: json });

  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
