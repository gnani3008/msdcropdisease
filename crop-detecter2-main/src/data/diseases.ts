export interface Treatment {
  type: 'fertilizer' | 'pesticide' | 'organic';
  name: string;
  dosage: string;
  application: string;
  timing: string;
}

export interface Disease {
  name: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  treatments: Treatment[];
  prevention: string[];
}

export const DISEASE_DATABASE: { [key: string]: Disease[] } = {
  'Tomato': [
    {
      name: 'Early Blight',
      confidence: 92,
      severity: 'Medium',
      description: 'A common fungal disease affecting tomato leaves, causing dark spots with concentric rings. Can reduce yield significantly if left untreated.',
      treatments: [
        {
          type: 'fertilizer',
          name: 'Balanced NPK (10-10-10)',
          dosage: '2-3 kg per acre',
          application: 'Soil application around plant base',
          timing: 'Every 2 weeks'
        },
        {
          type: 'pesticide',
          name: 'Chlorothalonil Fungicide',
          dosage: '2ml per liter water',
          application: 'Foliar spray covering all leaves',
          timing: 'Early morning or evening'
        },
        {
          type: 'organic',
          name: 'Neem Oil',
          dosage: '5ml per liter water',
          application: 'Spray on affected areas',
          timing: 'Weekly application'
        }
      ],
      prevention: [
        'Ensure proper air circulation between plants',
        'Avoid overhead watering to reduce leaf wetness',
        'Remove infected plant debris promptly',
        'Apply mulch to prevent soil splash on leaves',
        'Rotate crops every 2-3 years'
      ]
    }
  ],
  'Rice': [
    {
      name: 'Blast Disease',
      confidence: 87,
      severity: 'High',
      description: 'A serious fungal disease causing lesions on leaves, stems, and panicles. Can cause significant yield losses in rice crops.',
      treatments: [
        {
          type: 'fertilizer',
          name: 'Potassium Chloride',
          dosage: '50 kg per hectare',
          application: 'Basal application before transplanting',
          timing: 'At planting time'
        },
        {
          type: 'pesticide',
          name: 'Tricyclazole',
          dosage: '75g per 100L water',
          application: 'Foliar spray',
          timing: 'At first symptom appearance'
        },
        {
          type: 'organic',
          name: 'Silicon Fertilizer',
          dosage: '100 kg per hectare',
          application: 'Soil application',
          timing: 'Before tillering stage'
        }
      ],
      prevention: [
        'Use resistant rice varieties',
        'Maintain proper water management',
        'Avoid excessive nitrogen fertilization',
        'Practice field sanitation',
        'Monitor and remove infected plants early'
      ]
    }
  ],
  'Potato': [
    {
      name: 'Late Blight',
      confidence: 94,
      severity: 'High',
      description: 'A devastating disease caused by Phytophthora infestans that can destroy entire potato crops within days under favorable conditions.',
      treatments: [
        {
          type: 'fertilizer',
          name: 'Calcium Nitrate',
          dosage: '200 kg per hectare',
          application: 'Side dressing around plants',
          timing: 'During active growth'
        },
        {
          type: 'pesticide',
          name: 'Metalaxyl + Mancozeb',
          dosage: '2.5g per liter water',
          application: 'Preventive foliar spray',
          timing: 'Every 7-10 days'
        },
        {
          type: 'organic',
          name: 'Copper Oxychloride',
          dosage: '3g per liter water',
          application: 'Foliar spray',
          timing: 'Weekly during humid conditions'
        }
      ],
      prevention: [
        'Plant certified disease-free seed potatoes',
        'Ensure good drainage and air circulation',
        'Remove volunteer potatoes and infected plant debris',
        'Monitor weather conditions for disease-favorable periods',
        'Apply preventive fungicide sprays'
      ]
    }
  ]
};

export const getRandomDisease = (cropType: string): Disease => {
  const diseases = DISEASE_DATABASE[cropType];
  if (diseases && diseases.length > 0) {
    return diseases[Math.floor(Math.random() * diseases.length)];
  }
  
  // Default disease for unknown crop types
  return {
    name: 'Fungal Leaf Spot',
    confidence: 78,
    severity: 'Medium',
    description: 'A common fungal infection causing circular spots on leaves. Can be managed with proper fungicide application and cultural practices.',
    treatments: [
      {
        type: 'fertilizer',
        name: 'Balanced NPK (15-15-15)',
        dosage: '25 kg per acre',
        application: 'Broadcast and incorporate into soil',
        timing: 'Monthly application'
      },
      {
        type: 'pesticide',
        name: 'Copper-based Fungicide',
        dosage: '2-3g per liter water',
        application: 'Foliar spray on affected areas',
        timing: 'Every 10-14 days'
      },
      {
        type: 'organic',
        name: 'Compost Tea',
        dosage: '1:10 ratio with water',
        application: 'Soil drench around plants',
        timing: 'Bi-weekly application'
      }
    ],
    prevention: [
      'Maintain proper plant spacing for air circulation',
      'Remove infected plant material immediately',
      'Avoid overhead irrigation during humid periods',
      'Apply organic mulch to suppress soil-borne pathogens',
      'Practice crop rotation with non-host plants'
    ]
  };
};