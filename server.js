import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { products, customer } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    // 👉 usando o PRIMEIRO produto do carrinho
    const item = products[0];

    const payload = {
      product: {
        externalId: String(item.id || "produto-001"),
        name: item.name,
        photos: [],
        offer: {
          name: item.name,
          price: Math.round(Number(item.price) * 100), // CENTAVOS
          offerType: "NATIONAL",
          currency: "BRL",
          lang: "pt-BR"
        }
      },
      settings: {
        paymentMethods: ["PIX", "CREDIT_CARD", "BOLETO"],
        acceptedDocs: ["CPF"],
        askForAddress: false
      },
      customer: customer || {},
      trackProps: {
        source: "site"
      }
    };
console.log("PUBLIC len:", (process.env.SIGILO_PUBLIC_KEY || "").length);
console.log("SECRET len:", (process.env.SIGILO_SECRET_KEY || "").length);
    const response = await fetch(
  "https://app.sigilopay.com.br/api/v1/gateway/checkout",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-public-key": process.env.SIGILO_PUBLIC_KEY,
      "x-secret-key": process.env.SIGILO_SECRET_KEY
    },
    body: JSON.stringify(payload)
  }
);

    const data = await response.json();

    if (!response.ok || !data.checkoutUrl) {
      return res.status(500).json({
        error: "Erro SigiloPay",
        details: data
      });
    }

    return res.json({ checkout_url: data.checkoutUrl });

  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({
      error: "Erro interno",
      details: String(error)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log("Servidor rodando na porta", PORT)
);
