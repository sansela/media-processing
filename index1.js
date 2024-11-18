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

async function generateSlides(config, quotesList) {
    let slideNumber = 1; // Track the slide sequence

    for (let i = 0; i < quotesList.length; i++) {
        const template = i === 0 ? config.templates.multi_slide_text_template.mainSlide : config.templates.multi_slide_text_template.subSlide;

        const outputFileName = `public/${slideNumber}-${i === 0 ? 'hero' : 'sub'}.png`;
        await generateSlide(config.templates.multi_slide_text_template, template, quotesList[i], outputFileName, i > 0 ? `${slideNumber}. ` : '');
        slideNumber++;
    }

    // Generate Thanks Slide
    const thanksList = quotesList.slice(0, 3); // Example subset for the thanks slide
    await generateSlide(config.templates.multi_slide_text_template, config.templates.multi_slide_text_template.thanksSlide, thanksList.join('\n\n'), `public/${slideNumber}-thanks.png`);
    slideNumber++;

    // Generate Promotion Slide
    const promotionList = quotesList.slice(3, 5); // Example subset for the promotion slide
    await generateSlide(config.templates.multi_slide_text_template, config.templates.multi_slide_text_template.promotionSlide, promotionList.join('\n\n'), `public/${slideNumber}-promotion.png`);
}

async function generateSlide(templateConfig, slideConfig, textContent, outputFile, prefix = '') {
    try {
        const image = sharp(templateConfig.backgroundImage);
        const metadata = await image.metadata();
        const maxWidth = metadata.width - slideConfig.paddingLeft - slideConfig.paddingRight;

        // Wrap text and calculate starting Y position
        const lines = wrapText(textContent, maxWidth, slideConfig.fontSize);
        const totalTextHeight = lines.length * slideConfig.fontSize + (lines.length - 1) * slideConfig.lineSpacing;
        let currentY = (metadata.height - totalTextHeight) / 2;

        // Create SVG text
        const svgText = lines.map((line, idx) => {
            const boldPrefix = idx === 0 && prefix ? `<tspan font-weight="bold">${prefix}</tspan>` : '';
            const lineSvg = `
                <text 
                    x="${slideConfig.paddingLeft}" 
                    y="${currentY}" 
                    font-family="${slideConfig.fontFamily}" 
                    font-size="${slideConfig.fontSize}px" 
                    font-weight="${slideConfig.fontWeight}" 
                    font-style="${slideConfig.fontStyle}" 
                    fill="${slideConfig.color}" 
                    dominant-baseline="hanging">
                    ${boldPrefix}${line}
                </text>`;
            currentY += slideConfig.fontSize + slideConfig.lineSpacing;
            return lineSvg;
        }).join('');

        const svgImage = `
            <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
                ${svgText}
            </svg>
        `;

        // Composite the SVG text onto the image
        await image.composite([{ input: Buffer.from(svgImage), top: 0, left: 0 }]).toFile(outputFile);

        console.log(`Slide generated: ${outputFile}`);
    } catch (error) {
        console.error(`Error generating slide for ${outputFile}:`, error);
    }
}

// Call the function with the configuration and quotes list
const quotesList = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "The purpose of our lives is to be happy. - Dalai Lama",
    "Get busy living or get busy dying. - Stephen King",
    "You have within you right now, everything you need to deal with whatever the world can throw at you. - Brian Tracy"
];

generateSlides(config, quotesList);
