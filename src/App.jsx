import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [summary, setSummary] = useState("");
  const [draftSaved, setDraftSaved] =useState(false);

  useEffect(() => {
    console.log("Name changed:", name);
  }, [name]);
  
  useEffect(() => {
    document.title = name ? "Resume: " +name : "AI Resume Buider";
  },[name]);
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("resumeDraft"));
      if (saved){
        setName(saved.name || "");
        setSkills(saved.skills || "");
        setExperience(saved.experience || "");
        setSummary(saved.summary || "");
      }
    }catch (err){
      console.log("No saved draft");
    }
    setLoaded(true);
  }, []);

  useEffect(()=> {
    if (!loaded) return;
    localStorage.setItem(
      "resumeDraft",
      JSON.stringify({ name, skills, experience, summary})
    );
    setDraftSaved(true);
    const timer = setTimeout(() => setDraftSaved(false), 1200);
    return () => clearTimeout(timer);
  },[name, skills, experience, summary]);

    const prompt = `Create one professional resume summary.

Name: ${name}
Skills: ${skills}
Experience: ${experience}

Return only the final summary. Do not invent anything.`;
  
   function clearDraft() {
    setName("");
    setSkills("");
    setExperience("");
    setSummary("");
  }

  async function generateResume() {
    if (!name || !skills || !experience) {
      alert("Please fill in all fields!");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        "gemini-3.1-flash-lite:generateContent";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": "API_KEY",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI request failed");
      }

      const result =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No summary generated.";

      setSummary(result);
    } catch (error) {
      setSummary("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  console.log(name, "Name");
  console.log(skills, "Skills");
  console.log(experience, "Experience");

  return (
    <>
      <div style={style.page}>
        <div style={style.card}>
          <h1>AI Resume Builder</h1>

          <div style={style.section}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your Full Name"
              style={style.input}
            />

            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, React, SQL"
              style={style.input}
            />

            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Describe your experience"
              rows={5}
              style={style.input}
            />

            <button
              onClick={generateResume}
              disabled={loading}
              style={style.button}
            >
              {loading ? "Generating..." : "Generate My Resume"}
            </button>

            <div style={style.draftRow}>
              <button onClick={clearDraft} style={style.clearBtn}>
                Clear draft
              </button>
              <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                {draftSaved ? "Draft saved" : ""}
                </span>
            </div>

            {summary && (
              <div style={style.result}>
                <h2>Resume Summary</h2>
                <h3>{name}</h3>
                <p>{skills}</p>

                <p style={{ whiteSpace: "pre-wrap" }}>
                  {summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const style = {
  input: {
    padding: "10px",
    border: "1px solid #f9fafb",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },

  page: {
    minHeight: "100vh",
    background: "#eef3fb",
    padding: "40px 16px",
  },

  card: {
    maxWidth: "650px",
    margin: "0 auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  button: {
    padding: "12px",
    background: "#2457d6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
  },

  result: {
    marginTop: "28px",
    padding: "22px",
    background: "#f0f7ff",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    lineHeight: "1.7",
  },

  draftRow:{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },

  clearBtn:{
    padding: "8px 14px",
    background: "#e2e8f0",
    color: "#le293b",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default App;