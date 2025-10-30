import React, { useState } from 'react';
import { Brain, Leaf, Users, Shield, ArrowRight, Scan, Camera, MessageSquare, Zap } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { SymptomInput } from './components/SymptomInput';
import { AnalysisResults } from './components/AnalysisResults';
import { getRandomDisease, Disease } from './data/diseases';

// --------- Image validation helpers ---------
type ImageValidation = {
  ok: boolean;
  reason?: string;
  details?: { width: number; height: number; sizeMB: number; type: string; vegetationScore?: number };
};

const MAX_IMAGE_MB = 10;
const MIN_DIM = 256;
const MIN_VEG_SCORE = 0.08;

function loadImageFromBlob(blobUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = blobUrl;
  });
}

function computeVegetationScore(img: HTMLImageElement): number {
  const canvas = document.createElement('canvas');
  const maxSide = 512;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let greenish = 0;
  let total = 0;
  const step = Math.max(1, Math.floor((data.length / 4) / 10000));
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 50) continue;
    total++;
    const isGreen = g > r * 1.1 && g > b * 1.1 && g > 60;
    if (isGreen) greenish++;
  }
  return total ? greenish / total : 0;
}

async function validateImage(file: File): Promise<ImageValidation> {
  if (!file.type.startsWith('image/')) return { ok: false, reason: 'File is not an image.' };
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_IMAGE_MB) return { ok: false, reason: `Image is too large (${sizeMB.toFixed(1)} MB). Max ${MAX_IMAGE_MB} MB.` };

  const blobUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageFromBlob(blobUrl);
    if (img.width < MIN_DIM || img.height < MIN_DIM) {
      return { ok: false, reason: `Image is too small (${img.width}x${img.height}). Minimum ${MIN_DIM}x${MIN_DIM}.` };
    }
    const vegetationScore = computeVegetationScore(img);
    if (vegetationScore < MIN_VEG_SCORE) {
      return {
        ok: false,
        reason: 'Wrong image: looks unlike a crop/leaf. Please upload a clear leaf/plant photo.',
        details: { width: img.width, height: img.height, sizeMB, type: file.type, vegetationScore }
      };
    }
    return { ok: true, details: { width: img.width, height: img.height, sizeMB, type: file.type, vegetationScore } };
  } catch {
    return { ok: false, reason: 'Could not read the image. Try another file.' };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
// ----------------------------------------------------

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [cropType, setCropType] = useState('');
  const [analysis, setAnalysis] = useState<Disease | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'home' | 'image' | 'text' | 'results'>('home');
  const [analysisMode, setAnalysisMode] = useState<'image' | 'text' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setCurrentStep('image');
    setAnalysis(null);
    setErrorMsg(null);
    setInfoMsg(null);
  };

