"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import ClinicalSummaryCard from "../components/ClinicalSummaryCard";
import {
  Activity,
  ArrowLeft,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
const loadingMessages = [
  "Analyzing patient health parameters...",
  "Running disease prediction models...",
  "Evaluating diabetes risk...",
  "Evaluating cardiovascular risk...",
  "Evaluating liver health...",
  "Evaluating kidney function...",
  "Evaluating thyroid indicators...",
  "Generating AI health insights...",
  "Preparing medical report...",
];


const diseaseMeta = {
  diabetes: { title: "Diabetes", icon: "🩸" },
  heartDisease: { title: "Heart Disease", icon: "❤" },
  liverDisease: { title: "Liver Disease", icon: "🫀" },
  kidneyDisease: { title: "Kidney Disease", icon: "🧪" },
  thyroidDisease: { title: "Thyroid Disease", icon: "🧬" },
};
const recommendationMap = {
  Diabetes: [
    { title: "HbA1c Test", icon: FlaskConical, text: "Assess average blood glucose control over the last 2–3 months." },
    { title: "Fasting Blood Sugar", icon: Activity, text: "Validate fasting glucose status with a confirmatory lab test." },
    { title: "Consult Endocrinologist", icon: Stethoscope, text: "Review metabolic risk factors with a diabetes specialist." },
    { title: "Lifestyle Modification", icon: HeartPulse, text: "Focus on nutrition, activity, weight management, and sleep." },
  ],
  "Heart Disease": [
    { title: "ECG", icon: Activity, text: "Screen cardiac rhythm and electrical activity for further evaluation." },
    { title: "Lipid Profile", icon: FlaskConical, text: "Review cholesterol and related cardiovascular risk markers." },
    { title: "Cardiologist Consultation", icon: Stethoscope, text: "Discuss symptoms, biomarkers, and cardiovascular risk." },
  ],
  "Kidney Disease": [
    { title: "Serum Creatinine", icon: FlaskConical, text: "Reassess kidney filtration markers through lab testing." },
    { title: "eGFR", icon: Activity, text: "Estimate kidney function to support nephrology review." },
    { title: "Nephrologist Consultation", icon: Stethoscope, text: "Review renal indicators and appropriate follow-up." },
  ],
  "Liver Disease": [
    { title: "Liver Function Test", icon: FlaskConical, text: "Confirm hepatic markers and enzyme abnormalities." },
    { title: "Hepatologist Consultation", icon: Stethoscope, text: "Evaluate liver-related findings with a specialist." },
  ],
  "Thyroid Disease": [
    { title: "TSH", icon: FlaskConical, text: "Confirm thyroid stimulating hormone abnormality." },
    { title: "T3 / T4", icon: Activity, text: "Review thyroid hormone balance with confirmatory testing." },
    { title: "Endocrinologist Consultation", icon: Stethoscope, text: "Interpret thyroid risk pattern with a specialist." },
  ],
};

const getPriorityLevel = (probability) => {
  if (probability >= 70) return "High";
  if (probability >= 40) return "Moderate";
  return "Low";
};

const getConfidenceLabel = (probability) => {
  if (probability >= 70) return "Strong model confidence";
  if (probability >= 40) return "Moderate model confidence";
  return "Lower model confidence";
};

const getContributionLevel = (impact, index) => {
  const absImpact = Math.abs(Number(impact || 0));
  if (absImpact >= 0.2 || index === 0) return "High contribution";
  if (absImpact >= 0.08 || index === 1) return "Moderate contribution";
  return "Supportive contribution";
};

const getFactorNarrative = (feature, disease, index) => {
  const label = getFeatureLabel(feature);

  const diseasePhrases = {
    Diabetes: {
      Glucose: "glycemic variation",
      BMI: "metabolic load",
      Age: "age-related metabolic risk",
    },
    "Heart Disease": {
      Cholesterol: "lipid-related cardiovascular strain",
      Age: "age-associated cardiac risk",
    },
    "Kidney Disease": {
      Creatinine: "renal filtration stress",
      Albumin: "kidney function imbalance",
      "Blood urea": "waste-clearance burden",
    },
    "Liver Disease": {
      Bilirubin: "hepatic processing stress",
      Albumin: "synthetic liver function variation",
      "Total protein levels": "liver protein balance",
    },
    "Thyroid Disease": {
      TSH: "thyroid regulation shift",
      T3: "thyroid hormone variation",
      FTI: "thyroid activity imbalance",
    },
  };

  const mapped = diseasePhrases[disease]?.[label];
  if (mapped) return `${label} reflects ${mapped}.`;
  if (index === 0) return `${label} appears to be a leading contributor in this prediction.`;
  return `${label} adds supportive signal to the model assessment.`;
};
const riskFromProbability = (value) => {
  if (value >= 70) return "High";
  if (value >= 40) return "Moderate";
  return "Low";
};

const riskClass = (risk) => {
  if (risk === "High") return "high";
  if (risk === "Moderate") return "moderate";
  return "low";
};

const formatKeyLabel = (key = "") =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()).trim();

const normalizeFeatureKey = (feature = "") => feature.trim().toLowerCase();

const getParameterValue = (paramsMap, feature) => {
  const key = normalizeFeatureKey(feature);

  const mapping = {
    glucose: paramsMap.glucose,
    bmi: paramsMap.bmi,
    age: paramsMap.age,
    cholesterol: paramsMap.cholesterol,
    creatinine: paramsMap.creatinine,
    "serum creatinine": paramsMap.creatinine,
    "blood urea": paramsMap.bloodUrea,
    albumin: paramsMap.albumin,
    tsh: paramsMap.tsh,
    t3: paramsMap.t3,
    fti: paramsMap.fti,
    "total bilirubin": paramsMap.totalBilirubin,
    "total proteins": paramsMap.totalProteins,
  };

  return mapping[key];
};

const getFeatureLabel = (feature = "") => {
  const key = normalizeFeatureKey(feature);

  const labels = {
    glucose: "Glucose",
    bmi: "BMI",
    age: "Age",
    cholesterol: "Cholesterol",
    creatinine: "Creatinine",
    "serum creatinine": "Creatinine",
    "blood urea": "Blood urea",
    albumin: "Albumin",
    tsh: "TSH",
    t3: "T3",
    fti: "FTI",
    "total bilirubin": "Bilirubin",
    "total proteins": "Total protein levels",
    "chest pain type": "Chest pain pattern",
    slope: "ST-segment slope",
    "diabetes pedigree function": "Family diabetes tendency",
    hemoglobin: "Hemoglobin",
  };

  return labels[key] || feature;
};

const buildImpactTag = (impact) => (Number(impact) > 0 ? "HIGH" : "LOW");

