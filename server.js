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
      referenceId: referenceId, // ID do pedido (obrigatório)
      amount: totalCentavos, // valor TOTAL em centavos (ex: 1990)
      currency: "BRL",

      product: {
        name: "Copo Personalizado Infantil"
      },

      successUrl: "https://seusite.com/sucesso",
      cancelUrl: "https://seusite.com/cancelado"
    };

    const amount = Number(payload.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount inválido", amount });
    }

    if (
      !payload.successUrl?.startsWith("https://") ||
      !payload.cancelUrl?.startsWith("https://")
    ) {
      return res.status(400).json({
        error: "URLs inválidas",
        successUrl: payload.successUrl,
        cancelUrl: payload.cancelUrl
      });
    }

    console.log("SIGILOPAY PAYLOAD:", JSON.stringify(payload, null, 2));

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

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data
        },
        message: `Erro SigiloPay ${response.status}`
      };
    }

    if (!data.checkoutUrl) {
      return res.status(500).json({ error: "Erro SigiloPay", details: data });
    }

    res.json({ checkout_url: data.checkoutUrl });

  } catch (error) {
    console.log("SIGILOPAY STATUS:", error?.response?.status);
    console.log("SIGILOPAY DATA:", JSON.stringify(error?.response?.data, null, 2));
    console.log("SIGILOPAY MESSAGE:", error?.message);
    console.log("SIGILOPAY STACK:", error?.stack);
    res.status(500).json({ error: "Erro interno", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server na porta", PORT));
