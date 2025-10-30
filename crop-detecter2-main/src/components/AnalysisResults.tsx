import React from 'react';
import { AlertTriangle, CheckCircle, Droplets, Bug, Calendar, Info } from 'lucide-react';

interface Treatment {
  type: 'fertilizer' | 'pesticide' | 'organic';
  name: string;
  dosage: string;
  application: string;
  timing: string;
}

interface Disease {
  name: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  treatments: Treatment[];
  prevention: string[];
}

interface AnalysisResultsProps {
  disease: Disease;
  isLoading: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  disease,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <p className="text-center text-gray-600 mt-4">
          Analyzing crop disease... Please wait
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fertilizer': return <Droplets className="h-4 w-4" />;
      case 'pesticide': return <Bug className="h-4 w-4" />;
      default: return <Leaf className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Disease Identification */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800">Disease Detected</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(disease.severity)}`}>
            {disease.severity} Severity
          </span>
        </div>
        
        <div className="flex items-center space-x-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="text-lg font-medium text-gray-800">{disease.name}</span>
          <span className="text-sm text-gray-500">
            {disease.confidence}% confidence
          </span>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-gray-700">{disease.description}</p>
          </div>
        </div>
      </div>

      {/* Treatment Recommendations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          Recommended Treatments
        </h4>
        
        <div className="grid gap-4">
          {disease.treatments.map((treatment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-3">
                {getTypeIcon(treatment.type)}
                <span className="font-medium text-gray-800 capitalize">
                  {treatment.type} Treatment
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Product:</span>
                  <span className="ml-2 text-gray-800">{treatment.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Dosage:</span>
                  <span className="ml-2 text-gray-800">{treatment.dosage}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Application:</span>
                  <span className="ml-2 text-gray-800">{treatment.application}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-600">Timing:</span>
                  <span className="ml-2 text-gray-800">{treatment.timing}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prevention Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-green-800 mb-3">Prevention Tips</h4>
        <ul className="space-y-2">
          {disease.prevention.map((tip, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Leaf: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
  </svg>
);