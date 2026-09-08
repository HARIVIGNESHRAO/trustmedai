import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from xgboost import XGBClassifier

# Load Dataset
df = pd.read_csv("kidney_disease.csv")

# Drop ID
df.drop("id", axis=1, inplace=True)

# Replace missing symbols
df.replace(["?", "\t?", ""], np.nan, inplace=True)

# Clean target column
df["classification"] = (
    df["classification"]
    .astype(str)
    .str.replace(r"\t", "", regex=True)
    .str.strip()
)

# Convert target
df["classification"] = df["classification"].map({
    "ckd": 1,
    "notckd": 0
})

# Remove rows with missing target
df = df.dropna(subset=["classification"])

# Split before preprocessing to avoid leakage
X = df.drop("classification", axis=1)
y = df["classification"].astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Numeric columns
numeric_cols = [
    'age','bp','sg','al','su',
    'bgr','bu','sc','sod','pot',
    'hemo','pcv','wc','rc'
]

# Convert numeric columns
for col in numeric_cols:
    X_train[col] = pd.to_numeric(X_train[col], errors='coerce')
    X_test[col] = pd.to_numeric(X_test[col], errors='coerce')

train_medians = X_train[numeric_cols].median()
X_train[numeric_cols] = X_train[numeric_cols].fillna(train_medians)
X_test[numeric_cols] = X_test[numeric_cols].fillna(train_medians)

# Categorical columns
categorical_cols = [
    'rbc','pc','pcc','ba',
    'htn','dm','cad',
    'appet','pe','ane'
]

# Fill categorical missing values
for col in categorical_cols:
    X_train[col] = (
        X_train[col]
        .astype(str)
        .str.replace(r"\t", "", regex=True)
        .str.strip()
    )
    X_test[col] = (
        X_test[col]
        .astype(str)
        .str.replace(r"\t", "", regex=True)
        .str.strip()
    )

    mode_val = X_train[col].replace("nan", np.nan).mode(dropna=True)[0]
    X_train[col] = X_train[col].replace("nan", np.nan).fillna(mode_val)
    X_test[col] = X_test[col].replace("nan", np.nan).fillna(mode_val)

    categories = X_train[col].dropna().unique().tolist()
    X_train[col] = pd.Categorical(X_train[col], categories=categories).codes
    X_test[col] = pd.Categorical(X_test[col], categories=categories).codes

# Final cleanup
X_train = X_train.replace([np.inf, -np.inf], np.nan)
X_test = X_test.replace([np.inf, -np.inf], np.nan)
X_train.fillna(X_train.median(numeric_only=True), inplace=True)
X_test.fillna(X_train.median(numeric_only=True), inplace=True)

print("Dataset Shape:")
print(df.shape)

print("\nMissing Values:")
print(df.isnull().sum().sum())

print("\nTarget Distribution:")
print(df["classification"].value_counts())

# Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# XGBoost Model
model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss"
)

# Cross Validation
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
    scoring='accuracy'
)

print("\nCross Validation Scores:")
print(scores)
print("Average CV Accuracy:", scores.mean())

# Train
model.fit(X_train, y_train)

# Predict
pred = model.predict(X_test)

print("\nTest Accuracy:")
print(accuracy_score(y_test, pred))

print("\nClassification Report:")
print(classification_report(y_test, pred))

# Feature Importance
importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print("\nFeature Importance:")
print(importance)

# Save Model
with open("kidney_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("kidney_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nKidney Model Saved Successfully!")