const handleAnalyze = async (mode: 'image' | 'text') => {
  setErrorMsg(null);
  setInfoMsg(null);

  if (mode === 'image') {
    if (!selectedImage) return;
    setIsAnalyzing(true);

    // Validate image before analyzing
    const validation = await validateImage(selectedImage);
    if (!validation.ok) {
      setIsAnalyzing(false);
      setAnalysis(null);
      setCurrentStep('image');
      setErrorMsg(validation.reason ?? 'Wrong image. Please upload a clear crop/leaf photo.');
      return;
    }
  }

  if (mode === 'text') {
    if (!symptoms && !cropType) return;
    setIsAnalyzing(true);
  }

  setAnalysisMode(mode);
  setCurrentStep('results');

  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1200));
  const disease = getRandomDisease(cropType);
  setAnalysis(disease);

  // Send results to backend
  try {
    const formData = new FormData();
    if (selectedImage) formData.append('image', selectedImage);

    const payload = {
      cropName: cropType,
      diseaseDetected: disease.name,
      confidence: disease.confidence,
      severity: disease.severity,
      description: disease.description,
      fertilizer: JSON.stringify(disease.treatments.filter(t => t.type === 'fertilizer')),
      pesticide: JSON.stringify(disease.treatments.filter(t => t.type === 'pesticide')),
      organic: JSON.stringify(disease.treatments.filter(t => t.type === 'organic')),
      symptoms: symptoms || '',
    };

    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const res = await fetch('http://localhost:5000/api/analysis', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend error:', res.status, errorText);
      throw new Error(`Backend error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log('Saved to backend:', data);
    setInfoMsg('Analysis saved successfully!');
  } catch (err: any) {
    console.error('Error saving to backend:', err);
    setErrorMsg(err.message || 'Failed to save analysis to backend. Please try again.');
  }

  setIsAnalyzing(false);
};


  const resetAnalysis = () => {
    setAnalysis(null);
    setIsAnalyzing(false);
    setAnalysisMode(null);
    setCurrentStep('home');
    setSelectedImage(null);
    setSymptoms('');
    setCropType('');
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const startImageAnalysis = () => {
    setCurrentStep('image');
    setAnalysisMode('image');
    setErrorMsg(null);
    setInfoMsg('Upload a clear photo of a leaf or plant. Blurry or non-plant images will be rejected.');
  };

  const startTextAnalysis = () => {
    setCurrentStep('text');
    setAnalysisMode('text');
    setErrorMsg(null);
    setInfoMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CropCare AI</h1>
                <p className="text-sm text-gray-600">Smart Disease Detection & Treatment</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Scan className="h-4 w-4 text-green-600" />
                <span>AI Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span>Treatment Plans</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Prevention Tips</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(errorMsg || infoMsg) && (
          <div className="max-w-4xl mx-auto mb-6">
            {errorMsg && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3">{errorMsg}</div>}
            {infoMsg && <div className="rounded-lg border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3">{infoMsg}</div>}
          </div>
        )}

        {/* Home Screen */}
        {currentStep === 'home' && (
          <div className="text-center mb-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Analysis Method</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get instant crop disease detection and treatment recommendations using either image analysis or symptom description
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Image Analysis Option */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-green-100">
                <div className="bg-green-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-6">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Image Analysis</h3>
                <p className="text-gray-600 mb-6">Upload a photo of your crop to get instant AI-powered disease detection with visual analysis</p>
                <ul className="text-sm text-gray-500 mb-8 space-y-2">
                  <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />Instant visual recognition</li>
                  <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />95%+ accuracy rate</li>
                  <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />Works offline</li>
                </ul>
                <button onClick={startImageAnalysis} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Start Image Analysis
                </button>
              </div>

              {/* Text Analysis Option */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-blue-100">
                <div className="bg-blue-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-6">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Symptom Description</h3>
                <p className="text-gray-600 mb-6">Describe your crop symptoms and get expert recommendations based on your observations</p>
                <ul className="text-sm text-gray-500 mb-8 space-y-2">
                  <li className="flex items-center"><Zap className="h-4 w-4 text-blue-500 mr-2" />Detailed symptom analysis</li>
                  <li className="flex items-center"><Zap className="h-4 w-4 text-blue-500 mr-2" />Expert knowledge base</li>
                  <li className="flex items-center"><Zap className="h-4 w-4 text-blue-500 mr-2" />No camera needed</li>
                </ul>
                <button onClick={startTextAnalysis} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Start Text Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Analysis Flow */}
        {currentStep === 'image' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Analysis</h2>
              <p className="text-gray-600">Upload a clear photo of your crop for AI analysis</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Crop Image</h3>
                  <ImageUpload onImageSelect={handleImageSelect} selectedImage={selectedImage} onRemoveImage={handleRemoveImage} />
                  <p className="text-xs text-gray-500 mt-3">Accepted: JPG/PNG up to {MAX_IMAGE_MB} MB, min size {MIN_DIM}×{MIN_DIM}. Non-plant images will be rejected.</p>
                </div>
                {selectedImage && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Optional: Add Crop Details</h3>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Leaf className="h-4 w-4 mr-2 text-green-600" />
                        Crop Type (helps improve accuracy)
                      </label>
                      <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="">Select crop type (optional)</option>
                        {['Rice','Wheat','Corn','Tomato','Potato','Cotton','Soybean','Sugarcane','Banana','Apple','Grapes','Citrus','Other'].map((crop) => <option key={crop} value={crop}>{crop}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {selectedImage && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <button onClick={() => handleAnalyze('image')} disabled={isAnalyzing} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Camera className="h-5 w-5" />
                      <span>{isAnalyzing ? 'Analyzing Image...' : 'Analyze Crop Image'}</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                  <div className="bg-green-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Image Analysis</h3>
                <p className="text-gray-600 mb-6">Our advanced AI will analyze your crop image to identify diseases, pests, and nutrient deficiencies with high accuracy.</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Visual</div>
                    <div className="text-green-600">Recognition</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Instant</div>
                    <div className="text-blue-600">Results</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Analysis Flow */}
        {currentStep === 'text' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Symptom Analysis</h2>
             
              <p className="text-gray-600">Describe your crop symptoms for expert recommendations</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Crop Information & Symptoms
                  </h3>
                  <SymptomInput
                    symptoms={symptoms}
                    cropType={cropType}
                    onSymptomsChange={setSymptoms}
                    onCropTypeChange={setCropType}
                  />
                </div>

                {(symptoms || cropType) && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <button
                      onClick={() => handleAnalyze('text')}
                      disabled={isAnalyzing || (!symptoms && !cropType)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>
                        {isAnalyzing ? 'Analyzing Symptoms...' : 'Analyze Symptoms'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                  <div className="bg-blue-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Expert Knowledge Base
                </h3>
                <p className="text-gray-600 mb-6">
                  Our system uses agricultural expertise and machine learning to match your symptoms with the most likely diseases and provide targeted solutions.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Expert</div>
                    <div className="text-blue-600">Knowledge</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Targeted</div>
                    <div className="text-green-600">Solutions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {currentStep === 'results' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis Results
                  {analysisMode && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      ({analysisMode === 'image' ? 'Image Analysis' : 'Symptom Analysis'})
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">
                  {analysisMode === 'image' 
                    ? 'AI-powered image analysis results' 
                    : 'Expert symptom analysis results'
                  }
                </p>
              </div>
              {analysis && (
                <button
                  onClick={resetAnalysis}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
            
            <AnalysisResults
              disease={analysis!}
              isLoading={isAnalyzing}
            />
          </div>
        )}

        {/* Back to Home Button */}
        {currentStep !== 'home' && currentStep !== 'results' && (
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentStep('home')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Analysis Options
            </button>
          </div>
        )}

        {/* Features Section - Only show on home */}
        {currentStep === 'home' && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Why Choose CropCare AI?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 mx-auto w-12 h-12 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">AI-Powered Detection</h4>
                <p className="text-sm text-gray-600">Advanced machine learning algorithms trained on thousands of crop images</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 mx-auto w-12 h-12 flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Expert Recommendations</h4>
                <p className="text-sm text-gray-600">Detailed treatment plans with specific fertilizers and application guidelines</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-3 mx-auto w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Prevention Focus</h4>
                <p className="text-sm text-gray-600">Proactive measures to prevent future disease outbreaks in your crops</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-green-200">
              © 2025 CropCare AI. Empowering farmers with intelligent crop disease detection.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
