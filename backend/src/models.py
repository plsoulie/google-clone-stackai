from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid


class SearchQuery(BaseModel):
    query: str
    num_results: int = 10
    location: Optional[str] = None


class OrganicResult(BaseModel):
    title: str
    link: str
    snippet: str
    position: int
    thumbnail: Optional[str] = None


class LocalResult(BaseModel):
    title: str
    address: str
    rating: Optional[float] = None
    reviews: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    thumbnail: Optional[str] = None


class KnowledgeGraph(BaseModel):
    title: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = {}


class RelatedQuestion(BaseModel):
    question: str
    snippet: Optional[str] = None


class SearchResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    organic_results: List[Dict[str, Any]] = []
    knowledge_graph: Optional[Dict[str, Any]] = None
    local_results: Optional[List[Dict[str, Any]]] = None
    related_questions: Optional[List[Dict[str, Any]]] = None
    related_searches: Optional[List[str]] = None
    inline_images: Optional[List[Dict[str, Any]]] = None
    answer_box: Optional[Dict[str, Any]] = None
    ai_response: Optional[str] = None
    location: Optional[str] = None


class AIResponse(BaseModel):
    search_id: str
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow) 