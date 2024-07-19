function validateIntroMessage(content) {
    const errors = [];
    let isValid = true;

    // Split the content into lines
    const lines = content.split('\n').map(line => line.trim());

    // Define required fields
    const requiredFields = ['Age', 'Gender', 'Pronouns', 'Orientation', 'Location', '*Education/career', 'Hobbies', '*Trivia'];

    // Check each required field
    requiredFields.forEach(field => {
        const lineIndex = lines.findIndex(line => line.startsWith(field + ':'));
        if (lineIndex === -1) {
            errors.push(`Missing ${field} field.`);
            isValid = false;
        } else if (lines[lineIndex].split(':')[1].trim() === '') {
            errors.push(`${field} field cannot be empty.`);
            isValid = false;
        }
    });

    // Check age
    const ageLine = lines.find(line => line.startsWith('Age:'));
    if (ageLine) {
        const age = parseInt(ageLine.split(':')[1].trim());
        if (age < 16) {
            errors.push('You must be at least 16 years old to join this server. Please join our teen server instead.');
            isValid = false;
        }
    }

    // Check location
    const locationLine = lines.find(line => line.startsWith('Location:'));
    if (locationLine) {
        const location = locationLine.split(':')[1].trim().toLowerCase();
        if (location === 'india') {
            errors.push('Please provide a more specific location in State/City format, e.g., "Maharashtra/Mumbai" or "Delhi/New Delhi".');
            isValid = false;
        }
    }

    // Check trivia
    const triviaLine = lines.find(line => line.startsWith('*Trivia:'));
    if (triviaLine) {
        const trivia = triviaLine.split(':')[1].trim().toLowerCase();
        if (['i dont understand', 'i dont know', 'idk', ''].some(phrase => trivia.includes(phrase))) {
            errors.push('Trivia means a fun fact about yourself. For example: "I can solve a Rubik\'s cube in under a minute" or "I\'ve visited 10 countries".');
            isValid = false;
        }
    }

    // Check orientation
    const orientationLine = lines.find(line => line.startsWith('Orientation:'));
    if (orientationLine) {
        const orientation = orientationLine.split(':')[1].trim().toLowerCase();
        if (orientation === 'bi' || orientation === 'flex') {
            errors.push('Please provide a full orientation term (e.g., "Bisexual" instead of "bi", or a more specific term instead of "flex").');
            isValid = false;
        }
    }

    // Check gender
    const genderLine = lines.find(line => line.startsWith('Gender:'));
    if (genderLine) {
        const gender = genderLine.split(':')[1].trim();
        if (!gender.includes('(')) {
            errors.push('Please provide additional context for your gender (e.g., "Male (cis)" or "Female (trans)").');
            isValid = false;
        }
    }

    return { isValid, errors };
}