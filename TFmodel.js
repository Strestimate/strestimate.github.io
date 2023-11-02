//function to asynchronously load the TFjs FaceDetection model into the browser
async function loadFaceModel() {
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig = {
        runtime: 'tfjs',
        min_detection_confidence: 0.9,
        maxFaces: 2,
    };
    return faceDetection.createDetector(model, detectorConfig);
}

//function to asynchronously load the tensorflowJS model into the browser
async function loadStressModel() {
    return tf.loadLayersModel('https://vishnu-drx.github.io/TFjs/model.json');
}

async function getFace(imageTaken) {
    tf.engine().startScope();//starting the TFjs engine
    model = await loadFaceModel();//loading the face detection model
    console.log("FaceModel succesfully loaded as model=" + model);//logging load confirmation


    const faceTensor = await model.estimateFaces(imageTaken);//getting detected face
    const faceValues = Object.values(faceTensor);

    console.log("Face Tensor values:")
    console.log(faceValues);//logging the face tensor values

    if (faceValues.length == 0) {
        console.log("No face detected.");
        tf.engine().endScope()
        return null;
    }

    if (faceValues.length > 1) {
        console.log("Mulitple faces detected. Going with the first detected face.");
    }

    const boxValues = Object.values(faceValues[0].box);//extracting the dimensions of detected face
    var coordinates = { x: boxValues[0], y: boxValues[2], width: boxValues[4], height: boxValues[5] };//storing them as coordinates

    const faceCrop = cropImage(imageTaken, coordinates);//cropping the face out from the image
    console.log("Peak memory usage:")
    console.table(tf.memory());//peak memory load should be at this point, therefore logging it


    console.log("Number of tensors in getFace before enginestop: " + tf.memory().numTensors);
    tf.engine().endScope()//closing the TFjs engine to dispose Face detection model
    console.log("Number of tensors in getFace after enginestop: " + tf.memory().numTensors);//loggin the effect of engine stop

    return faceCrop;//returning the cropped and scaled face
}

function preprocImg(imageData) {

    //converting image into tensor of shape [48 48 3]
    const imageTensor = tf.browser.fromPixels(imageData)

    //converting raw tensor to grayscale tensor of shape [48 48 1]
    const grayTensor = tf.image.rgbToGrayscale(imageTensor);

    //resizing the tensor to [224 224 1]
    const resizedTensor = tf.image.resizeBilinear(grayTensor, [224, 224]);

    //converting grayscale tensor to rgb tensor of shape [224 224 3]
    const imgTensor = tf.image.grayscaleToRGB(resizedTensor)

    //converting tensor values from range (0-255) to (0-1)
    const offset = tf.scalar(255.0);
    const finalTensor = tf.scalar(1.0).sub(imgTensor.div(offset));

    //logging number of tensors currently present
    console.log("Number of tensors in Pre-processing: " + tf.memory().numTensors);
    return finalTensor;//returning the processed tensor
}

async function runFullModel() {
    const model = await loadStressModel();//loading the stress detection model 
    console.log("StressModel succesfully loaded as model=" + model);//logging load confirmation

    const image = document.getElementById("testImage");//loading the input image
    
    var str_time = new Date().getTime();//setting start time
    const face = await getFace(image);
    var elapsed = (new Date().getTime() - str_time);//setting end time
    console.log("Face extraction time: " + elapsed + " ms")//logging the face extraction time


    const result = tf.tidy(() => {

        if (face == null) {
            return tf.tensor([[0],]);
        }

        const inputTensor = preprocImg(face);//preprocessing the face

        str_time = new Date().getTime();//setting start time
        const predResult = model.predict(tf.expandDims(inputTensor, 0));//running the prediction
        elapsed = (new Date().getTime() - str_time);//setting end time
        console.log("Stress detection time: " + elapsed + " ms")//logging the prediction time

        return predResult;
    });

    const value = await result.data()//storing the predicted value
    console.log("Result value: " + value[0])//logging exact value of tensor

    console.log("Number of Tensors before final dispose: " + tf.memory().numTensors);

    tf.disposeVariables();
    tf.dispose(result);
    console.log("Number of Tensors after final dispose: " + tf.memory().numTensors);



    document.getElementById("resultValue").innerHTML = Math.round(value[0] * 100 * 100) * 0.01;//sending predicted value to html page
}