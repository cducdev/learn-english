import os
from typing import Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

# Cấu hình API key cho OpenAI
# Trong môi trường thực tế, nên sử dụng biến môi trường
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# Khởi tạo client
client = OpenAI(api_key=api_key)

async def generate_explanation(question: Dict[str, Any]) -> Optional[str]:
    """
    Sử dụng OpenAI để tạo lời giải thích cho câu hỏi
    
    Args:
        question: Câu hỏi cần giải thích
        
    Returns:
        Lời giải thích được tạo bởi OpenAI hoặc None nếu có lỗi
    """
    try:
        # Kiểm tra xem API key đã được cấu hình chưa
        if not api_key:
            print("OpenAI API key chưa được cấu hình")
            return None
        
        # Chuẩn bị prompt cho OpenAI
        question_text = question["question"]
        question_type = question["type"]
        correct_answer = question["answer"]
        
        # Tạo prompt dựa trên loại câu hỏi
        if question_type == "fill_blank":
            prompt = f"""
            Hãy giải thích chi tiết cho câu hỏi điền vào chỗ trống sau:
            
            Câu hỏi: {question_text}
            Đáp án đúng: {correct_answer}
            
            Giải thích tại sao đáp án này là đúng và cung cấp thêm thông tin liên quan.
            """
        elif question_type == "multiple_choice":
            options = question.get("options", [])
            options_text = "\n".join([f"- {opt}" for opt in options])
            prompt = f"""
            Hãy giải thích chi tiết cho câu hỏi trắc nghiệm sau:
            
            Câu hỏi: {question_text}
            Các lựa chọn:
            {options_text}
            
            Đáp án đúng: {correct_answer}
            
            Giải thích tại sao đáp án này là đúng và tại sao các đáp án khác là sai.
            """
        elif question_type == "sentence_rearrangement":
            if isinstance(correct_answer, list):
                correct_answer_text = " ".join(correct_answer)
            else:
                correct_answer_text = str(correct_answer)
                
            prompt = f"""
            Hãy giải thích chi tiết cho câu hỏi sắp xếp câu sau:
            
            Câu hỏi: {question_text}
            Đáp án đúng: {correct_answer_text}
            
            Giải thích tại sao đây là thứ tự đúng và cung cấp thêm thông tin về cấu trúc câu.
            """
        else:
            prompt = f"""
            Hãy giải thích chi tiết cho câu hỏi sau:
            
            Câu hỏi: {question_text}
            Loại câu hỏi: {question_type}
            Đáp án đúng: {correct_answer}
            
            Giải thích tại sao đáp án này là đúng và cung cấp thêm thông tin liên quan.
            """
        
        # Gọi API OpenAI với phiên bản mới
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý giáo dục, giúp giải thích các câu hỏi một cách rõ ràng và chi tiết bằng tiếng Việt."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        # Trích xuất lời giải thích từ phản hồi
        explanation = response.choices[0].message.content.strip()
        return explanation
        
    except Exception as e:
        print(f"Lỗi khi gọi OpenAI API: {str(e)}")
        return None

def is_openai_configured() -> bool:
    """Kiểm tra xem OpenAI API đã được cấu hình chưa"""
    return bool(api_key) 