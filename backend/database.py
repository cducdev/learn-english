import random
from typing import List, Dict, Any, Optional, Union

# Dữ liệu mẫu cho các câu hỏi
questions_data = [
    # Câu hỏi điền vào chỗ trống
    {
        "id": 1,
        "type": "fill_blank",
        "question": "Thủ đô của Việt Nam là _____.",
        "answer": "Hà Nội"
    },
    {
        "id": 2,
        "type": "fill_blank",
        "question": "Ngôn ngữ lập trình Python được tạo ra bởi _____.",
        "answer": "Guido van Rossum"
    },
    
    # Câu hỏi trắc nghiệm
    {
        "id": 3,
        "type": "multiple_choice",
        "question": "Đâu là hành tinh lớn nhất trong hệ mặt trời?",
        "options": ["Trái Đất", "Sao Hỏa", "Sao Mộc", "Sao Thổ"],
        "answer": "Sao Mộc"
    },
    {
        "id": 4,
        "type": "multiple_choice",
        "question": "Ngôn ngữ lập trình nào được sử dụng phổ biến nhất trong AI?",
        "options": ["Java", "C++", "Python", "JavaScript"],
        "answer": "Python"
    },
    
    # Câu hỏi sắp xếp câu
    {
        "id": 5,
        "type": "sentence_rearrangement",
        "question": "Sắp xếp các từ sau thành câu hoàn chỉnh",
        "options": ["học", "tôi", "trường", "đang", "đại", "tại"],
        "answer": ["tôi", "đang", "học", "tại", "trường", "đại"]
    },
    {
        "id": 6,
        "type": "sentence_rearrangement",
        "question": "Sắp xếp các bước để tạo một ứng dụng web",
        "options": ["Triển khai", "Thiết kế", "Kiểm thử", "Phân tích yêu cầu", "Phát triển"],
        "answer": ["Phân tích yêu cầu", "Thiết kế", "Phát triển", "Kiểm thử", "Triển khai"]
    },
    
    # Thêm một số câu hỏi mới
    {
        "id": 7,
        "type": "fill_blank",
        "question": "Ngôn ngữ lập trình được sử dụng để phát triển ứng dụng iOS là _____.",
        "answer": "Swift"
    },
    {
        "id": 8,
        "type": "multiple_choice",
        "question": "Đâu là thành phố đông dân nhất Việt Nam?",
        "options": ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"],
        "answer": "Hồ Chí Minh"
    },
    {
        "id": 9,
        "type": "sentence_rearrangement",
        "question": "Sắp xếp các từ sau thành câu có nghĩa",
        "options": ["mưa", "trời", "hôm nay", "to"],
        "answer": ["hôm nay", "trời", "mưa", "to"]
    },
    {
        "id": 10,
        "type": "multiple_choice",
        "question": "Đâu là ngôn ngữ lập trình hướng đối tượng?",
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