const sharp = require('sharp');
const config = require('./config1');

function wrapText(text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = testLine.length * (fontSize * 0.6); // Approximate width

        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

async function addTextOverlay(config, templateName) {
    try {
        console.log(templateName);
        const image = sharp(config.templates[templateName].backgroundImage);
        const metadata = await image.metadata();

        const template = config.templates[templateName]; //multi_slide_text_template
        const mainSlide = template.mainSlide;

        const maxWidthMainSlide = maxWidth(metadata, mainSlide);

        function maxWidth(metadata, slide) {
            return metadata.width - slide.paddingLeft - slide.paddingRight;
        }

        // Sample input list
        // const listItems = [
        //     'Protect who is behind you, and respect who is beside you.Protect who is behind you, and respect who is beside you.',
        //     'Never eat the last piece of something you didn\'t buy.',
        //     'By age 25, you should be smart enough to realize this.',
        // ];

        const listItems = ['By age 25, you should be smart enough to realize this.'];

        // Calculate total text height for vertical centering
        function totalHeight(itemsList, maxWidth, slide) {
            const lineHeights = itemsList.map(item => wrapText(item, maxWidth, slide.fontSize).length);
            const totalTextHeight = lineHeights.reduce((total, lines) => total + lines * slide.fontSize + slide.lineSpacing, 0);
            const startingY = (metadata.height - totalTextHeight) / 2;
            return startingY;
        }

        // Generate SVG
        let currentY = totalHeight(listItems, maxWidthMainSlide, mainSlide);
        const svgText = listItems.map(item => {
            const lines = wrapText(item, maxWidthMainSlide, mainSlide.fontSize);

            const lineSVG = lines.map(line => {
                const svg = `
                <text 
                    x="${mainSlide.paddingLeft}" 
                    y="${currentY}" 
                    font-family="${mainSlide.fontFamily}" 
                    font-size="${mainSlide.fontSize}px" 
                    font-weight="${mainSlide.fontWeight}" 
                    font-style="${mainSlide.fontStyle}" 
                    fill="${mainSlide.color}" 
                    dominant-baseline="hanging"
                >
                    ${line}
                </text>`;
                currentY += mainSlide.fontSize + mainSlide.lineSpacing;
                return svg;
            }).join('');

            // Add a gap between list items
            currentY += mainSlide.fontSize;

            return lineSVG;
        }).join('');

        const svgImage = `
            <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
                ${svgText}
            </svg>
        `;

        // Composite SVG onto the image
        await image
            .composite([{ input: Buffer.from(svgImage), top: 0, left: 0 }])
            .toFile(template.outputPath);

        console.log('Text overlay added successfully!');
    } catch (error) {
        console.error('Error adding text overlay:', error);
    }
}

// Call the function with the configuration
addTextOverlay(config, 'multi_slide_text_template');
