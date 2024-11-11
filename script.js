async function loadCancerData() {
    const response = await fetch('cancer_data.json');
    return await response.json();
}

function createQuestionElement(symptom) {
    const div = document.createElement('div');
    div.classList.add('question');

    const questionText = document.createElement('label');
    questionText.textContent = `Do you experience ${symptom}?`;

    const yesInput = document.createElement('input');
    yesInput.type = 'radio';
    yesInput.name = symptom;
    yesInput.value = 'yes';

    const noInput = document.createElement('input');
    noInput.type = 'radio';
    noInput.name = symptom;
    noInput.value = 'no';
    noInput.checked = true;

    div.appendChild(questionText);
    div.appendChild(yesInput);
    div.appendChild(document.createTextNode(' Yes '));
    div.appendChild(noInput);
    div.appendChild(document.createTextNode(' No'));
    
    return div;
}

async function init() {
    const cancerData = await loadCancerData();
    const symptoms = Object.keys(cancerData.symptoms);
    const questionsDiv = document.getElementById('questions');

    symptoms.forEach(symptom => {
        questionsDiv.appendChild(createQuestionElement(symptom));
    });

    document.getElementById('submitBtn').addEventListener('click', () => {
        const selectedSymptoms = symptoms.filter(symptom => {
            const response = document.querySelector(`input[name="${symptom}"]:checked`).value;
            return response === 'yes';
        });

        displayResults(selectedSymptoms, cancerData);
    });
}

function displayResults(selectedSymptoms, cancerData) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (selectedSymptoms.length === 0) {
        resultsDiv.innerHTML = '<p>Please select at least one symptom.</p>';
        return;
    }

    let detectedCancers = [];
    let foundSpecificCancers = []; // Moved inside the function

    // Check for specific cancers first
    const specificCancers = Object.keys(cancerData.specific_cancers);
    specificCancers.forEach(cancer => {
        const symptomsArray = cancerData.specific_cancers[cancer];
        const hasAllSymptoms = symptomsArray.every(symptom => selectedSymptoms.includes(symptom));
        if (hasAllSymptoms) {
            foundSpecificCancers.push(cancer);
        }
    });

    // Display potential specific cancers detected
    if (foundSpecificCancers.length > 0) {
        resultsDiv.innerHTML += `<h3>Potential Specific Cancers Detected:</h3><p>${foundSpecificCancers.join(', ')}</p>`;
    } else {
        resultsDiv.innerHTML += `<p><strong>No specific cancer could be determined based on your symptoms. Please consult a doctor for a thorough examination.</strong></p>`;
    }

    // Now display the general cancer information, but only for found specific cancers
    selectedSymptoms.forEach(symptom => {
        const cancerInfo = cancerData.symptoms[symptom];

        if (cancerInfo) {
            const cancerType = cancerInfo.type;
            if (foundSpecificCancers.includes(cancerType) && !detectedCancers.includes(cancerType)) {
                detectedCancers.push(cancerType);
                const cancerDetails = `
                    <h3>Type of Cancer: ${cancerType}</h3>
                    <p><strong>Prevention:</strong> ${cancerInfo.prevention}</p>
                    <p><strong>Meal Plan:</strong> ${cancerInfo.meal_plan}</p>
                    <p><strong>Recommended Drugs</strong><i>(discuss with your doctor before use)</i><strong>:</strong> ${cancerInfo.drugs.join(', ')}</p>
                    <p><strong>Advice:</strong> ${cancerInfo.advice}</p>
                `;
                resultsDiv.innerHTML += cancerDetails;
            }
        }
    });
}

init();
