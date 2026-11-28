from google import genai
from google.genai import types


class AssistenteGemini:
    def __init__(self, chave_api, modelo="gemini-2.5-flash"):
        self.chave_api = chave_api
        self.modelo = modelo
        self._cliente = None

    @property
    def cliente(self):
        # Mantém as ferramentas do banco disponíveis sem configurar a chave Gemini.
        if self._cliente is None:
            if not self.chave_api:
                raise RuntimeError("Configure GEMINI_API_KEY no arquivo MCP/.env.")
            self._cliente = genai.Client(api_key=self.chave_api)
        return self._cliente

    def perguntar(self, instrucao, pergunta):
        """Envia uma pergunta ao Gemini e devolve o texto da resposta."""
        resposta = self.cliente.models.generate_content(
            model=self.modelo,
            contents=pergunta,
            config=types.GenerateContentConfig(system_instruction=instrucao),
        )
        if not resposta.text:
            raise RuntimeError("O Gemini não retornou uma resposta em texto.")
        return resposta.text.strip()

    def gerar_sql(self, pergunta, esquema):
        """Transforma uma pergunta em português em um comando SELECT."""
        instrucao = (
            "Você é especialista em PostgreSQL. "
            "Com base nas tabelas abaixo, escreva UM comando SELECT que responda à pergunta. "
            "Responda somente com o SQL, sem explicações e sem ```.\n\n"
            f"Tabelas:\n{esquema}"
        )
        sql = self.perguntar(instrucao, pergunta)
        return sql.replace("```sql", "").replace("```", "").strip()

    def explicar_resultado(self, pergunta, dados):
        """Escreve uma resposta amigável a partir dos dados do banco."""
        instrucao = "Responda à pergunta do usuário em português, de forma curta, usando apenas os dados fornecidos."
        return self.perguntar(instrucao, f"Pergunta: {pergunta}\nDados: {dados}")
