import React, { useState, useEffect } from "react";
import { Question, CheckResult, Answer } from "../types";
import { generateExam, checkAnswer } from "../services/api";
import QuestionComponent from "../components/Question";
import MarkdownRenderer from "../components/MarkdownRenderer";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faSpinner, faFileExport, faFileUpload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";

const Exam: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [results, setResults] = useState<CheckResult[]>([]);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>({});
  const [numQuestions, setNumQuestions] = useState<number>(1);
  const [topic, setTopic] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingExplanations, setLoadingExplanations] = useState<{ [key: string]: boolean }>({});

  const startExam = async () => {
    setLoading(true);
    setQuestions([]);
    setUserAnswers({});
    setResults([]);
    setExplanations({});
    setLoadingExplanations({});
    const examRequest = {
      num_questions: numQuestions,
      topic: topic.trim() || "General Knowledge",
    };
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

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
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

    const checkResults = await Promise.all(answers.map((answer) => checkAnswer(answer)));
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

  const fetchExplanation = async (questionId: string) => {
    setLoadingExplanations((prev) => ({ ...prev, [questionId]: true }));
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
      setLoadingExplanations((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;
    doc.setFontSize(16);
    doc.text(`Exam: ${topic || "General Knowledge"} (${questions.length} Questions)`, 10, yOffset);
    yOffset += 10;

    questions.forEach((question: Question, index: number) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${question.question}`, 10, yOffset);
      yOffset += 8;
      if (question.options && question.options.length > 0) {
        question.options.forEach((option: string, optIndex: number) => {
          doc.text(`   ${String.fromCharCode(97 + optIndex)}. ${option}`, 10, yOffset);
          yOffset += 6;
        });
      }
      yOffset += 5;
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 10;
      }
    });

    doc.save(`exam-${topic || "general-knowledge"}-${questions.length}-questions.pdf`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/upload-exam", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedQuestions: Question[] = response.data.questions;
      setQuestions(uploadedQuestions);
      setTimeLeft(uploadedQuestions.length * 60);
      setIsStarted(true);
      setIsSubmitted(false);
    } catch (error) {
      console.error("Error uploading exam:", error);
    } finally {
      setLoading(false);
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
      <div className="min-h-[calc(100vh-80px)] bg-indigo-100 flex items-center justify-center">
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-800 mb-6 md:mb-8">
            Create Your Exam
          </h1>
          <div className="mb-6">
            <label className="block text-base md:text-lg font-semibold text-indigo-800 mb-2">
              Number of Questions
            </label>
            <div className="flex justify-center space-x-4">
              {[1, 5, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => setNumQuestions(value)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-300 font-bold text-base md:text-lg flex items-center justify-center cursor-pointer ${
                    numQuestions === value ? "bg-indigo-600 text-white" : "bg-white text-indigo-800"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-base md:text-lg font-semibold text-indigo-800 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., General Knowledge, Programming)"
              className="w-full p-2 border border-indigo-300 rounded-lg text-base md:text-lg focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={startExam}
              disabled={loading}
              className="bg-indigo-600 cursor-pointer text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md disabled:opacity-50 text-base md:text-lg font-semibold"
            >
              {loading ? "Loading..." : "Start Exam"}
            </button>
            <label className="bg-green-500 cursor-pointer text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-green-600 transition duration-300 shadow-md text-base md:text-lg font-semibold flex items-center justify-center">
              <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
              Upload Exam
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex flex-col md:flex-row min-h-[calc(100vh-80px)] px-4">
      <div className="w-full md:w-3/4 pr-0 md:pr-8 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-6 md:mb-8 text-center">
          Exam ({questions.length} Questions)
        </h1>
        <div className="space-y-6 md:space-y-8">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-4 md:p-6 rounded-lg shadow-md ${
                isSubmitted
                  ? results[index]?.correct
                    ? "bg-green-50"
                    : "bg-pink-50"
                  : "bg-white"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-bold">{question.question}</h3>
                <button
                  onClick={() => handleSpeakQuestion(question)}
                  className="cursor-pointer text-blue-600 hover:text-blue-800 focus:outline-none mt-2 md:mt-0"
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
                    disabled={loadingExplanations[question.id]}
                    className={`cursor-pointer bg-gray-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center w-28 md:w-32 text-sm md:text-base ${
                      loadingExplanations[question.id] ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingExplanations[question.id] ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    ) : null}
                    {loadingExplanations[question.id] ? "Loading..." : "Explanation"}
                  </button>
                  {explanations[question.id] && (
                    <div className="mt-3 bg-gray-100 p-3 md:p-4 rounded-lg">
                      <details>
                        <summary className="cursor-pointer text-gray-700 font-semibold text-sm md:text-base">
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

      <div className="w-full md:w-1/4 mt-6 md:mt-0 md:fixed md:right-0 md:top-20 md:h-[calc(100vh-80px)] md:pr-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-800 mb-4 text-center">Info</h2>
          <p className="text-sm md:text-lg">Time Left: {formatTime(timeLeft)}</p>
          <p className="text-sm md:text-lg">
            Answered: {Object.keys(userAnswers).length}/{questions.length}
          </p>
          {!isSubmitted && (
            <button
              onClick={handleSubmitExam}
              className="cursor-pointer mt-4 md:mt-6 w-full bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-green-700 transition duration-300 shadow-md text-sm md:text-lg font-semibold"
            >
              Submit Exam
            </button>
          )}
          {isSubmitted && (
            <div className="mt-4">
              <h3 className="text-base md:text-lg font-semibold text-green-700">Results</h3>
              <p className="text-sm md:text-base">
                Correct: {results.filter((r) => r.correct).length} / {questions.length}
              </p>
              <p className="text-sm md:text-base">
                Score: {((results.filter((r) => r.correct).length / questions.length) * 100).toFixed(2)}%
              </p>
            </div>
          )}
          <button
            onClick={exportToPDF}
            className="cursor-pointer mt-4 w-full bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md text-sm md:text-lg font-semibold flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Exam;