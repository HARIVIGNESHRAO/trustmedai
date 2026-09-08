import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from xgboost import XGBClassifier

# Load Dataset
df = pd.read_csv("heart_disease_uci.csv")

# Drop ID
df.drop("id", axis=1, inplace=True)

# Replace missing values
df.replace("?", np.nan, inplace=True)

# Convert target
df["num"] = df["num"].apply(
    lambda x: 0 if x == 0 else 1
)

# Encode categorical columns
categorical_cols = [
    "sex",
    "dataset",
    "cp",
    "restecg",
    "slope",
    "thal"
]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))

# Convert remaining columns
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Features and Target
X = df.drop("num", axis=1)
y = df["num"]

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Fill missing values using training statistics only
train_medians = X_train.median(numeric_only=True)
X_train.fillna(train_medians, inplace=True)
X_test.fillna(train_medians, inplace=True)

# Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Model
model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    random_state=42,
    eval_metric='logloss'
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

print("Cross Validation Scores:")
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
with open("heart_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("heart_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nHeart Model Saved Successfully!")