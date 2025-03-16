import streamlit as st
import requests
import json
from typing import List, Dict, Any, Union
import random
import time

# Cấu hình API URL
API_URL = "http://localhost:8000"

# Thiết lập tiêu đề trang
st.set_page_config(
    page_title="Hệ Thống Kiểm Tra Kiến Thức",
    page_icon="📚",
    layout="wide"
)

# CSS tùy chỉnh để giảm khoảng cách giữa các nút và tạo giao diện giống hình
st.markdown("""
<style>
    /* Tùy chỉnh nút từ */
    .stButton>button {
        background-color: #1e1e1e !important;
        color: white !important;
        border-radius: 10px !important;
        border: 1px solid #333 !important;
        padding: 5px 15px !important;
        font-size: 0.9rem !important;
        margin: 5px 5px !important;
        min-height: 0 !important;
        line-height: 1.2 !important;
    }
    
    /* Tùy chỉnh container chứa các từ */
    .word-container {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 5px !important;
        margin-top: 10px !important;
    }
    
    /* Tùy chỉnh tiêu đề */
    h3 {
        margin-bottom: 10px !important;
    }
    
    /* Tùy chỉnh nút kiểm tra */
    button[data-testid="baseButton-secondary"] {
        background-color: #1e1e1e !important;
        color: white !important;
        border-radius: 10px !important;
        border: 1px solid #333 !important;
    }
    
    /* Tùy chỉnh nút xóa từ cuối cùng */
    button:contains("↩️") {
        background-color: transparent !important;
        border: none !important;
        color: #ff4b4b !important;
        padding: 0 !important;
    }
    
    /* Tùy chỉnh nền tối */
    .main .block-container {
        background-color: #0e1117;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Hàm gọi API
def get_random_question():
    """Lấy một câu hỏi ngẫu nhiên từ API"""
    try:
        response = requests.get(f"{API_URL}/get-question")
        if (response.status_code == 200):
            return response.json()
        else:
            return None
    except Exception as e:
        st.error(f"Lỗi khi kết nối đến API: {str(e)}")
        return None

def check_answer(question_id: int, answer: Union[str, List[str]]):
    """Gửi câu trả lời để kiểm tra"""
    try:
        data = {
            "question_id": question_id,
            "answer": answer
        }
        response = requests.post(f"{API_URL}/check-answer", json=data)
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        st.error(f"Lỗi khi kết nối đến API: {str(e)}")
        return None

def generate_exam(num_questions: int):
    """Tạo một bài kiểm tra mới"""
    try:
        data = {"num_questions": num_questions}
        response = requests.post(f"{API_URL}/generate-exam", json=data)
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        st.error(f"Lỗi khi kết nối đến API: {str(e)}")
        return None

# Hàm hiển thị câu hỏi
def display_question(question: Dict[str, Any]):
    """Hiển thị câu hỏi theo loại"""
    question_id = question["id"]
    question_type = question["type"]
    question_text = question["question"]
    
    st.markdown(f"### Câu hỏi {question_id}")
    st.markdown(f"**{question_text}**")
    
    # Xử lý theo loại câu hỏi
    if question_type == "fill_blank":
        # Câu hỏi điền vào chỗ trống
        user_answer = st.text_input("Nhập câu trả lời của bạn:", key=f"fill_{question_id}")
        if st.button("Kiểm tra", key=f"check_{question_id}"):
            with st.spinner("Đang kiểm tra câu trả lời và tạo lời giải thích..."):
                result = check_answer(question_id, user_answer)
                display_result(result)
    
    elif question_type == "multiple_choice":
        # Câu hỏi trắc nghiệm
        options = question.get("options", [])
        user_answer = st.radio("Chọn đáp án:", options, key=f"choice_{question_id}")
        if st.button("Kiểm tra", key=f"check_{question_id}"):
            with st.spinner("Đang kiểm tra câu trả lời và tạo lời giải thích..."):
                result = check_answer(question_id, user_answer)
                display_result(result)
    
    elif question_type == "sentence_rearrangement":
        # Câu hỏi sắp xếp câu
        options = question.get("options", [])
        
        # Khởi tạo danh sách đã chọn và chưa chọn trong session_state
        if f"selected_{question_id}" not in st.session_state:
            st.session_state[f"selected_{question_id}"] = []
            st.session_state[f"available_{question_id}"] = options.copy()
        
        # Hiển thị các từ đã chọn
        st.markdown("### Câu trả lời của bạn:")
        selected_items = st.session_state[f"selected_{question_id}"]
        if selected_items:
            selected_text = " ".join(selected_items)
            st.markdown(f"**{selected_text}**")
            
            # Nút xóa từ cuối cùng
            if st.button("↩️ Xóa từ cuối cùng", key=f"remove_last_{question_id}"):
                if selected_items:
                    removed_item = selected_items.pop()
                    st.session_state[f"available_{question_id}"].append(removed_item)
                    st.rerun()
        else:
            st.markdown("*Hãy chọn các từ theo thứ tự đúng*")
        
        # Hiển thị các từ chưa chọn
        st.markdown("### Các từ có sẵn:")
        available_items = st.session_state[f"available_{question_id}"]
        
        # Sử dụng HTML trực tiếp để hiển thị các từ gần nhau hơn
        html_buttons = '<div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;">'
        
        # Hiển thị các nút từ trong container
        cols = st.columns(min(len(available_items), 8) if available_items else 1)
        for i, item in enumerate(available_items):
            with cols[i % min(len(available_items), 8)]:
                if st.button(f"{item}", key=f"select_{question_id}_{i}"):
                    # Thêm từ vào danh sách đã chọn
                    selected_items.append(item)
                    # Xóa từ khỏi danh sách chưa chọn
                    available_items.remove(item)
                    st.rerun()
        
        # Nút kiểm tra khi đã chọn hết các từ
        if not available_items:
            st.success("Bạn đã sắp xếp tất cả các từ!")
        
        if st.button("Kiểm tra", key=f"check_{question_id}"):
            with st.spinner("Đang kiểm tra câu trả lời và tạo lời giải thích..."):
                result = check_answer(question_id, selected_items)
                display_result(result)

def display_result(result: Dict[str, Any]):
    """Hiển thị kết quả kiểm tra"""
    if not result:
        st.error("Không thể kiểm tra câu trả lời")
        return
    
    is_correct = result.get("correct", False)
    explanation = result.get("explanation", "")
    correct_answer = result.get("correct_answer", "")
    
    if is_correct:
        st.success("✅ Chính xác!")
    else:
        st.error("❌ Chưa chính xác!")
        
        # Hiển thị đáp án đúng
        if isinstance(correct_answer, list):
            st.markdown("**Đáp án đúng:**")
            correct_text = " ".join(correct_answer)
            st.markdown(f"**{correct_text}**")
        else:
            st.markdown(f"**Đáp án đúng:** {correct_answer}")
    
    # Hiển thị lời giải thích
    if explanation:
        st.markdown("### Giải thích (được tạo bởi AI):")
        st.markdown(explanation)
    else:
        st.info("Đang tạo lời giải thích...")

# Giao diện chính
def main():
    st.title("🎓 Hệ Thống Kiểm Tra Kiến Thức")
    
    # Thanh bên để chọn chức năng
    menu = ["Câu hỏi ngẫu nhiên", "Bài kiểm tra", "Giới thiệu"]
    choice = st.sidebar.selectbox("Chọn chức năng:", menu)
    
    if choice == "Câu hỏi ngẫu nhiên":
        st.header("Câu hỏi ngẫu nhiên")
        
        # Sử dụng session_state để theo dõi trạng thái nút
        if "get_new_question" not in st.session_state:
            st.session_state.get_new_question = False
            
        if st.button("Lấy câu hỏi mới"):
            st.session_state.get_new_question = True
            
        # Xử lý lấy câu hỏi mới khi cần
        if st.session_state.get_new_question:
            with st.spinner("Đang tải câu hỏi..."):
                question = get_random_question()
                if question:
                    st.session_state.current_question = question
                st.session_state.get_new_question = False  # Đặt lại trạng thái
        
        # Hiển thị câu hỏi hiện tại
        if "current_question" in st.session_state:
            display_question(st.session_state.current_question)
    
    elif choice == "Bài kiểm tra":
        st.header("Bài kiểm tra")
        
        # Tạo bài kiểm tra mới
        num_questions = st.slider("Số lượng câu hỏi:", min_value=1, max_value=10, value=5)
        
        # Sử dụng session_state để theo dõi trạng thái nút
        if "create_new_exam" not in st.session_state:
            st.session_state.create_new_exam = False
            
        if st.button("Tạo bài kiểm tra mới"):
            st.session_state.create_new_exam = True
            
        # Xử lý tạo bài kiểm tra mới khi cần
        if st.session_state.create_new_exam:
            with st.spinner("Đang tạo bài kiểm tra..."):
                questions = generate_exam(num_questions)
                if questions:
                    st.session_state.exam_questions = questions
                    st.session_state.current_exam_index = 0
                    st.session_state.exam_results = []
                st.session_state.create_new_exam = False  # Đặt lại trạng thái
        
        # Hiển thị bài kiểm tra
        if "exam_questions" in st.session_state and "current_exam_index" in st.session_state:
            questions = st.session_state.exam_questions
            current_index = st.session_state.current_exam_index
            
            # Hiển thị tiến trình
            progress = st.progress((current_index) / len(questions))
            st.markdown(f"Câu hỏi {current_index + 1}/{len(questions)}")
            
            # Hiển thị câu hỏi hiện tại
            if current_index < len(questions):
                display_question(questions[current_index])
                
                # Nút chuyển câu hỏi
                col1, col2 = st.columns(2)
                with col1:
                    if current_index > 0 and st.button("Câu trước"):
                        st.session_state.current_exam_index -= 1
                        st.rerun()
                with col2:
                    if current_index < len(questions) - 1 and st.button("Câu tiếp theo"):
                        st.session_state.current_exam_index += 1
                        st.rerun()
            
            # Kết thúc bài kiểm tra
            if current_index == len(questions) - 1:
                if st.button("Kết thúc bài kiểm tra"):
                    st.session_state.show_exam_results = True
                    st.rerun()
            
            # Hiển thị kết quả
            if "show_exam_results" in st.session_state and st.session_state.show_exam_results:
                st.header("Kết quả bài kiểm tra")
                # Ở đây sẽ hiển thị kết quả chi tiết của bài kiểm tra
                st.markdown("Chức năng này đang được phát triển...")
    
    else:  # Giới thiệu
        st.header("Giới thiệu")
        st.markdown("""
        ## Hệ Thống Kiểm Tra Kiến Thức
        
        Đây là một ứng dụng giúp bạn kiểm tra kiến thức với các loại câu hỏi khác nhau:
        
        - **Điền vào chỗ trống**: Điền từ hoặc cụm từ vào chỗ trống
        - **Trắc nghiệm**: Chọn đáp án đúng từ các lựa chọn
        - **Sắp xếp câu**: Sắp xếp các từ/cụm từ theo thứ tự đúng
        
        ### Cách sử dụng
        1. Chọn chức năng từ thanh bên trái
        2. Làm bài và kiểm tra kết quả
        3. Xem lời giải thích được tạo bởi AI để học hỏi thêm
        
        ### Công nghệ sử dụng
        - **Backend**: FastAPI
        - **Frontend**: Streamlit
        - **AI**: OpenAI GPT-4o
        """)

if __name__ == "__main__":
    main() 