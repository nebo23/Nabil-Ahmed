from fastapi import FastAPI
from models import message, UpdateMessage
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from typing import List
import requests 
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db: List[message] = []


@app.get("/message", response_model=List[message])
async def get_message():
    return db

@app.post("/post_message", response_model=message)
async def post_message(payload: message):
    db.append(payload)
    data_for_n8n = payload.dict()
    data_for_n8n["id"] = str(data_for_n8n["id"])
    save_message_and_trigger_email(data_for_n8n)
    return payload

def save_message_and_trigger_email(message_data: dict): # خليها تستلم dict

    n8n_webhook_url = os.getenv("N8N_WEBHOOK_URL")

    try:
        response = requests.post(n8n_webhook_url, json=message_data)
        

        print(f"Status: {response.status_code}")
        print(f"Response Body: {response.text}") 
        
    except Exception as e:
        print(f"Error connecting to n8n: {e}")


@app.put("/update_message/{message_id}", response_model=message)
async def update_message(message_id: uuid.UUID, payload: UpdateMessage):
    for item in db:
        if item.id == message_id:
            if payload.name is not None:
                item.name = payload.name
            if payload.email is not None:
                item.email = payload.email
            if payload.message is not None:
                item.message = payload.message
            return item

    raise HTTPException(status_code=404, detail="Message not found")

@app.delete("/delete_message/{message_id}", response_model=message)
async def delete_message(message_id: uuid.UUID):
    for item in db:
        if str(item.id) == str(message_id):
            db.remove(item)
            return item
    raise HTTPException(status_code=404, detail="Message not found")

