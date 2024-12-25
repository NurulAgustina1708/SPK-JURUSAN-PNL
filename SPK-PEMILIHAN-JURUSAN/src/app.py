from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# Sample data for majors and their requirements
majors = [
    {
        "name": "Teknik Informatika",
        "requirements": {
            "matematika": 85,
            "bahasa_inggris": 75,
            "ipa": 80,
            "minat": 85
        }
    },
    {
        "name": "Teknik Elektro",
        "requirements": {
            "matematika": 80,
            "bahasa_inggris": 70,
            "ipa": 85,
            "minat": 75
        }
    },
    {
        "name": "Manajemen",
        "requirements": {
            "matematika": 70,
            "bahasa_inggris": 80,
            "ipa": 65,
            "minat": 70
        }
    },
    {
        "name": "Psikologi",
        "requirements": {
            "matematika": 65,
            "bahasa_inggris": 80,
            "ipa": 70,
            "minat": 85
        }
    }
]

@app.route('/api/majors', methods=['GET'])
def get_majors():
    return jsonify(majors)

@app.route('/api/calculate', methods=['POST'])
def calculate_scores():
    try:
        data = request.json
        student_scores = data['scores']
        criteria = {item['name']: item['weight'] for item in data['criteria']}
        
        results = []
        
        for major in majors:
            # Calculate match percentage for each subject
            match_scores = {
                'matematika': min(100, (float(student_scores['matematika']) / major['requirements']['matematika']) * 100),
                'bahasa_inggris': min(100, (float(student_scores['bahasa_inggris']) / major['requirements']['bahasa_inggris']) * 100),
                'ipa': min(100, (float(student_scores['ipa']) / major['requirements']['ipa']) * 100),
                'minat': min(100, (float(student_scores['minat']) / major['requirements']['minat']) * 100)
            }
            
            # Calculate weighted score
            final_score = (
                match_scores['matematika'] * (criteria['Nilai Matematika'] / 100) +
                match_scores['bahasa_inggris'] * (criteria['Nilai Bahasa Inggris'] / 100) +
                match_scores['ipa'] * (criteria['Nilai IPA'] / 100) +
                match_scores['minat'] * (criteria['Minat'] / 100)
            )
            
            results.append({
                'name': major['name'],
                'score': final_score
            })
        
        # Sort results by score in descending order
        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify(results)

    except Exception as e: 
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)