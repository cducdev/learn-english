from typing import Dict, Any, List, Union
import asyncio
from openai_helper import generate_explanation

async def check_answer_with_explanation(question: Dict[str, Any], user_answer: Union[str, List[str]]) -> Dict[str, Any]:
    """
    Kiểm tra câu trả lời của người dùng và tạo lời giải thích bằng OpenAI
    
    Args:
        question: Câu hỏi cần kiểm tra
        user_answer: Câu trả lời của người dùng
        
    Returns:
        Dict chứa kết quả kiểm tra (đúng/sai) và lời giải thích
    """
    # Kiểm tra đáp án
    result = check_answer(question, user_answer)
    
    # Tạo lời giải thích bằng OpenAI
    explanation = await generate_explanation(question)
    if explanation:
        result["explanation"] = explanation
    
    return result

def check_answer(question: Dict[str, Any], user_answer: Union[str, List[str]]) -> Dict[str, Any]:
    """
    Kiểm tra câu trả lời của người dùng
    
    Args:
        question: Câu hỏi cần kiểm tra
        user_answer: Câu trả lời của người dùng
        
    Returns:
        Dict chứa kết quả kiểm tra (đúng/sai) và lời giải thích
    """
    question_type = question["type"]
    correct_answer = question["answer"]
    explanation = question.get("explanation", "")
    
    # Kiểm tra theo loại câu hỏi
    if question_type == "fill_blank":
        # Kiểm tra câu trả lời điền vào chỗ trống
        is_correct = normalize_answer(user_answer) == normalize_answer(correct_answer)
    
    elif question_type == "multiple_choice":
        # Kiểm tra câu trả lời trắc nghiệm
        is_correct = user_answer == correct_answer
    
    elif question_type == "sentence_rearrangement":
        # Kiểm tra câu trả lời sắp xếp câu
        if not isinstance(user_answer, list) or not isinstance(correct_answer, list):
            is_correct = False
        else:
            # So sánh hai danh sách
            is_correct = len(user_answer) == len(correct_answer) and all(
                normalize_answer(a) == normalize_answer(b) 
                for a, b in zip(user_answer, correct_answer)
            )
    else:
        # Loại câu hỏi không được hỗ trợ
        is_correct = False
        explanation = "Loại câu hỏi không được hỗ trợ"
    
    return {
        "correct": is_correct,
        "explanation": explanation,
        "correct_answer": correct_answer
    }

def normalize_answer(answer: Union[str, List[str]]) -> Union[str, List[str]]:
    """
    Chuẩn hóa câu trả lời để so sánh (loại bỏ khoảng trắng thừa, chuyển về chữ thường)
    
    Args:
        answer: Câu trả lời cần chuẩn hóa
        
    Returns:
        Câu trả lời đã chuẩn hóa
    """
    if isinstance(answer, str):
        return answer.strip().lower()
    elif isinstance(answer, list):
        return [item.strip().lower() if isinstance(item, str) else item for item in answer]
    return answer 