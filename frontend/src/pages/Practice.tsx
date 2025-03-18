// src/pages/Practice.tsx
import React, { useState } from "react";
import { Question } from "../types";
import QuestionComponent from "../components/Question";
import MarkdownRenderer from "../components/MarkdownRenderer";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faVolumeHigh, faSpinner } from "@fortawesome/free-solid-svg-icons"; // Thêm faSpinner cho loading

const Practice: React.FC = () => {
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>(() => {
    const stored = localStorage.getItem("wrongQuestions");
    if (stored) {
      try {
        return JSON.parse(stored) as Question[];
      } catch (error) {
        console.error("Error parsing wrong questions from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [checked, setChecked] = useState<{ [key: number]: boolean }>({});
  const [explanations, setExplanations] = useState<{ [key: number]: string }>({});
  const [loadingChecks, setLoadingChecks] = useState<{ [key: number]: boolean }>({}); // State mới để theo dõi loading cho từng câu hỏi

  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    if (!checked[questionId]) {
      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    }
  };

  const fetchExplanation = async (questionId: number) => {
    setLoadingChecks((prev) => ({ ...prev, [questionId]: true })); // Bắt đầu loading cho câu hỏi cụ thể
    const question = practiceQuestions.find((q) => q.id === questionId);
    if (!question) {
      setLoadingChecks((prev) => ({ ...prev, [questionId]: false }));
      return;
    }
    const answerObj = {
      question_id: questionId,
      answer: question.answer,
    };
    try {
      const response = await axios.post("http://localhost:8000/get-explanation", answerObj);
      setExplanations((prev) => ({
        ...prev,
        [questionId]: response.data.explanation,
      }));
      setChecked((prev) => ({
        ...prev,
        [questionId]: true,
      }));
    } catch (error) {
      console.error("Error fetching explanation", error);
    } finally {
      setLoadingChecks((prev) => ({ ...prev, [questionId]: false })); // Dừng loading dù thành công hay thất bại
    }
  };

  const speakText = (text: string, lang = "en-US") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakQuestion = (question: Question) => {
    let textToSpeak = question.question;
    if (question.options && question.options.length > 0) {
      textToSpeak += ". Options: " + question.options.join(", ");
    }
    speakText(textToSpeak, "en-US");
  };

  const removeQuestion = (questionId: number) => {
    const updated = practiceQuestions.filter((q) => q.id !== questionId);
    setPracticeQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));

    const { [questionId]: removedChecked, ...restChecked } = checked;
    setChecked(restChecked);
    const { [questionId]: removedAnswer, ...restUserAnswers } = userAnswers;
    setUserAnswers(restUserAnswers);
    const { [questionId]: removedExp, ...restExplanations } = explanations;
    setExplanations(restExplanations);
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex justify-center">
      <div className="w-3/4 pr-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-8 text-center">
          Practice Wrong Questions ({practiceQuestions.length})
        </h1>
        <div className="space-y-8 max-h-[calc(100vh-160px)] overflow-y-auto">
          {practiceQuestions.map((question) => (
            <div key={question.id} className="p-6 rounded-lg shadow-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{question.question}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSpeakQuestion(question)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
                    aria-label="Read question aloud"
                  >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                  </button>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-800 focus:outline-none cursor-pointer"
                    title="Remove this question"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <QuestionComponent
                question={question}
                onSubmit={(result, q) =>
                  handleAnswerChange(q.id, result.correct_answer as string | string[])
                }
                disabled={!!checked[question.id]}
              />
              <div className="mt-4">
                {!checked[question.id] ? (
                  <button
                    onClick={() => fetchExplanation(question.id)}
                    disabled={loadingChecks[question.id]} // Disable nút khi đang loading
                    className={`bg-green-600 text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center w-24 ${
                      loadingChecks[question.id] ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingChecks[question.id] ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    ) : null}
                    {loadingChecks[question.id] ? "Loading..." : "Check"}
                  </button>
                ) : (
                  <div className="mt-3 bg-gray-100 p-4 rounded-lg">
                    <details open>
                      <summary className="cursor-pointer text-gray-700 font-semibold">
                        View Explanation
                      </summary>
                      {explanations[question.id] && (
                        <MarkdownRenderer content={explanations[question.id]} />
                      )}
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4 text-center">
            Review Info
          </h2>
          <p className="text-lg">Total Questions: {practiceQuestions.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Practice;