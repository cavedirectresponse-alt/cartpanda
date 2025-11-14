export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
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
