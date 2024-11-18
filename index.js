const sharp = require('sharp');
const config = require('./config');

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

function makeBoldLastWord(text) {
    const words = text.split(' ');
    if (words.length > 1) {
        const lastWord = words.pop();
        return words.join(' ') + ` <tspan font-weight="bold">${lastWord}</tspan>`;
    }
    return `<tspan font-weight="bold">${text}</tspan>`;
}

function makeBoldLastChars(text, chars) {
    if (text.length > chars) {
        const regularPart = text.slice(0, -chars);
        const boldPart = text.slice(-chars);
        return `${regularPart}<tspan font-weight="bold">${boldPart}</tspan>`;
    }
    return `<tspan font-weight="bold">${text}</tspan>`;
}

function makeBoldFirstChars(text, chars) {
    if (text.length > chars) {
        const boldPart = text.slice(0, chars);
        const regularPart = text.slice(chars);
        return `<tspan font-weight="bold">${boldPart}</tspan>${regularPart}`;
    }
    return `<tspan font-weight="bold">${text}</tspan>`;
}

function generateListSVG(listConfig, metadata) {
    const maxWidth = metadata.width - listConfig.paddingLeft - listConfig.paddingRight; // Calculate max width for wrapping
    const lineGap = listConfig.lineSpacing + 10; // Line spacing between wrapped lines

    // Calculate total height of the list
    const totalHeight = listConfig.content.reduce((height, item) => {
        const wrappedLines = wrapText(item, maxWidth, listConfig.fontSize);
        return height + wrappedLines.length * listConfig.lineSpacing + lineGap;
    }, 0);

    // Calculate starting Y position to vertically center the list
    const yStart = (metadata.height - totalHeight) / 2;

    // Generate the SVG elements for the list
    let currentY = yStart; // Keep track of the current Y position

    return listConfig.content.map(item => {
        const wrappedLines = wrapText(item, maxWidth, listConfig.fontSize);

        const itemSVG = wrappedLines.map((line, lineIndex) => {
            const yPosition = currentY + lineIndex * listConfig.lineSpacing;
            return `
                <text 
                    x="${listConfig.paddingLeft}" 
                    y="${yPosition}"
                    font-family="${listConfig.font}"
                    font-size="${listConfig.fontSize}px"
                    fill="${listConfig.color}"
                    dominant-baseline="middle"
                >${listConfig.boldFirstChars && lineIndex === 0 ? makeBoldFirstChars(line, listConfig.boldFirstChars) : line}</text>`;
        }).join('');

        // Update currentY to move down for the next item
        currentY += wrappedLines.length * listConfig.lineSpacing + lineGap;

        return itemSVG;
    }).join('');
}


async function addTextOverlay(templateConfig) {
    try {
        const image = sharp(config.input.path);
        const metadata = await image.metadata();

        let mainContent;

        if (templateConfig.mainText) {
            const maxWidth = metadata.width - templateConfig.mainText.paddingLeft - templateConfig.mainText.paddingRight;
            const lines = wrapText(templateConfig.mainText.content, maxWidth, templateConfig.mainText.fontSize);

            const lineHeight = templateConfig.mainText.fontSize + templateConfig.mainText.lineSpacing;
            const totalTextHeight = lines.length * lineHeight;

            const verticalCenter = metadata.height / 2;
            const textStartY = verticalCenter - (totalTextHeight / 2) + templateConfig.mainText.fontSize / 2;

            mainContent = lines.map((line, index) =>
                `<g>
                    <rect 
                        x="${templateConfig.mainText.paddingLeft}" 
                        y="${textStartY + index * lineHeight - templateConfig.mainText.fontSize * templateConfig.mainText.underlineHeight / 2}"
                        width="${line.length * templateConfig.mainText.fontSize * 0.6}"
                        height="${templateConfig.mainText.fontSize * templateConfig.mainText.underlineHeight}"
                        fill="${templateConfig.mainText.underlineColor}"
                    />
                    <text 
                        x="${templateConfig.mainText.paddingLeft}" 
                        y="${textStartY + index * lineHeight}"
                        font-family="${templateConfig.mainText.font}"
                        font-size="${templateConfig.mainText.fontSize}px"
                        font-weight="${templateConfig.mainText.fontWeight}"
                        fill="${templateConfig.mainText.color}"
                        dominant-baseline="middle"
                    >${line}</text>
               </g>`
            ).join('');

        } else if (templateConfig.listText) {
            mainContent = generateListSVG(templateConfig.listText, metadata); // Generate SVG for list items
        }

        const brandText = `
           <text 
               x="50%" 
               y="${metadata.height - templateConfig.brandText.bottomPadding}"
               font-family="${templateConfig.brandText.font}"
               font-size="${templateConfig.brandText.fontSize}px"
               fill="${templateConfig.brandText.color}"
               text-anchor="middle"
           >${templateConfig.brandText.boldLastWord ? makeBoldLastWord(templateConfig.brandText.content) : templateConfig.brandText.content}</text>`;

        const captionText = `
           <text 
               x="${metadata.width - templateConfig.captionText.rightPadding}" 
               y="${templateConfig.captionText.topPadding}"
               font-family="${templateConfig.captionText.font}"
               font-size="${templateConfig.captionText.fontSize}px"
               fill="${templateConfig.captionText.color}"
               text-anchor="end"
           >${templateConfig.captionText.boldLastChars ? makeBoldLastChars(templateConfig.captionText.content, templateConfig.captionText.boldLastChars) : templateConfig.captionText.content}</text>`;

        const pageTurnText = `
           <text 
               x="${metadata.width - templateConfig.pageTurnText.rightPadding}" 
               y="${metadata.height - templateConfig.pageTurnText.bottomPadding}"
               font-family="${templateConfig.pageTurnText.font}"
               font-size="${templateConfig.pageTurnText.fontSize}px"
               fill="${templateConfig.pageTurnText.color}"
               text-anchor="end"
           >${templateConfig.pageTurnText.content}</text>
       `;

        const svgImage = `
           <svg width="${metadata.width}" height="${metadata.height}">
               ${mainContent}
               ${brandText}
               ${captionText}
               ${pageTurnText}
           </svg>
       `;

        await image
            .composite([
                {
                    input: Buffer.from(svgImage),
                    top: 0,
                    left: 0,
                },
            ])
            .toFile(config.output.path);

        console.log('Text overlay added successfully!');
    } catch (error) {
        console.error('Error adding text overlay:', error);
    }
}

// Usage example for hero_template
// const hero_template_config = config.templates['hero_template'];
// hero_template_config.mainText.content = "By age 25, you should be smart enough to realize this:";
// hero_template_config.captionText.content = "By age 25, you should be smart enough to realize this.";
// addTextOverlay(hero_template_config);

// Usage example for list_template
const list_template_config = config.templates['list_template'];
list_template_config.listText.content = ['3. Protect who is behind you, and respect who is beside you.', '4. Never eat the last piece of something you didn\'t buy.']
list_template_config.captionText.content = "By age 25, you should be smart enough to realize this |1";

addTextOverlay(list_template_config);