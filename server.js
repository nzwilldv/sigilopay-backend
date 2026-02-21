import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    // total em reais
    const totalReais = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // CONVERSÃO CORRETA PARA CENTAVOS
    const totalCentavos = Math.round(totalReais * 100);
    const referenceId = `pedido-${Date.now()}`;

    const payload = {
  referenceId, // ID do pedido (obrigatório)
  amount: totalCentavos,        // valor TOTAL em centavos (ex: 1990)
  currency: "BRL",

  product: {
    name: "Copo Personalizado Infantil"
  },

  successUrl: "https://seusite.com/sucesso",
  cancelUrl: "https://seusite.com/cancelado"
};

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

    if (!data.checkoutUrl) {
      return res.status(500).json({ error: "Erro SigiloPay", details: data });
    }

    res.json({ checkout_url: data.checkoutUrl });

  } catch (err) {
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server na porta", PORT));