const buildFactorPoint = (feature, impact, disease) => {
  const key = normalizeFeatureKey(feature);
  if (key === "dummy") return null;

  const tag = buildImpactTag(impact);
  const label = getFeatureLabel(feature);
  const positive = Number(impact) > 0;

  if (disease === "Diabetes") {
    if (key === "glucose") {
      return `${label} — ${tag} contribution to the diabetes risk assessment.`;
    }
    if (key === "bmi") {
      return `${label} — ${tag} contribution to the diabetes risk assessment.`;
    }
    if (key === "age") {
      return `${label} — ${tag} age-associated contribution to the diabetes assessment.`;
    }
    if (key === "diabetes pedigree function") {
      return `${label} — ${tag} contribution to the diabetes assessment.`;
    }
  }

  if (disease === "Liver Disease") {
    if (key === "total bilirubin") {
      return `${label} — ${tag} contribution to the liver disease assessment.`;
    }
    if (key === "albumin") {
      return `${label} — ${tag} contribution to the liver risk evaluation.`;
    }
    if (key === "total proteins") {
      return `${label} — ${tag} contribution to the liver disease assessment.`;
    }
    if (key === "age") {
      return `${label} — ${tag} age-associated contribution to the liver assessment.`;
    }
  }

  if (disease === "Heart Disease") {
    if (key === "cholesterol") {
      return `${label} — ${tag} contribution to the cardiovascular risk assessment.`;
    }
    if (key === "chest pain type") {
      return `${label} — ${tag} contribution to the cardiovascular assessment.`;
    }
    if (key === "slope") {
      return `${label} — ${tag} contribution to the heart disease assessment.`;
    }
    if (key === "age") {
      return `${label} — ${tag} age-associated contribution to the cardiovascular assessment.`;
    }
  }

  if (disease === "Kidney Disease") {
    if (key === "creatinine" || key === "serum creatinine") {
      return `${label} — ${tag} contribution to the kidney disease assessment.`;
    }
    if (key === "blood urea") {
      return `${label} — ${tag} contribution to the kidney assessment.`;
    }
    if (key === "albumin") {
      return `${label} — ${tag} contribution to the kidney assessment.`;
    }
    if (key === "hemoglobin") {
      return `${label} — ${tag} contribution to the kidney assessment.`;
    }
  }

  if (disease === "Thyroid Disease") {
    if (key === "tsh") {
      return `${label} — ${tag} contribution to the thyroid assessment.`;
    }
    if (key === "t3") {
      return `${label} — ${tag} contribution to the thyroid assessment.`;
    }
    if (key === "fti") {
      return `${label} — ${tag} contribution to the thyroid assessment.`;
    }
  }

  return positive
    ? `${label} — HIGH contribution to the ${disease.toLowerCase()} assessment.`
    : `${label} — LOW contribution to the ${disease.toLowerCase()} assessment.`;
};

const buildInsightIntro = (disease, paramsMap) => {
  if (disease === "Diabetes") {
    const glucose = getParameterValue(paramsMap, "glucose");
    const bmi = getParameterValue(paramsMap, "bmi");

    if (glucose && bmi) {
      return "High glucose levels and elevated BMI suggest a strong diabetic risk profile.";
    }
    if (glucose) {
      return "Glucose-related abnormalities suggest a diabetic risk pattern requiring attention.";
    }
    return "The uploaded medical report indicates metabolic abnormalities requiring attention.";
  }

  if (disease === "Liver Disease") {
    const bilirubin = getParameterValue(paramsMap, "total bilirubin");

    if (bilirubin) {
      return "Liver-related indicators, particularly elevated bilirubin levels, showed patterns associated with hepatic stress.";
    }
    return "Liver-related indicators showed abnormalities associated with increased clinical concern.";
  }

  if (disease === "Heart Disease") {
    return "Cardiovascular risk appears influenced by biomarker patterns that should be clinically reviewed.";
  }

  if (disease === "Kidney Disease") {
    return "Kidney-related findings showed lower predicted risk overall, although selected markers may require follow-up review.";
  }

  if (disease === "Thyroid Disease") {
    return "Thyroid-related findings showed lower predicted risk overall, although selected markers may require periodic monitoring.";
  }

  return "The uploaded medical report showed abnormal biomarkers requiring clinical attention.";
};

