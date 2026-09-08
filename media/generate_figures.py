import warnings
from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap

from imblearn.over_sampling import SMOTE
from sklearn.metrics import auc, roc_curve
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent
FIG_DIR = BASE_DIR / "figures"
ROC_DIR = FIG_DIR / "roc"
SHAP_DIR = FIG_DIR / "shap"
ROC_DIR.mkdir(parents=True, exist_ok=True)
SHAP_DIR.mkdir(parents=True, exist_ok=True)


def fit_roc_shap(model_name, X_train, X_test, y_train, y_test, feature_names, model):
    model.fit(X_train, y_train)

    y_prob = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    test_frame = pd.DataFrame(X_test, columns=feature_names)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(test_frame)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    plt.figure(figsize=(10, 7))
    shap.summary_plot(shap_values, test_frame, show=False, max_display=15)
    plt.title(f"{model_name} SHAP Summary Plot")
    plt.tight_layout()
    shap_path = SHAP_DIR / f"{model_name.lower()}_shap_summary.png"
    plt.savefig(shap_path, dpi=300, bbox_inches="tight")
    plt.close()

    return {
        "name": model_name,
        "fpr": fpr,
        "tpr": tpr,
        "auc": roc_auc,
        "shap_path": shap_path,
    }


def train_diabetes():
    df = pd.read_csv(BASE_DIR / "diabete.csv")
    X = df.drop("Outcome", axis=1)
    y = df["Outcome"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    smote = SMOTE(random_state=42)
    X_train, y_train = smote.fit_resample(X_train, y_train)

    model = XGBClassifier(
        n_estimators=500,
        max_depth=8,
        learning_rate=0.03,
        subsample=0.9,
        colsample_bytree=0.9,
        min_child_weight=1,
        gamma=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric="logloss",
    )

    return fit_roc_shap("Diabetes", X_train, X_test, y_train, y_test, X.columns, model)


def train_liver():
    df = pd.read_csv(BASE_DIR / "indian_liver_patient.csv")
    df["Dataset"] = df["Dataset"].apply(lambda x: 1 if x == 1 else 0)

    X = df.drop("Dataset", axis=1)
    y = df["Dataset"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    gender_categories = X_train["Gender"].astype(str).str.strip().dropna().unique().tolist()
    X_train["Gender"] = pd.Categorical(
        X_train["Gender"].astype(str).str.strip(),
        categories=gender_categories,
    ).codes
    X_test["Gender"] = pd.Categorical(
        X_test["Gender"].astype(str).str.strip(),
        categories=gender_categories,
    ).codes

    train_medians = X_train.median(numeric_only=True)
    X_train.fillna(train_medians, inplace=True)
    X_test.fillna(train_medians, inplace=True)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    smote = SMOTE(random_state=42)
    X_train, y_train = smote.fit_resample(X_train, y_train)

    model = XGBClassifier(
        n_estimators=700,
        max_depth=8,
        learning_rate=0.03,
        subsample=0.9,
        colsample_bytree=0.9,
        min_child_weight=1,
        gamma=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric="logloss",
    )

    return fit_roc_shap("Liver", X_train, X_test, y_train, y_test, X.columns, model)


def train_heart():
    df = pd.read_csv(BASE_DIR / "heart.csv")
    df.replace("?", np.nan, inplace=True)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df.fillna(df.median(numeric_only=True), inplace=True)
    df["target"] = df["target"].apply(lambda x: 0 if x == 0 else 1)

    X = df.drop("target", axis=1)
    y = df["target"]

    X_scaled = StandardScaler().fit_transform(X)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    smote = SMOTE(sampling_strategy="auto", k_neighbors=5, random_state=42)
    X_train, y_train = smote.fit_resample(X_train, y_train)

    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        random_state=42,
        eval_metric="logloss",
    )

    return fit_roc_shap("Heart", X_train, X_test, y_train, y_test, X.columns, model)


def train_kidney():
    df = pd.read_csv(BASE_DIR / "kidney_disease.csv")
    df.drop("id", axis=1, inplace=True)
    df.replace(["?", "\t?", ""], np.nan, inplace=True)
    df["classification"] = (
        df["classification"].astype(str).str.replace(r"\t", "", regex=True).str.strip()
    )
    df["classification"] = df["classification"].map({"ckd": 1, "notckd": 0})
    df = df.dropna(subset=["classification"])

    X = df.drop("classification", axis=1)
    y = df["classification"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    numeric_cols = [
        "age", "bp", "sg", "al", "su", "bgr", "bu", "sc", "sod", "pot",
        "hemo", "pcv", "wc", "rc",
    ]
    categorical_cols = ["rbc", "pc", "pcc", "ba", "htn", "dm", "cad", "appet", "pe", "ane"]

    for col in numeric_cols:
        X_train[col] = pd.to_numeric(X_train[col], errors="coerce")
        X_test[col] = pd.to_numeric(X_test[col], errors="coerce")

    train_medians = X_train[numeric_cols].median()
    X_train[numeric_cols] = X_train[numeric_cols].fillna(train_medians)
    X_test[numeric_cols] = X_test[numeric_cols].fillna(train_medians)

    for col in categorical_cols:
        X_train[col] = X_train[col].astype(str).str.replace(r"\t", "", regex=True).str.strip()
        X_test[col] = X_test[col].astype(str).str.replace(r"\t", "", regex=True).str.strip()
        mode_val = X_train[col].replace("nan", np.nan).mode(dropna=True)[0]
        X_train[col] = X_train[col].replace("nan", np.nan).fillna(mode_val)
        X_test[col] = X_test[col].replace("nan", np.nan).fillna(mode_val)
        categories = X_train[col].dropna().unique().tolist()
        X_train[col] = pd.Categorical(X_train[col], categories=categories).codes
        X_test[col] = pd.Categorical(X_test[col], categories=categories).codes

    X_train = X_train.replace([np.inf, -np.inf], np.nan)
    X_test = X_test.replace([np.inf, -np.inf], np.nan)
    X_train.fillna(X_train.median(numeric_only=True), inplace=True)
    X_test.fillna(X_train.median(numeric_only=True), inplace=True)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss",
    )

    return fit_roc_shap("Kidney", X_train, X_test, y_train, y_test, X.columns, model)


def train_thyroid():
    df = pd.read_csv(BASE_DIR / "thyroidDF.csv")
    if "patient_id" in df.columns:
        df.drop("patient_id", axis=1, inplace=True)

    df["target"] = df["target"].astype(str).str.strip().apply(lambda x: 0 if x == "-" else 1)
    df.replace(["?", "", " ", "NA", "N/A"], np.nan, inplace=True)

    numeric_cols = ["age", "TSH", "T3", "TT4", "T4U", "FTI", "TBG"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].fillna(df[col].median())

    for col in df.columns:
        if col != "target" and not pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].astype(str).str.strip()
            mode_val = df[col].mode()[0]
            df[col] = df[col].fillna(mode_val)
            encoder = LabelEncoder()
            df[col] = encoder.fit_transform(df[col])

    df = df.replace([np.inf, -np.inf], np.nan)
    df.fillna(df.median(numeric_only=True), inplace=True)

    X = df.drop("target", axis=1)
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    for col in numeric_cols:
        if col in X_train.columns:
            X_train[col] = pd.to_numeric(X_train[col], errors="coerce")
            X_test[col] = pd.to_numeric(X_test[col], errors="coerce")
            train_median = X_train[col].median()
            X_train[col] = X_train[col].fillna(train_median)
            X_test[col] = X_test[col].fillna(train_median)

    for col in X_train.columns:
        if col != "target" and not pd.api.types.is_numeric_dtype(X_train[col]):
            X_train[col] = X_train[col].astype(str).str.strip().replace({"nan": np.nan})
            X_test[col] = X_test[col].astype(str).str.strip().replace({"nan": np.nan})
            mode_val = X_train[col].mode(dropna=True)[0]
            X_train[col] = X_train[col].fillna(mode_val)
            X_test[col] = X_test[col].fillna(mode_val)
            categories = X_train[col].dropna().unique().tolist()
            X_train[col] = pd.Categorical(X_train[col], categories=categories).codes
            X_test[col] = pd.Categorical(X_test[col], categories=categories).codes

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss",
    )

    return fit_roc_shap("Thyroid", X_train, X_test, y_train, y_test, X.columns, model)


def main():
    results = [
        train_heart(),
        train_diabetes(),
        train_liver(),
        train_kidney(),
        train_thyroid(),
    ]

    plt.figure(figsize=(10, 8))
    for result in results:
        plt.plot(result["fpr"], result["tpr"], linewidth=2, label=f"{result['name']} (AUC = {result['auc']:.3f})")

    plt.plot([0, 1], [0, 1], "k--", linewidth=1)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curves of Disease-Specific XGBoost Models")
    plt.legend(loc="lower right")
    plt.grid(alpha=0.25)
    plt.tight_layout()
    roc_path = ROC_DIR / "figure9_roc_curves.png"
    plt.savefig(roc_path, dpi=300, bbox_inches="tight")
    plt.close()

    print("Saved ROC figure to:", roc_path)
    for result in results:
        print(f"Saved SHAP figure for {result['name']} to: {result['shap_path']}")


if __name__ == "__main__":
    main()
