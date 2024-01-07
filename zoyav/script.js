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
    const imagesSpacingInput = document.getElementById("images-spacing");

    const imageListElement = document.getElementById("images-list");

    const saveButton = document.getElementById("button-save");
    const clearButton = document.getElementById("button-clear");
    const generateButton = document.getElementById("button-generate");

    const statusElement = document.getElementById("status");

    previewContainer.style.display = 'none';
    clearButton.disabled = true;
    generateButton.disabled = true;

    let images = [];
    let statusMessage = "";

    imagesSelector.onchange = async () => {
        const newImages = [];
        const promises = [];

        for (let file of imagesSelector.files) {
            statusMessage += `INFO: Selected image ${file.name}\n`;
            const fileReader = new FileReader();

            promises.push(new Promise(resolve => {
                fileReader.onload = async e => {
                    const img = new Image();
                    img.src = e.target.result;
                    statusMessage += `INFO: Image ${file.name} read!\n`;

                    await img.decode();

                    newImages.push(new ImageInfo(file.name, img));
                    statusMessage += `INFO: Added ${file.name} (W: ${img.width} H: ${img.height}) to list of new images\n`;
                    resolve();
                }

                fileReader.readAsDataURL(file)
            }));
        }

        await Promise.all(promises);

        statusMessage += `INFO: Number of added images ${newImages.length}\n`;

        for (let imgInfo of newImages) {
            const newImgInfoElement = document.createElement("li");
            newImgInfoElement.innerText = `${imgInfo.fileName} (${imgInfo.image.width}x${imgInfo.image.height})`
            newImgInfoElement.class = "images-list-item";
            imageListElement.appendChild(newImgInfoElement);
            
            images.push(imgInfo);
            statusMessage += `INFO: Adding image ${imgInfo.fileName} (W: ${imgInfo.image.width} H: ${imgInfo.image.height}) to list of all images\n`;
        }

        statusMessage += `INFO: There are total ${images.length} images to process\n`;
        statusElement.innerText = statusMessage;

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

    generateButton.onclick = () => {
        try {
            const imagesInRow = parseInt(imagesPerRowInput.value);
            const spacing = parseInt(imagesSpacingInput.value);

            const numImages = images.length;
            const rows = Math.ceil(numImages / imagesInRow);

            let maxWidth = 0;
            let maxHeight = 0;

            for (let imgInfo of images) {
                maxWidth = Math.max(imgInfo.image.width, maxWidth);
                maxHeight = Math.max(imgInfo.image.height, maxHeight);
            }

            const finalImageWidth = (maxWidth + spacing) * imagesInRow + spacing;
            const finalImageHeight = (maxHeight + spacing) * rows + spacing;

            statusMessage += `INFO: Images in row ${imagesInRow} (type: ${typeof imagesInRow})\n`;
            statusMessage += `INFO: Spacing ${spacing} (type: ${typeof spacing})\n`;
            statusMessage += `INFO: Num images ${numImages} (type: ${typeof numImages})\n`;
            statusMessage += `INFO: Rows ${rows} (type: ${typeof rows})\n`;
            statusMessage += `INFO: Max W ${maxWidth} (type: ${typeof maxWidth})\n`;
            statusMessage += `INFO: Max H ${maxHeight} (type: ${typeof maxHeight})\n`;
            statusMessage += `INFO: Final W ${finalImageWidth} (type: ${typeof finalImageWidth})\n`;
            statusMessage += `INFO: Final H ${finalImageHeight} (type: ${typeof finalImageHeight})\n`;

            previewCanvas.width = finalImageWidth;
            previewCanvas.height = finalImageHeight;
            
            const context = previewCanvas.getContext('2d');

            for (let imageIdx = 0; imageIdx < numImages; ++imageIdx) {
                const image = images[imageIdx].image;
                const row = Math.floor(imageIdx / imagesInRow);
                const column = imageIdx - row * imagesInRow;

                const x = column * (maxWidth + spacing) + spacing;
                const y = row * (maxHeight + spacing) + spacing;

                statusMessage += `INFO: Drawing image idx ${imageIdx} (${images[imageIdx].fileName} ${image.width}x${image.height}) in position (${x}, ${y})\n`;
                context.drawImage(image, x, y);
            }

            previewContainer.style.display = 'block';

            saveButton.href = previewCanvas.toDataURL();
        }
        catch(ex) {
            statusMessage += `ERROR: ${ex}\n`;
        }

        statusElement.innerText = statusMessage;
    }
}