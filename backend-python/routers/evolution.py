import os
import httpx
import json
from fastapi import APIRouter, Response, HTTPException, status, Request, Depends
from pydantic import BaseModel

# --- Modelos Pydantic ---
class WebhookMessage(BaseModel):
    instance: str
    data: dict

class OutgoingMessage(BaseModel):
    instanceName: str
    number: str
    message: str

# --- Função para criar o router com dependências injetadas ---
def create_evolution_router(
    http_client: httpx.AsyncClient,
    evolution_api_url: str,
    evolution_api_key: str,
    publish_message_func: callable
):
    router = APIRouter()

    @router.get("/connections/{instance_name}/qrcode")
    async def get_qrcode(instance_name: str):
        headers = {"apikey": evolution_api_key}
        url = f"{evolution_api_url}/instance/connectionqr/{instance_name}"
        
        try:
            response = await http_client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            
            data = response.json()
            if data.get("base64"):
                return Response(content=data["base64"], media_type="image/png")
            elif data.get("qrcode"):
                return {"qrcode_url": data["qrcode"]}
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR Code não encontrado ou formato inesperado.")

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Erro da Evolution API: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro de rede ao conectar à Evolution API: {e}")

    @router.get("/connections/{instance_name}/status")
    async def get_connection_status(instance_name: str):
        headers = {"apikey": evolution_api_key}
        url = f"{evolution_api_url}/instance/connectionState/{instance_name}"

        try:
            response = await http_client.get(url, headers=headers, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Erro da Evolution API: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro de rede ao conectar à Evolution API: {e}")

    @router.post("/webhook")
    async def evolution_webhook(webhook_data: WebhookMessage):
        publish_message_func('evolution_webhooks', webhook_data.dict())
        return {"status": "ok", "message": "Webhook recebido e publicado no RabbitMQ.", "data": webhook_data.dict()}

    @router.post("/send-message")
    async def send_message(outgoing_message: OutgoingMessage):
        headers = {"apikey": evolution_api_key, "Content-Type": "application/json"}
        url = f"{evolution_api_url}/message/sendText/{outgoing_message.instanceName}"
        payload = {"number": outgoing_message.number, "options": {"delay": 1200}, "textMessage": {"text": outgoing_message.message}}

        try:
            response = await http_client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Erro da Evolution API: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro de rede ao conectar à Evolution API: {e}")

    return router
