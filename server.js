app.post("/criar-pagamento", async (req, res) => {
  try {
    const items = req.body.items || req.body.products;
codex/generate-unique-referenceid-for-payments-eidhyr
 main
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    const totalReais = items.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      if (!Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) return sum;
      return sum + price * quantity;
    }, 0);

    const totalCentavos = Math.round(totalReais * 100);
    if (!Number.isInteger(totalCentavos) || totalCentavos <= 0) {
      return res.status(400).json({ error: "Total inválido", totalReais });
    }

codex/generate-unique-referenceid-for-payments-eidhyr
    const referenceId = `pedido-${Date.now()}`;

    const payload = {
      referenceId,
      amount: totalCentavos,
      currency: "BRL",
      product: { name: "Copo Personalizado Infantil" },
      successUrl: "https://seusite.com/sucesso",
      cancelUrl: "https://seusite.com/cancelado"
    };


    if (!Number.isInteger(totalCentavos) || totalCentavos <= 0) {
      return res.status(400).json({ error: "Total inválido", totalReais });
    }

    const referenceId = `pedido-${Date.now()}`;

    const payload = {
      referenceId,
      amount: totalCentavos,
      currency: "BRL",
      product: { name: "Copo Personalizado Infantil" },
      successUrl: "https://seusite.com/sucesso",
      cancelUrl: "https://seusite.com/cancelado"
    };

 main
    const response = await fetch("https://app.sigilopay.com.br/api/v1/gateway/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": process.env.SIGILO_PUBLIC_KEY,
        "x-secret-key": process.env.SIGILO_SECRET_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("SIGILOPAY STATUS:", response.status);
      console.log("SIGILOPAY DATA:", JSON.stringify(data, null, 2));
      return res.status(500).json({ error: "Erro SigiloPay", details: data });
    }

    return res.json({ url: data.checkoutUrl });
  } catch (error) {
    console.log("ERRO:", error?.message);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});
