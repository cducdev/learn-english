# Hệ Thống Kiểm Tra Kiến Thức

Ứng dụng kiểm tra kiến thức với FastAPI (Backend) và Streamlit (Frontend), hỗ trợ nhiều loại câu hỏi khác nhau và tạo lời giải thích tự động bằng OpenAI.

## Tính Năng

-   **Hỗ trợ 3 loại câu hỏi**:
    -   Điền vào chỗ trống (Fill-in-the-blank)
    -   Trắc nghiệm (Multiple Choice)
    -   Sắp xếp câu (Sentence Rearrangement)
-   **Tạo bài kiểm tra** với số lượng câu hỏi tùy chỉnh
-   **Giải thích đáp án tự động** bằng OpenAI GPT-4o
-   **Giao diện người dùng** thân thiện

## Cài Đặt

### Yêu Cầu

-   Python 3.8+
-   pip (trình quản lý gói Python)
-   Tài khoản OpenAI và API key

### Cài Đặt Backend

```bash
cd backend
pip install -r requirements.txt
```

### Cài Đặt Frontend

```bash
cd frontend
pip install -r requirements.txt
```

### Cấu Hình OpenAI API

Tạo file `.env` trong `backend`
Mở file `backend/.env` và thêm API key của bạn:

```python
# Cấu hình API key cho OpenAI
OPENAI_API_KEY="your-api-key-here"
```

Hoặc sử dụng biến môi trường:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

## Chạy Ứng Dụng

### Chạy Backend

```bash
cd backend
uvicorn main:app --reload
```

Backend sẽ chạy tại địa chỉ: http://localhost:8000

### Chạy Frontend

```bash
cd frontend
streamlit run app.py
```

Frontend sẽ chạy tại địa chỉ: http://localhost:8501

## Cấu Trúc Dự Án

```
│── backend/              # FastAPI Backend
│   ├── main.py           # Entry point cho FastAPI
│   ├── database.py       # Lưu trữ dữ liệu câu hỏi
│   ├── models.py         # Định nghĩa schema dữ liệu
│   ├── services.py       # Xử lý logic kiểm tra đáp án
│   ├── openai_helper.py  # Tích hợp OpenAI LLM
│   ├── requirements.txt  # Thư viện backend
│
│── frontend/             # Streamlit Frontend
│   ├── app.py            # Chạy giao diện Streamlit
│   ├── requirements.txt  # Thư viện frontend
│
│── README.md             # Hướng dẫn sử dụng
```

## Cách Hoạt Động

1. Người dùng chọn câu hỏi hoặc tạo bài kiểm tra
2. Sau khi trả lời, hệ thống kiểm tra đáp án
3. OpenAI GPT-4o tự động tạo lời giải thích chi tiết cho câu hỏi
4. Người dùng xem kết quả và lời giải thích để học hỏi

## Mở Rộng

Dự án có thể mở rộng với:

-   Thêm loại câu hỏi mới
-   Tích hợp cơ sở dữ liệu (SQLite/PostgreSQL)
-   Hỗ trợ nhiều người dùng và lưu lịch sử bài kiểm tra
-   Thống kê kết quả và tiến trình học tập

## Đóng Góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo issue hoặc pull request để cải thiện dự án.
