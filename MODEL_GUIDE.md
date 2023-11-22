<h1 align="center">Detector Model Guide</h1>

  <p align="center">
    A guide for developers on how to utilize the detector model
    <br />
    (Workflow is logged onto the console)
    <br />
    <a href="https://github.com/Strestimate/strestimate.github.io/blob/main/modelFiles/TFmodel.js"><strong>- View Model file -</strong></a>
    <br />
  </p>
</div>

## Initialization
### Required Scripts
---
Certain scripts need to included in the HTML file head to load all the files and dependencies.

* Scripts needed to load TensorflowJS and MediaPipe model dependencies:
    ```html
    <!-- Load TensorFlow.js union bundle from a script tag -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"></script>
    <!-- Load MediaPipe face detection bundle from a script tag -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_detection" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/face-detection"></script>
    ```

* Scripts ndeeded to load the model files:
    ```html
    <!-- Load the detector model file -->
    <script src="./modelFiles/TFmodel.js"></script>
    <!-- Load the face extractor -->
    <script src="./modelFiles/faceExtract.js"></script>
    <!-- Load the stress detector -->
    <script src="./modelFiles/stressDetect.js"></script>
    ```

### Function loadModel()
---
An asynchronous function that loads and warms up the required models. 
The function returns a detector object which contains multiple functions.

* Example usage:
    ```js
    let detector = await loadModel();
    ```

#### Note:
* The initial load up takes around 10-12 seconds.
* Subsequent loads take 5-6 seconds if the browser has caching enabled.
* Ideally execute this on page load. (warm-up can be provided as a separate function if needed)
* The face detection model currently has been set to detect upto 2 faces with a minimum of 60% confidence.

### Provided functions:
  <ul>
    <li><a href="#getstress">.getStress()</a></li>
    <li><a href="#getavgstress">.getAvgStress()</a></li>
    <li><a href="#getface">.getFace()</a></li>
    <li><a href="#terminatemodel">.terminateModel()</a></li>
  </ul>

---
---

## .getStress()
An asynchronous function that takes an image as input and returns the detected stress value (upto 2 decimal places) of the person in the image.
The function checks for a face, extracts it and runs the stress detetcion on the face.

* Example usage:
    ```js
    const result = await detector.getStress(testImage);
    ```
#### Note:
* The function will return zero if no face is detected.
* Current response time per test is <70 ms.
* Make sure the image being passed has fully rendered before function call otherwise it will throw a webgl error.

## .getAvgStress()
An asynchronous function that takes an array of images as input and returns the average detected stress value (upto 2 decimal places) of the person in the image.
The function runs the same process as <a href="#getstress">.getStress()</a> on an array of images.

* Example usage:
    ```js
    const avgResult = await detector.getAvgStress([testImage_1,testImage_2]);
    ```
#### Note:
* This function has not been properly tested yet. (Be my guest)
* Make sure all the images being passed are properly loaded before function call otherwise it will throw a webgl error.

## .getFace()
An asynchronous function that checks and extracts a face from the image.
The function only utilizes the face detection model. It is executed as a sub-part in the <a href="#getstress">.getStress()</a> and <a href="#getavgstress">.getAvgStress()</a> functions.

* Example usage:
    ```js
    const face = await detector.getFace(testImage);
    ```
#### Note:
* The function will return null if no face is detected.
* The function will return the first image found if multiple faces are detected. (Can change it to return an error also if you guys want that)
* For now, it is only intended for debugging purposes ie. viewing the cropped faces.

## .terminateModel()
A synchronous function that completely shuts down the models and clears the memory.
The function once executed will require you to initialize the model again.


* Example usage:
    ```js
    detector.terminateModel();
    ```
#### Note:
* Peak tensor count comes to about 135 (I was getting around 1.2 GB of constant VRAM usage).
* Executing the function clears the 127 tensors that are constantly allocated in the memory.
