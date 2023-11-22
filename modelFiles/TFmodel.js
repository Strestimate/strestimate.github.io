//function to load the model and provide the detector
async function loadModel() {
    let str_time;
    let elapsed;

    console.log("---Loading Model---");
    str_time = new Date().getTime();//setting start time

    tf.engine().startScope();//starting TFjs engine
    const model_Mediapipe = await faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig = {
        runtime: 'tfjs',
        min_detection_confidence: 0.6,
        maxFaces: 2,
    };//setting up the needed Face detection model

    //Loading Face-Detection and Stress-Detection models
    const FDmodel = await faceDetection.createDetector(model_Mediapipe, detectorConfig);
    const SDmodel = await tf.loadLayersModel('https://strestimate.github.io/modelFiles/SDmodel/model.json');

    elapsed = (new Date().getTime() - str_time);//setting end time
    console.log("Model Loading complete in " + elapsed + " ms");

    //function that warms up the model to improve response times
    async function modelWarmUp() {
        let zeroImage = new Image(width = 200, height = 200);//warm up image

        str_time = new Date().getTime();//setting start time
        let zeroResult = await FDmodel.estimateFaces(zeroImage);
        zeroImage = tf.expandDims(processImage(zeroImage), 0);
        zeroResult = SDmodel.predict(zeroImage);
        elapsed = (new Date().getTime() - str_time);//setting end time

        tf.dispose(zeroResult);
        tf.dispose(zeroImage);//disposing the warm-up tensors
        console.log("Model Warm-Up complete in " + elapsed + " ms");
    }

    //function to close down all models and clear the memory
    function terminateModel() {
        tf.disposeVariables();
        tf.engine().endScope();
        console.log("---Model Terminated---")
    }

    //function to extract a face from an image
    async function getFace(image) {
        const face = await extractFace(image, FDmodel);
        return face;
    }

    //function to test an image for a stressed face
    async function getStress(image) {
        const testResult = testStress(image, SDmodel, FDmodel);
        return testResult;
    }

    //function to get an average stress value from a collection of images
    async function getAvgStress(images) {
        let testResult = 0;
        let avgStress = 0.0;
        for (i = 0; i < images.length; i++) {
            testResult = testStress(images[i], SDmodel, FDmodel);
            avgStress += testResult;
        }
        avgStress = (avgStress / images.length)
        return avgStress;
    }

    await modelWarmUp();//warming up the model
    console.log("---Model is ready---");

    return { getStress, getAvgStress, getFace, terminateModel };//returning the functions for the model
}