// frontend/src/pages/Questionnaire.jsx – Create your career roadmap (form, no chat)
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const Questionnaire = () => {
  const { loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");
  const [proficiency, setProficiency] = useState("Beginner");
  const [professionalGoal, setProfessionalGoal] = useState("job-ready");
  const [currentStatus, setCurrentStatus] = useState("College student");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError("Please enter your primary interest or domain.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/ai/generate-career-roadmap", {
        domain: domain.trim(),
        proficiency_level: proficiency,
        professional_goal: professionalGoal,
        current_status: currentStatus,
      });
      if (res.data.success) {
        navigate("/roadmap");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(
        msg?.includes("not running")
          ? "AI service is offline. Start it with: cd backend/service && python application.py"
          : msg || "Failed to generate roadmap. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F6F6F6" }}>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "#F6F6F6" }}>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-300 shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#000000" }}>
            Create your career roadmap
          </h1>
          <p className="text-gray-600 mb-6">
            Tell us a bit about yourself and we’ll generate a step-by-step learning path for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Primary interest or domain
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Python, Web Development, Data Science"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency level
              </label>
              <select
                id="proficiency"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={submitting}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="professionalGoal" className="block text-sm font-medium text-gray-700 mb-1">
                Professional goal
              </label>
              <select
                id="professionalGoal"
                value={professionalGoal}
                onChange={(e) => setProfessionalGoal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={submitting}
              >
                <option value="job-ready">Job-ready</option>
                <option value="enterprise">Enterprise</option>
                <option value="product-based">Product-based</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Current status
              </label>
              <select
                id="status"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={submitting}
              >
                <option value="School student">School student</option>
                <option value="College student">College student</option>
                <option value="Working professional">Working professional</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {submitting ? "Generating roadmap…" : "Generate my roadmap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