export default function Result() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultData, setResultData] = useState(null);
  const [locality, setLocality] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [analysisHospital, setAnalysisHospital] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [loadingHospitals,
    setLoadingHospitals]
    = useState(false);
  const [username, setUsername] =
    useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    const username =
      localStorage.getItem("username");

    if (username) {
      setUsername(username);
      setAuthenticated(true);
    }
  }, [router]);
  const sortedHospitals = useMemo(() => {
    return [...hospitals].sort((a, b) => {
      if ((b.hss || 0) !== (a.hss || 0)) return (b.hss || 0) - (a.hss || 0);
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      return (b.userRatingCount || 0) - (a.userRatingCount || 0);
    });
  }, [hospitals]);
  const [userCoords, setUserCoords] = useState({
    latitude: null,
    longitude: null,
  });
  const featuredHospital = sortedHospitals[0] || null;
  const otherHospitals = sortedHospitals.slice(1);

  const formatScore = (value) =>
    value == null ? "-" : Number(value).toFixed(1);

  const formatCount = (value) =>
    value?.toLocaleString?.() || "0";
  const handleUseMyLocation = () => {
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      setShowManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserCoords(coords);

        setGeoError("");

        setLocality("Current Location");
        setUseCurrentLocation(true);

        handleRecommend(coords, true);
      },
      (error) => {
        if (error?.code === 1) {
          setGeoError(
            "Location permission is blocked. Allow location for localhost in your browser settings, then click Use My Location again — or enter your area manually."
          );
        } else if (error?.code === 2) {
          setGeoError("Your device could not determine its location. Check Location Services or enter your area manually.");
        } else if (error?.code === 3) {
          setGeoError("Location detection timed out. Please try again or enter your area manually.");
        } else {
          setGeoError("Unable to fetch your current location.");
        }
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };
  const geocodeLocality = async (place) => {
    const query = encodeURIComponent(`${place}, Hyderabad, Telangana, India`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch coordinates.");
    }

    const data = await response.json();

    if (!data.length) {
      throw new Error("Location not found.");
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  };
  const [useCurrentLocation, setUseCurrentLocation] =
    useState(false);
  const handleRecommend = async (coordinateOverride = null, useCoordinateOverride = false) => {
    const activeCoords = coordinateOverride || userCoords;
    if (
      !locality.trim() &&
      (
        activeCoords.latitude == null ||
        activeCoords.longitude == null
      )
    ) {
      setGeoError(
        "Please enter your area or use current location."
      );
      return;
    }

    if (!resultData?.predictions?.length) {
      setGeoError("Prediction data not found.");
      return;
    }

    setLoadingHospitals(true);
    setGeoError("");

    try {
      const diseases = resultData.predictions.map((p) => p.disease);

      let latitude = activeCoords.latitude;
      let longitude = activeCoords.longitude;

      if (latitude == null || longitude == null) {
        const coords = await geocodeLocality(locality.trim());
        latitude = coords.latitude;
        longitude = coords.longitude;

        setUserCoords({
          latitude,
          longitude,
        });
      }

      const payload = {
        locality,
        diseases,
      };

      if ((useCoordinateOverride || useCurrentLocation) && latitude != null && longitude != null) {
        payload.latitude = latitude;
        payload.longitude = longitude;
      }
      console.log(
        "Payload:",
        payload
      );
      const token = localStorage.getItem("token");

      console.log("TOKEN =", token);
      const response = await fetch(`${API_URL}/recommend-hospitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setHospitals(data.hospitals || []);
      try {

        const token = localStorage.getItem("token");
        console.log(resultData);
        console.log(resultData.predictionId);
        const saveResponse = await fetch(
          `${API_URL}/save-hospitals`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              predictionId: resultData.predictionId,
              hospitalRecommendations: JSON.stringify(data.hospitals),
            }),
          }
        );

        if (!saveResponse.ok) {
          throw new Error(await saveResponse.text());
        }

        console.log("✅ Hospital recommendations saved successfully.");

      } catch (err) {

        console.error("Failed to save hospital recommendations", err);

      }

      if (!data.hospitals?.length) {
        setGeoError("No hospitals found for this area.");
      }
    } catch (error) {
      setGeoError(error.message || "Failed to fetch hospitals.");
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("trustmedai_result");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        console.log("FULL RESULT =", parsed);
        console.log("FOLLOW UP =", parsed.followUpPlans);

        setResultData(parsed);
      } catch (error) {
        console.error("Invalid stored result data", error);
      }
    }
  }, []);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 96 ? 96 : prev + Math.floor(Math.random() * 12) + 4));
    }, 350);

    const doneTimer = setTimeout(() => {
      setProgress(100);
      setIsLoading(false);
    }, 4200);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const parameters = useMemo(() => {
    if (Array.isArray(resultData?.parameters)) return resultData.parameters;

    if (resultData?.parameters && typeof resultData.parameters === "object") {
      return Object.entries(resultData.parameters).map(([key, value]) => ({
        key,
        label: formatKeyLabel(key),
        value,
        unit: "",
      }));
    }

    return [];
  }, [resultData]);

  const patient = useMemo(() => {
    const ageFromParams = parameters.find((item) => item.key === "age")?.value;
    const genderFromParams = parameters.find((item) => item.key === "gender")?.value;

    // Improved name extraction
    const patientName =
      parameters.find((item) => item.key === "patientName" || item.key === "name")?.value ||
      resultData?.patient?.patientName ||
      resultData?.patient?.name ||
      resultData?.name ||                    // ← Add this
      resultData?.patientName ||
      "Unknown Patient";

    return {
      patientName,
      age: ageFromParams ?? resultData?.patient?.age ?? resultData?.age ?? "-",
      gender: genderFromParams ?? resultData?.patient?.gender ?? resultData?.gender ?? "-",
    };
  }, [resultData, parameters]);

  const predictionMap = useMemo(() => {
    const map = {};
    resultData?.predictions?.forEach((item) => {
      if (item.disease === "Diabetes") map.diabetes = item.probability;
      if (item.disease === "Heart Disease") map.heartDisease = item.probability;
      if (item.disease === "Liver Disease") map.liverDisease = item.probability;
      if (item.disease === "Kidney Disease") map.kidneyDisease = item.probability;
      if (item.disease === "Thyroid Disease") map.thyroidDisease = item.probability;
    });
    return map;
  }, [resultData]);

  const predictions = useMemo(() => predictionMap, [predictionMap]);
  const normalizeRisk = (risk) => {
    const value = String(risk || "").trim().toLowerCase();
    if (value === "high") return "High";
    if (value === "moderate") return "Moderate";
    if (value === "low") return "Low";
    return null;
  };

  const resolveRisk = (risk, probability) => {
    return normalizeRisk(risk) ?? riskFromProbability(Number(probability || 0));
  };
  const diseaseCards = useMemo(() => {
    return (resultData?.predictions || []).map((item) => {
      const probability = Number(item.probability || 0);
      const risk = resolveRisk(item.risk, probability);

      const key =
        item.disease === "Diabetes"
          ? "diabetes"
          : item.disease === "Heart Disease"
            ? "heartDisease"
            : item.disease === "Liver Disease"
              ? "liverDisease"
              : item.disease === "Kidney Disease"
                ? "kidneyDisease"
                : "thyroidDisease";

      return {
        key,
        title: item.disease,
        icon: diseaseMeta[key]?.icon || "🩺",
        probability,
        risk,
        tone: riskClass(risk),
      };
    });
  }, [resultData]);
  const timestamp = useMemo(() => {
    return resultData?.timestamp || new Date().toLocaleString();
  }, [resultData]);
  const highestRiskPrediction = useMemo(() => {
    if (!resultData?.predictions?.length) return null;

    return [...resultData.predictions].sort(
      (a, b) => Number(b.probability || 0) - Number(a.probability || 0)
    )[0];
  }, [resultData]);

  const actionPlans = useMemo(() => {
    return (resultData?.followUpPlans || []).map((plan, index) => ({
      id: `${plan.disease || "condition"}-${index}`,
      disease: plan.disease || "General health",
      specialist: plan.specialist || "General Physician",
      tests: plan.tests || [],
      lifestyle: plan.lifestyle || [],
      warning: plan.warning,
    }));
  }, [resultData]);

  useEffect(() => {
    if (!actionModal) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActionModal(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [actionModal]);

  const handleConsultation = async () => {
    if (!hospitals.length) {
      setShowManualInput(true);
      document.querySelector(".hospital-recommend-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        document.querySelector(".hospital-recommend-input")?.focus();
      }, 650);
      return;
    }

    setActionModal("consultation");
  };

  const clinicalSummary = useMemo(() => {
    if (!highestRiskPrediction) return null;

    const disease = highestRiskPrediction.disease;
    const probability = Number(highestRiskPrediction.probability || 0);
    const risk = resolveRisk(highestRiskPrediction.risk, probability);
    const priority = getPriorityLevel(probability);

    const topFactors = (highestRiskPrediction.topFactors || [])
      .filter((factor) => factor?.feature && normalizeFeatureKey(factor.feature) !== "dummy")
      .slice(0, 3)
      .map((factor, index) => ({
        feature: getFeatureLabel(factor.feature),
        contribution: getContributionLevel(factor.impact, index),
        narrative: getFactorNarrative(factor.feature, disease, index),
      }));

    const leadText = topFactors[0]?.feature
      ? `The prediction is primarily influenced by ${topFactors[0].feature.toLowerCase()}${topFactors[1]?.feature ? ` together with ${topFactors[1].feature.toLowerCase()}` : ""
      }.`
      : "The prediction is influenced by the available clinical parameters in the uploaded assessment.";

    return {
      patientName: patient.patientName,
      disease,
      probability,
      risk,
      priority,
      confidenceLabel: getConfidenceLabel(probability),
      timestamp,
      summaryText: `The AI analysis indicates that the patient has a ${risk.toUpperCase()} RISK of ${disease} with a confidence score of ${probability.toFixed(
        2
      )}%. ${leadText} The remaining disease models indicate comparatively lower risk. This assessment is generated using explainable AI and should be interpreted by a qualified healthcare professional.`,
      topFactors,
      recommendations: recommendationMap[disease] || [],
      status: probability >= 50 ? "Positive" : "Needs review",
    };
  }, [highestRiskPrediction, patient.patientName, timestamp]);
  const xaiInsights = useMemo(() => {
    if (!resultData?.predictions?.length) return [];

    const paramsMap = parameters.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const riskOrder = { High: 0, Moderate: 1, Low: 2 };

    const sortedPredictions = [...resultData.predictions].sort((a, b) => {
      const aRisk = resolveRisk(a.risk, a.probability);
      const bRisk = resolveRisk(b.risk, b.probability);

      const riskDiff = (riskOrder[aRisk] ?? 3) - (riskOrder[bRisk] ?? 3);
      if (riskDiff !== 0) return riskDiff;

      return Number(b.probability || 0) - Number(a.probability || 0);
    });

    return sortedPredictions.map((item, index) => {
      const disease = item.disease || `Disease ${index + 1}`;
      const risk = resolveRisk(item.risk, item.probability);

      const validTopFactors = (item.topFactors || []).filter(
        (factor) => factor?.feature && normalizeFeatureKey(factor.feature) !== "dummy"
      );

      const points = validTopFactors
        .slice(0, 3)
        .map((factor) => buildFactorPoint(factor.feature, factor.impact, disease))
        .filter(Boolean);

      return {
        id: `${disease}-${index}`,
        disease,
        risk,
        tone: riskClass(risk),
        intro: buildInsightIntro(disease, paramsMap),
        points,
      };
    });
  }, [resultData, parameters]);

  const filteredParameters = useMemo(() => {
    if (!searchTerm.trim()) return parameters;
    return parameters.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, parameters]);


  if (!authenticated) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <h2>Access Restricted</h2>

          <p>Please login to view the result.</p>

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
  if (isLoading) {
    return (
      <main className="result-shell loading-shell">
        <section className="loading-screen">
          <div className="loading-brand">
            <div className="brand-mark">
              <span />
              <span />
            </div>
            <div>
              <p className="eyebrow">TrustMedAI</p>
              <h1>AI Health Analysis</h1>
            </div>
          </div>

          <div className="loading-visuals">
            <div className="brain-orb">
              <div className="brain-core">🧠</div>
              <div className="brain-ring ring-one" />
              <div className="brain-ring ring-two" />
            </div>

            <div className="heartbeat-wrap" aria-hidden="true">
              <svg viewBox="0 0 600 120" className="heartbeat-svg">
                <path
                  d="M0 60 H90 L120 60 L145 25 L175 95 L210 45 L245 60 H320 L350 60 L380 20 L410 100 L445 50 L485 60 H600"
                  className="heartbeat-line"
                />
              </svg>
            </div>
          </div>

          <div className="loading-copy glass-card">
            <p className="loading-label">Estimated time: 3–5 seconds</p>
            <h2>{loadingMessages[messageIndex]}</h2>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-meta">
              <span>AI pipeline active</span>
              <strong>{progress}%</strong>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="result-shell">
      <section className="result-page">
        <header className="result-topbar glass-card">
          <div>
            <p className="eyebrow">TrustMedAI results</p>
            <h1>Healthcare AI Assessment</h1>
            <span className="topbar-subtitle">
              Premium clinical-style prediction dashboard
            </span>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="dashboard-back-btn"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <div className="assessment-badge">
              <span className="badge-dot" />
              AI Assessment Ready
            </div>
          </div>
        </header>

        <section className="patient-grid">
          <div className="glass-card info-card">
            <span>Patient Name</span>
            <strong>{patient.patientName}</strong>
          </div>
          <div className="glass-card info-card">
            <span>Age</span>
            <strong>{patient.age}</strong>
          </div>
          <div className="glass-card info-card">
            <span>Gender</span>
            <strong>{patient.gender}</strong>
          </div>
          <div className="glass-card info-card">
            <span>Analysis Timestamp</span>
            <strong>{timestamp}</strong>
          </div>
        </section>

        <section className="top-results-layout">
          <div className="top-results-right">
            <section className="section-block disease-block">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Disease models</p>
                  <h2>Disease Risk Cards</h2>
                </div>
              </div>

              <div className="disease-grid top-disease-grid">
                {diseaseCards.map((item) => (
                  <article className="glass-card disease-card" key={item.key}>
                    <div className="disease-card-top">
                      <div className="disease-title-wrap">
                        <div className="disease-icon">{item.icon}</div>
                        <div>
                          <h3>{item.title}</h3>
                          <span className={`risk-pill ${item.tone}`}>
                            {item.risk} Risk
                          </span>
                        </div>
                      </div>
                      <div className="disease-message">
                        {item.risk === "High" && (
                          <p className="high-message">
                            ⚠ Clinical evaluation is recommended.
                          </p>
                        )}

                        {item.risk === "Moderate" && (
                          <p className="moderate-message">
                            ⚠ Follow-up testing is advised.
                          </p>
                        )}

                        {item.risk === "Low" && (
                          <p className="low-message">
                            ✓ No immediate indication of {item.title.toLowerCase()} detected.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
        <ClinicalSummaryCard data={clinicalSummary} />
        <section className="section-block clinical-followup-section">
          <div className="glass-card clinical-followup-card">
            <div className="clinical-followup-head">
              <div>
                <p className="eyebrow">AI Clinical Follow-up</p>
                <h2>AI Follow-up Plan</h2>
                <span className="clinical-followup-subtitle">
                  Structured next steps generated from the prediction results
                </span>
              </div>
              <div className="followup-head-icon">
                <ClipboardList size={22} />
              </div>
            </div>

            {resultData?.followUpPlans?.length ? (
              resultData.followUpPlans.map((plan, index) => (
                <div
                  key={index}
                  className="followup-card"
                >
                  <div className="followup-card-head">
                    <span className="followup-step-badge">Plan {index + 1}</span>
                    <div className="followup-specialist">
                      <div className="followup-icon">
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <span>Specialist</span>
                        <strong>{plan.specialist}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="followup-grid">
                    <article className="followup-panel">
                      <div className="followup-panel-head">
                        <FlaskConical size={18} />
                        <h3>Recommended Tests</h3>
                      </div>

                      <ul className="followup-list">
                        {plan.tests.map((test, i) => (
                          <li key={i}>{test}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="followup-panel">
                      <div className="followup-panel-head">
                        <HeartPulse size={18} />
                        <h3>Lifestyle Guidance</h3>
                      </div>

                      <ul className="followup-list">
                        {plan.lifestyle.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </article>

                    <article className="followup-panel followup-panel-wide">
                      <div className="followup-panel-head">
                        <CalendarClock size={18} />
                        <h3>Follow-up</h3>
                      </div>

                      <p>{plan.followUp}</p>
                    </article>
                  </div>

                  {plan.warning ? (
                    <div className="followup-warning">
                      <AlertTriangle size={18} />
                      <p>{plan.warning}</p>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="followup-empty">
                No follow-up recommendations available.
              </div>
            )}
          </div>
        </section>
        <section className="section-block">
          <div className="glass-card insights-panel">
            <p className="eyebrow">XAI Insights</p>
            <h2>XAI Insights</h2>

            <div className="insight-list">
              {xaiInsights.length === 0 ? (
                <article className="insight-card">
                  <div className="insight-icon">✦</div>
                  <div className="insight-content">
                    <p>No explainable insights are available for this assessment.</p>
                  </div>
                </article>
              ) : (
                xaiInsights.map((item) => (
                  <article className="insight-card" key={item.id}>
                    <div className="insight-icon">✦</div>

                    <div className="insight-content">
                      <h3>{item.disease}</h3>
                      <p>{item.intro}</p>

                      {item.points?.length > 0 && (
                        <ol className="reason-list">
                          {item.points.map((point, index) => (
                            <li key={`${item.id}-point-${index}`}>{point}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
        <section className="section-block">
          <div className="glass-card hospital-recommend-card">
            <div className="hospital-recommend-head">
              <div className="hosp-head-icon">🏥</div>
              <div>
                <p className="eyebrow">AI-Powered Hospital Recommendation</p>
                <h2>Find the Right Hospital for You</h2>
                <span className="hospital-recommend-subtext">
                  Based on your predicted conditions, we&apos;ll match you with hospitals that have the right specialists, facilities, and proximity.
                </span>
              </div>
            </div>

            <div className="location-choice-box">
              <div className="location-choice-grid">
                <button type="button" className="location-card" onClick={handleUseMyLocation}>
                  <div className="location-card-icon">📍</div>
                  <div>
                    <strong>Use My Location</strong>
                    <span>Auto-detect your current position</span>
                  </div>
                </button>

                <button type="button" className="location-card" onClick={() => setShowManualInput(true)}>
                  <div className="location-card-icon">✏️</div>
                  <div>
                    <strong>Enter Area Manually</strong>
                    <span>Type your locality or neighborhood</span>
                  </div>
                </button>
              </div>
            </div>

            {geoError && (
              <div className="geo-alert">
                <span className="geo-alert-icon">⚠️</span>
                <p>{geoError}</p>
              </div>
            )}

            {showManualInput && (
              <div className="hospital-recommend-form">
                <div className="form-input-wrap">
                  <span className="input-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Enter your area, locality or city..."
                    value={locality}
                    onChange={(e) => {
                      setLocality(e.target.value);
                      setUseCurrentLocation(false);
                    }}
                    className="hospital-recommend-input"
                  />
                </div>
                <button type="button" onClick={() => handleRecommend()} className="hospital-recommend-btn" disabled={loadingHospitals}>
                  {loadingHospitals ? "Searching..." : "Find Hospitals"}
                </button>
              </div>
            )}

            {loadingHospitals && (
              <div className="hospital-loading-state">
                <div className="hospital-loading-head">
                  <div className="pulse-dot" />
                  <span>Matching your conditions with nearby hospitals...</span>
                </div>

                <div className="hospital-skeleton featured">
                  <div className="skeleton-line xl" />
                  <div className="skeleton-chip-row">
                    <span className="skeleton-chip" />
                    <span className="skeleton-chip" />
                    <span className="skeleton-chip" />
                  </div>
                  <div className="skeleton-line lg" />
                  <div className="skeleton-line md" />
                  <div className="skeleton-card-grid">
                    <div className="mini-skeleton-card" />
                    <div className="mini-skeleton-card" />
                    <div className="mini-skeleton-card" />
                  </div>
                </div>

                <div className="hospital-skeleton-grid">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="hospital-skeleton">
                      <div className="skeleton-line lg" />
                      <div className="skeleton-chip-row">
                        <span className="skeleton-chip" />
                        <span className="skeleton-chip" />
                      </div>
                      <div className="skeleton-line md" />
                      <div className="skeleton-line sm" />
                      <div className="skeleton-action-row">
                        <span className="skeleton-btn" />
                        <span className="skeleton-btn" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loadingHospitals && hospitals.length > 0 && (
              <div className="hospital-results-wrap premium-results">
                <div className="hospital-results-head premium-head">
                  <div>
                    <p className="eyebrow">AI-Matched Results</p>
                    <h3>Recommended Hospitals Near You</h3>
                  </div>
                  <div className="results-count-badge">
                    <span className="results-count-dot" />
                    {sortedHospitals.length} hospitals found
                  </div>
                </div>

                {/* ── FEATURED HOSPITAL (HERO) ── */}
                {featuredHospital && (
                  <article className="glass-card featured-hospital-hero">
                    <div className="featured-crown">
                      <span className="crown-badge">👑 #1 Best Match</span>
                    </div>

                    <div className="featured-hero-layout">
                      {/* Left: Hospital Info */}
                      <div className="featured-hero-info">
                        <h3 className="featured-hero-name">{featuredHospital.name}</h3>

                        <div className="hospital-meta-row featured-meta-row">
                          <span className="rating-chip glow">⭐ {formatScore(featuredHospital.rating)}</span>
                          <span className="review-chip">👥 {formatCount(featuredHospital.userRatingCount)} Reviews</span>
                          <span className={`status-chip ${featuredHospital.businessStatus === "OPERATIONAL" ? "open" : "closed"}`}>
                            <span className="status-dot-live" />
                            {featuredHospital.businessStatus === "OPERATIONAL" ? "Open Now" : "Unavailable"}
                          </span>
                        </div>

                        <p className="featured-address">📍 {featuredHospital.address}</p>

                        {/* Specialist & Facility Tags */}
                        {(featuredHospital.availableSpecialists?.length > 0 || featuredHospital.availableFacilities?.length > 0) && (
                          <div className="featured-tags-section">
                            {featuredHospital.availableSpecialists?.length > 0 && (
                              <div className="tag-group">
                                <span className="tag-group-label">🩺 Specialists</span>
                                <div className="tag-pills">
                                  {featuredHospital.availableSpecialists.slice(0, 5).map((s, i) => (
                                    <span key={i} className={`spec-pill ${featuredHospital.hssBreakdown?.requiredSpecialists?.includes(s) ? "matched" : ""}`}>
                                      {featuredHospital.hssBreakdown?.requiredSpecialists?.includes(s) ? "✓ " : ""}{s}
                                    </span>
                                  ))}
                                  {featuredHospital.availableSpecialists.length > 5 && (
                                    <span className="spec-pill more">+{featuredHospital.availableSpecialists.length - 5} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                            {featuredHospital.availableFacilities?.length > 0 && (
                              <div className="tag-group">
                                <span className="tag-group-label">🏥 Facilities</span>
                                <div className="tag-pills">
                                  {featuredHospital.availableFacilities.slice(0, 4).map((f, i) => (
                                    <span key={i} className={`spec-pill facility ${featuredHospital.hssBreakdown?.requiredFacilities?.includes(f) ? "matched" : ""}`}>
                                      {featuredHospital.hssBreakdown?.requiredFacilities?.includes(f) ? "✓ " : ""}{f}
                                    </span>
                                  ))}
                                  {featuredHospital.availableFacilities.length > 4 && (
                                    <span className="spec-pill more">+{featuredHospital.availableFacilities.length - 4} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recommendation Reasons */}
                        {featuredHospital.recommendationReasons?.length > 0 && (
                          <div className="featured-reasons">
                            {featuredHospital.recommendationReasons.slice(0, 4).map((reason, i) => (
                              <span key={i} className="reason-pill">✔ {reason}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: HSS Gauge */}
                      <div className="featured-gauge-panel">
                        <div className="hss-gauge-wrap">
                          <svg viewBox="0 0 160 160" className="hss-gauge-svg">
                            <circle cx="80" cy="80" r="68" className="gauge-track" />
                            <circle cx="80" cy="80" r="68"
                              className="gauge-fill"
                              style={{
                                strokeDasharray: `${(Number(featuredHospital.hss || 0) / 100) * 427} 427`
                              }}
                            />
                          </svg>
                          <div className="gauge-value">
                            <strong>{formatScore(featuredHospital.hss)}</strong>
                            <span>HSS</span>
                          </div>
                        </div>

                        <div className="gauge-metrics">
                          <div className="gauge-metric-row">
                            <span>Specialist</span>
                            <div className="metric-bar-track">
                              <div className="metric-bar-fill" style={{ width: `${featuredHospital.hssBreakdown?.specialistMatch || 0}%` }} />
                            </div>
                            <strong>{featuredHospital.hssBreakdown?.specialistMatch || 0}%</strong>
                          </div>
                          <div className="gauge-metric-row">
                            <span>Facility</span>
                            <div className="metric-bar-track">
                              <div className="metric-bar-fill facility-bar" style={{ width: `${featuredHospital.hssBreakdown?.facilityMatch || 0}%` }} />
                            </div>
                            <strong>{featuredHospital.hssBreakdown?.facilityMatch || 0}%</strong>
                          </div>
                          <div className="gauge-metric-row">
                            <span>Distance</span>
                            <div className="metric-bar-track">
                              <div className="metric-bar-fill distance-bar" style={{ width: `${featuredHospital.hssBreakdown?.distanceScore || 0}%` }} />
                            </div>
                            <strong>{featuredHospital.hssBreakdown?.distanceKm ?? "-"} km</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hero Actions */}
                    <div className="featured-hero-actions">
                      <button type="button" className="hero-action-btn primary-glow" onClick={() => setSelectedHospital(featuredHospital)}>
                        📊 HSS Breakdown
                      </button>
                      <button type="button" className="hero-action-btn" onClick={() => setAnalysisHospital(featuredHospital)}>
                        🔬 Match Analysis
                      </button>
                      <a href={featuredHospital.googleMapsUri} target="_blank" rel="noopener noreferrer" className="hero-action-btn maps-action">
                        🗺️ Open in Maps
                      </a>
                      {featuredHospital.websiteUri && (
                        <a href={featuredHospital.websiteUri} target="_blank" rel="noopener noreferrer" className="hero-action-btn website-action">
                          🌐 Visit Website
                        </a>
                      )}
                    </div>
                  </article>
                )}

                {/* ── OTHER HOSPITALS ── */}
                {otherHospitals.length > 0 && (
                  <div className="hospital-subgrid">
                    {otherHospitals.map((hospital, index) => (
                      <article key={index} className="glass-card hospital-card-v2">
                        <div className="card-v2-header">
                          <div className="card-v2-rank">#{index + 2}</div>
                          <div className="card-v2-title-wrap">
                            <h4 className="card-v2-name">{hospital.name}</h4>
                            <div className="hospital-meta-row">
                              <span className="rating-chip">⭐ {formatScore(hospital.rating)}</span>
                              <span className={`status-chip ${hospital.businessStatus === "OPERATIONAL" ? "open" : "closed"}`}>
                                <span className="status-dot-live" />
                                {hospital.businessStatus === "OPERATIONAL" ? "Open" : "Closed"}
                              </span>
                            </div>
                          </div>

                          {/* Mini HSS Gauge */}
                          <div className="mini-gauge-wrap">
                            <svg viewBox="0 0 80 80" className="mini-gauge-svg">
                              <circle cx="40" cy="40" r="32" className="gauge-track" />
                              <circle cx="40" cy="40" r="32" className="gauge-fill"
                                style={{ strokeDasharray: `${(Number(hospital.hss || 0) / 100) * 201} 201` }}
                              />
                            </svg>
                            <div className="mini-gauge-value">
                              <strong>{formatScore(hospital.hss)}</strong>
                            </div>
                          </div>
                        </div>

                        <p className="card-v2-address">📍 {hospital.address}</p>

                        {/* Inline Metric Bars */}
                        <div className="card-v2-metrics">
                          <div className="card-metric">
                            <span>Specialist {hospital.hssBreakdown?.specialistMatch || 0}%</span>
                            <div className="metric-bar-track small">
                              <div className="metric-bar-fill" style={{ width: `${hospital.hssBreakdown?.specialistMatch || 0}%` }} />
                            </div>
                          </div>
                          <div className="card-metric">
                            <span>Facility {hospital.hssBreakdown?.facilityMatch || 0}%</span>
                            <div className="metric-bar-track small">
                              <div className="metric-bar-fill facility-bar" style={{ width: `${hospital.hssBreakdown?.facilityMatch || 0}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="card-v2-quick-info">
                          <span>👨‍⚕️ {hospital.availableSpecialists?.length || 0}</span>
                          <span>🏥 {hospital.availableFacilities?.length || 0}</span>
                          <span>📍 {hospital.hssBreakdown?.distanceKm ?? "-"} km</span>
                          <span>👥 {formatCount(hospital.userRatingCount)}</span>
                        </div>

                        <div className="card-v2-actions">
                          <button type="button" className="card-action-btn" onClick={() => setSelectedHospital(hospital)}>
                            📊 HSS
                          </button>
                          <button type="button" className="card-action-btn" onClick={() => setAnalysisHospital(hospital)}>
                            🔬 Analysis
                          </button>
                          <a href={hospital.googleMapsUri} target="_blank" rel="noopener noreferrer" className="card-action-btn maps-action">
                            🗺️ Maps
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── HSS DETAIL MODAL ── */}
          {selectedHospital && (
            <div className="hss-modal-overlay" onClick={() => setSelectedHospital(null)}>
              <div className="hss-modal glass-card" onClick={(e) => e.stopPropagation()}>
                <div className="hss-modal-head">
                  <div>
                    <p className="eyebrow">Hospital Suitability Score</p>
                    <h3>{selectedHospital.name}</h3>
                  </div>
                  <button type="button" className="close-modal-btn" onClick={() => setSelectedHospital(null)}>✕</button>
                </div>

                {/* Big HSS Gauge in Modal */}
                <div className="modal-gauge-hero">
                  <div className="modal-gauge-wrap">
                    <svg viewBox="0 0 200 200" className="modal-gauge-svg">
                      <circle cx="100" cy="100" r="85" className="gauge-track" />
                      <circle cx="100" cy="100" r="85" className="gauge-fill big"
                        style={{ strokeDasharray: `${(Number(selectedHospital.hss || 0) / 100) * 534} 534` }}
                      />
                    </svg>
                    <div className="modal-gauge-value">
                      <strong>{selectedHospital.hss}</strong>
                      <span>/ 100</span>
                    </div>
                  </div>
                  <p className="modal-gauge-label">Hospital Suitability Score</p>
                </div>

                {/* Metric Cards with Progress Bars */}
                <div className="hss-breakdown-grid">
                  <div className="hss-metric-card-v2">
                    <div className="metric-card-head">
                      <span>🩺 Specialist Match</span>
                      <strong>{selectedHospital.hssBreakdown?.specialistMatch}%</strong>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill" style={{ width: `${selectedHospital.hssBreakdown?.specialistMatch || 0}%` }} />
                    </div>
                    <small>Weight: 40%</small>
                  </div>

                  <div className="hss-metric-card-v2">
                    <div className="metric-card-head">
                      <span>🏥 Facility Match</span>
                      <strong>{selectedHospital.hssBreakdown?.facilityMatch}%</strong>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill facility-bar" style={{ width: `${selectedHospital.hssBreakdown?.facilityMatch || 0}%` }} />
                    </div>
                    <small>Weight: 30%</small>
                  </div>

                  <div className="hss-metric-card-v2">
                    <div className="metric-card-head">
                      <span>📍 Distance Score</span>
                      <strong>{selectedHospital.hssBreakdown?.distanceScore}</strong>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill distance-bar" style={{ width: `${selectedHospital.hssBreakdown?.distanceScore || 0}%` }} />
                    </div>
                    <small>Weight: 20% · {selectedHospital.hssBreakdown?.distanceKm ?? "-"} km away</small>
                  </div>

                  <div className="hss-metric-card-v2">
                    <div className="metric-card-head">
                      <span>⭐ Rating Score</span>
                      <strong>{selectedHospital.hssBreakdown?.ratingScore}</strong>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill rating-bar" style={{ width: `${selectedHospital.hssBreakdown?.ratingScore || 0}%` }} />
                    </div>
                    <small>Weight: 10% · {selectedHospital.rating}/5 ({formatCount(selectedHospital.userRatingCount)} reviews)</small>
                  </div>
                </div>

                <div className="hss-formula-block">
                  <h4>📐 Score Calculation</h4>
                  <div className="formula-visual">
                    <div className="formula-term">
                      <span className="formula-weight">0.40</span>
                      <span>× {selectedHospital.hssBreakdown?.specialistMatch}</span>
                    </div>
                    <span className="formula-op">+</span>
                    <div className="formula-term">
                      <span className="formula-weight">0.30</span>
                      <span>× {selectedHospital.hssBreakdown?.facilityMatch}</span>
                    </div>
                    <span className="formula-op">+</span>
                    <div className="formula-term">
                      <span className="formula-weight">0.20</span>
                      <span>× {selectedHospital.hssBreakdown?.distanceScore}</span>
                    </div>
                    <span className="formula-op">+</span>
                    <div className="formula-term">
                      <span className="formula-weight">0.10</span>
                      <span>× {selectedHospital.hssBreakdown?.ratingScore}</span>
                    </div>
                    <span className="formula-op">=</span>
                    <div className="formula-result">{selectedHospital.hss}</div>
                  </div>
                </div>

                <div className="hospital-actions multi">
                  <a href={selectedHospital.googleMapsUri} target="_blank" rel="noopener noreferrer" className="map-btn">🗺️ Open in Maps</a>
                  {selectedHospital.websiteUri && (
                    <a href={selectedHospital.websiteUri} target="_blank" rel="noopener noreferrer" className="website-btn">🌐 Visit Website</a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYSIS MODAL ── */}
          {analysisHospital && (
            <div className="hss-modal-overlay" onClick={() => setAnalysisHospital(null)}>
              <div className="hss-modal glass-card analysis-modal" onClick={(e) => e.stopPropagation()}>
                <div className="hss-modal-head">
                  <div>
                    <p className="eyebrow">Hospital Match Analysis</p>
                    <h3>{analysisHospital.name}</h3>
                  </div>
                  <button type="button" className="close-modal-btn" onClick={() => setAnalysisHospital(null)}>✕</button>
                </div>

                <div className="match-analysis-grid">
                  <div className="analysis-card">
                    <div className="analysis-card-head">
                      <h4>🩺 Specialist Matching</h4>
                      <span className="match-score">{analysisHospital.hssBreakdown?.specialistMatch}%</span>
                    </div>
                    <div className="analysis-split">
                      <div>
                        <strong className="analysis-col-label">Required</strong>
                        <ul className="analysis-tag-list">
                          {analysisHospital.hssBreakdown?.requiredSpecialists?.map((item) => (
                            <li key={item} className={`analysis-tag ${analysisHospital.hssBreakdown?.availableSpecialists?.includes(item) ? "matched" : "missing"}`}>
                              {analysisHospital.hssBreakdown?.availableSpecialists?.includes(item) ? "✓" : "✗"} {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="analysis-col-label">Available at Hospital</strong>
                        <ul className="analysis-tag-list">
                          {analysisHospital.hssBreakdown?.availableSpecialists?.map((item) => (
                            <li key={item} className={`analysis-tag ${analysisHospital.hssBreakdown?.requiredSpecialists?.includes(item) ? "matched" : ""}`}>
                              {analysisHospital.hssBreakdown?.requiredSpecialists?.includes(item) ? "✓ " : ""}{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-card">
                    <div className="analysis-card-head">
                      <h4>🏥 Facility Matching</h4>
                      <span className="match-score">{analysisHospital.hssBreakdown?.facilityMatch}%</span>
                    </div>
                    <div className="analysis-split">
                      <div>
                        <strong className="analysis-col-label">Required</strong>
                        <ul className="analysis-tag-list">
                          {analysisHospital.hssBreakdown?.requiredFacilities?.map((item) => (
                            <li key={item} className={`analysis-tag ${analysisHospital.hssBreakdown?.availableFacilities?.includes(item) ? "matched" : "missing"}`}>
                              {analysisHospital.hssBreakdown?.availableFacilities?.includes(item) ? "✓" : "✗"} {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="analysis-col-label">Available at Hospital</strong>
                        <ul className="analysis-tag-list">
                          {analysisHospital.hssBreakdown?.availableFacilities?.map((item) => (
                            <li key={item} className={`analysis-tag ${analysisHospital.hssBreakdown?.requiredFacilities?.includes(item) ? "matched" : ""}`}>
                              {analysisHospital.hssBreakdown?.requiredFacilities?.includes(item) ? "✓ " : ""}{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-card">
                    <div className="analysis-card-head">
                      <h4>📍 Distance Analysis</h4>
                      <span className="match-score">{analysisHospital.hssBreakdown?.distanceScore ?? "-"}</span>
                    </div>
                    <div className="analysis-detail-grid">
                      <div className="analysis-detail-item">
                        <span>Distance</span>
                        <strong>{analysisHospital.hssBreakdown?.distanceKm ?? "-"} km</strong>
                      </div>
                      <div className="analysis-detail-item">
                        <span>Score</span>
                        <strong>{analysisHospital.hssBreakdown?.distanceScore ?? "-"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-card">
                    <div className="analysis-card-head">
                      <h4>⭐ Reputation Analysis</h4>
                      <span className="match-score">{analysisHospital.hssBreakdown?.ratingScore ?? "-"}</span>
                    </div>
                    <div className="analysis-detail-grid">
                      <div className="analysis-detail-item">
                        <span>Rating</span>
                        <strong>{analysisHospital.rating ?? "-"} / 5</strong>
                      </div>
                      <div className="analysis-detail-item">
                        <span>Reviews</span>
                        <strong>{formatCount(analysisHospital.userRatingCount)}</strong>
                      </div>
                      <div className="analysis-detail-item">
                        <span>Score</span>
                        <strong>{analysisHospital.hssBreakdown?.ratingScore ?? "-"}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        <section className="section-block">
          <div className="section-head table-head">
            <div>
              <p className="eyebrow">Submitted metrics</p>
              <h2>Health Parameters Used</h2>
            </div>

            <div className="search-wrap">
              <input
                type="text"
                placeholder="Search parameter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card table-card">
            <div className="table-scroll">
              <table className="parameter-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParameters.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-cell">
                        No matching parameter found.
                      </td>
                    </tr>
                  ) : (
                    filteredParameters.map((item) => (
                      <tr key={item.key}>
                        <td>{item.label}</td>
                        <td>{item.value}</td>
                        <td>{item.unit || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-head">
            <div>
              <p className="eyebrow">Recommended actions</p>
              <h2>Clinical next steps</h2>
            </div>
          </div>

          <div className="actions-grid">
            <article className="glass-card action-card">
              <div className="action-icon">👨‍⚕</div>
              <h3>Consult Specialist</h3>
              <p>Review high-risk findings with a relevant medical specialist.</p>
              <button type="button" className="action-btn primary" onClick={handleConsultation}>
                Book Consultation
              </button>
            </article>

            <article className="glass-card action-card">
              <div className="action-icon">🧪</div>
              <h3>Schedule Lab Tests</h3>
              <p>Confirm predictive findings with targeted laboratory investigations.</p>
              <button type="button" className="action-btn" onClick={() => setActionModal("tests")}>
                View Test Plan
              </button>
            </article>

            <article className="glass-card action-card">
              <div className="action-icon">🫀</div>
              <h3>Lifestyle Recommendations</h3>
              <p>Support long-term health with diet, exercise, and risk reduction habits.</p>
              <button type="button" className="action-btn" onClick={() => setActionModal("lifestyle")}>
                Open Guidance
              </button>
            </article>
          </div>
        </section>

        {actionModal && (
          <div className="action-modal-overlay" onClick={() => setActionModal(null)}>
            <section
              className="action-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="action-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="action-modal-header">
                <div>
                  <p className="eyebrow">Clinical next steps</p>
                  <h2 id="action-modal-title">
                    {actionModal === "consultation"
                      ? "Book a doctor consultation"
                      : actionModal === "tests"
                        ? "Recommended test plan"
                        : "Lifestyle guidance"}
                  </h2>
                </div>
                <button type="button" onClick={() => setActionModal(null)} aria-label="Close dialog">
                  ×
                </button>
              </header>

              {actionModal === "consultation" ? (
                <div className="consult-hospital-list">
                  <p className="consult-intro">
                    Choose one of your HSS-ranked hospitals and continue through its official
                    consultation channel. The matched specialists are shown below.
                  </p>
                  {sortedHospitals.map((hospital, index) => (
                    <article className="consult-hospital-card" key={`${hospital.name}-${index}`}>
                      <div className="consult-hospital-heading">
                        <span>#{index + 1}</span>
                        <div>
                          <h3>{hospital.name}</h3>
                          <p>⭐ {formatScore(hospital.rating)} · HSS {formatScore(hospital.hss)}</p>
                        </div>
                      </div>
                      <p className="consult-address">{hospital.address}</p>
                      <div className="consult-specialists">
                        {(hospital.hssBreakdown?.requiredSpecialists || hospital.availableSpecialists || []).map((specialist) => (
                          <span key={specialist}>{specialist}</span>
                        ))}
                      </div>
                      <div className="consult-actions">
                        {hospital.websiteUri && (
                          <a href={hospital.websiteUri} target="_blank" rel="noopener noreferrer" className="action-btn primary">
                            Find doctors / Book online
                          </a>
                        )}
                        <a href={hospital.googleMapsUri} target="_blank" rel="noopener noreferrer" className="action-btn">
                          Open in Maps
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
              <div className="action-plan-list">
                {actionPlans.length === 0 ? (
                  <p className="action-plan-empty">No recommendations are available for this assessment.</p>
                ) : (
                  actionPlans.map((plan) => {
                    const recommendations = actionModal === "tests" ? plan.tests : plan.lifestyle;
                    return (
                      <article className="action-plan-group" key={plan.id}>
                        <div className="action-plan-title">
                          <h3>{plan.disease}</h3>
                          <span>{plan.specialist}</span>
                        </div>
                        {recommendations.length ? (
                          <ul>
                            {recommendations.map((recommendation, index) => (
                              <li key={`${plan.id}-${index}`}>{recommendation}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No specific recommendations were generated.</p>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
              )}

              <p className="action-modal-disclaimer">
                These suggestions provide clinical decision support only and are not a medical
                prescription. Please consult a qualified healthcare professional.
              </p>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
