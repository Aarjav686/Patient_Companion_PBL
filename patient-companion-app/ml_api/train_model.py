import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier

# Create models directory
os.makedirs('models', exist_ok=True)

# Load data
# Adjust path as needed based on where this script is run
DATA_PATH = "../Human Disease Prediction"
print(f"Loading data from {DATA_PATH}...")

try:
    train = pd.read_csv(os.path.join(DATA_PATH, "Training.csv"))
    test = pd.read_csv(os.path.join(DATA_PATH, "Testing.csv"))
except FileNotFoundError:
    print("Error: content not found. Please ensure Training.csv and Testing.csv are in the correct location.")
    exit(1)

# Preprocessing
if "Unnamed: 133" in train.columns:
    train = train.drop("Unnamed: 133", axis=1)

P = train[["prognosis"]]
X = train.drop(["prognosis"], axis=1)
Y = test.drop(["prognosis"], axis=1)

# Split data
xtrain, xvalid, ytrain, yvalid = train_test_split(X, P, test_size=0.2, random_state=1)
ytrain = np.array(ytrain).ravel()
yvalid = np.array(yvalid).ravel()

print("Training Random Forest...")
rf = RandomForestClassifier(random_state=18)
model_rf = rf.fit(xtrain, ytrain)
joblib.dump(model_rf, 'models/rf_model.pkl')

print("Training Decision Tree...")
dt = DecisionTreeClassifier()
model_dt = dt.fit(xtrain, ytrain)
joblib.dump(model_dt, 'models/dt_model.pkl')

print("Training SVM...")
svm = SVC()
model_svm = svm.fit(xtrain, ytrain)
joblib.dump(model_svm, 'models/svm_model.pkl')

print("Training Naive Bayes...")
nb = GaussianNB()
model_nb = nb.fit(xtrain, ytrain)
joblib.dump(model_nb, 'models/nb_model.pkl')

print("Training KNN...")
knn = KNeighborsClassifier(n_neighbors=7, metric='minkowski', p=2)
model_knn = knn.fit(xtrain, ytrain)
joblib.dump(model_knn, 'models/knn_model.pkl')

# Save column names to ensure input vector matches
joblib.dump(list(X.columns), 'models/columns.pkl')

print("All models trained and saved to ml_api/models/")
