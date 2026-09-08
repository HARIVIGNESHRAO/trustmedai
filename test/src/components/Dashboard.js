"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Activity,
  FileClock,
  FileSearch,
  FileUp,
  LogOut,
  Mic,
  PenLine,
  ShieldCheck,
  Sparkles,
  Square,
  Upload,
} from "lucide-react";
import { API_ORIGIN, API_URL } from "@/lib/config";

const profile = {
  name: "Hari Vignesh",
  role: "Medical Report Portal",
  avatar: "/profile.png",
};

const initialForm = {
  patientName: "",
  age: "",
  gender: "",
  selectedParameter: "",
  parameterValue: "",
};

const acceptedTypes = [".pdf", ".png", ".jpg", ".jpeg", ".webm", ".wav", ".mp3"];

const medicalParameters = [
  { label: "Glucose (mg/dL)", key: "glucose", unit: "mg/dL" },
  { label: "BMI (kg/m²)", key: "bmi", unit: "kg/m²" },
  { label: "Insulin (μU/mL)", key: "insulin", unit: "μU/mL" },

  { label: "Blood Pressure (mmHg)", key: "bloodPressure", unit: "mmHg" },
  { label: "Cholesterol (mg/dL)", key: "cholesterol", unit: "mg/dL" },
  { label: "Chest Pain Type (0-3)", key: "cp", unit: "" },
  { label: "Fasting Blood Sugar (0/1)", key: "fbs", unit: "" },
  { label: "ECG Result (0-2)", key: "restecg", unit: "" },
  { label: "Maximum Heart Rate (bpm)", key: "thalach", unit: "bpm" },
  { label: "Exercise Induced Angina (0/1)", key: "exang", unit: "" },
  { label: "ST Depression (Oldpeak)", key: "oldpeak", unit: "" },
  { label: "Slope (0-2)", key: "slope", unit: "" },
  { label: "Major Vessels (0-4)", key: "ca", unit: "" },
  { label: "Thalassemia (0-3)", key: "thal", unit: "" },

  { label: "TSH (mIU/L)", key: "tsh", unit: "mIU/L" },
  { label: "T3 (ng/dL)", key: "t3", unit: "ng/dL" },
  { label: "TT4 (μg/dL)", key: "tt4", unit: "μg/dL" },
  { label: "T4U", key: "t4u", unit: "" },
  { label: "FTI", key: "fti", unit: "" },
  { label: "TBG", key: "tbg", unit: "" },

  { label: "Hemoglobin (g/dL)", key: "hemoglobin", unit: "g/dL" },
  { label: "Creatinine (mg/dL)", key: "creatinine", unit: "mg/dL" },
  { label: "Blood Urea (mg/dL)", key: "bloodUrea", unit: "mg/dL" },
  { label: "Sodium (mEq/L)", key: "sodium", unit: "mEq/L" },
  { label: "Potassium (mEq/L)", key: "potassium", unit: "mEq/L" },

  { label: "Albumin (g/dL)", key: "albumin", unit: "g/dL" },
  { label: "Total Bilirubin (mg/dL)", key: "totalBilirubin", unit: "mg/dL" },
  { label: "Direct Bilirubin (mg/dL)", key: "directBilirubin", unit: "mg/dL" },
  { label: "ALT / SGPT (U/L)", key: "altSgpt", unit: "U/L" },
  { label: "AST / SGOT (U/L)", key: "astSgot", unit: "U/L" },
  { label: "Alkaline Phosphatase (U/L)", key: "alkalinePhosphatase", unit: "U/L" },
  { label: "Total Proteins (g/dL)", key: "totalProteins", unit: "g/dL" },
  { label: "Albumin / Globulin Ratio", key: "agRatio", unit: "" },
];

