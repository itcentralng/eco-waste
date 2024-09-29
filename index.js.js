const express = require('express');
const bodyParser = require('body-parser');
const Africastalking = require('africastalking');

// Initialize Africastalking
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
    English: {
        selectLanguage: 'CON Please select your language:\n1. English\n2. Hausa\n3. Yoruba\n4. Igbo',
        mainMenu: 'CON Select an option:\n1. Register\n2. Report an issue',
        enterAddress: 'CON Please enter your home address:',
        enterFamilySize: 'CON Please enter the number of people in your household:',
        enterBinUsage: 'CON On a scale of 1 to 10, how quickly does your bin fill up?',
        enterReport: 'CON Please enter your report:',
        thankYou: 'END Thank you! Your report has been submitted.',
        registrationSuccess: 'END Thank you! Registration successful. We will send you a message shortly.',
        invalidInput: 'END Invalid input. Please try again.',
        error: 'END There was an error processing your request. Please try again later.'
    },
    Hausa: {
        selectLanguage: 'CON Da fatan zaɓi harshenku:\n1. Turanci\n2. Hausa\n3. Yoruba\n4. Igbo',
        mainMenu: 'CON Zaɓi wani zaɓi:\n1. Yi rijista\n2. Bayar da rahoto',
        enterAddress: 'CON Da fatan rubuta adireshin gidanku:',
        enterFamilySize: 'CON Da fatan shigar da yawan mutane a gidanku:',
        enterBinUsage: 'CON Akan sikeli na 1 zuwa 10, da sauri nawa kwandon ku ke cika?',
        enterReport: 'CON Da fatan rubuta rahotonku:',
        thankYou: 'END Na gode! An aika rahotonku.',
        registrationSuccess: 'END Na gode! Rijista ta yi nasara. Za mu aiko muku da saƙo nan bada jimawa ba.',
        invalidInput: 'END Shigarwar ba ta dace ba. Da fatan a sake gwadawa.',
        error: 'END An sami kuskure wajen sarrafa buƙatarku. Da fatan a sake gwadawa daga baya.'
    },
    Yoruba: {
        selectLanguage: 'CON Jowo yan ede re:\n1. English\n2. Hausa\n3. Yoruba\n4. Igbo',
        mainMenu: 'CON Yan ibere kan:\n1. Forukọsilẹ\n2. Ròyin iṣoro kan',
        enterAddress: 'CON Jowo fi adirẹsi ile re sii:',
        enterFamilySize: 'CON Jowo fi iye awon eniyan ninu ile re sii:',
        enterBinUsage: 'CON Lori akosile 1 si 10, bi yara ni bin re ma n kun?',
        enterReport: 'CON Jowo fi akọsilẹ rẹ sii:',
        thankYou: 'END O ṣeun! A ti gbe ròyin rẹ si.',
        registrationSuccess: 'END O ṣeun! Forukọsilẹ ṣeyọri. A yoo fi ifiranṣẹ ranṣẹ si ọ laipẹ.',
        invalidInput: 'END Ifisilẹ ko tọ. Jowo gbiyanju lẹẹkansi.',
        error: 'END A ṣẹlẹ aṣiṣe kan nigba ilana ibeere rẹ. Jowo gbiyanju lẹẹkansi nigbamii.'
    },
    Igbo: {
        selectLanguage: 'CON Biko họrọ asụsụ gị:\n1. English\n2. Hausa\n3. Yoruba\n4. Igbo',
        mainMenu: 'CON Họrọ nhọrọ:\n1. Debanye aha\n2. Kọọ nsogbu',
        enterAddress: 'CON Biko tinye adreesị ụlọ gị:',
        enterFamilySize: 'CON Biko tinye ọnụ ọgụgụ mmadụ nọ n’ezinụlọ gị:',
        enterBinUsage: 'CON N’ụzọ 1 ruo 10, olee otu ọ dị ka ụlọ ahụ na-eju ngwa ngwa?',
        enterReport: 'CON Biko tinye akụkọ gị:',
        thankYou: 'END Daalụ! A zitere akụkọ gị.',
        registrationSuccess: 'END Daalụ! Ndebanye aha ga-emesị. Anyị ga-ezitere gị ozi n’oge adịghị anya.',
        invalidInput: 'END Ntinye adịghị mma. Biko gbalịa ọzọ.',
        error: 'END E nwere njehie n’ịrụ ọrụ gị. Biko gbalịa ọzọ mgbe e mesịrị.'
    }
};


