const imageUpload = document.getElementById("imageUpload");

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"), // Recognizes faces
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"), // Detects where the faces are
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"), // Detection algoritm
]).then(start);

function start() {
  // To know when the page finishes loading all the models
  document.body.append("Models fully loaded");

  imageUpload.addEventListener("change", async () => {
    // Will take the uploaded file and convert it to an image element that will be usable with the faceapi
    const image = await faceapi.bufferToImage(imageUpload.files[0]);

    // To display the image
    document.body.append(image);

    // Detect all faces
    // withFaceLandmarks -> to detect where the faces are
    // withFaceDescriptors -> to draw the boxes and such around the faces
    const detection = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // Counts how many faces are and show the number
    document.body.append(detection.length);
  });
}
