import pandas as pd
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE

from xgboost import XGBClassifier

# Load Dataset
df = pd.read_csv("diabete.csv")

# Features and Target
X = df.drop("Outcome", axis=1)
y = df["Outcome"]

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Apply SMOTE to handle class imbalance
smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train, y_train)

# XGBoost with class balance
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
with open("diabetes_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("diabetes_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nDiabetes Model Saved Successfully!")