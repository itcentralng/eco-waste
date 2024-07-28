const express = require('express');
const bodyParser = require('body-parser');
const Africastalking = require('africastalking');


const africastalking = Africastalking({
    username: 'sandbox',
    apiKey: 'atsk_257d9bc79efcda5dc2c66f819cc83a137850ac4d6ca1a353afe438e966f22c2aab858267'
});

const sms = africastalking.SMS;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));


let userData = {};


const translations = {
    Hausa: {
        selectLanguage: 'CON Don Allah zaɓi yare:\n1. Hausa\n2. Yoruba\n3. Igbo',
        enterName: 'CON Shigar da sunanka:',
        enterProduct: 'CON Shigar da sunan samfurin da ka girbe:',
        enterQuantity: 'CON Shigar da adadin samfurin (misali, adadin jakunkuna):',
        enterLocation: 'CON Shigar da wurin samfurin:',
        thankYou: 'END Na gode! An karɓi bayaninka. Za mu tuntube ka nan ba da jimawa ba.',
        invalidInput: 'END Shigar da ba daidai ba. Da fatan za a gwada sake.',
        error: 'END An samu kuskure wajen sarrafa buƙatarka. Da fatan za a sake gwadawa daga baya.'
    },
    Yoruba: {
        selectLanguage: 'CON Jọwọ yan ede:\n1. Hausa\n2. Yoruba\n3. Igbo',
        enterName: 'CON Tẹ orukọ rẹ:',
        enterProduct: 'CON Tẹ orukọ ọja ti o gbin:',
        enterQuantity: 'CON Tẹ iye ọja (gẹgẹbi, nọmba awọn apo):',
        enterLocation: 'CON Tẹ ipo ọja:',
        thankYou: 'END O ṣeun! A ti gba alaye rẹ. A yoo kan si ọ laipẹ.',
        invalidInput: 'END Akoko ti ko tọ. Jọwọ gbiyanju lẹẹkansi.',
        error: 'END A ri aṣiṣe ninu processing ibeere rẹ. Jọwọ gbiyanju lẹẹkansi ni igba diẹ.'
    },
    Igbo: {
        selectLanguage: 'CON Biko họrọ asụsụ:\n1. Hausa\n2. Yoruba\n3. Igbo',
        enterName: 'CON Tinye aha gị:',
        enterProduct: 'CON Tinye aha ngwaahịa ị nwetara:',
        enterQuantity: 'CON Tinye ọnụ ọgụgụ nke ngwaahịa (dịka, ọnụ ọgụgụ akpa):',
        enterLocation: 'CON Tinye ebe ngwaahịa ahụ dị:',
        thankYou: 'END Daalụ! Anyi anabatala ozi gị. Onye ọrụ anyị ga-akpọtụrụ gị noge na-adịghị anya.',
        invalidInput: 'END Ihe a na-etinye adịghị mma. Biko nwalee ọzọ.',
        error: 'END E nwere njehie na nhazi nke arịrịọ gị. Biko nwalee ọzọ mgbe e mesịrị.'
    }
};

app.post('/ussd', async (req, res) => {
    const { phoneNumber, text } = req.body;

    let response = '';

   
    const userInputs = text.split('*');


    const language = userData.language || 'Hausa';

    switch (userInputs.length) {
        case 1:
            if (!userData.language) {
  
                response = translations.Hausa.selectLanguage;
            } else {
      
                response = translations[language].enterName;
            }
            break;
        case 2:
            if (!userData.language) {
         
                userData.phoneNumber = phoneNumber;
                userData.language = getLanguageName(userInputs[1]);
                response = translations[userData.language]?.enterName || translations['Hausa'].enterName;
            } else {
                userData.name = userInputs[1];
                response = translations[language]?.enterProduct || translations['Hausa'].enterProduct;
            }
            break;
        case 3:
            userData.name = userInputs[2];
            response = translations[language]?.enterProduct || translations['Hausa'].enterProduct;
            break;
        case 4:
            userData.product = userInputs[3];
            response = translations[language]?.enterQuantity || translations['Hausa'].enterQuantity;
            break;
        case 5:
            userData.quantity = userInputs[4];
            response = translations[language]?.enterLocation || translations['Hausa'].enterLocation;
            break;
        case 6:
            userData.location = userInputs[5];

            const message = `New harvest submission:\nName: ${userData.name}\nProduct: ${userData.product}\nQuantity: ${userData.quantity}\nLocation: ${userData.location}\nLanguage: ${userData.language}`;

            try {
                const smsResponse = await sms.send({
                    to: '+2347013503405',
                    message: message,
                    from: '22074'
                });
                console.log('SMS sent:', smsResponse);
                response = translations[language]?.thankYou || translations['Hausa'].thankYou;
            } catch (error) {
                console.error('Error sending SMS:', error.response ? error.response.data : error.message);
                response = translations[language]?.error || translations['Hausa'].error;
            }

            break;
        default:
            response = translations[language]?.invalidInput || translations['Hausa'].invalidInput;
            break;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});


function getLanguageName(option) {
    switch (option) {
        case '1': return 'Hausa';
        case '2': return 'Yoruba';
        case '3': return 'Igbo';
        default: return 'Hausa'; 
    }
}

app.listen(port, () => {
    console.log(`USSD server running at http://localhost:${port}`);
});
