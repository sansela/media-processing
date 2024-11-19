const config = {
    templates: {
        multi_slide_text_template: {
            backgroundImage: 'templates/background.jpg',
            outputFolder: 'public/',
            mainSlide: {
                fontSize: 100,
                fontFamily: 'Arial',
                color: 'black',
                fontWeight: 900,
                fontStyle: 'normal',
                paddingLeft: 80,
                paddingRight: 40,
                lineSpacing: 50,
            },
            subSlide: {
                fontSize: 48,
                fontFamily: 'Times New Roman',
                color: 'black',
                fontWeight: 600,
                fontStyle: 'normal',
                paddingLeft: 80,
                paddingRight: 20,
                lineSpacing: 40,
            },
            thanksSlide: {
                fontSize: 40,
                fontFamily: 'Courier New',
                color: 'darkblue',
                fontWeight: 500,
                fontStyle: 'normal',
                paddingLeft: 50,
                paddingRight: 50,
                lineSpacing: 30,
            },
            promotionSlide: {
                fontSize: 60,
                fontFamily: 'Verdana',
                color: 'green',
                fontWeight: 600,
                fontStyle: 'normal',
                paddingLeft: 50,
                paddingRight: 50,
                lineSpacing: 40,
            },
        },
    },
};

module.exports = config;
