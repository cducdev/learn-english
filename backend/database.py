import asyncio
from typing import List, Dict, Any, Optional, Union
from openai_helper import generate_questions
import uuid

# Danh sách câu hỏi tạm thời để lưu trữ các câu hỏi đã tạo (nếu muốn lưu lại)
generated_questions = []

async def get_random_question(question_types: Optional[List[str]] = None, topic: Optional[str] = None):
    """Lấy một câu hỏi ngẫu nhiên do OpenAI tạo"""
    questions = await generate_questions(num_questions=1, question_types=question_types, topic=topic)
    if not questions:
        return None
    question = questions[0]
    generated_questions.append(question)  # Lưu câu hỏi vào danh sách tạm
    return question

async def get_random_questions(num_questions: int, question_types: Optional[List[str]] = None, topic: Optional[str] = None):
    """Lấy nhiều câu hỏi ngẫu nhiên do OpenAI tạo"""
    questions = await generate_questions(num_questions=num_questions, question_types=question_types, topic=topic)
    if not questions:
        return []
    generated_questions.extend(questions)  # Lưu các câu hỏi vào danh sách tạm
    return questions

def get_question_by_id(question_id: str):
    """Lấy câu hỏi theo ID từ danh sách đã tạo"""
    for question in generated_questions:
        if question["id"] == question_id:
            return question
    return None

def add_question(question_data: Dict[str, Any]):
    """Thêm câu hỏi mới vào danh sách"""
    question_data["id"] = str(uuid.uuid4())
    generated_questions.append(question_data)
    return question_data