from fastapi import FastAPI, HTTPException, status, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import requests 
import os
from dotenv import load_dotenv
from models import Message, Base
from schemas import UserMessage ,MessageResponse
from database import engine, get_db

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def auto_reply(message_data: dict):
    make_webhook_url = os.getenv("MAKE_WEBHOOK_URL")
    if not make_webhook_url:
        print("Make URL Not Found")
    try:
        response = requests.post(make_webhook_url, json=message_data)
        print(f"Make Webhook Status: {response.status_code}")
    except Exception as e:
        print(f"Error connecting to Make: {e}")


@app.post("/message", response_model=MessageResponse)
def create_message(message:UserMessage, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        db_message =Message(**message.dict()) 
        db.add(db_message)
        db.commit()
        db.refresh(db_message)

        data_for_make = message.dict()
        data_for_make["id"] = db_message.id
        background_tasks.add_task(auto_reply, data_for_make)

        return db_message

    except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))