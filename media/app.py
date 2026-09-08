import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier

# Load Dataset
df = pd.read_csv("heart.csv")

# Replace ? with NaN
df.replace('?', np.nan, inplace=True)

# Convert all columns to numeric
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill missing values
df.fillna(df.median(numeric_only=True), inplace=True)

# Target Binary Conversion
df['target'] = df['target'].apply(
    lambda x: 0 if x == 0 else 1
)

print("Dataset Shape:")
print(df.shape)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nTarget Distribution:")
print(df['target'].value_counts())

# Features and Target
X = df.drop("target", axis=1)
y = df["target"]

# Feature Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# SMOTE Balancing
smote = SMOTE(
    sampling_strategy='auto',
    k_neighbors=5,
    random_state=42
)

X_train, y_train = smote.fit_resample(
    X_train,
    y_train
)

# XGBoost Model
model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    random_state=42,
    eval_metric='logloss'
)

# 5-Fold Cross Validation
cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_scores = cross_val_score(
    model,
    X_train,
    y_train,
    cv=cv,
    scoring='accuracy'
)

print("\nCross Validation Accuracy:")
print(cv_scores)
print("Average CV Accuracy:", cv_scores.mean())

# Train Model
model.fit(X_train, y_train)

# Predictions
pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, pred)

print("\nTest Accuracy:")
print(accuracy)

# Classification Report
print("\nClassification Report:")
print(classification_report(y_test, pred))

# Save Model
with open("heart_model.pkl", "wb") as file:
    pickle.dump(model, file)

# Save Scaler
with open("heart_scaler.pkl", "wb") as file:
    pickle.dump(scaler, file)

print("\nHeart Model Saved Successfully!")

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