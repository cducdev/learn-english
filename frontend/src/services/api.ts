// src/services/api.ts
import axios from "axios";
import { Question, Answer, CheckResult, ExamRequest } from "../types";

const API_URL = "http://localhost:8000";

export const getRandomQuestion = async (): Promise<Question> => {
  const response = await axios.get(`${API_URL}/get-question`);
  return response.data;
};

export const checkAnswer = async (answer: Answer): Promise<CheckResult> => {
  const response = await axios.post(`${API_URL}/check-answer`, answer);
  return response.data;
};

export const generateExam = async (
  examRequest: ExamRequest
): Promise<Question[]> => {
  const response = await axios.post(`${API_URL}/generate-exam`, examRequest);
  return response.data;
};