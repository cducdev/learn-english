# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel
from models import Question, Answer, CheckResult, ExamRequest
from database import get_random_question, get_question_by_id, get_random_questions
from services import check_answer, check_answer_with_explanation
from openai_helper import generate_explanation

app = FastAPI(title="Hệ Thống Kiểm Tra Kiến Thức")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với API Kiểm Tra Kiến Thức"}

@app.get("/get-question", response_model=Question)
def get_question():
    question = get_random_question()
    if not question:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi nào")
    return question

@app.post("/check-answer", response_model=CheckResult)
async def validate_answer(answer_data: Answer):
    question = get_question_by_id(answer_data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
    result = check_answer(question, answer_data.answer)  # Chỉ kiểm tra đáp án, không tạo explanation
    return result

@app.post("/get-explanation", response_model=dict)
async def get_explanation_endpoint(answer_data: Answer):
    question = get_question_by_id(answer_data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
    explanation = await generate_explanation(question)
    return {"explanation": explanation or "Không có giải thích"}

@app.post("/generate-exam", response_model=List[Question])
def generate_exam(exam_request: ExamRequest):
    if exam_request.num_questions <= 0:
        raise HTTPException(status_code=400, detail="Số lượng câu hỏi phải lớn hơn 0")
    questions = get_random_questions(exam_request.num_questions)
    if not questions:
        raise HTTPException(status_code=404, detail="Không thể tạo bài kiểm tra")
    return questions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)