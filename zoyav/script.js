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

    previewContainer.style.display = 'none';
    clearButton.disabled = true;
    generateButton.disabled = true;

    let images = [];

    imagesSelector.onchange = async () => {
        const newImages = [];
        const promises = [];

        for (let file of imagesSelector.files) {
            const fileReader = new FileReader();

            promises.push(new Promise(resolve => {
                fileReader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;

                    img.onload = () => {
                        newImages.push(new ImageInfo(file.name, img));
                        resolve();
                    }
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

    generateButton.onclick = () => {
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

        previewCanvas.width = finalImageWidth;
        previewCanvas.height = finalImageHeight;

        const context = previewCanvas.getContext('2d');

        for (let imageIdx = 0; imageIdx < numImages; ++imageIdx) {
            const image = images[imageIdx].image;
            const row = Math.floor(imageIdx / imagesInRow);
            const column = imageIdx - row * imagesInRow;

            const x = column * (maxWidth + spacing) + spacing;
            const y = row * (maxHeight + spacing) + spacing;

            context.drawImage(image, x, y);
        }

        previewContainer.style.display = 'block';

        saveButton.href = previewCanvas.toDataURL();
    }
}