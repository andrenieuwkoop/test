// src/App.jsx
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function App() {
  const [checklists, setChecklists] = useState(() => {
    const stored = localStorage.getItem("checklists");
    return stored ? JSON.parse(stored) : [];
  });
  const [inspections, setInspections] = useState(() => {
    const stored = localStorage.getItem("inspections");
    return stored ? JSON.parse(stored) : [];
  });
  const [view, setView] = useState("home");
  const [currentChecklist, setCurrentChecklist] = useState(null);
  const [formResponses, setFormResponses] = useState([]);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [newQuestions, setNewQuestions] = useState([{ question: "", options: [{ text: "", color: "" }] }]);

  useEffect(() => {
    localStorage.setItem("inspections", JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem("checklists", JSON.stringify(checklists));
  }, [checklists]);

  const handleChecklistSubmit = () => {
    const filteredQuestions = newQuestions
      .filter(q => q.question.trim() !== "")
      .map(q => ({
        question: q.question,
        options: q.options.filter(o => o.text.trim() !== "")
      }));

    const newChecklist = {
      id: Date.now(),
      name: newChecklistName,
      questions: filteredQuestions
    };
    setChecklists([newChecklist, ...checklists]);
    setNewChecklistName("");
    setNewQuestions([{ question: "", options: [{ text: "", color: "" }] }]);
    setView("list");
  };

  const startInspection = (checklist) => {
    setCurrentChecklist(checklist);
    setFormResponses(checklist.questions.map(q => ({ question: q.question, answer: "", comment: "" })));
    setView("form");
  };

  const handleFormInput = (index, value) => {
    const updated = [...formResponses];
    updated[index].answer = value;
    setFormResponses(updated);
  };

  const handleCommentInput = (index, value) => {
    const updated = [...formResponses];
    updated[index].comment = value;
    setFormResponses(updated);
  };

  const handleInspectionSubmit = () => {
    const newInspection = {
      id: Date.now(),
      checklistName: currentChecklist.name,
      date: new Date().toLocaleString(),
      results: formResponses,
    };
    setInspections([newInspection, ...inspections]);
    setView("list");
  };

  const getAnswerStats = () => {
    const stats = {};
    inspections.forEach(insp => {
      insp.results.forEach(res => {
        if (!stats[res.question]) stats[res.question] = {};
        stats[res.question][res.answer] = (stats[res.question][res.answer] || 0) + 1;
      });
    });
    return stats;
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4444"];

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto text-gray-800">
      <header className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-4">
          <img src="/images/logo-minjusv.png" alt="Logo MinJ&V" className="h-20" />
          <h1 className="text-3xl font-bold text-gray-900">Inspectie Webapp</h1>
        </div>
        <nav className="mt-4 flex gap-4 flex-wrap justify-center">
          <button className="text-sm text-blue-700 underline" onClick={() => setView("home")}>Home</button>
          <button className="text-sm text-blue-700 underline" onClick={() => setView("newChecklist")}>Nieuwe checklist</button>
          <button className="text-sm text-blue-700 underline" onClick={() => setView("list")}>Inspecties</button>
          <button className="text-sm text-blue-700 underline" onClick={() => setView("dashboard")}>Dashboard</button>
        </nav>
      </header>

      {view === "home" && (
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-700">Welkom bij de Inspectie Webapp van het Ministerie van Justitie en Veiligheid.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow" onClick={() => setView("newChecklist")}>Nieuwe checklist</button>
            <button className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow" onClick={() => setView("list")}>Inspecties</button>
            <button className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl shadow" onClick={() => setView("dashboard")}>Dashboard</button>
          </div>
        </div>
      )}

      {view === "newChecklist" && (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold">Nieuwe Checklist Aanmaken</h2>
          <div>
            <label className="block font-medium mb-1">Naam van de checklist</label>
            <input type="text" className="border px-2 py-1 w-full rounded" value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-1">Vragen</label>
            {newQuestions.map((q, idx) => (
              <div key={idx} className="mb-4 border p-4 rounded bg-gray-50">
                <input type="text" placeholder="Vraagtekst" className="border px-2 py-1 w-full rounded mb-2" value={q.question} onChange={(e) => {
                  const updated = [...newQuestions];
                  updated[idx].question = e.target.value;
                  setNewQuestions(updated);
                }} />
                <label className="block font-medium mb-1">Antwoordopties</label>
                {q.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder={`Optie ${i + 1}`} className="border px-2 py-1 flex-1 rounded" value={opt.text} onChange={(e) => {
                      const updated = [...newQuestions];
                      updated[idx].options[i].text = e.target.value;
                      setNewQuestions(updated);
                    }} />
                    <input type="color" value={opt.color || "#ffffff"} onChange={(e) => {
                      const updated = [...newQuestions];
                      updated[idx].options[i].color = e.target.value;
                      setNewQuestions(updated);
                    }} />
                  </div>
                ))}
                <button className="mt-1 px-3 py-1 bg-gray-300 rounded shadow" onClick={() => {
                  const updated = [...newQuestions];
                  updated[idx].options.push({ text: "", color: "" });
                  setNewQuestions(updated);
                }}>Voeg antwoord toe</button>
              </div>
            ))}
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded shadow" onClick={() => setNewQuestions([...newQuestions, { question: "", options: [{ text: "", color: "" }] }])}>Voeg vraag toe</button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow" onClick={handleChecklistSubmit}>Checklist opslaan</button>
        </div>
      )}

      {view === "form" && currentChecklist && (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold">Inspectieformulier: {currentChecklist.name}</h2>
          {formResponses.map((res, idx) => (
            <div key={idx} className="border p-4 rounded bg-gray-50 space-y-2">
              <label className="font-medium block">{res.question}</label>
              <div className="flex flex-wrap gap-2">
                {currentChecklist.questions[idx].options.map((opt, i) => (
                  <button key={i} className={`px-3 py-1 rounded shadow ${res.answer === opt.text ? "bg-blue-700 text-white" : "bg-gray-200 hover:bg-gray-300"}`} style={{ borderColor: opt.color || "#000", borderWidth: 2, borderStyle: "solid" }} onClick={() => handleFormInput(idx, opt.text)} type="button">{opt.text}</button>
                ))}
              </div>
              <textarea className="w-full border rounded px-2 py-1 mt-2" placeholder="Opmerking (optioneel)" value={res.comment} onChange={(e) => handleCommentInput(idx, e.target.value)} />
            </div>
          ))}
          <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow" onClick={handleInspectionSubmit}>Inspectie voltooien</button>
        </div>
      )}

      {view === "list" && (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold">Inspectiegeschiedenis</h2>
          {checklists.length > 0 ? (
            <>
              <h3 className="text-lg font-bold">Kies checklist om inspectie te starten</h3>
              <div className="flex flex-wrap gap-4">
                {checklists.map((cl) => (
                  <button key={cl.id} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow" onClick={() => startInspection(cl)}>{cl.name}</button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Er zijn nog geen checklists beschikbaar.</p>
          )}

          {inspections.length > 0 ? (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-bold">Vorige inspecties</h3>
              {inspections.map((insp) => (
                <div key={insp.id} className="border p-4 rounded bg-gray-50">
                  <div className="font-semibold">{insp.checklistName}</div>
                  <div className="text-sm text-gray-600">{insp.date}</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {insp.results.map((res, i) => (
                      <li key={i}>
                        <strong>{res.question}:</strong> {res.answer}
                        {res.comment && <em className="text-gray-500"> — {res.comment}</em>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">Nog geen inspecties uitgevoerd.</p>
          )}
        </div>
      )}

      {view === "dashboard" && (
        <div className="space-y-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold">Managementdashboard</h2>
          {Object.entries(getAnswerStats()).map(([question, answers], idx) => (
            <div key={idx} className="border p-4 rounded-xl bg-gray-50">
              <h3 className="text-lg font-bold mb-2">{question}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={Object.entries(answers).map(([key, value]) => ({ name: key, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {Object.entries(answers).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