export default function Dashboard() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("upload");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadedData, setUploadedData] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [parameterSearch, setParameterSearch] = useState("");
  const [addedParameters, setAddedParameters] = useState([]);
  const [editingParameterKey, setEditingParameterKey] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [username, setUsername] =
    useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState("/profile.png");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.mediaDevices?.getUserMedia
    ) {
      setSpeechSupported(false);
    }
  }, []);
  useEffect(() => {
    const requestedMode = window.location.hash.slice(1);
    if (["upload", "direct", "voice"].includes(requestedMode)) {
      setMode(requestedMode);
    }
  }, []);
  useEffect(() => {

    const username =
      localStorage.getItem("username");

    if (username) {
      setUsername(username);
      setAuthenticated(true);
      setLoading(false);
      return;
    }
    fetch(
      `${API_ORIGIN}/current-user`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
      .then(res => res.json())
      .then(data => {

        console.log("Current User:", data);

        if (data.authenticated) {

          setUsername(data.name);

          if (
            data.picture &&
            !data.picture.includes("graph.microsoft.com")
          ) {
            setProfilePicture(data.picture);
          } else {
            setProfilePicture("/profile.png");
          }

          setAuthenticated(true);
        }

        setLoading(false);

      })
      .catch(err => {

        console.error(
          "Current User Error:",
          err
        );

        setLoading(false);

      });

  }, []);
  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setFeedback("Voice recording is not supported in this browser.", "error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], "voice-report.webm", {
          type: "audio/webm",
        });

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const localUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(file);
        setAudioUrl(localUrl);
        setFeedback("Voice recording captured successfully.", "success");

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback("Recording started... speak now.", "info");
    } catch (error) {
      setFeedback("Microphone access denied or unavailable.", "error");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyzeVoiceReport = async () => {
    if (!recordedAudio) {
      setFeedback("Please record a voice report first.", "error");
      return;
    }

    setAnalyzing(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", recordedAudio);

      const response = await fetch(`${API_URL}/voice-report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Voice analysis failed");
      }

      localStorage.setItem(
        "trustmedai_result",
        JSON.stringify({
          predictionId: result.predictionId,
          patient: {
            patientName:
              result?.patient?.patientName ||
              result?.patientName ||
              "Voice Report Patient",
            age: result?.patient?.age || result?.age || "-",
            gender: result?.patient?.gender || result?.gender || "-",
          },
          parameters: normalizeParametersFromOcr(result),
          predictions: normalizePredictions(result.predictions),
          timestamp: new Date().toLocaleString(),
          source: "voice",
          transcript: result.transcript || result.rawText || "",
          uploadedFiles: [
            {
              name: recordedAudio.name,
              type: recordedAudio.type,
              size: recordedAudio.size,
            },
          ],
        })
      );

      setFeedback("Voice report analyzed successfully.", "success");
      router.push("/result");
    } catch (error) {
      setFeedback(error.message || "Unable to analyze voice report right now.", "error");
    } finally {
      setAnalyzing(false);
    }
  };
  const previewItems = useMemo(
    () =>
      files.map((file, index) => ({
        id: `${file.name}-${index}`,
        file,
        name: file.name,
        type: file.type || "Unknown",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })),
    [files]
  );

  const filteredParameters = useMemo(() => {
    const remaining = medicalParameters.filter(
      (item) => !addedParameters.some((param) => param.key === item.key)
    );

    if (!parameterSearch.trim()) return remaining;

    return remaining.filter((item) =>
      item.label.toLowerCase().includes(parameterSearch.toLowerCase())
    );
  }, [parameterSearch, addedParameters]);

  const setFeedback = (message, type = "info") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.patientName.trim()) nextErrors.patientName = "Patient name is required.";
    if (!form.age.toString().trim()) {
      nextErrors.age = "Age is required.";
    } else if (Number.isNaN(Number(form.age)) || Number(form.age) <= 0) {
      nextErrors.age = "Enter a valid age.";
    }

    if (!form.gender.trim()) nextErrors.gender = "Gender is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const normalizePredictions = (predictions) => {
    if (!predictions) return [];

    if (Array.isArray(predictions)) {
      return predictions.map((item) => ({
        disease: item.disease,
        probability: Number(item.probability ?? item.score ?? 0),
      }));
    }

    if (typeof predictions === "object") {
      return Object.entries(predictions).map(([key, value]) => ({
        disease: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase())
          .trim(),
        probability: Number(value ?? 0),
      }));
    }

    return [];
  };

  const normalizeParametersFromOcr = (ocrData) => {
    if (!ocrData) return [];

    if (
      ocrData.parameters &&
      typeof ocrData.parameters === "object" &&
      !Array.isArray(ocrData.parameters)
    ) {
      return Object.entries(ocrData.parameters).map(([key, value]) => {
        let finalValue = value;

        if (typeof value === "string") {
          const trimmed = value.trim();

          if (trimmed === "") {
            finalValue = null;
          } else if (key === "gender") {
            finalValue = trimmed;
          } else if (!Number.isNaN(Number(trimmed))) {
            finalValue = Number(trimmed);
          } else {
            finalValue = trimmed;
          }
        }

        return {
          key,
          label: key,
          value: finalValue,
          unit: "",
        };
      });
    }

    return [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddParameter = () => {
    const selected = medicalParameters.find((item) => item.key === form.selectedParameter);

    if (!selected) {
      setFeedback("Please select a medical parameter.", "error");
      return;
    }

    if (!form.parameterValue.toString().trim()) {
      setFeedback("Please enter a parameter value.", "error");
      return;
    }

    if (Number.isNaN(Number(form.parameterValue))) {
      setFeedback("Parameter value must be numeric.", "error");
      return;
    }

    const exists = addedParameters.some((item) => item.key === selected.key);

    if (exists) {
      setFeedback("Duplicate parameters are not allowed.", "error");
      return;
    }

    setAddedParameters((prev) => [
      ...prev,
      {
        key: selected.key,
        label: selected.label,
        unit: selected.unit,
        value: Number(form.parameterValue),
      },
    ]);

    setForm((prev) => ({
      ...prev,
      selectedParameter: "",
      parameterValue: "",
    }));

    setParameterSearch("");
    setFeedback(`${selected.label} added successfully.`, "success");
  };

  const handleDeleteParameter = (key) => {
    setAddedParameters((prev) => prev.filter((item) => item.key !== key));
    if (editingParameterKey === key) {
      setEditingParameterKey("");
      setEditingValue("");
    }
    setFeedback("Parameter removed successfully.", "info");
  };

  const handleEditParameter = (item) => {
    setEditingParameterKey(item.key);
    setEditingValue(String(item.value));
  };

  const handleSaveParameter = (key) => {
    if (!editingValue.toString().trim() || Number.isNaN(Number(editingValue))) {
      setFeedback("Enter a valid numeric value.", "error");
      return;
    }

    setAddedParameters((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, value: Number(editingValue) } : item
      )
    );

    setEditingParameterKey("");
    setEditingValue("");
    setFeedback("Parameter updated successfully.", "success");
  };

  const handleAnalyzeRisk = async () => {
    if (!validateForm()) {
      setFeedback("Please fill patient details correctly.", "error");
      return;
    }

    if (addedParameters.length === 0) {
      setFeedback("Add at least one medical parameter.", "error");
      return;
    }

    setAnalyzing(true);

    const payload = {
      age: Number(form.age),
      gender: form.gender,
      parameters: addedParameters.reduce((acc, item) => {
        acc[item.key] = Number(item.value);
        return acc;
      }, {}),
    };

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();

      localStorage.setItem(
        "trustmedai_result",
        JSON.stringify({
          patient: {
            patientName: form.patientName,
            age: form.age,
            gender: form.gender,
          },
          parameters: addedParameters,
          predictions: normalizePredictions(result.predictions),
          timestamp: new Date().toLocaleString(),
          source: "manual",
        })
      );

      router.push("/result");
      setUploadedData([]);
      setFeedback("Health risk analysis data prepared successfully.", "success");
    } catch (error) {
      setFeedback("Unable to analyze health risk right now.", "error");
    } finally {
      setAnalyzing(false);
    }
  };
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/prediction-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("History fetch error:", error);
        setHistory([]);
      }
    };

    fetchHistory();
  }, []);
  const handleLogout = () => {

    localStorage.removeItem("username");
    localStorage.removeItem("token");

    router.push("/");

  };

  const handleAnalyzeUploadedReport = async () => {
    if (!files.length) {
      setFeedback("Please select at least one report file.", "error");
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/upload-report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("OCR prediction failed");
      }

      const result = await response.json();
      console.log("UPLOAD RESPONSE =", result);
      localStorage.setItem(
        "trustmedai_result",
        JSON.stringify({
          predictionId: result.predictionId,
          patient: {
            patientName:
              result?.patient?.patientName ||
              result?.patientName ||
              "Uploaded Report Patient",
            age: result?.patient?.age || result?.age || "-",
            gender: result?.patient?.gender || result?.gender || "-",
          },
          parameters: normalizeParametersFromOcr(result),
          predictions: normalizePredictions(result.predictions),
          followUpPlans: result.followUpPlans || [],
          hospitalRecommendations: result.hospitalRecommendations || [],
          timestamp: new Date().toLocaleString(),
          source: "ocr",
          uploadedFiles: files.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
        })
      );

      setFeedback("Uploaded report analyzed successfully.", "success");
      router.push("/result");
    } catch (error) {
      setFeedback("Unable to analyze uploaded report right now.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFeedback("Please fill in all required details.", "error");
      return;
    }

    handleAnalyzeRisk();
  };

  const handleFiles = (fileList) => {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;

    const invalid = selected.filter((file) => {
      const lower = file.name.toLowerCase();
      return !acceptedTypes.some((ext) => lower.endsWith(ext));
    });

    if (invalid.length) {
      setFeedback("Only PDF, PNG, JPG, and JPEG files are allowed.", "error");
      return;
    }

    setFiles(selected);
    setFeedback(`${selected.length} file(s) selected successfully.`, "success");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUploadDisplay = () => {
    if (!files.length) {
      setFeedback("Please select at least one file to continue.", "error");
      return;
    }

    const mapped = files.map((file, index) => ({
      id: `${file.name}-${index}`,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || "Unknown",
    }));

    setUploadedData(mapped);
    setSubmittedData(null);
    setFeedback("Uploaded report details are ready.", "success");
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setFeedback("File removed from selection.", "info");
  };
  if (loading) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }
  if (!authenticated) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <h2>Access Restricted</h2>

          <p>Please login to view the dashboard.</p>

          <button
            className="auth-login-btn"
            onClick={() => router.push("/login")}
          >
            Login Here
          </button>
        </div>
      </div>
    );
  }
  return (
    <main className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span />
              <span />
            </div>
            <div>
              <p className="eyebrow">TrustMedAI</p>
              <h2>Dashboard</h2>
            </div>
          </div>

          <div className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-link ${mode === "upload" ? "active" : ""}`}
              onClick={() => {
                setMode("upload");
                setSidebarOpen(false);
              }}
            >
              <span className="sidebar-link-icon"><FileUp size={17} /></span>
              Upload Report
            </button>

            <button
              type="button"
              className={`sidebar-link ${mode === "direct" ? "active" : ""}`}
              onClick={() => {
                setMode("direct");
                setSidebarOpen(false);
              }}
            >
              <span className="sidebar-link-icon"><PenLine size={17} /></span>
              Enter Details
            </button>
            <button
              type="button"
              className={`sidebar-link ${mode === "voice" ? "active" : ""}`}
              onClick={() => {
                setMode("voice");
                setSidebarOpen(false);
              }}
            >
              <span className="sidebar-link-icon"><Mic size={17} /></span>
              Voice Recording
            </button>
            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                router.push("/dashboard/history");
                setSidebarOpen(false);
              }}
            >
              <span className="sidebar-link-icon"><FileClock size={17} /></span>
              Prediction History
            </button>
          </div>
        </div>

        <div className="sidebar-note">
          <p className="eyebrow">Tips</p>
          <h3>Quick guidance</h3>
          <span>Use clear files, readable images, and complete report details.</span>
        </div>
      </aside>

      <section className="main-panel">
        <header className="top-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              <span />
              <span />
              <span />
            </button>

            <div>
              <p className="eyebrow">Medical workspace</p>
              <h1>Medical Report Dashboard</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="profile-box">
              <div className="profile-image-wrap">
                <Image
                  src={profilePicture}
                  alt={profile.name}
                  className="profile-image"
                  width={62}
                  height={62}
                  priority
                />
              </div>
              <div>
                <p className="profile-label">Logged in user</p>
                <h3>{username}</h3>
                <span>{profile.role}</span>
              </div>
            </div>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={13} /> AI-assisted medical intake</p>
            <h2>Turn patient data into clear, explainable health insights.</h2>
            <p>
              Choose a secure input method. TrustMedAI extracts biomarkers, assesses multiple
              conditions, and explains every result in one guided workflow.
            </p>
          </div>
          <div className="dashboard-hero-proof" aria-label="Platform capabilities">
            <div><ShieldCheck size={18} /><strong>Private</strong><span>Encrypted intake</span></div>
            <div><Activity size={18} /><strong>5 models</strong><span>Parallel screening</span></div>
            <div><Sparkles size={18} /><strong>Explainable</strong><span>Factor-level insight</span></div>
          </div>
        </section>

        {statusMessage && (
          <div className={`status-banner ${statusType}`}>
            <span className="status-dot" />
            {statusMessage}
          </div>
        )}

        <section className="option-grid">
          <button
            type="button"
            className={`option-card ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            <div className="option-card-top"><span className="option-card-icon"><FileUp size={22} /></span><span className="option-number">01</span></div>
            <h3>Upload medical report</h3>
            <p>Upload image, PDF, or scanned report with preview and file summary.</p>
          </button>

          <button
            type="button"
            className={`option-card ${mode === "direct" ? "active" : ""}`}
            onClick={() => setMode("direct")}
          >
            <div className="option-card-top"><span className="option-card-icon"><PenLine size={22} /></span><span className="option-number">02</span></div>
            <h3>Enter details manually</h3>
            <p>Fill the patient and report details using a validated form.</p>
          </button>
          <button
            type="button"
            className={`option-card ${mode === "voice" ? "active" : ""}`}
            onClick={() => setMode("voice")}
          >
            <div className="option-card-top"><span className="option-card-icon"><Mic size={22} /></span><span className="option-number">03</span></div>
            <h3>Voice recording</h3>
            <p>Record voice input and analyze it as an audio-based medical report.</p>
          </button>
        </section>

        {mode === "upload" && (
          <section className="content-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Upload report</p>
                <h2>Select your file</h2>
              </div>
              <div className="mini-help">Accepted: PDF, PNG, JPG, JPEG</div>
            </div>

            <div className="upload-grid">
              <div
                className={`upload-box ${dragActive ? "dragging" : ""}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  multiple={false}
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="upload-icon"><Upload size={24} aria-hidden="true" /></div>
                <h3>Upload a medical report</h3>
                <p>Drag and drop one PDF or image here, or choose a file from your device.</p>

                <div className="upload-actions-row">
                  <button
                    type="button"
                    className="secondary-btn upload-browse-btn"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={16} aria-hidden="true" />
                    Choose file
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={files.length === 0}
                    onClick={handleUploadDisplay}
                  >
                    Review file
                  </button>
                </div>

                <div className="submit-row upload-submit-row">
                  <button
                    type="button"
                    className="primary-btn analyze-report-btn"
                    disabled={files.length === 0 || analyzing}
                    onClick={handleAnalyzeUploadedReport}
                  >
                    {analyzing ? (
                      <><span className="button-spinner" aria-hidden="true" /> Analyzing report...</>
                    ) : (
                      <><FileSearch size={17} aria-hidden="true" /> Analyze report</>
                    )}
                  </button>
                </div>
              </div>

              <div className="files-card">
                <div className="files-head">
                  <h3>Selected files</h3>
                  <span>{files.length}</span>
                </div>

                {previewItems.length === 0 ? (
                  <div className="empty-state">
                    <p>No files selected yet.</p>
                  </div>
                ) : (
                  <div className="file-list">
                    {previewItems.map((item, index) => (
                      <div className="file-row" key={item.id}>
                        <div className="file-main">
                          {item.preview ? (
                            <img src={item.preview} alt={item.name} className="file-preview" />
                          ) : (
                            <div className="file-preview file-fallback">PDF</div>
                          )}
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.size}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFile(index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {uploadedData.length > 0 && (
              <div className="result-card">
                <p className="eyebrow">Uploaded details</p>
                <h2>Report file summary</h2>

                <div className="result-grid">
                  {uploadedData.map((file) => (
                    <div className="result-box" key={file.id}>
                      <span>File name</span>
                      <strong>{file.name}</strong>
                      <span>Type</span>
                      <strong>{file.type}</strong>
                      <span>Size</span>
                      <strong>{file.size}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
        {mode === "voice" && (
          <section className="content-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Voice report</p>
                <h2>Record your voice input</h2>
              </div>
              <div className="mini-help">Microphone-based report capture</div>
            </div>

            <div className="voice-grid">
              <div className="voice-card">
                <div className="voice-icon-wrap">
                  <div className={`voice-pulse ${isRecording ? "active" : ""}`}>
                    <Mic size={28} aria-hidden="true" />
                  </div>
                </div>

                <h3>{isRecording ? "Recording in progress..." : "Ready to record"}</h3>
                <p>
                  Read the patient details and medical values clearly. You can listen back before analysis.
                </p>

                {!speechSupported ? (
                  <div className="empty-state">
                    <p>Voice recording is not supported in this browser.</p>
                  </div>
                ) : (
                  <div className="voice-actions">
                    {!isRecording ? (
                      <button
                        type="button"
                        className="primary-btn record-start-btn"
                        onClick={handleStartRecording}
                      >
                        <Mic size={17} aria-hidden="true" />
                        Start recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="stop-btn"
                        onClick={handleStopRecording}
                      >
                        <Square size={15} fill="currentColor" aria-hidden="true" />
                        Stop recording
                      </button>
                    )}

                    <button
                      type="button"
                      className="secondary-btn voice-analyze-btn"
                      disabled={!recordedAudio || analyzing}
                      onClick={handleAnalyzeVoiceReport}
                    >
                      {analyzing ? (
                        <><span className="button-spinner" aria-hidden="true" /> Analyzing recording...</>
                      ) : (
                        <><FileSearch size={17} aria-hidden="true" /> Analyze recording</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="files-card">
                <div className="files-head">
                  <h3>Recorded audio</h3>
                  <span>{recordedAudio ? 1 : 0}</span>
                </div>

                {!recordedAudio ? (
                  <div className="empty-state">
                    <p>No voice recording available yet.</p>
                  </div>
                ) : (
                  <div className="audio-preview-box">
                    <strong>{recordedAudio.name}</strong>
                    <span>{(recordedAudio.size / 1024 / 1024).toFixed(2)} MB</span>
                    <audio controls src={audioUrl} className="audio-player" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        {mode === "direct" && (
          <section className="content-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Manual entry</p>
                <h2>Enter patient details</h2>
              </div>
              <div className="mini-help">Patient info and dynamic medical parameters</div>
            </div>

            <form className="details-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Patient name
                  <input
                    type="text"
                    name="patientName"
                    value={form.patientName}
                    onChange={handleChange}
                    placeholder="Enter patient name"
                  />
                  {errors.patientName && (
                    <small className="field-error">{errors.patientName}</small>
                  )}
                </label>

                <label>
                  Age
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                  />
                  {errors.age && <small className="field-error">{errors.age}</small>}
                </label>

                <label>
                  Gender
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="dark-select"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <small className="field-error">{errors.gender}</small>}
                </label>

                <label className="full-span">
                  Search medical parameter
                  <input
                    type="text"
                    value={parameterSearch}
                    onChange={(e) => setParameterSearch(e.target.value)}
                    placeholder="Search glucose, BMI, creatinine, TSH..."
                  />
                </label>

                <label>
                  Select Medical Parameter
                  <select
                    name="selectedParameter"
                    value={form.selectedParameter}
                    onChange={handleChange}
                    className="dark-select"
                  >
                    <option value="">Select Medical Parameter</option>
                    {filteredParameters.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Parameter Value
                  <input
                    type="number"
                    step="any"
                    name="parameterValue"
                    value={form.parameterValue}
                    onChange={handleChange}
                    placeholder="Enter value"
                  />
                </label>
              </div>

              <div className="parameter-toolbar">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleAddParameter}
                >
                  Add Parameter
                </button>
              </div>

              <div className="parameter-list">
                {addedParameters.length === 0 ? (
                  <div className="empty-state parameter-empty-state">
                    <p>No parameters added yet.</p>
                  </div>
                ) : (
                  addedParameters.map((item) => (
                    <div className="parameter-card" key={item.key}>
                      <div className="parameter-card-head">
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.key}</span>
                        </div>

                        <div className="parameter-card-actions">
                          <button
                            type="button"
                            className="parameter-action-btn"
                            onClick={() => handleEditParameter(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="parameter-action-btn delete"
                            onClick={() => handleDeleteParameter(item.key)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {editingParameterKey === item.key ? (
                        <div className="parameter-edit-row">
                          <input
                            type="number"
                            step="any"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            placeholder="Update value"
                          />
                          <button
                            type="button"
                            className="primary-btn compact-btn"
                            onClick={() => handleSaveParameter(item.key)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="secondary-btn compact-btn"
                            onClick={() => {
                              setEditingParameterKey("");
                              setEditingValue("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="parameter-value-row">
                          <p>
                            {item.label.split(" (")[0]} = <strong>{item.value}</strong>{" "}
                            {item.unit}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="submit-row">
                <button type="submit" className="primary-btn" disabled={analyzing}>
                  {analyzing ? "Analyzing Health Risk..." : "Analyze Health Risk"}
                </button>
              </div>
            </form>

            {submittedData && (
              <div className="result-card">
                <p className="eyebrow">Entered details</p>
                <h2>Patient report summary</h2>

                <div className="result-grid">
                  <div className="result-box">
                    <span>Patient name</span>
                    <strong>{submittedData.patientName}</strong>
                  </div>
                  <div className="result-box">
                    <span>Age</span>
                    <strong>{submittedData.age}</strong>
                  </div>
                  <div className="result-box">
                    <span>Gender</span>
                    <strong>{submittedData.gender}</strong>
                  </div>
                  <div className="result-box full-span">
                    <span>Added medical parameters</span>
                    <strong>
                      {submittedData.parameters.map((item) => (
                        <div key={item.key} className="summary-parameter-row">
                          ✓ {item.label.split(" (")[0]} = {item.value} {item.unit}
                        </div>
                      ))}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
