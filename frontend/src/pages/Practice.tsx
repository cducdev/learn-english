// src/pages/Practice.tsx
import React, { useState } from "react";
import { Question } from "../types";
import QuestionComponent from "../components/Question";
import MarkdownRenderer from "../components/MarkdownRenderer";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faVolumeHigh, faSpinner, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

interface Vocabulary {
  english: string;
  vietnamese: string[];
  pos: string;
  pronunciation: string;
  explanation: string;
}

interface WrongVocab extends Vocabulary {
  isSwapped: boolean;
  timestamp: number;
}

interface WrongQuestion extends Question {
  timestamp?: number;
}

const Practice: React.FC = () => {
  const [practiceQuestions, setPracticeQuestions] = useState<WrongQuestion[]>(() => {
    const stored = localStorage.getItem("wrongQuestions");
    if (stored) {
      try {
        const questions = JSON.parse(stored) as WrongQuestion[];
        return questions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      } catch (error) {
        console.error("Error parsing wrong questions from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const [practiceVocabs, setPracticeVocabs] = useState<WrongVocab[]>(() => {
    const stored = localStorage.getItem("wrongVocabs");
    if (stored) {
      try {
        const vocabs = JSON.parse(stored) as WrongVocab[];
        return vocabs.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error parsing wrong vocabs from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const [selectedSection, setSelectedSection] = useState<"exam" | "vocab" | null>(null);
  const [userAnswersQuestions, setUserAnswersQuestions] = useState<{ [key: number]: string | string[] }>({});
  const [checkedQuestions, setCheckedQuestions] = useState<{ [key: number]: boolean }>({});
  const [explanationsQuestions, setExplanationsQuestions] = useState<{ [key: number]: string }>({});
  const [loadingChecksQuestions, setLoadingChecksQuestions] = useState<{ [key: number]: boolean }>({});

  const [userAnswersVocabs, setUserAnswersVocabs] = useState<{ [key: string]: string }>({});
  const [checkedVocabs, setCheckedVocabs] = useState<{ [key: string]: boolean }>({});

  const handleAnswerChangeQuestions = (questionId: number, answer: string | string[]) => {
    if (!checkedQuestions[questionId]) {
      setUserAnswersQuestions((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    }
  };

  const handleAnswerChangeVocabs = (word: string, answer: string) => {
    if (!checkedVocabs[word]) {
      // Chỉ trim khoảng trắng ở đầu và cuối, không loại bỏ khoảng trắng giữa các từ
      setUserAnswersVocabs((prev) => ({
        ...prev,
        [word]: answer.toLowerCase(),
      }));
    }
  };

  const fetchExplanation = async (questionId: number) => {
    setLoadingChecksQuestions((prev) => ({ ...prev, [questionId]: true }));
    const question = practiceQuestions.find((q) => q.id === questionId);
    if (!question) {
      setLoadingChecksQuestions((prev) => ({ ...prev, [questionId]: false }));
      return;
    }
    const answerObj = {
      question_id: questionId,
      answer: question.answer,
    };
    try {
      const response = await axios.post("http://localhost:8000/get-explanation", answerObj);
      setExplanationsQuestions((prev) => ({
        ...prev,
        [questionId]: response.data.explanation,
      }));
      setCheckedQuestions((prev) => ({
        ...prev,
        [questionId]: true,
      }));
    } catch (error) {
      console.error("Error fetching explanation", error);
    } finally {
      setLoadingChecksQuestions((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const checkVocabAnswer = (word: string) => {
    setCheckedVocabs((prev) => ({
      ...prev,
      [word]: true,
    }));
  };

  const speakText = (text: string, lang = "en-US") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakQuestion = (question: WrongQuestion) => {
    let textToSpeak = question.question;
    if (question.options && question.options.length > 0) {
      textToSpeak += ". Options: " + question.options.join(", ");
    }
    speakText(textToSpeak, "en-US");
  };

  const handleSpeakVocab = (vocab: WrongVocab) => {
    speakText(vocab.english, "en-US");
  };

  const handleVoiceInputVocab = (word: string, isSwapped: boolean) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = isSwapped ? "en-US" : "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log("Voice input for vocab:", transcript);
      handleAnswerChangeVocabs(word, transcript);
      toast.success(`Recognized: "${transcript}"`);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Voice recognition error:", event.error);
      toast.error("An error occurred during voice recognition: " + event.error);
    };

    recognition.start();
  };

  const handleVoiceInputQuestion = (questionId: number) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log("Voice input for question:", transcript);
      handleAnswerChangeQuestions(questionId, transcript);
      toast.success(`Recognized: "${transcript}"`);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Voice recognition error:", event.error);
      toast.error("An error occurred during voice recognition: " + event.error);
    };

    recognition.start();
  };

  const removeQuestion = (questionId: number) => {
    const updated = practiceQuestions.filter((q) => q.id !== questionId);
    setPracticeQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));

    const { [questionId]: removedChecked, ...restChecked } = checkedQuestions;
    setCheckedQuestions(restChecked);
    const { [questionId]: removedAnswer, ...restUserAnswers } = userAnswersQuestions;
    setUserAnswersQuestions(restUserAnswers);
    const { [questionId]: removedExp, ...restExplanations } = explanationsQuestions;
    setExplanationsQuestions(restExplanations);
  };

  const removeVocab = (word: string) => {
    const updated = practiceVocabs.filter((v) => v.english !== word);
    setPracticeVocabs(updated);
    localStorage.setItem("wrongVocabs", JSON.stringify(updated));

    const { [word]: removedChecked, ...restChecked } = checkedVocabs;
    setCheckedVocabs(restChecked);
    const { [word]: removedAnswer, ...restUserAnswers } = userAnswersVocabs;
    setUserAnswersVocabs(restUserAnswers);
  };

  const handleSectionSelect = (section: "exam" | "vocab") => {
    setSelectedSection(section);
    setUserAnswersQuestions({});
    setCheckedQuestions({});
    setExplanationsQuestions({});
    setLoadingChecksQuestions({});
    setUserAnswersVocabs({});
    setCheckedVocabs({});
  };

  if (!selectedSection) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-indigo-100 flex items-center justify-center">
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-800 mb-6 md:mb-8">
            Select Practice Section
          </h1>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleSectionSelect("exam")}
              className="bg-indigo-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md text-base md:text-lg font-semibold"
            >
              Exam Questions ({practiceQuestions.length})
            </button>
            <button
              onClick={() => handleSectionSelect("vocab")}
              className="bg-indigo-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md text-base md:text-lg font-semibold"
            >
              Vocabulary ({practiceVocabs.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex flex-col md:flex-row min-h-[calc(100vh-80px)] px-4">
      <div className="w-full md:w-3/4 pr-0 md:pr-8 overflow-y-auto">
        {selectedSection === "exam" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-6 md:mb-8 text-center">
              Practice Wrong Questions ({practiceQuestions.length})
            </h1>
            <div className="space-y-6 md:space-y-8">
              {practiceQuestions.length > 0 ? (
                practiceQuestions.map((question) => (
                  <div key={question.id} className="p-4 md:p-6 rounded-lg shadow-md bg-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                      <h3 className="text-base md:text-lg font-bold">{question.question}</h3>
                      <div className="flex items-center space-x-2 mt-2 md:mt-0">
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
                    <div className="flex items-center space-x-2">
                      <QuestionComponent
                        question={question}
                        onSubmit={(result, q) =>
                          handleAnswerChangeQuestions(q.id, result.correct_answer as string | string[])
                        }
                        disabled={!!checkedQuestions[question.id]}
                      />
                      <button
                        onClick={() => handleVoiceInputQuestion(question.id)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        disabled={!!checkedQuestions[question.id]}
                        aria-label="Speak answer"
                      >
                        <FontAwesomeIcon icon={faMicrophone} />
                      </button>
                    </div>
                    <div className="mt-4">
                      {!checkedQuestions[question.id] ? (
                        <button
                          onClick={() => fetchExplanation(question.id)}
                          disabled={loadingChecksQuestions[question.id]}
                          className={`bg-green-600 text-white cursor-pointer px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center w-20 md:w-24 text-sm md:text-base ${
                            loadingChecksQuestions[question.id] ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {loadingChecksQuestions[question.id] ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          ) : null}
                          {loadingChecksQuestions[question.id] ? "Loading..." : "Check"}
                        </button>
                      ) : (
                        <div className="mt-3 bg-gray-100 p-3 md:p-4 rounded-lg">
                          <details open>
                            <summary className="cursor-pointer text-gray-700 font-semibold text-sm md:text-base">
                              View Explanation
                            </summary>
                            {explanationsQuestions[question.id] && (
                              <MarkdownRenderer content={explanationsQuestions[question.id]} />
                            )}
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 text-base md:text-lg">
                  No wrong questions available for practice.
                </p>
              )}
            </div>
          </>
        )}

        {selectedSection === "vocab" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-6 md:mb-8 text-center">
              Practice Wrong Vocabularies ({practiceVocabs.length})
            </h1>
            <div className="space-y-6 md:space-y-8">
              {practiceVocabs.length > 0 ? (
                practiceVocabs.map((vocab) => {
                  // Kiểm tra đáp án có khớp với cụm từ không
                  const userAnswer = userAnswersVocabs[vocab.english]?.toLowerCase() || "";
                  const correctAnswers = vocab.isSwapped
                    ? [vocab.english.toLowerCase()]
                    : vocab.vietnamese.map((v) => v.toLowerCase());
                  const isCorrect = correctAnswers.includes(userAnswer);

                  return (
                    <div key={vocab.english + vocab.isSwapped} className="p-4 md:p-6 rounded-lg shadow-md bg-white">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <h3 className="text-base md:text-lg font-bold">
                          {vocab.isSwapped ? vocab.vietnamese[0] : vocab.english}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2 md:mt-0">
                          <button
                            onClick={() => handleSpeakVocab(vocab)}
                            className="text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
                            aria-label="Read vocab aloud"
                          >
                            <FontAwesomeIcon icon={faVolumeHigh} />
                          </button>
                          <button
                            onClick={() => removeVocab(vocab.english)}
                            className="text-red-600 hover:text-red-800 focus:outline-none cursor-pointer"
                            title="Remove this vocab"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <div className="w-full md:w-1/3 text-sm md:text-base text-gray-600">{vocab.pos}</div>
                        <div className="w-full md:w-2/3 flex items-center space-x-2">
                          <input
                            type="text"
                            value={userAnswersVocabs[vocab.english] || ""}
                            onChange={(e) => handleAnswerChangeVocabs(vocab.english, e.target.value)}
                            disabled={!!checkedVocabs[vocab.english]}
                            className={`w-full p-2 border rounded-lg text-sm md:text-base ${
                              checkedVocabs[vocab.english]
                                ? isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter translation here"
                          />
                          <button
                            onClick={() => handleVoiceInputVocab(vocab.english, vocab.isSwapped)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            disabled={!!checkedVocabs[vocab.english]}
                            aria-label="Speak answer"
                          >
                            <FontAwesomeIcon icon={faMicrophone} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        {!checkedVocabs[vocab.english] ? (
                          <button
                            onClick={() => checkVocabAnswer(vocab.english)}
                            className="bg-green-600 text-white cursor-pointer px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition duration-300 w-20 md:w-24 text-sm md:text-base"
                          >
                            Check
                          </button>
                        ) : (
                          <div className="mt-3 bg-gray-100 p-3 md:p-4 rounded-lg">
                            <p className="text-sm md:text-base">
                              <strong>Explanation:</strong> {vocab.explanation}
                            </p>
                            <p className="text-sm md:text-base">
                              <strong>Pronunciation:</strong> {vocab.pronunciation}
                            </p>
                            <p className="text-sm md:text-base">
                              <strong>Accepted Answers:</strong> {vocab.vietnamese.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-600 text-base md:text-lg">
                  No wrong vocabularies available for practice.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="w-full md:w-1/4 mt-6 md:mt-0 md:fixed md:right-0 md:top-20 md:h-[calc(100vh-80px)] md:pr-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-800 mb-4 text-center">Review Info</h2>
          <p className="text-sm md:text-lg">Total Questions: {practiceQuestions.length}</p>
          <p className="text-sm md:text-lg">Total Vocabs: {practiceVocabs.length}</p>
          <button
            onClick={() => setSelectedSection(null)}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 text-sm md:text-base"
          >
            Back to Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;