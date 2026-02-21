import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { totalReais } = req.body;
    const totalCentavos = Math.round(Number(totalReais) * 100);
    const referenceId = `pedido-${Date.now()}`;

    const payload = {
      referenceId,
      amount: totalCentavos,
      currency: "BRL",
      product: { name: "Copo Personalizado Infantil" },
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

    if (!response.ok) {
      return res.status(500).json({ error: "Erro SigiloPay", details: data });
    }

    return res.json({ url: data.checkoutUrl });
  } catch (error) {
    console.log("ERRO:", error?.message);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server na porta", PORT));
