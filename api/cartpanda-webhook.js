export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    console.log("Webhook recebido da CartPanda:", req.body);

    const body = req.body;

    // 1) Conferir se o evento é order.paid
    const event = body.event;
    if (event !== "order.paid") {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const data = body.data;

    // 2) Extrair customer_id + payment_method_id
    const customerId = data.customer_id;
    const paymentMethodId = data.payment_method_id;

    // 3) Criar assinatura via API do CartPanda
    const response = await fetch("https://api.cartpanda.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CARTPANDA_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        variant_id: 202602407,
        price: 16900, // $169.00 USD
        interval_unit: "month",
        interval_count: 1

        price: 16900,   // $169 USD em centavos
        status: "active",
        start_date: null

      })
    });

    const json = await response.json();
    console.log("Resposta da criação da assinatura:", json);

    return res.status(200).json({ ok: true, subscription: json });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.status(500).json({ error: true });
  }
}
