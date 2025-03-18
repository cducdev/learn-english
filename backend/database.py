import random
from typing import List, Dict, Any, Optional, Union

# Dữ liệu mẫu cho các câu hỏi
questions_data = [
    # Fill in the blank questions
    {
        "id": 1,
        "type": "fill_blank",
        "question": "The capital of Vietnam is _____.",
        "answer": "Hanoi"
    },
    {
        "id": 2,
        "type": "fill_blank",
        "question": "The Python programming language was created by _____.",
        "answer": "Guido van Rossum"
    },
    
    # Multiple choice questions
    {
        "id": 3,
        "type": "multiple_choice",
        "question": "Which is the largest planet in the Solar System?",
        "options": ["Earth", "Mars", "Jupiter", "Saturn"],
        "answer": "Jupiter"
    },
    {
        "id": 4,
        "type": "multiple_choice",
        "question": "Which programming language is most commonly used in AI?",
        "options": ["Java", "C++", "Python", "JavaScript"],
        "answer": "Python"
    },
    
    # Sentence rearrangement questions
    {
        "id": 5,
        "type": "sentence_rearrangement",
        "question": "Rearrange the following words to form a complete sentence.",
        "options": ["studying", "I", "university", "am", "at", "a"],
        "answer": ["I", "am", "studying", "at", "a", "university"]
    },
    {
        "id": 6,
        "type": "sentence_rearrangement",
        "question": "Arrange the steps to create a web application.",
        "options": ["Deployment", "Design", "Testing", "Requirement analysis", "Development"],
        "answer": ["Requirement analysis", "Design", "Development", "Testing", "Deployment"]
    },
    
    # Additional questions
    {
        "id": 7,
        "type": "fill_blank",
        "question": "The programming language used to develop iOS applications is _____.",
        "answer": "Swift"
    },
    {
        "id": 8,
        "type": "multiple_choice",
        "question": "Which is the most populous city in Vietnam?",
        "options": ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hai Phong"],
        "answer": "Ho Chi Minh City"
    },
    {
        "id": 9,
        "type": "sentence_rearrangement",
        "question": "Rearrange the following words to form a meaningful sentence.",
        "options": ["today", "rain", "is", "heavy"],
        "answer": ["today", "rain", "is", "heavy"]
    },
    {
        "id": 10,
        "type": "multiple_choice",
        "question": "Which of the following is an object-oriented programming language?",
        "options": ["HTML", "CSS", "JavaScript", "SQL"],
        "answer": "JavaScript"
    }
]


def get_random_question():
    """Lấy một câu hỏi ngẫu nhiên từ danh sách"""
    if not questions_data:
        return None
    return random.choice(questions_data)

def get_question_by_id(question_id: int):
    """Lấy câu hỏi theo ID"""
    for question in questions_data:
        if question["id"] == question_id:
            return question
    return None

def get_random_questions(num_questions: int, question_types: List[str] = None):
    """Lấy nhiều câu hỏi ngẫu nhiên theo số lượng và loại"""
    available_questions = questions_data
    
    # Lọc theo loại câu hỏi nếu có yêu cầu
    if question_types:
        available_questions = [q for q in questions_data if q["type"] in question_types]
    
    # Nếu số lượng yêu cầu lớn hơn số câu hỏi có sẵn, trả về tất cả
    if num_questions >= len(available_questions):
        return available_questions
    
    # Lấy ngẫu nhiên theo số lượng yêu cầu
    return random.sample(available_questions, num_questions)

def add_question(question_data: Dict[str, Any]):
    """Thêm câu hỏi mới vào danh sách"""
    # Tạo ID mới
    new_id = max([q["id"] for q in questions_data], default=0) + 1
    question_data["id"] = new_id
    
    questions_data.append(question_data)
    return question_data 