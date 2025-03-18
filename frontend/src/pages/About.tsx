// src/pages/About.tsx
import React from "react";

const About: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Giới Thiệu</h1>
      <p className="text-gray-700">
        Chào mừng bạn đến với Hệ Thống Kiểm Tra Kiến Thức! Đây là một ứng dụng
        giúp bạn kiểm tra kiến thức qua các dạng câu hỏi như điền vào chỗ trống,
        trắc nghiệm và sắp xếp câu. Bạn có thể làm bài kiểm tra, xem kết quả và
        luyện tập lại những câu hỏi sai. Hãy bắt đầu ngay nào!
      </p>
    </div>
  );
};

export default About;