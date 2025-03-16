from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel

from models import Question, Answer, CheckResult, ExamRequest
from database import get_random_question, get_question_by_id, get_random_questions
from services import check_answer, check_answer_with_explanation

app = FastAPI(title="Hệ Thống Kiểm Tra Kiến Thức")

# Cấu hình CORS để frontend có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong môi trường production, hãy giới hạn nguồn gốc
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với API Kiểm Tra Kiến Thức"}

@app.get("/get-question", response_model=Question)
def get_question():
    """Lấy một câu hỏi ngẫu nhiên từ cơ sở dữ liệu"""
    question = get_random_question()
    if not question:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi nào")
    return question

@app.post("/check-answer", response_model=CheckResult)
async def validate_answer(answer_data: Answer):
    """Kiểm tra câu trả lời của người dùng và tạo lời giải thích bằng OpenAI"""
    question = get_question_by_id(answer_data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
    
    # Sử dụng OpenAI để tạo lời giải thích
    result = await check_answer_with_explanation(question, answer_data.answer)
    return result

@app.post("/generate-exam", response_model=List[Question])
def generate_exam(exam_request: ExamRequest):
    """Tạo một bài kiểm tra với số lượng câu hỏi chỉ định"""
    if exam_request.num_questions <= 0:
        raise HTTPException(status_code=400, detail="Số lượng câu hỏi phải lớn hơn 0")
    
    questions = get_random_questions(exam_request.num_questions)
    if not questions:
        raise HTTPException(status_code=404, detail="Không thể tạo bài kiểm tra")
    
    return questions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 