//function to crop out a detected face from an image
function cropImage(image, coords) {
    // Creating a canvas element
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let offset = 0;

    //Adding a forehead offset
    offset = coords.height / 5;
    coords.height = coords.height + offset;
    coords.y = coords.y - offset;

    // Setting the canvas dimensions to the desired cropped area
    canvas.width = coords.width;
    canvas.height = coords.height;

    // Drawing the cropped image on the canvas
    ctx.drawImage(image, coords.x, coords.y, coords.width, coords.height, 0, 0, coords.width, coords.height);

    // Converting the canvas content to a data URL
    let dataURL = canvas.toDataURL('image/png');

    // Creating a new image object for the cropped image
    let croppedImage = new Image();
    let showImage = new Image();

    // Setting the source of the new image object to the data URL
    croppedImage.src = dataURL;

    //showing the image (for testing only)
    showImage.src = dataURL;
    showImage.width = 400;
    showImage.height = 400;

    //return image resized as 48 x 48
    croppedImage.width = 48;
    croppedImage.height = 48;
    return croppedImage;
}

//function to detect faces
async function extractFace(imageTaken, FDmodel) {
    const faceTensor = await FDmodel.estimateFaces(imageTaken);//getting detected face
    const faceValues = Object.values(faceTensor);

    if (faceValues.length == 0) {
        console.log("No face detected.");
        return null;
    }

    console.log("Face Tensor values:")
    console.log(faceValues);//logging the face tensor values

    if (faceValues.length > 1) {
        console.log("Mulitple faces detected. Going with the first detected face.");
    }

    const boxValues = Object.values(faceValues[0].box);//extracting the dimensions of detected face
    const coordinates = { x: boxValues[0], y: boxValues[2], width: boxValues[4], height: boxValues[5] };//storing them as coordinates
    const faceCrop = cropImage(imageTaken, coordinates);//cropping the face out from the image

    tf.dispose(faceTensor);
    return faceCrop;//returning the cropped and scaled face
}