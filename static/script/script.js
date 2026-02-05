window.latestProbabilities
window.latestPrediction


const canvas = document.getElementById("draw-canvas");
const ctx = canvas.getContext("2d");

// Canvas settings
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "white";
ctx.lineWidth = 18;
ctx.lineCap = "round";

let drawing = false;

// Get mouse position relative to canvas
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.closePath();
});

canvas.addEventListener("mouseleave", () => {
    drawing = false;
    ctx.closePath();
});

function get28x28PixelArray() {
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = 28;
    smallCanvas.height = 28;

    const sctx = smallCanvas.getContext("2d");
    sctx.drawImage(canvas, 0, 0, 28, 28);

    const imageData = sctx.getImageData(0, 0, 28, 28).data;
    let pixels = [];

    for (let i = 0; i < imageData.length; i += 4) {
        // Red channel is enough (white = 255, black = 0)
        pixels.push(imageData[i]);
    }

    return pixels; // length = 784
}

document.querySelector(".predict-btn").addEventListener("click", async () => {
    const pixels = get28x28PixelArray();

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pixels: pixels })
        });

        const result = await response.json();

        // Update predicted digit box
        document.querySelector(".prediction-value").innerText =
            result.prediction;

         // 🔥 UPDATE PROBABILITY BARS
        updateProbabilityBars(result.probabilities, result.prediction);
        
        // // 🔒 Store probabilities for next step
        // window.latestProbabilities = result.probabilities;
        // window.latestPrediction = result.prediction;

    } catch (err) {
        console.error("Prediction error:", err);
        document.querySelector(".prediction-value").innerText = "Error";
    }
});

// Clear button
document.querySelector(".clear-btn").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset UI
    document.querySelector(".prediction-value").innerText = "—";
    document.querySelectorAll(".bar-fill").forEach(bar => bar.style.height = "0%");
    document.querySelectorAll(".prob-value").forEach(val => val.innerText = "0.00");
    document.querySelectorAll(".prob-column").forEach(col => col.classList.remove("active"));
});

function updateProbabilityBars(probabilities, predictedDigit) {
    const columns = document.querySelectorAll(".prob-column");

    columns.forEach((col, index) => {
        const bar = col.querySelector(".bar-fill");
        const valueText = col.querySelector(".prob-value");

        const prob = probabilities[index]; // value for digit = index

        // Update bar height (0–100%)
        bar.style.height = (prob * 100) + "%";

        // Update numeric value
        valueText.innerText = (prob * 100).toFixed(2);

        // Highlight predicted digit
        if (index === predictedDigit) {
            col.classList.add("active");
        } else {
            col.classList.remove("active");
        }
    });
}
