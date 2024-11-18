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

function calculateTotalHeight(lines, fontSize, lineSpacing) {
    return lines.reduce((total, line) => total + fontSize + lineSpacing, 0);
}

module.exports = { wrapText, calculateTotalHeight };
