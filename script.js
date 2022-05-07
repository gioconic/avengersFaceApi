const imageUpload = document.getElementById("imageUpload");

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"), // Recognizes faces
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"), // Detects where the faces are
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"), // Detection algoritm
]).then(start);

// Is an async function due the quantity of promises required
async function start() {
  // Creating a container
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);

  //  60% sure the character is the right one
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.Facematcher(labeledFaceDescriptors, 0.6);

  let image;
  let canvas;

  // To know when the page finishes loading all the models
  document.body.append("Models fully loaded");

  imageUpload.addEventListener("change", async () => {
    // Remove the photo and canvas if a new one is submitted
    if (image) image.remove();
    if (canvas) image.remove();

    // Will take the uploaded file and convert it to an image element that will be usable with the faceapi
    image = await faceapi.bufferToImage(imageUpload.files[0]);

    // To display the image
    container.append(image);

    // Creating and adding the canvas from the image we passed to it
    canvas = faceapi.createCanvasFromMedia(image);
    // Resize the canvas to the correct size
    container.append(canvas);
    // image and canvas appended to the container, so they're both absolutely positioned on top of each other perfectly inside the relative container

    const displaySize = { width: image.width, height: image.height };

    // Resize our canvas
    faceapi.matchDimensions(canvas, displaySize);

    // Detect all faces
    // withFaceLandmarks -> to detect where the faces are
    // withFaceDescriptors -> to draw the boxes and such around the faces
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // Resize all the boxes for our detection to be the correct size based on the sizes we pass it
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Use the faceMatcher to display the character name
    // Go through all the images that we loaded and it's going to find the best match that is above 60% (if there's none, returns nothing)
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    results.forEach((result, i) => {
      // Box of the face that our algorithm determines for our individual faces in our image
      const box = resizedDetections[i].detection.box;
      // Draw the boxes onto the screen
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });

    // Counts how many faces are and show the number
    /* document.body.append(detection.length); */
  });
}

// Parse all the labeled images
function loadLabeledImages() {
  const labels = [
    "Black Widow",
    "Captain America",
    "Captain Marvel",
    "Hawkeye",
    "Jim Rhodes",
    "Thor",
    "Tony Stark",
  ];

  return Promise.all(
    labels.map(async (label) => {
      //   Array to add in there the face detections
      const descriptions = [];

      //  i up to 2 (quantity of pictures per character - the more images, the more accurate is going to be)
      for (let i = 1; i <= 2; i++) {
        //  Load images
        // Label: folder name -- i: picture name
        const img = await faceapi.fetchImages(
          `https://github.com/gioconic/avengersFaceApi/tree/main/labeled_images/${label}/${i}.jpg`
        );
        //  Detect the face on those images
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Adding the face detections to an array
        // descriptor: describes the face that was detected inside each one of our individual images
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
