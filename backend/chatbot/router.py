from fastapi import APIRouter
from chatbot.schemas import ChatRequest, ChatResponse
from chatbot.chatbot_service import generate_chat_response

router = APIRouter(prefix="/api/chat", tags=["chatbot"])

@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Submit a question about a specific news article.
    The response will be generated using only the provided context.
    """
    return generate_chat_response(request)
