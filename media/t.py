import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from xgboost import XGBClassifier

# =========================
# Load Dataset
# =========================

df = pd.read_csv("thyroidDF.csv")

# Drop patient id
if "patient_id" in df.columns:
    df.drop("patient_id", axis=1, inplace=True)

# =========================
# Clean Target
# =========================

df["target"] = (
    df["target"]
    .astype(str)
    .str.strip()
)

# Binary classification
# Normal (-) = 0
# Disease = 1

df["target"] = df["target"].apply(
    lambda x: 0 if x == "-" else 1
)

# =========================
# Replace Missing Markers
# =========================

df.replace(
    ["?", "", " ", "NA", "N/A"],
    np.nan,
    inplace=True
)

# =========================
# Convert Numeric Columns
# =========================

numeric_cols = [
    "age",
    "TSH",
    "T3",
    "TT4",
    "T4U",
    "FTI",
    "TBG"
]

for col in numeric_cols:

    if col in df.columns:

        df[col] = pd.to_numeric(
            df[col],
            errors="coerce"
        )

        df[col] = df[col].fillna(
            df[col].median()
        )

# =========================
# Encode Categorical Columns
# =========================

for col in df.columns:

    if col != "target":

        if not pd.api.types.is_numeric_dtype(df[col]):

            df[col] = (
                df[col]
                .astype(str)
                .str.strip()
            )

            mode_val = df[col].mode()[0]

            df[col] = df[col].fillna(
                mode_val
            )

            encoder = LabelEncoder()

            df[col] = encoder.fit_transform(
                df[col]
            )

# Final cleanup
df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df.fillna(
    df.median(numeric_only=True),
    inplace=True
)

# =========================
# Verification
# =========================

print("Dataset Shape:")
print(df.shape)

print("\nMissing Values:")
print(df.isnull().sum().sum())

print("\nTarget Distribution:")
print(df["target"].value_counts())

# =========================
# Features and Target
# =========================

X = df.drop("target", axis=1)
y = df["target"]

# =========================
# Train Test Split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# =========================
# Train-only preprocessing
# =========================

for col in numeric_cols:

    if col in X_train.columns:

        X_train[col] = pd.to_numeric(
            X_train[col],
            errors="coerce"
        )

        X_test[col] = pd.to_numeric(
            X_test[col],
            errors="coerce"
        )

        train_median = X_train[col].median()

        X_train[col] = X_train[col].fillna(train_median)
        X_test[col] = X_test[col].fillna(train_median)

for col in X_train.columns:

    if col != "target" and not pd.api.types.is_numeric_dtype(X_train[col]):

        X_train[col] = (
            X_train[col]
            .astype(str)
            .str.strip()
            .replace({"nan": np.nan})
        )

        X_test[col] = (
            X_test[col]
            .astype(str)
            .str.strip()
            .replace({"nan": np.nan})
        )

        mode_val = X_train[col].mode(dropna=True)[0]

        X_train[col] = X_train[col].fillna(mode_val)
        X_test[col] = X_test[col].fillna(mode_val)

        categories = X_train[col].dropna().unique().tolist()

        X_train[col] = pd.Categorical(X_train[col], categories=categories).codes
        X_test[col] = pd.Categorical(X_test[col], categories=categories).codes

# =========================
# Scaling
# =========================

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# =========================
# XGBoost Model
# =========================

model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss"
)

# =========================
# Cross Validation
# =========================

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

scores = cross_val_score(
    model,
    X_train,
    y_train,
    cv=cv,
    scoring="accuracy"
)

print("\nCross Validation Scores:")
print(scores)

print(
    "Average CV Accuracy:",
    scores.mean()
)

# =========================
# Train
# =========================

model.fit(
    X_train,
    y_train
)

# =========================
# Predict
# =========================

pred = model.predict(
    X_test
)

print("\nTest Accuracy:")
print(
    accuracy_score(
        y_test,
        pred
    )
)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        pred
    )
)

# =========================
# Feature Importance
# =========================

importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print("\nTop Features:")
print(
    importance.head(20)
)

# =========================
# Save Model
# =========================

with open(
    "thyroid_model.pkl",
    "wb"
) as f:
    pickle.dump(model, f)

with open(
    "thyroid_scaler.pkl",
    "wb"
) as f:
    pickle.dump(scaler, f)

print("\nThyroid Model Saved Successfully!")