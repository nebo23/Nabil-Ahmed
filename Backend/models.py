import uuid
from typing import Optional, List
from pydantic import BaseModel, Field

class message(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    email: str
    message: Optional[str] = None


class UpdateMessage(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    message: Optional[str] = None