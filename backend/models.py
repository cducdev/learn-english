from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal

class Question(BaseModel):
    """Model cho câu hỏi"""
    id: int
    type: Literal["fill_blank", "multiple_choice", "sentence_rearrangement"]
    question: str
    options: Optional[List[str]] = None  # Cho câu hỏi trắc nghiệm
    answer: Union[str, List[str]]  # Đáp án có thể là chuỗi hoặc danh sách
    explanation: Optional[str] = None  # Giải thích đáp án

class Answer(BaseModel):
    """Model cho câu trả lời của người dùng"""
    question_id: int
    answer: Union[str, List[str]]  # Câu trả lời có thể là chuỗi hoặc danh sách

class CheckResult(BaseModel):
    """Model cho kết quả kiểm tra"""
    correct: bool
    explanation: Optional[str] = None
    correct_answer: Union[str, List[str]]

class ExamRequest(BaseModel):
    """Model cho yêu cầu tạo bài kiểm tra"""
    num_questions: int = Field(gt=0, description="Số lượng câu hỏi trong bài kiểm tra")
    question_types: Optional[List[str]] = None  # Loại câu hỏi cần lấy, nếu None thì lấy tất cả

class ExamResult(BaseModel):
    """Model cho kết quả bài kiểm tra"""
    total_questions: int
    correct_answers: int
    score: float  # Tỉ lệ đúng (0-100%)
    details: List[Dict[str, Any]]  # Chi tiết từng câu hỏi 