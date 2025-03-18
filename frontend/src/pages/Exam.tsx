// src/pages/Exam.tsx
import React, { useState, useEffect } from "react";
import { Question, CheckResult, Answer } from "../types";
import { generateExam, checkAnswer } from "../services/api";
import QuestionComponent from "../components/Question";
import MarkdownRenderer from "../components/MarkdownRenderer";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faSpinner } from "@fortawesome/free-solid-svg-icons"; // Thêm faSpinner cho loading

const Exam: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [results, setResults] = useState<CheckResult[]>([]);
  const [explanations, setExplanations] = useState<{ [key: number]: string }>({});
  const [numQuestions, setNumQuestions] = useState<number>(1);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingExplanations, setLoadingExplanations] = useState<{ [key: number]: boolean }>({}); // State mới để theo dõi loading cho từng câu hỏi

  const startExam = async () => {
    setLoading(true);
    const examRequest = { num_questions: numQuestions };
    const examQuestions = await generateExam(examRequest);
    setQuestions(examQuestions);
    setTimeLeft(numQuestions * 60);
    setIsStarted(true);
    setLoading(false);
    setIsSubmitted(false);
  };

  useEffect(() => {
    if (isStarted && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitExam();
    }
  }, [isStarted, isSubmitted, timeLeft]);

  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    if (!isSubmitted) {
      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    }
  };

  const handleSubmitExam = async () => {
    const answers: Answer[] = questions.map((question) => ({
      question_id: question.id,
      answer: userAnswers[question.id] || "",
    }));

    const checkResults = await Promise.all(
      answers.map((answer) => checkAnswer(answer))
    );
    setResults(checkResults);
    setIsSubmitted(true);

    const wrongs = questions.filter((_question, index) => !checkResults[index].correct);
    const storedWrongQuestions = localStorage.getItem("wrongQuestions");
    let wrongQuestionsList: Question[] = storedWrongQuestions ? JSON.parse(storedWrongQuestions) : [];
    wrongs.forEach((question) => {
      if (!wrongQuestionsList.find((q) => q.id === question.id)) {
        wrongQuestionsList.push(question);
      }
    });
    localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestionsList));
  };

  const fetchExplanation = async (questionId: number) => {
    setLoadingExplanations((prev) => ({ ...prev, [questionId]: true })); // Bắt đầu loading cho câu hỏi cụ thể
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      setLoadingExplanations((prev) => ({ ...prev, [questionId]: false }));
      return;
    }
    const answer: Answer = {
      question_id: questionId,
      answer: question.answer,
    };
    try {
      const response = await axios.post("http://localhost:8000/get-explanation", answer);
      setExplanations((prev) => ({
        ...prev,
        [questionId]: response.data.explanation,
      }));
    } catch (error) {
      console.error("Error fetching explanation:", error);
    } finally {
      setLoadingExplanations((prev) => ({ ...prev, [questionId]: false })); // Dừng loading dù thành công hay thất bại
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
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

  if (!isStarted) {
    return (
      <div className="h-[calc(100vh-64px)] bg-indigo-100 flex items-center justify-center mt-64px">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-indigo-800 mb-8">
            Select Number of Questions
          </h1>
          <div className="flex justify-center space-x-4 mb-6">
            {[1, 5, 10].map((value) => (
              <button
                key={value}
                onClick={() => setNumQuestions(value)}
                className={`w-12 h-12 rounded-full border-2 border-indigo-300 font-bold text-lg flex items-center justify-center cursor-pointer  ${
                  numQuestions === value ? "bg-indigo-600 text-white" : "bg-white text-indigo-800"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={startExam}
              disabled={loading}
              className="bg-indigo-600 cursor-pointer text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? "Loading..." : "Start Exam"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex justify-center h-[calc(100vh-64px)] mt-64px">
      <div className="w-3/4 pr-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-8 text-center">
          Exam ({questions.length} Questions)
        </h1>
        <div className="space-y-8 max-h-[calc(100vh-160px)] overflow-y-auto">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-6 rounded-lg shadow-md ${
                isSubmitted
                  ? results[index]?.correct
                    ? "bg-green-50"
                    : "bg-pink-50"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{question.question}</h3>
                <button
                  onClick={() => handleSpeakQuestion(question)}
                  className="cursor-pointer text-blue-600 hover:text-blue-800 focus:outline-none"
                  aria-label="Read question aloud"
                >
                  <FontAwesomeIcon icon={faVolumeHigh} />
                </button>
              </div>
              <QuestionComponent
                question={question}
                onSubmit={(result, q) =>
                  handleAnswerChange(q.id, result.correct_answer as string | string[])
                }
                disabled={isSubmitted}
              />
              {isSubmitted && (
                <div className="mt-4">
                  <button
                    onClick={() => fetchExplanation(question.id)}
                    disabled={loadingExplanations[question.id]} // Disable nút khi đang loading
                    className={`cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center w-32 ${
                      loadingExplanations[question.id] ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingExplanations[question.id] ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    ) : null}
                    {loadingExplanations[question.id] ? "Loading..." : "Explanation"}
                  </button>
                  {explanations[question.id] && (
                    <div className="mt-3 bg-gray-100 p-4 rounded-lg">
                      <details>
                        <summary className="cursor-pointer text-gray-700 font-semibold">
                          View Explanation
                        </summary>
                        <MarkdownRenderer content={explanations[question.id]} />
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4 text-center">Info</h2>
          <p className="text-lg">Time Left: {formatTime(timeLeft)}</p>
          <p className="text-lg">
            Answered: {Object.keys(userAnswers).length}/{questions.length}
          </p>
          {!isSubmitted && (
            <button
              onClick={handleSubmitExam}
              className="cursor-pointer mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300 shadow-md w-full"
            >
              Submit Exam
            </button>
          )}

          {isSubmitted && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-green-700">Results</h3>
              <p>
                Correct: {results.filter((r) => r.correct).length} / {questions.length}
              </p>
              <p>
                Score: {((results.filter((r) => r.correct).length / questions.length) * 100).toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exam;