export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    console.log("Webhook recebido:", req.body);

    const body = req.body;

    const event = body.event;
    if (event !== "order.paid") {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const data = body.data;

    const customerId = data.customer_id;
    const paymentMethodId = data.payment_method_id;

    // 🔥 Criar assinatura via API da CartPanda
    const response = await fetch("https://api.cartpanda.com/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CARTPANDA_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        variant_id: 123456, // coloque seu variant_id da assinatura
        quantity: 1,
        interval_unit: "month",
        interval_count: 1,
        price: 4900, // preço em centavos (49.00 USD)
        status: "active",
        start_date: null
      })
    });

    const json = await response.json();

    console.log("Assinatura criada:", json);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.status(500).json({ error: true });
  }
}
