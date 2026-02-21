import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/criar-pagamento", async (req, res) => {
  try {
    const response = await fetch("COLOQUE_AQUI_ENDPOINT_SIGILOPAY", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SIGILO_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    res.json({ checkout_url: data.checkout_url });

  } catch (error) {
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

app.listen(process.env.PORT || 3000);
