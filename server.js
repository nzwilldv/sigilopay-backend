import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { products = [], customer = {} } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    // ✅ soma total do carrinho (price * quantity)
    const total = products.reduce((acc, p) => {
      const price = Number(p.price ?? 0);
      const qty = Number(p.quantity ?? 1);
      return acc + price * qty;
    }, 0);

    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ error: "Total inválido", total });
    }

    const priceInCents = Math.round(total * 100);

    const payload = {
      product: {
        externalId: `cart-${Date.now()}`,
        name: `Carrinho (${products.length} item${products.length > 1 ? "s" : ""})`,
        photos: [], // ✅ não enviar fotos (evita erro de URL)
        offer: {
          name: "Compra no carrinho",
          price: priceInCents, // ✅ centavos
          offerType: "NATIONAL",
          currency: "BRL",
          lang: "pt-BR",
        },
      },
      settings: {
        paymentMethods: ["PIX", "CREDIT_CARD", "BOLETO"],
        acceptedDocs: ["CPF"],
        askForAddress: false,
      },
      customer,
      trackProps: {
        source: "site",
        items_count: String(products.length),
      },
    };

    const response = await fetch(
      "https://app.sigilopay.com.br/api/v1/gateway/checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-public-key": process.env.SIGILO_PUBLIC_KEY,
          "x-secret-key": process.env.SIGILO_SECRET_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.checkoutUrl) {
      return res.status(500).json({ error: "Erro SigiloPay", details: data });
    }

    return res.json({ checkout_url: data.checkoutUrl });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res
      .status(500)
      .json({ error: "Erro interno", details: String(error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server na porta", PORT));
