from flask import Flask, request, jsonify, render_template
import numpy as np
import joblib
import os

app = Flask(__name__)

# -------------------------------
# Load trained SVM model
# -------------------------------
MODEL_PATH = os.path.join("model","DC_SVM_model.joblib")

with open(MODEL_PATH, "rb") as f:
    model = joblib.load(f)

# -------------------------------
# Home route (UI later)
# -------------------------------
@app.route("/")
def home():
    return render_template("index.html")
    # return 'Backend is running.'
# -------------------------------
# Prediction API
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    # 1️⃣ Extract pixel data
    pixels = data.get("pixels")

    if not isinstance(pixels, list) or len(pixels) != 784:
        return jsonify({"error": "Expected list of 784 values"}), 400

    # 2️⃣ Convert to NumPy array
    img = np.array(pixels, dtype=np.float32).reshape(1, -1)
    # ⚠️ IMPORTANT:
    # If you normalized during training (e.g. /255), do it here
    # img_array = img_array / 255.0

    # 3️⃣ Reshape for model input

    # 4️⃣ Predict probabilities
    probs = model.predict_proba(img)[0]
    prediction = int(np.argmax(probs))

    # 5️⃣ Predicted digit
    # predicted_digit = int(np.argmax(probabilities))

    # 6️⃣ Return JSON response
    return jsonify({
        "prediction": prediction,
        "probabilities": probs.tolist()
    })

# -------------------------------
# Run server
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)
