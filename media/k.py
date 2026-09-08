import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

# Load Dataset
df = pd.read_csv("kidney.csv")

# Drop ID column
df.drop("id", axis=1, inplace=True)

# Remove extra spaces/tabs
for col in df.columns:
    if df[col].dtype == "object":
        df[col] = df[col].astype(str).str.strip()

# Numeric columns
numeric_cols = [
    'age', 'bp', 'sg', 'al', 'su',
    'bgr', 'bu', 'sc', 'sod', 'pot',
    'hemo', 'pcv', 'wc', 'rc'
]

# Convert numeric columns
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill numeric missing values
for col in numeric_cols:
    df[col] = df[col].fillna(df[col].median())

# Fill categorical missing values
for col in df.columns:
    if col not in numeric_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

# Encode all non-numeric columns
label_encoders = {}

for col in df.columns:

    if not pd.api.types.is_numeric_dtype(df[col]):

        le = LabelEncoder()

        df[col] = le.fit_transform(
            df[col].astype(str)
        )

        label_encoders[col] = le

print("\nFinal Data Types:")
print(df.dtypes)

# Features and Target
X = df.drop("classification", axis=1)
y = df["classification"]

# Split Dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Random Forest Model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Predict
pred = model.predict(X_test)

# Accuracy
print("\nAccuracy:")
print(accuracy_score(y_test, pred))

# Classification Report
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

print("\nKidney Model Saved Successfully!")