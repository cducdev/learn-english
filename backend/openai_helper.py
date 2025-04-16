import uuid
import os
from typing import Dict, Any, Optional, List
import openai
from dotenv import load_dotenv
import json

# Cấu hình API key cho OpenAI
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("OpenAI API key chưa được cấu hình")
else:
    openai.api_key = api_key

async def generate_explanation(question: Dict[str, Any]) -> Optional[str]:
    """
    Sử dụng OpenAI để tạo lời giải thích cho câu hỏi
    """
    try:
        question_text = question["question"]
        question_type = question["type"]
        correct_answer = question["answer"]

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

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý giáo dục, giúp giải thích các câu hỏi một cách rõ ràng và chi tiết bằng tiếng Việt."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        explanation = response.choices[0].message.content.strip()
        return explanation

    except Exception as e:
        print(f"Lỗi khi gọi OpenAI API: {str(e)}")
        return None

async def generate_questions(num_questions: int, question_types: Optional[List[str]] = None, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Sử dụng OpenAI để tạo danh sách câu hỏi theo số lượng và loại yêu cầu

    Args:
        num_questions: Số lượng câu hỏi cần tạo
        question_types: Danh sách loại câu hỏi (fill_blank, multiple_choice, sentence_rearrangement)
        topic: Chủ đề của câu hỏi (nếu có)

    Returns:
        Danh sách các câu hỏi theo định dạng tương tự questions_data
    """
    try:
        # Nếu không chỉ định loại câu hỏi, mặc định sử dụng tất cả
        if not question_types:
            question_types = ["fill_blank", "multiple_choice", "sentence_rearrangement"]

        # Chuẩn bị prompt cho OpenAI
        prompt = f"""
        Bạn là một trợ lý giáo dục, hãy tạo {num_questions} câu hỏi kiểm tra kiến thức theo định dạng JSON.
        Các câu hỏi phải thuộc các loại sau: {', '.join(question_types)}.
        {(f"Chủ đề của các câu hỏi là: {topic}." if topic else "Chủ đề có thể là bất kỳ lĩnh vực kiến thức chung nào.")}
        
        Mỗi câu hỏi phải có cấu trúc JSON như sau:
        - id: số nguyên (tạm thời đặt là 0, sẽ được gán sau)
        - type: loại câu hỏi (fill_blank, multiple_choice, hoặc sentence_rearrangement)
        - question: nội dung câu hỏi (chuỗi)
        - options: danh sách các lựa chọn (cho multiple_choice hoặc sentence_rearrangement, để null cho fill_blank)
        - answer: đáp án đúng (chuỗi cho fill_blank và multiple_choice, danh sách chuỗi cho sentence_rearrangement)

        Ví dụ:
        [
            {{
                "id": 0,
                "type": "fill_blank",
                "question": "The capital of Vietnam is _____.",
                "options": null,
                "answer": "Hanoi"
            }},
            {{
                "id": 0,
                "type": "multiple_choice",
                "question": "Which is the largest planet in the Solar System?",
                "options": ["Earth", "Mars", "Jupiter", "Saturn"],
                "answer": "Jupiter"
            }},
            {{
                "id": 0,
                "type": "sentence_rearrangement",
                "question": "Rearrange the following words to form a complete sentence.",
                "options": ["studying", "I", "university", "am", "at", "a"],
                "answer": ["I", "am", "studying", "at", "a", "university"]
            }}
        ]

        Trả về một mảng JSON chứa {num_questions} câu hỏi, đảm bảo phân bố đều các loại câu hỏi nếu có nhiều loại.
        Đáp án phải chính xác và câu hỏi phải rõ ràng, phù hợp để kiểm tra kiến thức.
        """
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý giáo dục, tạo câu hỏi kiểm tra kiến thức theo định dạng JSON chính xác."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=4000,
            temperature=0.7
        )

        # Phân tích phản hồi từ OpenAI
        response_text = response.choices[0].message.content.strip()
        
        # Xử lý để đảm bảo phản hồi là JSON hợp lệ
        try:
            # Loại bỏ các ký tự markdown như ```json nếu có
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            questions = json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"Lỗi khi phân tích JSON từ OpenAI: {str(e)}")
            return []

        # Gán ID duy nhất cho các câu hỏi
        for question in questions:
            question["id"] = str(uuid.uuid4())

        return questions

    except Exception as e:
        print(f"Lỗi khi gọi OpenAI API để tạo câu hỏi: {str(e)}")
        return []

def is_openai_configured() -> bool:
    """Kiểm tra xem OpenAI API đã được cấu hình chưa"""
    return bool(api_key)