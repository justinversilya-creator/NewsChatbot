from pydantic import BaseModel, Field

class NewsContext(BaseModel):
    title: str = Field(..., description="Title of the news article")
    summary: str = Field(..., description="Summary of the news article")
    source: str = Field(..., description="Source of the news article")
    published: str = Field(..., description="Published date of the news article")
    category: str = Field(..., description="Category of the news article")
    url: str = Field(..., description="URL of the news article")

class ChatRequest(BaseModel):
    news: NewsContext = Field(..., description="The news article context to answer from")
    question: str = Field(..., min_length=1, description="The user's question about the news article")

class ChatResponse(BaseModel):
    answer: str = Field(..., description="The answer to the user's question")
    source: str = Field(..., description="The source of the news article used for context")
    grounded: bool = Field(True, description="Whether the answer is grounded in the provided context")
