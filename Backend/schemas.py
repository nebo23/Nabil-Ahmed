from pydantic import BaseModel
from typing import Optional

class UserMessage(BaseModel):
    name: str
    email: str
    message: str

class MessageResponse(BaseModel):
    id: int
    name: str
    email: str
    message: Optional[str] = None

    class Config:
        from_attributes = True