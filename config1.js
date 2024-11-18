const config = {
    templates: {
        multi_slide_text_template: {
            backgroundImage: 'templates/background.jpg',
            outputPath: 'public/output.jpg',
            mainSlide: {
                fontSize: 100,
                fontFamily: 'Arial',
                color: 'black',
                fontWeight: 900,
                fontStyle: 'normal',
                paddingLeft: 80,
                paddingRight: 40,
                lineSpacing: 50
            },
            subSlide: {
                fontSize: 24,
                fontFamily: 'Arial',
                color: 'black',
                fontWeight: 'bold',
                fontStyle: 'normal',
                paddingLeft: 50,
                paddingRight: 50,
                lineSpacing: 10,
            },
            thanksSlide: {},
            promotionSlide: {}
        },
        multi_slide_image_template: {},
        single_slide_text_template: {},
        single_slide_video_template: {}
    },
};

module.exports = config;
