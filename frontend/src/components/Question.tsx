// src/components/Question.tsx
import React, { useState } from "react";
import { Question } from "../types";
import { toast } from "react-toastify";
// Nếu chưa thêm ToastContainer vào root component, hãy import CSS:
import "react-toastify/dist/ReactToastify.css";

interface QuestionProps {
  question: Question;
  onSubmit: (result: { correct_answer: string | string[] }, question: Question) => void;
  disabled?: boolean; // Dùng để khóa input sau khi nộp bài
  showSpeaker?: boolean; // Hiển thị icon loa để nghe cách đọc câu hỏi
}

const QuestionComponent: React.FC<QuestionProps> = ({ question, onSubmit, disabled, showSpeaker }) => {
  const [userAnswer, setUserAnswer] = useState<string | string[]>([]);

  const handleChange = (answer: string | string[]) => {
    if (!disabled) {
      setUserAnswer(answer);
      onSubmit({ correct_answer: answer }, question);
    }
  };

  // Hàm xử lý voice input sử dụng Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN"; // Điều chỉnh ngôn ngữ nếu cần
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log("Voice input:", transcript);
      if (question.type === "fill_blank") {
        handleChange(transcript);
      } else if (question.type === "multiple_choice") {
        const matchedOption = question.options?.find(
          (opt) => opt.toLowerCase() === transcript.toLowerCase()
        );
        if (matchedOption) {
          handleChange(matchedOption);
        } else {
          toast.error("No matching option found for your speech.");
        }
      } else if (question.type === "sentence_rearrangement") {
        const spokenWords = transcript.split(/\s+/).filter((word: any) => word !== "");
        const validWords: string[] = [];
        if (question.options) {
          spokenWords.forEach((word: any) => {
            const matched = question.options?.find(
              (opt) => opt.toLowerCase() === word.toLowerCase()
            );
            if (matched) {
              validWords.push(matched);
            }
          });
        }
        if (validWords.length === 0) {
          toast.error("No valid words found in your speech.");
          return;
        }
        handleChange(validWords);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
      toast.error("An error occurred during voice recognition.");
    };

    recognition.start();
  };

  // Hàm dùng Speech Synthesis để đọc văn bản
  const speakText = (text: string, lang = "en-US") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const renderInput = () => {
    switch (question.type) {
      case "fill_blank":
        return (
          <div>
            <input
              type="text"
              value={typeof userAnswer === "string" ? userAnswer : ""}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className="border p-2 rounded cursor-pointer w-full disabled:bg-gray-200"
            />
            <button
              disabled={disabled}
              onClick={handleVoiceInput}
              className="mt-2 bg-blue-500 cursor-pointer text-white px-2 py-1 rounded"
            >
              Voice Input
            </button>
          </div>
        );
      case "multiple_choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={typeof userAnswer === "string" && userAnswer === option}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={disabled}
                  className="mr-2 disabled:cursor-not-allowed cursor-pointer"
                />
                {option}
              </label>
            ))}
            <button
              disabled={disabled}
              onClick={handleVoiceInput}
              className="mt-2 cursor-pointer bg-blue-500 text-white px-2 py-1 rounded"
            >
              Voice Input
            </button>
          </div>
        );
      case "sentence_rearrangement":
        const options = question.options || [];
        return (
          <div>
            <div className="flex flex-wrap gap-2">
              {options.map((word, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleChange(
                      Array.isArray(userAnswer) ? [...userAnswer, word] : [word]
                    )
                  }
                  disabled={disabled || (Array.isArray(userAnswer) && userAnswer.includes(word))}
                  className="bg-blue-500 cursor-pointer text-white px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {word}
                </button>
              ))}
            </div>
            {Array.isArray(userAnswer) && (
              <div className="mt-2 w-full">
                <p>Current order: {userAnswer.join(" ")}</p>
                <button
                  disabled={disabled}
                  onClick={handleVoiceInput}
                  className="mt-2 cursor-pointer bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Voice Input Sentence
                </button>
                <button
                  onClick={() => handleChange([])}
                  disabled={disabled}
                  className="mt-2 cursor-pointer block text-red-500"
                >
                  Clear Order
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold flex items-center">
        {showSpeaker && (
          <button
            onClick={() => speakText(question.question)}
            className="ml-2 cursor-pointer text-blue-500 hover:text-blue-700"
            title="Listen to question"
          >
            🔊
          </button>
        )}
      </h3>
      {renderInput()}
    </div>
  );
};

export default QuestionComponent;
