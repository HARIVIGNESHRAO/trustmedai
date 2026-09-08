import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Load dataset
df = pd.read_csv("liver.csv")

# Fill missing values
df['Albumin_and_Globulin_Ratio'] = (
    df['Albumin_and_Globulin_Ratio']
    .fillna(df['Albumin_and_Globulin_Ratio'].median())
)

# Encode Gender
df['Gender'] = df['Gender'].map({
    'Male': 1,
    'Female': 0
})

# Convert target
# 1 = Liver Disease
# 2 = Healthy

df['Dataset'] = df['Dataset'].map({
    1: 1,
    2: 0
})

print("Dataset Shape:")
print(df.shape)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nTarget Distribution:")
print(df['Dataset'].value_counts())

# Features and Target
X = df.drop("Dataset", axis=1)
y = df["Dataset"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Predict
pred = model.predict(X_test)

# Accuracy
print("\nAccuracy:")
print(accuracy_score(y_test, pred))

# Report
print("\nClassification Report:")
print(classification_report(y_test, pred))

# Feature Importance
importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': model.feature_importances_
})

importance = importance.sort_values(
    by='Importance',
    ascending=False
)

print("\nFeature Importance:")
print(importance)

# Save Model
with open("liver_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("\nLiver Model Saved Successfully!")