const sharp = require("sharp");
const config = require("./config1");
const { wrapText } = require("./textHelper");

async function generateSlides(config, slidesList) {
    let subSlideIndex = 2; // Sub-slide numbering starts after the main slide

    // Hero Slide
    const heroTemplate = config.templates.multi_slide_text_template.mainSlide;
    const heroOutputFileName = `public/1-hero.png`;
    await generateSlide(
        config.templates.multi_slide_text_template,
        heroTemplate,
        slidesList.mainSlide[0],
        heroOutputFileName
    );

    // Sub Slides (two quotes per slide)
    for (let i = 0; i < slidesList.subSlides.length; i += 2) {
        const subTemplate = config.templates.multi_slide_text_template.subSlide;

        const quote1 = slidesList.subSlides[i];
        const quote2 = slidesList.subSlides[i + 1] || ""; // Handle last slide
        const combinedQuotes = `${quote1}\n\n${quote2}`.trim();

        const subOutputFileName = `public/${subSlideIndex}-sub.png`;
        await generateSlide(
            config.templates.multi_slide_text_template,
            subTemplate,
            combinedQuotes,
            subOutputFileName
        );

        subSlideIndex++;
    }

    // Thanks Slide
    const thanksSlideContent = slidesList.thanksSlide.join("\n\n");
    const thanksOutputFileName = `public/${subSlideIndex}-thanks.png`;
    await generateSlide(
        config.templates.multi_slide_text_template,
        config.templates.multi_slide_text_template.thanksSlide,
        thanksSlideContent,
        thanksOutputFileName
    );
    subSlideIndex++;

    // Promotion Slide
    const promotionSlideContent = slidesList.promotionSlide.join("\n\n");
    const promotionOutputFileName = `public/${subSlideIndex}-promotion.png`;
    await generateSlide(
        config.templates.multi_slide_text_template,
        config.templates.multi_slide_text_template.promotionSlide,
        promotionSlideContent,
        promotionOutputFileName
    );
}

async function generateSlide(templateConfig, slideConfig, textContent, outputFile) {
    try {
        const image = sharp(templateConfig.backgroundImage);
        const metadata = await image.metadata();
        const maxWidth = metadata.width - slideConfig.paddingLeft - slideConfig.paddingRight;

        // Split the content into paragraphs
        const paragraphs = textContent.split("\n\n");

        // Wrap each paragraph and calculate the total height
        let totalTextHeight = 0;
        const wrappedParagraphs = paragraphs.map((paragraph) => {
            const lines = wrapText(paragraph, maxWidth, slideConfig.fontSize);
            totalTextHeight +=
                lines.length * slideConfig.fontSize +
                (lines.length - 1) * slideConfig.lineSpacing;
            return lines;
        });

        // Add space between paragraphs
        totalTextHeight += (paragraphs.length - 1) * (slideConfig.paragraphSpacing || slideConfig.lineSpacing);

        let currentY = (metadata.height - totalTextHeight) / 2;

        // Create SVG text with proper line breaks and paragraph spacing
        const svgText = wrappedParagraphs
            .map((paragraph, pIndex) => {
                const paragraphSvg = paragraph
                    .map((line) => {
                        const lineSvg = `
                        <text 
                            x="${slideConfig.paddingLeft}" 
                            y="${currentY}" 
                            font-family="${slideConfig.fontFamily}" 
                            font-size="${slideConfig.fontSize}px" 
                            font-weight="${slideConfig.fontWeight}" 
                            font-style="${slideConfig.fontStyle}" 
                            fill="${slideConfig.color}" 
                            dominant-baseline="hanging"
                        >${line}</text>`;
                        currentY += slideConfig.fontSize + slideConfig.lineSpacing;
                        return lineSvg;
                    })
                    .join("");

                // Add extra space after each paragraph except the last one
                if (pIndex < wrappedParagraphs.length - 1) {
                    currentY += slideConfig.paragraphSpacing || slideConfig.lineSpacing;
                }

                return paragraphSvg;
            })
            .join("");

        const svgImage = `
            <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
                ${svgText}
            </svg>
        `;

        // Composite the SVG text onto the image
        await image
            .composite([
                {
                    input: Buffer.from(svgImage),
                    top: 0,
                    left: 0,
                },
            ])
            .toFile(outputFile);

        console.log(`Slide generated: ${outputFile}`);
    } catch (error) {
        console.error(`Error generating slide for ${outputFile}:`, error);
    }
}

// Call the function with the configuration and slides list
const slidesList = {
    mainSlide: ["The only way to do great work is to love what you do"],
    subSlides: [
        "1. The only way to do great work is to love what you do. - Steve Jobs",
        "2. Life is what happens when you're busy making other plans. - John Lennon",
        "3. The purpose of our lives is to be happy. - Dalai Lama",
        "4. Get busy living or get busy dying. - Stephen King",
        "5. You have within you right now, everything you need to deal with whatever the world can throw at you. - Brian Tracy"
    ],
    thanksSlide: [
        "Thank you for your time!",
        "We hope you enjoyed the presentation.",
        "Feel free to share your feedback."
    ],
    promotionSlide: [
        "Visit our website for more inspiring content.",
        "Follow us on social media for daily updates.",
        "Subscribe to our newsletter for exclusive insights."
    ]
};

generateSlides(config, slidesList);
