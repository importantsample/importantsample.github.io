class ImageInfo {
    constructor(fileName, image) {
        this.fileName = fileName;
        this.image = image;
    }
}

window.onload = () => {
    const imagesSelector = document.getElementById("images-selector");
    const previewCanvas = document.getElementById("preview");
    const previewContainer = document.getElementById("preview-container");

    const imagesPerRowInput = document.getElementById("images-per-row");
    const imagesScaleInput = document.getElementById("images-scale");
    const imagesSpacingInput = document.getElementById("images-spacing");
    const backgroundColorInput = document.getElementById("background-color");

    const imageListElement = document.getElementById("images-list");

    const saveButton = document.getElementById("button-save");
    const clearButton = document.getElementById("button-clear");
    const generateButton = document.getElementById("button-generate");

    const statusMessageElement = document.getElementById("status-message");

    previewContainer.style.display = "none";
    clearButton.disabled = true;
    generateButton.disabled = true;

    const previewCanvasContext = previewCanvas.getContext("2d");

    let images = [];

    imagesSelector.onchange = async () => {
        const newImages = [];
        const promises = [];

        for (let file of imagesSelector.files) {
            const fileReader = new FileReader();

            promises.push(new Promise(resolve => {
                fileReader.onload = async e => {
                    const img = new Image();
                    img.src = e.target.result;

                    img.onerror = (e) => {
                        alert(e.toString());
                    }

                    await img.decode();

                    newImages.push(new ImageInfo(file.name, img));
                    resolve();
                }

                fileReader.readAsDataURL(file)
            }));
        }

        await Promise.all(promises);

        for (let imgInfo of newImages) {
            const newImgInfoElement = document.createElement("li");
            newImgInfoElement.innerText = `${imgInfo.fileName} (${imgInfo.image.width}x${imgInfo.image.height})`
            newImgInfoElement.class = "images-list-item";
            imageListElement.appendChild(newImgInfoElement);
            
            images.push(imgInfo);
        }

        clearButton.disabled = false;
        generateButton.disabled = false;
        imagesSelector.value = "";
    }

    clearButton.onclick = () => {
        images = [];
        imageListElement.replaceChildren();

        clearButton.disabled = true;
        generateButton.disabled = true;
    }

    generateButton.onclick = async () => {
        statusMessageElement.innerText = "Generating...";
        statusMessageElement.style.display = "block";
        previewContainer.style.display = "none";

        try {
            const imagesInRow = parseInt(imagesPerRowInput.value);
            const scale = parseFloat(imagesScaleInput.value);
            const spacing = parseInt(imagesSpacingInput.value);
            const backgroundColor = backgroundColorInput.value;

            const numImages = images.length;
            const rows = Math.ceil(numImages / imagesInRow);

            let maxWidth = 0;
            let maxHeight = 0;

            for (let imgInfo of images) {
                maxWidth = Math.max(Math.ceil(scale * imgInfo.image.width), maxWidth);
                maxHeight = Math.max(Math.ceil(scale * imgInfo.image.height), maxHeight);
            }

            const finalImageWidth = (maxWidth + spacing) * imagesInRow + spacing;
            const finalImageHeight = (maxHeight + spacing) * rows + spacing;

            const drawingCanvas = new OffscreenCanvas(finalImageWidth, finalImageHeight);
            const context = drawingCanvas.getContext("2d");
            
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            
            for (let imageIdx = 0; imageIdx < numImages; ++imageIdx) {
                const image = images[imageIdx].image;
                const row = Math.floor(imageIdx / imagesInRow);
                const column = imageIdx - row * imagesInRow;
                
                const x = column * (maxWidth + spacing) + spacing;
                const y = row * (maxHeight + spacing) + spacing;
                
                context.drawImage(image, x, y, Math.ceil(scale * image.width), Math.ceil(scale * image.height));
            }
            
            if(finalImageWidth > finalImageHeight) {
                previewCanvas.width = 1920;
                previewCanvas.height = Math.round(drawingCanvas.height / drawingCanvas.width * previewCanvas.width);
            }
            else {
                previewCanvas.height = 1920;
                previewCanvas.width = Math.round(drawingCanvas.width / drawingCanvas.height * previewCanvas.height);
            }

            previewCanvasContext.drawImage(drawingCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

            const timestamp = new Date();
            
            const paddedMonth = String(timestamp.getMonth() + 1).padStart(2, '0');
            const paddedDay = String(timestamp.getDate()).padStart(2, '0');
            const paddedHours = String(timestamp.getHours()).padStart(2, '0');
            const paddedMinutes = String(timestamp.getMinutes()).padStart(2, '0');
            const paddedSeconds = String(timestamp.getSeconds()).padStart(2, '0');
            
            const timestampedName = `collage_${timestamp.getFullYear()}${paddedMonth}${paddedDay}_${paddedHours}${paddedMinutes}${paddedSeconds}.png`;
            
            const finalImageBlob = await drawingCanvas.convertToBlob({type: "image/png"});
            saveButton.href = URL.createObjectURL(finalImageBlob);
            
            saveButton.download = timestampedName;
            previewContainer.style.display = "block";
            statusMessageElement.innerText = "Done!";
        }
        catch(ex) {
            statusMessageElement.innerText = ex.toString();
        }
    }
}