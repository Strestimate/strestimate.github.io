let detector;
let testImage = document.getElementById("testImage");
let modelReady = false;

// Getting the webcam stream
const video = document.getElementById('video');
const canvasCapture = document.getElementById('canvasCapture');
const capture = document.getElementById('capture');



async function loadImage(src) {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
  });
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        });
}

//function to load the model on page load
async function loadDetector() {
    detector = await loadModel();
    testArea = document.getElementById('testArea');
    testArea.style.display = 'block';
    introArea = document.getElementById('introArea');
    introArea.style.display = 'none';
    modelReady = true;
}

function startVideo() {
  document.getElementById('video').removeAttribute('hidden');
  document.getElementById('beginButton').setAttribute("hidden",true);
}

let intervalId; // Variable to store the interval ID for later clearing
let isCapturing = false; // Flag to track whether capturing is in progress

// Event listener for the "Begin" button
document.getElementById("beginButton").addEventListener("click", async function () {
    if (!isCapturing) {
        isCapturing = true;

        const images = await captureImages();
        const averageScore = await calculateAverageScore(images);

        // Display or use the average score as needed
        isCapturing = false;
        document.getElementById('video').setAttribute("hidden",true);
        sessionStorage.setItem('averageScore', averageScore);
        window.location.href = 'Result.html';
    }
});

// Function to capture an image every second for a specified duration
async function captureImages() {
  const images = [];
  for (let i = 0; i < 5; i++) {
      // Capture image from video
      canvasCapture.getContext('2d').drawImage(video, 0, 0, canvasCapture.width, canvasCapture.height);
      const dataURL = canvasCapture.toDataURL('image/png');
      images.push(dataURL);
      console.log("image clicked");

      // Introduce a 3-second delay before the next iteration
      await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return images;
}


// Function to calculate the average score from an array of images
async function calculateAverageScore(images) {
    let totalScore = 0;

    for (const imageDataURL of images) {
        const image = await loadImage(imageDataURL);
        const result = await detector.getStress(image);
        totalScore += result;
        console.log(result);
    }

    return totalScore / images.length;
}
