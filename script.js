const imageUpload = document.getElementById("imageUpload");

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"), // Recognizes faces
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"), // Detects where the faces are
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"), // Detection algoritm
]).then(start);

function start() {
  // Creating a container
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);

  // To know when the page finishes loading all the models
  document.body.append("Models fully loaded");

  imageUpload.addEventListener("change", async () => {
    // Will take the uploaded file and convert it to an image element that will be usable with the faceapi
    const image = await faceapi.bufferToImage(imageUpload.files[0]);

    // To display the image
    container.append(image);

    // Creating and adding the canvas from the image we passed to it
    const canvas = faceapi.createCanvasFromMedia(image);
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

    resizedDetections.forEach((detection) => {
      // Box of the face that our algorithm determines for our individual faces in our image
      const box = detection.detection.box;
      // Draw the boxes onto the screen
      const drawBox = new faceapi.draw.DrawBox(box, { label: "Face" });
      drawBox.draw(canvas);
    });

    // Counts how many faces are and show the number
    /* document.body.append(detection.length); */
  });
}
