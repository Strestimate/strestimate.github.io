//function to process the image into the required format of Tensor
function processImage(imageData) {
    const resultTensor = tf.tidy(() => {

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

        console.log("Peak memory usage:");
        console.table(tf.memory());//peak memory load should be at this point, therefore logging it
        return finalTensor;
    });

    return resultTensor;//returning the processed tensor
}

//function to detect stress from a face
async function testStress(image, SDmodel, FDmodel) {
    console.log("---Test Started---");

    str_time = new Date().getTime();//setting start time
    const face = await extractFace(image, FDmodel);//extracting face
    elapsed = (new Date().getTime() - str_time);//setting end time
    console.log("Face detection done in: " + elapsed + " ms")

    const result = tf.tidy(() => {
        if (face == null) //if no face is detected
        { return tf.tensor([[0],]); }

        const inputTensor = tf.expandDims(processImage(face), 0);//processing the face into a tensor

        str_time = new Date().getTime();//setting start time
        const prediction = SDmodel.predict(inputTensor);//running the prediction
        elapsed = (new Date().getTime() - str_time);//setting end time
        console.log("Stress detection done in: " + elapsed + " ms")

        return prediction;
    });

    const stressValue = await result.data()//storing the predicted value
    console.log("Result value: " + stressValue)//logging exact value of result tensor

    tf.dispose(result);
    console.log("Tensors Remaining: " + tf.memory().numTensors);//Tensors that are maintained for tests
    console.log("---Test Complete---");

    return (Math.round(stressValue * 10000) * 0.01);//sending predicted value to html page
}