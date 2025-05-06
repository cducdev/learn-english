import PyPDF2
from io import BytesIO

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Trích xuất văn bản từ nội dung PDF.
    
    Args:
        pdf_content: Nội dung PDF dưới dạng bytes
        
    Returns:
        Chuỗi văn bản trích xuất từ PDF
    """
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Lỗi khi trích xuất văn bản từ PDF: {str(e)}")
        return ""