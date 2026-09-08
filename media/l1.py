import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE

from xgboost import XGBClassifier

# Load Dataset
df = pd.read_csv("indian_liver_patient.csv")

# Convert Target
# 1 -> Disease
# 2 -> No Disease

df["Dataset"] = df["Dataset"].apply(
    lambda x: 1 if x == 1 else 0
)

# Features and Target
X = df.drop("Dataset", axis=1)
y = df["Dataset"]

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Encode Gender using training categories only
gender_categories = X_train["Gender"].astype(str).str.strip().dropna().unique().tolist()
X_train["Gender"] = pd.Categorical(
    X_train["Gender"].astype(str).str.strip(),
    categories=gender_categories
).codes
X_test["Gender"] = pd.Categorical(
    X_test["Gender"].astype(str).str.strip(),
    categories=gender_categories
).codes

# Fill missing values using train statistics only
train_medians = X_train.median(numeric_only=True)
X_train.fillna(train_medians, inplace=True)
X_test.fillna(train_medians, inplace=True)

# Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Apply SMOTE to handle class imbalance
smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train, y_train)

# XGBoost Model with class balance
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
with open("liver_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("liver_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nLiver Model Saved Successfully!")