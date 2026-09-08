import pandas as pd
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from xgboost import XGBClassifier

# Load dataset
df = pd.read_csv("diabetes.csv")

# Features and Target
X = df.drop("Outcome", axis=1)
y = df["Outcome"]

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

# Train
model.fit(X_train, y_train)

# Predict
pred = model.predict(X_test)

# Accuracy
print("\nTest Accuracy:")
print(accuracy_score(y_test, pred))

# Report
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
with open("diabetes_model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save Scaler
with open("diabetes_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nDiabetes Model Saved Successfully!")