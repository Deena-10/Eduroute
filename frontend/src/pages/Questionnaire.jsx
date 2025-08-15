import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const Chatbot = () => {
  const { user } = useContext(AuthContext); // 🎯 THE FIX: Get the logged-in user from the context
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const chatWindowRef = useRef(null);

  // 🎯 THE FIX: Fetch initial questions and user's saved data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        // Clear state if no user is logged in
        setAnswers({});
        setMessages([]);
        setCurrentQuestionIndex(0);
        return;
      }

      try {
        // Fetch questions
        const questionsRes = await axiosInstance.get("/questions");
        const fetchedQuestions = questionsRes.data || [];
        setQuestions(fetchedQuestions);

        // Fetch user's saved progress
        const answersRes = await axiosInstance.get(`/answers/${user.id}`); // Fetch answers specific to the user
        const fetchedAnswers = answersRes.data || {};
        setAnswers(fetchedAnswers);

        // Reconstruct messages from saved answers and questions
        const reconstructedMessages = [];
        let lastQuestionIndex = 0;
        
        reconstructedMessages.push({ from: "bot", text: fetchedQuestions[0]?.text, icon: fetchedQuestions[0]?.icon });
        
        for (const [questionId, answer] of Object.entries(fetchedAnswers)) {
            const question = fetchedQuestions.find(q => q.id === parseInt(questionId));
            if (question) {
                reconstructedMessages.push({ from: "user", text: answer });
                reconstructedMessages.push({ from: "bot", text: fetchedQuestions[fetchedQuestions.indexOf(question) + 1]?.text, icon: fetchedQuestions[fetchedQuestions.indexOf(question) + 1]?.icon });
                lastQuestionIndex = fetchedQuestions.indexOf(question) + 1;
            }
        }

        setMessages(reconstructedMessages);
        setCurrentQuestionIndex(lastQuestionIndex);

        if (reconstructedMessages.length === 0 && fetchedQuestions.length > 0) {
          setMessages([{ from: "bot", text: fetchedQuestions[0].text, icon: fetchedQuestions[0].icon }]);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    
    fetchData();
  }, [user]); // Re-run effect when the user object changes (e.g., on login/logout)

  // Scroll to bottom when messages change
  useEffect(() => {
    chatWindowRef.current?.scrollTo({ top: chatWindowRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, botTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !user?.id) return;

    const currentQuestionId = questions[currentQuestionIndex]?.id;
    const newUserMessage = { from: "user", text: userInput };

    setMessages((prev) => [...prev, newUserMessage]);
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: userInput }));

    // 🎯 THE FIX: Save the user's answer to the backend
    try {
        await axiosInstance.post(`/answers/${user.id}`, { questionId: currentQuestionId, answer: userInput });
    } catch (error) {
        console.error("Error saving answer", error);
    }
    
    setUserInput("");

    if (currentQuestionIndex < questions.length - 1) {
      setBotTyping(true);
      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        const nextQuestion = questions[nextQuestionIndex];
        setMessages((prev) => [...prev, { from: "bot", text: nextQuestion.text, icon: nextQuestion.icon }]);
        setCurrentQuestionIndex(nextQuestionIndex);
        setBotTyping(false);
      }, 800);
    } else {
      submitToAI();
    }
  };

  const submitToAI = async () => {
    if (!user?.id) return;
    setLoading(true);
    setBotTyping(true);
    setMessages((prev) => [...prev, { from: "bot", text: "Analyzing your answers...", icon: "🧠" }]);
    try {
      // 🎯 THE FIX: Pass the answers with the user ID to the AI endpoint
      const res = await axiosInstance.post(`/ai/career-suggestion/${user.id}`, { answers });
      setBotTyping(false);

      const suggestionCard = `
🎯 Career: ${res.data.careerTitle}
💡 Why: ${res.data.reason}
📅 Next Steps:
${res.data.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
      `;

      setMessages((prev) => [...prev, { from: "bot", text: suggestionCard, card: true, icon: "💡" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { from: "bot", text: "⚠️ Could not get a suggestion. Try again.", icon: "❌" }]);
    } finally {
      setLoading(false);
      setBotTyping(false);
    }
  };

  // Removed the handleRestart function and the Restart button from the JSX.
  
  if (questions.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}>Loading questions...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#4A90E2", padding: "20px", color: "#fff", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", position: "relative" }}>
        <h1 style={{ margin: 0 }}>💬 Career Chatbot</h1>
      </header>

      {/* Chat Messages */}
      <div ref={chatWindowRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "800px", margin: "0 auto" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
            {msg.from === "bot" && <img src="https://cdn-icons-png.flaticon.com/512/4712/4712107.png" alt="bot" style={{ width: "32px", height: "32px", marginRight: "8px" }} />}
            <div style={{
              padding: "12px 16px",
              background: msg.from === "user" ? "linear-gradient(135deg, #4A90E2, #357ABD)" : "#fff",
              color: msg.from === "user" ? "#fff" : "#333",
              borderRadius: "18px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              maxWidth: "70%",
              whiteSpace: "pre-wrap",
              transition: "all 0.3s"
            }}>
              {msg.card ? (
                <div style={{ border: "2px solid #4A90E2", padding: "10px", borderRadius: "12px", backgroundColor: "#EAF4FF" }}>
                  <pre style={{ margin: 0, fontFamily: "inherit" }}>{msg.text}</pre>
                </div>
              ) : msg.text}
            </div>
            {msg.from === "user" && <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="user" style={{ width: "32px", height: "32px", marginLeft: "8px" }} />}
          </div>
        ))}

        {/* Typing Indicator */}
        {botTyping && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712107.png" alt="bot" style={{ width: "32px", height: "32px", marginRight: "8px" }} />
            <div style={{ background: "#fff", padding: "10px 14px", borderRadius: "18px", color: "#555", fontStyle: "italic" }}>
              Typing<span className="dots">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={{ padding: "12px", backgroundColor: "#fff", borderTop: "1px solid #ddd" }}>
        <div style={{ display: "flex", gap: "8px", maxWidth: "800px", margin: "0 auto" }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer..."
            disabled={loading || currentQuestionIndex >= questions.length}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #ccc",
              borderRadius: "20px",
              outline: "none",
              fontSize: "16px",
              backgroundColor: (loading || currentQuestionIndex >= questions.length) ? "#f2f2f2" : "#fff"
            }}
          />
          <button type="submit" style={{
            backgroundColor: "#4A90E2",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}>
            Send
          </button>
        </div>
      </form>
      <style>{`
        .dots::after {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-left: 3px;
          border-radius: 50%;
          background: #555;
          animation: blink 1s infinite;
        }
        .dots::after:nth-child(2) { animation-delay: 0.2s; }
        .dots::after:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
