const path = require('path');

const config = {
    input: {
        path: path.join(__dirname, 'templates', 'background.jpg')
    },
    output: {
        path: path.join(__dirname, 'public', 'output.jpg')
    },
    templates: {
        hero_template: {
            mainText: {
                content: "",
                font: 'Arial',
                fontSize: 100,
                fontWeight: 900,
                color: 'black',
                paddingLeft: 80,
                paddingRight: 40,
                lineSpacing: 50,
                underlineColor: '#FAFA33',
                underlineHeight: 0.25
            },
            brandText: {
                content: "Powered by @key4success__", // Brand text content
                font: 'Arial',
                fontSize: 32,
                color: 'black',
                bottomPadding: 140,
                boldLastWord: true // Bold the last word
            },
            captionText: {
                content: "", // Caption text content
                font: 'Arial',
                fontSize: 28,
                color: 'black',
                topPadding: 40,
                rightPadding: 30,
                boldLastChars: 2 // Bold last two characters
            },
            pageTurnText: {
                content: "(Swipe Left)", // Page turn text content
                font: 'Arial',
                fontSize: 32,
                color: 'black',
                bottomPadding: 20,
                rightPadding: 20
            }
        },
        list_template: { // New list template configuration
            listText: {
                content: [],
                font: 'Times New Roman',
                fontSize: 48,
                fontWeight: 600,
                color: 'black',
                boldFirstChars: 2,
                paddingLeft: 120,
                paddingRight: -350,
                lineSpacing: 50
            },
            brandText: {
                content: "Powered by @key4success__", // Brand text for list template
                font: 'Arial',
                fontSize: 32,
                color: 'black',
                bottomPadding: 140,
                boldLastWord: true // Bold the last word in brand text
            },
            captionText: {
                content: "", // Caption text for list template
                font: 'Arial',
                fontSize: 28,
                color: 'black',
                topPadding: 40,
                rightPadding: 30,
                boldLastChars: 2 // Bold last two characters in caption text
            },
            pageTurnText: {
                content: "(Swipe Left)", // Page turn text for list template
                font: 'Arial',
                fontSize: 32,
                color: 'black',
                bottomPadding: 20,
                rightPadding: 20
            }
        }
    }
};

module.exports = config;