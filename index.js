const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tareas = {
  "2.1_tarde": [
    "Revisar mochilas",
    "Ducha a Pau",
    "Entregar merienda",
    "Control medicación"
  ],
  "3.2_nit": [
    "Cambiar pañales",
    "Verificar puertas cerradas",
    "Pasar ronda cada 2h",
    "Apuntar observaciones"
  ]
};

app.post("/ask", async (req, res) => {
  const { pregunta } = req.body;

  if (!pregunta) {
    return res.status(400).json({ error: "Falta la pregunta" });
  }

  try {
    const systemMessage = {
      role: "system",
      content: "Eres un asistente que responde sobre tareas por planta y turno en un centro residencial. Si te preguntan por una planta y turno, busca en la base de datos y responde claramente. Si no sabes, di que no hay datos."
    };

    const userMessage = {
      role: "user",
      content: pregunta
    };

    const tareasString = Object.entries(tareas)
      .map(([clave, lista]) => `Planta y turno: ${clave} → ${lista.join(", ")}`)
      .join("\n");

    const contextMessage = {
      role: "user",
      content: `Base de datos:\n${tareasString}`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, contextMessage, userMessage],
      temperature: 0.2,
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al conectar con OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`Servidor IA activo en http://localhost:${port}`);
});
