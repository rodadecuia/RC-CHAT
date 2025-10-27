import os
import httpx
import pika
import json
from fastapi import FastAPI

from routers.evolution import create_evolution_router # Importação corrigida

app = FastAPI()

# --- Configurações da Evolution API ---
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY")

if not EVOLUTION_API_URL or not EVOLUTION_API_KEY:
    raise ValueError("EVOLUTION_API_URL e EVOLUTION_API_KEY devem ser definidos nas variáveis de ambiente.")

# --- Configurações do RabbitMQ ---
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD")

if not all([RABBITMQ_HOST, RABBITMQ_USER, RABBITMQ_PASSWORD]):
    raise ValueError("Variáveis de ambiente do RabbitMQ não configuradas corretamente.")

# Cliente HTTP para fazer requisições assíncronas (compartilhado)
http_client = httpx.AsyncClient()

# --- Conexão RabbitMQ ---
connection = None
channel = None

def connect_rabbitmq():
    global connection, channel
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials))
        channel = connection.channel()
        channel.queue_declare(queue='evolution_webhooks', durable=True)
        channel.queue_declare(queue='outgoing_messages', durable=True)
        print("Conectado ao RabbitMQ com sucesso.")
    except pika.exceptions.AMQPConnectionError as e:
        print(f"Erro ao conectar ao RabbitMQ: {e}")

@app.on_event("startup")
async def startup_event():
    connect_rabbitmq()

@app.on_event("shutdown")
async def shutdown_event():
    if connection:
        connection.close()
        print("Conexão RabbitMQ fechada.")

def publish_message(queue_name: str, message: dict):
    if channel:
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent
            )
        )
        print(f"Mensagem publicada na fila {queue_name}: {message}")
    else:
        print("Erro: Canal RabbitMQ não está disponível.")

# --- Inclui o router da Evolution API na aplicação principal ---
evolution_router = create_evolution_router(
    http_client=http_client,
    evolution_api_url=EVOLUTION_API_URL,
    evolution_api_key=EVOLUTION_API_KEY,
    publish_message_func=publish_message
)
app.include_router(evolution_router, prefix="/api/evolution")

@app.get("/")
def read_root():
    return {"message": "Backend Python Works!"}
