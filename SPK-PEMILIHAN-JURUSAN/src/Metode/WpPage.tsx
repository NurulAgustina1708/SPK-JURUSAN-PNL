import React, { useState } from "react";
import MethodSwitcher from "../component/PopUp";

const WPPage = () => {
  // Data jurusan
  const jurusan = [
    { id: 1, name: "TIK (Teknologi Informasi dan Komunikasi)" },
    { id: 2, name: "Teknik Sipil" },
    { id: 3, name: "Teknik Elektro" },
    { id: 4, name: "Teknik Kimia" },
    { id: 5, name: "Bisnis" },
    { id: 6, name: "Teknik Mesin" },
  ];

  // Kriteria dengan type (benefit/cost)
  const criteria = [
    {
      id: 1,
      name: "Nilai Akademik",
      weight: 0.3,
      type: "benefit",
      description: "Semakin tinggi semakin baik",
    },
    {
      id: 2,
      name: "Minat Siswa",
      weight: 0.25,
      type: "benefit",
      description: "Semakin tinggi semakin baik",
    },
    {
      id: 3,
      name: "Peluang Karir",
      weight: 0.2,
      type: "benefit",
      description: "Semakin tinggi semakin baik",
    },
    {
      id: 4,
      name: "Daya Tampung",
      weight: 0.15,
      type: "benefit",
      description: "Semakin tinggi semakin baik",
    },
    {
      id: 5,
      name: "Persyaratan",
      weight: 0.1,
      type: "cost",
      description: "Semakin rendah semakin baik",
    },
  ];

  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vectorS, setVectorS] = useState([]);
  const [showVectorCalculation, setShowVectorCalculation] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState([]);

  const handleScoreChange = (jurusanId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${jurusanId}-${criteriaId}`]: parseFloat(value) || 0,
    }));
  };

 const calculateWP = () => {
   const steps = [];

   // Step 1: Normalisasi bobot
   const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
   const normalizedWeights = criteria.map((c) => ({
     ...c,
     normalizedWeight: c.weight / totalWeight,
   }));

   steps.push({
     title: "1. Normalisasi Bobot",
     description: "Wj = wj/Σwj",
     data: {
       weights: normalizedWeights,
       totalWeight,
     },
   });

   // Step 2: Calculate Vector S
   const vectorSValues = jurusan.map((j) => {
     let vectorS = 1;
     const calculations = criteria.map((c) => {
       const score = scores[`${j.id}-${c.id}`] || 0;
       const weight = c.type === "benefit" ? c.weight : -c.weight;
       const powerResult = Math.pow(score, weight);
       vectorS *= powerResult;
       return {
         criteria: c.name,
         score,
         weight,
         type: c.type,
         powerResult,
       };
     });

     return {
       jurusan: j.name,
       vectorS,
       calculations,
     };
   });

   steps.push({
     title: "2. Perhitungan Vector S",
     description: "Si = Π (Xij^wj) dimana j=1..n",
     data: vectorSValues,
   });

   // Step 3: Calculate Vector V
   const totalVectorS = vectorSValues.reduce(
     (sum, item) => sum + item.vectorS,
     0
   );
   const vectorVValues = vectorSValues.map((item) => ({
     jurusan: item.jurusan,
     vectorS: item.vectorS,
     vectorV: item.vectorS / totalVectorS,
   }));

   steps.push({
     title: "3. Perhitungan Vector V",
     description: "Vi = Si/ΣSi",
     data: {
       vectorV: vectorVValues,
       totalVectorS,
     },
   });

   setCalculationSteps(steps);
   setResults(vectorVValues.sort((a, b) => b.vectorV - a.vectorV));
   setShowResults(true);
 };

  const resetForm = () => {
    setScores({});
    setResults([]);
    setShowResults(false);
    setVectorS([]);
    setShowVectorCalculation(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            SPK - Metode Weighted Product (WP)
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>Ganti Metode</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="mb-2">
            Weighted Product (WP) menghitung preferensi untuk setiap alternatif
            dengan mengalikan seluruh kriteria yang telah dipangkatkan dengan
            bobot kriteria.
          </p>
          <p>Benefit: Nilai lebih besar lebih baik</p>
          <p>Cost: Nilai lebih kecil lebih baik</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Jurusan</th>
                {criteria.map((c) => (
                  <th key={c.id} className="border p-2">
                    {c.name}
                    <br />
                    <span className="text-xs text-gray-500">
                      ({c.type}) {(c.weight * 100).toFixed(0)}%
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jurusan.map((j) => (
                <tr key={j.id}>
                  <td className="border p-2 font-medium">{j.name}</td>
                  {criteria.map((c) => (
                    <td key={c.id} className="border p-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={scores[`${j.id}-${c.id}`] || ""}
                        onChange={(e) =>
                          handleScoreChange(j.id, c.id, e.target.value)
                        }
                        className="w-20 p-1 border rounded"
                        placeholder="1-5"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={calculateWP}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Hitung WP
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Reset
          </button>
        </div>

        {showVectorCalculation && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Perhitungan Vector S</h3>
            {vectorS.map((item, index) => (
              <div key={index} className="mb-6 p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{item.jurusan}</h4>
                <div className="space-y-2">
                  {item.calculations.map((calc, calcIndex) => (
                    <div key={calcIndex} className="flex gap-2 text-sm">
                      <span className="text-gray-600">{calc.criteria}:</span>
                      <span>
                        {calc.score} ^ {calc.weight} ({calc.type})
                      </span>
                    </div>
                  ))}
                  <div className="font-semibold mt-2">
                    Vector S = {item.vectorS.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults &&
          calculationSteps.map((step, stepIndex) => (
            <div
              key={stepIndex}
              className="mt-8 bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {step.description}
                </pre>
              </div>

              {/* Step 1: Weight Normalization */}
              {stepIndex === 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Kriteria</th>
                        <th className="border p-2">Bobot (w)</th>
                        <th className="border p-2">
                          Bobot Ternormalisasi (w/Σw)
                        </th>
                        <th className="border p-2">Tipe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.weights.map((w, i) => (
                        <tr key={i}>
                          <td className="border p-2">{w.name}</td>
                          <td className="border p-2 text-center">{w.weight}</td>
                          <td className="border p-2 text-center">
                            {w.normalizedWeight.toFixed(4)}
                          </td>
                          <td className="border p-2 text-center">{w.type}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-medium">Total</td>
                        <td className="border p-2 text-center">
                          {step.data.totalWeight}
                        </td>
                        <td className="border p-2 text-center">1.0000</td>
                        <td className="border p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Step 2: Vector S Calculation */}
              {stepIndex === 1 && (
                <div className="space-y-4">
                  {step.data.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{item.jurusan}</h4>
                      <table className="w-full border-collapse mb-2">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2">Kriteria</th>
                            <th className="border p-2">Nilai (X)</th>
                            <th className="border p-2">Bobot (w)</th>
                            <th className="border p-2">X^w</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.calculations.map((calc, i) => (
                            <tr key={i}>
                              <td className="border p-2">{calc.criteria}</td>
                              <td className="border p-2 text-center">
                                {calc.score}
                              </td>
                              <td className="border p-2 text-center">
                                {calc.weight}
                              </td>
                              <td className="border p-2 text-center">
                                {calc.powerResult.toFixed(4)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="font-medium mt-2">
                        Vector S = {item.vectorS.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Vector V Calculation */}
              {stepIndex === 2 && (
                <div className="space-y-4">
                  <div className="font-medium mb-2">
                    Total Vector S = {step.data.totalVectorS.toFixed(4)}
                  </div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        <th className="border p-2">Vector S</th>
                        <th className="border p-2">Vector V (S/ΣS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.vectorV.map((item, i) => (
                        <tr key={i}>
                          <td className="border p-2">{item.jurusan}</td>
                          <td className="border p-2 text-center">
                            {item.vectorS.toFixed(4)}
                          </td>
                          <td className="border p-2 text-center">
                            {(item.vectorV * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

        {/* Final Results */}
        {showResults && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Hasil Akhir Weighted Product
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Peringkat</th>
                  <th className="border p-2">Alternatif</th>
                  <th className="border p-2">Nilai Vector V</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className={
                      index === 0
                        ? "bg-green-100 hover:bg-green-200"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{result.jurusan}</td>
                    <td className="border p-2 text-center">
                      {(result.vectorV * 100).toFixed(2)}%
                    </td>
                    <td
                      className={`border p-2 text-center ${
                        index === 0
                          ? "font-bold text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {index === 0 ? "Rekomendasi Terbaik" : "Alternatif"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-lg text-green-800">
                <span className="font-bold">Rekomendasi terbaik adalah </span>
                <span className="bg-green-200 px-2 py-1 rounded">
                  {results[0]?.jurusan}
                </span>
                <span className="font-bold"> dengan nilai preferensi </span>
                <span className="bg-green-200 px-2 py-1 rounded">
                  {(results[0]?.vectorV * 100).toFixed(2)}%
                </span>
              </p>
            </div>
          </div>
        )}

        <MethodSwitcher
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default WPPage;
