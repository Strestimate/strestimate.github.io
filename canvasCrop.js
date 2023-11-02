function cropImage(image, coords) {
    // Creating a canvas element
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var offset=0;

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
    var dataURL = canvas.toDataURL('image/png');

    // Creating a new image object for the cropped image
    var croppedImage = new Image();
    var showImage = new Image();

    // Setting the source of the new image object to the data URL
    croppedImage.src = dataURL;

    //showing the image (for testing only)
    showImage.src = dataURL;
    showImage.width = 400;
    showImage.height = 400;
    document.body.appendChild(showImage);

    //return image resized as 48 x 48
    croppedImage.width = 48;
    croppedImage.height = 48;
    return croppedImage;
}