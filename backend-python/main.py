import os
import httpx
from fastapi import FastAPI, APIRouter, Response, HTTPException, status, Request
from pydantic import BaseModel

app = FastAPI()

# --- Configurações da Evolution API ---
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY")

if not EVOLUTION_API_URL or not EVOLUTION_API_KEY:
    raise ValueError("EVOLUTION_API_URL e EVOLUTION_API_KEY devem ser definidos nas variáveis de ambiente.")

# Cliente HTTP para fazer requisições assíncronas
http_client = httpx.AsyncClient()

evolution_router = APIRouter(prefix="/api/evolution")

# --- Modelos Pydantic para Webhook ---
class WebhookMessage(BaseModel):
    instance: str
    data: dict
    # Adicione outros campos que a Evolution API envia no webhook

# --- Endpoints da Evolution API ---

@evolution_router.get("/connections/{instance_name}/qrcode")
async def get_qrcode(instance_name: str):
    headers = {"apikey": EVOLUTION_API_KEY}
    url = f"{EVOLUTION_API_URL}/instance/connectionqr/{instance_name}"
    
    try:
        response = await http_client.get(url, headers=headers, timeout=30.0)
        response.raise_for_status() # Levanta HTTPException para status de erro (4xx, 5xx)
        
        # A Evolution API retorna um JSON com o QR Code em base64 ou uma URL
        data = response.json()
        if data.get("base64"):
            # Retorna a imagem base64 diretamente
            return Response(content=data["base64"], media_type="image/png")
        elif data.get("qrcode"): # Algumas versões/endpoints podem retornar a URL do QR
            # Se for uma URL, o frontend precisará buscar a imagem de lá
            return {"qrcode_url": data["qrcode"]}
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR Code não encontrado ou formato inesperado.")

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Erro da Evolution API: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro de rede ao conectar à Evolution API: {e}")

@evolution_router.get("/connections/{instance_name}/status")
async def get_connection_status(instance_name: str):
    headers = {"apikey": EVOLUTION_API_KEY}
    url = f"{EVOLUTION_API_URL}/instance/connectionState/{instance_name}"

    try:
        response = await http_client.get(url, headers=headers, timeout=10.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Erro da Evolution API: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro de rede ao conectar à Evolution API: {e}")

@evolution_router.post("/webhook")
async def evolution_webhook(request: Request):
    # Este endpoint receberá eventos da Evolution API
    # Por enquanto, apenas loga o que chega
    payload = await request.json()
    print(f"Webhook da Evolution API recebido: {payload}")
    # TODO: Processar o payload e encaminhar para o backend-node
    return {"status": "ok"}

# Inclui o router da Evolution API na aplicação principal
app.include_router(evolution_router)

@app.get("/")
def read_root():
    return {"message": "Backend Python Works!"}
