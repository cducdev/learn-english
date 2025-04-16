from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal

class Question(BaseModel):
    """Model cho câu hỏi"""
    id: int
    type: Literal["fill_blank", "multiple_choice", "sentence_rearrangement"]
    question: str
    options: Optional[List[str]] = None
    answer: Union[str, List[str]]
    explanation: Optional[str] = None

class Answer(BaseModel):
    """Model cho câu trả lời của người dùng"""
    question_id: int
    answer: Union[str, List[str]]

class CheckResult(BaseModel):
    """Model cho kết quả kiểm tra của 1 câu hỏi"""
    correct: bool
    explanation: Optional[str] = None
    correct_answer: Union[str, List[str]]

class ExamRequest(BaseModel):
    """Model cho yêu cầu tạo bài kiểm tra"""
    num_questions: int = Field(gt=0, description="Số lượng câu hỏi trong bài kiểm tra")
    question_types: Optional[List[str]] = None
    topic: Optional[str] = None  # Thêm trường topic

class ExamResult(BaseModel):
    """Model cho kết quả bài kiểm tra"""
    total_questions: int
    correct_answers: int
    score: float
    details: List[Dict[str, Any]]