// Function to simulate rainy day detection for the month
function getRainyDays() {
    const rainyDays = [];
    for (let i = 1; i <= 30; i++) {
        if (Math.random() < 0.2) { // 20% chance of rain on any given day
            rainyDays.push(i);
        }
    }
    return rainyDays;
}

// Function to calculate pickup frequency based on family size and bin usage
function calculatePickupFrequency(familySize, binUsage) {
    const baseFrequency = Math.max(1, 6 + binUsage);
    const familyAdjustment = familySize > 4 ? 1 : 1.5; // Slightly lower adjustment for larger families
    const adjustedFrequency = Math.round(baseFrequency / familyAdjustment);
    return Math.max(1, adjustedFrequency); 
}

app.post('/ussd', async (req, res) => {
    const { phoneNumber, text } = req.body;

    let response = '';
    const userInputs = text.split('*');
    const language = userData[phoneNumber]?.language || 'English';

    switch (userInputs.length) {
        case 1:
            if (!userData[phoneNumber]?.language) {
                response = translations.English.selectLanguage;
            } else {
                response = translations[language].mainMenu;
            }
            break;
        case 2:
            if (!userData[phoneNumber]?.language) {
                userData[phoneNumber] = { language: getLanguageName(userInputs[1]) };
                response = translations[userData[phoneNumber].language].mainMenu;
            } else {
                if (userInputs[1] === '1') {
                    response = translations[language].enterAddress;
                } else if (userInputs[1] === '2') {
                    response = translations[language].enterReport;
                } else {
                    response = translations[language].invalidInput;
                }
            }
            break;
        case 3:
            if (userInputs[1] === '1') {
                userData[phoneNumber].address = userInputs[2];
                response = translations[language].enterFamilySize;
            } else if (userInputs[1] === '2') {
                const report = userInputs[2];
                const managementNumber = '+2348108005192'; // Replace with the actual management number

                try {
                    const smsResponse = await sms.send({
                        to: managementNumber,
                        message: `Report from ${phoneNumber}: ${report}`,
                        from: '22074'
                    });
                    console.log('Report SMS sent:', smsResponse);
                    response = translations[language].thankYou;
                } catch (error) {
                    console.error('Error sending report SMS:', error.response ? error.response.data : error.message);
                    response = translations[language].error;
                }
            } else {
                response = translations[language].invalidInput;
            }
            break;
            case 4:
                if (userInputs[1] === '1') {
                    userData[phoneNumber].familySize = parseInt(userInputs[3], 10);  // Storing family size
                    response = translations[language].enterBinUsage;
                } else {
                    response = translations[language].invalidInput;
                }
                break;
            case 5:
                if (userInputs[1] === '1') {
                    userData[phoneNumber].binUsage = parseInt(userInputs[4], 10); // Storing bin usage
                    const pickupFrequency = calculatePickupFrequency(userData[phoneNumber].familySize, userData[phoneNumber].binUsage);
                    const rainyDays = getRainyDays();
            
                    const message = `
                    Pickup Frequency: ${pickupFrequency} times per month.
                    Rainy Days (No Pickup): ${rainyDays.length > 0 ? rainyDays.join(', ') : 'None'}. Please keep Kaduna clean and waste should not be out on rainy days. Thank you.
                    `;
            
                    try {
                        const smsResponse = await sms.send({
                            to: phoneNumber,
                            message: message.trim(),
                            from: '22074'
                        });
                        console.log('SMS sent:', smsResponse);
                        response = translations[language].registrationSuccess;
                    } catch (error) {
                        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
                        response = translations[language].error;
                    }
                } else {
                    response = translations[language].invalidInput;
                }
                break;
                    default:
            response = translations[language].invalidInput;
            break;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

function getLanguageName(option) {
    switch (option) {
        case '1': return 'English';
        case '2': return 'Hausa';
        case '3': return 'Yoruba';
        case '4': return 'Igbo';
        default: return 'English';
    }
}

app.listen(port, () => {
    console.log(`USSD server running at http://localhost:${port}`);
});
