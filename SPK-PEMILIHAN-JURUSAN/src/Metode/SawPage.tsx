import React, { useState } from "react";
import MethodSwitcherModal from "../component/PopUp";

const SPKJurusan = () => {
  // Data jurusan
  const jurusan = [
    { id: 1, name: "TIK (Teknologi Informasi dan Komunikasi)" },
    { id: 2, name: "Teknik Sipil" },
    { id: 3, name: "Teknik Elektro" },
    { id: 4, name: "Teknik Kimia" },
    { id: 5, name: "Bisnis" },
    { id: 6, name: "Teknik Mesin" },
  ];

  // Kriteria dan bobot (hasil dari AHP)
  const criteria = [
    { id: 1, name: "Nilai Akademik", weight: 0.3, type: "benefit" },
    { id: 2, name: "Minat Siswa", weight: 0.25, type: "benefit" },
    { id: 3, name: "Peluang Karir", weight: 0.2, type: "benefit" },
    { id: 4, name: "Daya Tampung", weight: 0.15, type: "benefit" },
    { id: 5, name: "Persyaratan", weight: 0.1, type: "cost" },
  ];

  // States
  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState("saw");
  const [calculationSteps, setCalculationSteps] = useState([]);

  // Handle method selection
  const handleMethodSelect = (methodId) => {
    setCurrentMethod(methodId);
    setShowResults(false);
    setResults([]);
    setCalculationSteps([]);
  };

  // Handle input change
  const handleScoreChange = (jurusanId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${jurusanId}-${criteriaId}`]: parseFloat(value) || 0,
    }));
  };

  // Get max value for each criteria
  const getMaxValue = (criteriaId) => {
    let maxValue = 0;
    jurusan.forEach((j) => {
      const score = scores[`${j.id}-${criteriaId}`] || 0;
      maxValue = Math.max(maxValue, score);
    });
    return maxValue;
  };

  // Get min value for each criteria
  const getMinValue = (criteriaId) => {
    let minValue = Infinity;
    jurusan.forEach((j) => {
      const score = scores[`${j.id}-${criteriaId}`] || 0;
      if (score > 0) minValue = Math.min(minValue, score);
    });
    return minValue === Infinity ? 0 : minValue;
  };

  // Normalize value based on criteria type
  const normalize = (value, criteriaId, criteriaType) => {
    const maxValue = getMaxValue(criteriaId);
    const minValue = getMinValue(criteriaId);

    if (maxValue === 0) return 0;

    if (criteriaType === "benefit") {
      return value / maxValue;
    } else {
      return minValue / value;
    }
  };

  // Calculate SAW
  const calculateSAW = () => {
    // Step 1: Create decision matrix
    const decisionMatrix = jurusan.map((j) => ({
      jurusan: j.name,
      values: criteria.map((c) => ({
        criteria: c.name,
        value: scores[`${j.id}-${c.id}`] || 0,
        weight: c.weight,
        type: c.type,
      })),
    }));

    // Step 2: Normalization matrix
    const normalizedMatrix = jurusan.map((j) => ({
      jurusan: j.name,
      values: criteria.map((c) => {
        const value = scores[`${j.id}-${c.id}`] || 0;
        return {
          criteria: c.name,
          original: value,
          normalized: normalize(value, c.id, c.type),
          weight: c.weight,
          type: c.type,
        };
      }),
    }));

    // Step 3: Weighted normalization and final calculation
    const weightedCalculations = jurusan.map((j) => {
      const calculations = criteria.map((c) => {
        const value = scores[`${j.id}-${c.id}`] || 0;
        const normalized = normalize(value, c.id, c.type);
        const weighted = normalized * c.weight;
        return {
          criteria: c.name,
          original: value,
          normalized,
          weight: c.weight,
          weighted,
          type: c.type,
        };
      });

      const totalScore = calculations.reduce(
        (sum, calc) => sum + calc.weighted,
        0
      );

      return {
        jurusan: j.name,
        calculations,
        totalScore,
      };
    });

    // Set calculation steps for display
    setCalculationSteps([
      {
        title: "1. Matriks Keputusan",
        description: "Matriks awal dari nilai yang diinputkan:",
        data: decisionMatrix,
      },
      {
        title: "2. Normalisasi Matriks",
        description:
          "Untuk kriteria benefit: Rij = Xij / max(Xi)\nUntuk kriteria cost: Rij = min(Xi) / Xij",
        data: normalizedMatrix,
      },
      {
        title: "3. Pembobotan dan Hasil Akhir",
        description: "Vi = Σ(Wj × Rij)",
        data: weightedCalculations,
      },
    ]);

    // Set final results
    const sortedResults = weightedCalculations
      .map((calc) => ({
        jurusan: calc.jurusan,
        score: calc.totalScore,
      }))
      .sort((a, b) => b.score - a.score);

    setResults(sortedResults);
    setShowResults(true);
  };

  const resetForm = () => {
    setScores({});
    setResults([]);
    setShowResults(false);
    setCalculationSteps([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Sistem Pendukung Keputusan Pemilihan Jurusan
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>Metode {currentMethod.toUpperCase()}</span>
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

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Panduan Penilaian:</h2>
          <p>Nilai 1 = Sangat Buruk</p>
          <p>Nilai 2 = Buruk</p>
          <p>Nilai 3 = Cukup</p>
          <p>Nilai 4 = Baik</p>
          <p>Nilai 5 = Sangat Baik</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Jurusan</th>
                {criteria.map((c) => (
                  <th key={c.id} className="border p-2">
                    {c.name} ({(c.weight * 100).toFixed(0)}%)
                    <br />
                    <span className="text-xs text-gray-500">({c.type})</span>
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
            onClick={calculateSAW}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Hitung Hasil
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Reset
          </button>
        </div>

        {showResults &&
          calculationSteps.map((step, stepIndex) => (
            <div
              key={stepIndex}
              className="mt-8 bg-white p-6 rounded-lg shadow"
            >
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-600 mb-4 whitespace-pre-line">
                {step.description}
              </p>

              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2">Alternatif</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="border p-2">
                        {c.name}
                        <br />
                        <span className="text-xs text-gray-500">
                          ({c.type})
                        </span>
                      </th>
                    ))}
                    {stepIndex === 2 && <th className="border p-2">Total</th>}
                  </tr>
                </thead>
                <tbody>
                  {step.data.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td className="border p-2">{item.jurusan}</td>
                      {stepIndex === 0 &&
                        item.values.map((val, valIndex) => (
                          <td key={valIndex} className="border p-2 text-center">
                            {val.value}
                          </td>
                        ))}
                      {stepIndex === 1 &&
                        item.values.map((val, valIndex) => (
                          <td key={valIndex} className="border p-2 text-center">
                            <div>{val.normalized.toFixed(4)}</div>
                            <div className="text-xs text-gray-500">
                              {val.type === "benefit"
                                ? `${val.original} / max`
                                : `min / ${val.original}`}
                            </div>
                          </td>
                        ))}
                      {stepIndex === 2 && (
                        <>
                          {item.calculations.map((calc, calcIndex) => (
                            <td
                              key={calcIndex}
                              className="border p-2 text-center"
                            >
                              <div>{calc.weighted.toFixed(4)}</div>
                              <div className="text-xs text-gray-500">
                                {calc.normalized.toFixed(4)} × {calc.weight}
                              </div>
                            </td>
                          ))}
                          <td className="border p-2 text-center font-bold">
                            {item.totalScore.toFixed(4)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {showResults && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">
              Hasil Akhir Perhitungan SAW
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Peringkat</th>
                  <th className="border p-2">Jurusan</th>
                  <th className="border p-2">Skor</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={index === 0 ? "bg-green-50" : ""}>
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{result.jurusan}</td>
                    <td className="border p-2 text-center">
                      {(result.score * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-lg">
                Rekomendasi jurusan terbaik adalah{" "}
                <strong>{results[0]?.jurusan}</strong> dengan skor{" "}
                <strong>{(results[0]?.score * 100).toFixed(2)}%</strong>
              </p>
            </div>
          </div>
        )}

        <MethodSwitcherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectMethod={handleMethodSelect}
        />
      </div>
    </div>
  );
};

export default SPKJurusan;
