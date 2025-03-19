// src/pages/VocabLearn.tsx
import React, { useState } from "react";
import vocabData from "../data/vocab.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faMicrophone } from "@fortawesome/free-solid-svg-icons";
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
  timestamp: number; // Thêm timestamp để sắp xếp
}

const VocabLearn: React.FC = () => {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [numVocabs, setNumVocabs] = useState<number>(5);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{ [key: string]: boolean }>({});
  const [isSwapped, setIsSwapped] = useState(false);

  const startLearning = () => {
    const shuffled = [...vocabData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numVocabs);
    setVocabList(selected);
    setUserAnswers({});
    setResults({});
    setIsStarted(true);
    setIsSubmitted(false);
  };

  const handleAnswerChange = (word: string, answer: string) => {
    if (!isSubmitted) {
      setUserAnswers((prev) => ({
        ...prev,
        [word]: answer.toLowerCase(),
      }));
    }
  };

  const handleSubmit = () => {
    const newResults: { [key: string]: boolean } = {};
    const wrongVocabs: WrongVocab[] = [];

    vocabList.forEach((vocab) => {
      const correctAnswers = isSwapped
        ? [vocab.english.toLowerCase()]
        : vocab.vietnamese.map((v) => v.toLowerCase());
      const isCorrect = correctAnswers.includes(userAnswers[vocab.english]?.toLowerCase() || "");
      newResults[vocab.english] = isCorrect;
      if (!isCorrect) {
        wrongVocabs.push({ ...vocab, isSwapped, timestamp: Date.now() }); // Thêm timestamp
      }
    });

    const storedWrongVocabs = localStorage.getItem("wrongVocabs");
    let wrongVocabsList: WrongVocab[] = storedWrongVocabs ? JSON.parse(storedWrongVocabs) : [];
    wrongVocabs.forEach((vocab) => {
      if (!wrongVocabsList.some((v) => v.english === vocab.english && v.isSwapped === vocab.isSwapped)) {
        wrongVocabsList.push(vocab);
      }
    });
    localStorage.setItem("wrongVocabs", JSON.stringify(wrongVocabsList));

    setResults(newResults);
    setIsSubmitted(true);
  };

  const toggleSwap = () => {
    setIsSwapped((prev) => !prev);
    setUserAnswers({});
    setResults({});
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    const correctCount = Object.values(results).filter((r) => r).length;
    return ((correctCount / vocabList.length) * 100).toFixed(2);
  };

  const speakText = (text: string, lang = "en-US") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = (word: string) => {
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
      console.log("Voice input:", transcript);
      handleAnswerChange(word, transcript);
      toast.success(`Recognized: "${transcript}"`);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Voice recognition error:", event.error);
      toast.error("An error occurred during voice recognition: " + event.error);
    };

    recognition.start();
  };

  if (!isStarted) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-indigo-100 flex items-center justify-center">
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-800 mb-6 md:mb-8">
            Select Number of Vocabulary
          </h1>
          <div className="flex justify-center space-x-4 mb-6">
            {[5, 10, 15].map((value) => (
              <button
                key={value}
                onClick={() => setNumVocabs(value)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-300 font-bold text-base md:text-lg flex items-center justify-center cursor-pointer ${
                  numVocabs === value ? "bg-indigo-600 text-white" : "bg-white text-indigo-800"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={startLearning}
              className="bg-indigo-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md text-base md:text-lg font-semibold"
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex flex-col md:flex-row min-h-[calc(100vh-80px)] px-4">
      <div className="w-full md:w-3/4 pr-0 md:pr-8 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-6 md:mb-8 text-center">
          Vocabulary Learning ({vocabList.length} Words)
        </h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleSwap}
            className="bg-blue-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm md:text-base"
          >
            {isSwapped ? "English → Vietnamese" : "Vietnamese → English"}
          </button>
        </div>
        <div className="space-y-4">
          {vocabList.map((vocab) => (
            <div key={vocab.english} className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 p-4 bg-white rounded-lg shadow-md">
              <div className="w-full md:w-1/3">
                <p className="text-base md:text-lg font-semibold">
                  {isSwapped ? vocab.vietnamese[0] : vocab.english}
                </p>
                <button
                  onClick={() => speakText(vocab.english)}
                  className="text-blue-600 hover:text-blue-800 mt-1 md:mt-0 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faVolumeHigh} />
                </button>
              </div>
              <div className="w-full md:w-1/3 text-sm md:text-base text-gray-600">
                {vocab.pos}
              </div>
              <div className="w-full md:w-1/3 flex items-center space-x-2">
                <input
                  type="text"
                  value={userAnswers[vocab.english] || ""}
                  onChange={(e) => handleAnswerChange(vocab.english, e.target.value)}
                  disabled={isSubmitted}
                  className={`w-full p-2 border rounded-lg text-sm md:text-base ${
                    isSubmitted
                      ? results[vocab.english]
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter translation here"
                />
                <button
                  onClick={() => handleVoiceInput(vocab.english)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  disabled={isSubmitted}
                >
                  <FontAwesomeIcon icon={faMicrophone} />
                </button>
              </div>
              {isSubmitted && (
                <div className="w-full mt-2 bg-gray-100 p-3 rounded-lg">
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
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/4 mt-6 md:mt-0 md:fixed md:right-0 md:top-20 md:h-[calc(100vh-80px)] md:pr-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-800 mb-4 text-center">Learning Info</h2>
          <p className="text-sm md:text-lg">Words Answered: {Object.keys(userAnswers).length}/{vocabList.length}</p>
          {isSubmitted && (
            <div className="mt-4">
              <h3 className="text-base md:text-lg font-semibold text-green-700">Results</h3>
              <p className="text-sm md:text-base">Correct: {Object.values(results).filter((r) => r).length}/{vocabList.length}</p>
              <p className="text-sm md:text-base">Score: {calculateScore()}%</p>
            </div>
          )}
          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              className="mt-4 md:mt-6 w-full bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-green-700 transition duration-300 shadow-md text-sm md:text-lg font-semibold"
            >
              Submit Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabLearn;