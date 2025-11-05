import axios from "axios";

interface ContextMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const chatWithDoc = async (
  doc_id: number | null,
  query: string,
  context: ContextMessage[] = []
) => {
  try {
    const response = await axios.post(`/search/${doc_id}`, {
      query,
      context, // ✅ send previous conversation
    });

    if (response.status !== 200) {
      console.log("Something went wrong. Try again.");
    }

    return response; // return full response
  } catch (error) {
    console.error(error);
    throw error; // re-throw to handle in calling code
  }
};

export const fetchQuizFromAPI = async (doc_id: number | null,difficulty:string,topic:string,numQuestions:number) => {
  try {
    const response = await axios.post(`/search/quiz-chunk/${doc_id}`,{difficulty,topic,numQuestions});
    return response.data; // expected to be string[]
  } catch (error) {
    console.log(error);
  }
};

export const checkAnswer = async (
  question: string,
  answer: string,
  doc_id: number | null
) => {
  if (!doc_id) throw new Error("doc_id is required");
  
  try {
    const response = await axios.post(`search/check/${doc_id}`, {
      question,
      answer,
    });
    return response.data;
  } catch (error: any) {
    console.log("Error in check answer:", error.response?.data || error);
  }
};

