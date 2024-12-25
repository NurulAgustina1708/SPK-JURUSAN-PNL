import React, { useState } from "react";
import MethodSwitcher from "../component/PopUp";

const TOPSISPage = () => {
  // Data jurusan
  const jurusan = [
    { id: 1, name: "TIK (Teknologi Informasi dan Komunikasi)" },
    { id: 2, name: "Teknik Sipil" },
    { id: 3, name: "Teknik Elektro" },
    { id: 4, name: "Teknik Kimia" },
    { id: 5, name: "Bisnis" },
    { id: 6, name: "Teknik Mesin" },
  ];

  // Kriteria dengan tipe (benefit/cost)
  const criteria = [
    { id: 1, name: "Nilai Akademik", weight: 0.3, type: "benefit" },
    { id: 2, name: "Minat Siswa", weight: 0.25, type: "benefit" },
    { id: 3, name: "Peluang Karir", weight: 0.2, type: "benefit" },
    { id: 4, name: "Daya Tampung", weight: 0.15, type: "benefit" },
    { id: 5, name: "Persyaratan", weight: 0.1, type: "cost" },
  ];

  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const handleScoreChange = (jurusanId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${jurusanId}-${criteriaId}`]: parseFloat(value) || 0,
    }));
  };

  const calculateTOPSIS = () => {
    const steps = [];

    // Step 1: Create decision matrix
    const decisionMatrix = jurusan.map((j) =>
      criteria.map((c) => scores[`${j.id}-${c.id}`] || 0)
    );

    steps.push({
      title: "1. Matriks Keputusan",
      description:
        "Membentuk matriks keputusan yang ternormalisasi dari nilai yang diinputkan",
      data: {
        matrix: decisionMatrix,
        jurusan: jurusan,
        criteria: criteria,
      },
    });

    // Step 2: Calculate normalized matrix
    const normalizedMatrix = decisionMatrix.map((row) => {
      return row.map((value, colIndex) => {
        const squareSum = Math.sqrt(
          decisionMatrix.reduce(
            (sum, curr) => sum + Math.pow(curr[colIndex], 2),
            0
          )
        );
        return value / squareSum;
      });
    });

    steps.push({
      title: "2. Normalisasi Matriks",
      description: "Rij = Xij / √(Σ(Xij²))",
      data: {
        matrix: normalizedMatrix,
        jurusan: jurusan,
        criteria: criteria,
        original: decisionMatrix,
      },
    });

    // Step 3: Calculate weighted normalized matrix
    const weightedMatrix = normalizedMatrix.map((row) => {
      return row.map((value, colIndex) => value * criteria[colIndex].weight);
    });

    steps.push({
      title: "3. Matriks Ternormalisasi Terbobot",
      description: "Yij = Wj × Rij",
      data: {
        matrix: weightedMatrix,
        jurusan: jurusan,
        criteria: criteria,
        weights: criteria.map((c) => c.weight),
      },
    });

    // Step 4: Determine ideal solutions
    const idealPositive = weightedMatrix[0].map((_, colIndex) => {
      const values = weightedMatrix.map((row) => row[colIndex]);
      return criteria[colIndex].type === "benefit"
        ? Math.max(...values)
        : Math.min(...values);
    });

    const idealNegative = weightedMatrix[0].map((_, colIndex) => {
      const values = weightedMatrix.map((row) => row[colIndex]);
      return criteria[colIndex].type === "benefit"
        ? Math.min(...values)
        : Math.max(...values);
    });

    steps.push({
      title: "4. Solusi Ideal Positif (A+) dan Negatif (A-)",
      description:
        "A+ = max(yij) jika j adalah benefit; min(yij) jika j adalah cost\nA- = min(yij) jika j adalah benefit; max(yij) jika j adalah cost",
      data: {
        idealPositive,
        idealNegative,
        criteria: criteria,
      },
    });

    // Step 5: Calculate distances
    const positiveDistances = weightedMatrix.map((row) =>
      Math.sqrt(
        row.reduce(
          (sum, value, index) =>
            sum + Math.pow(value - idealPositive[index], 2),
          0
        )
      )
    );

    const negativeDistances = weightedMatrix.map((row) =>
      Math.sqrt(
        row.reduce(
          (sum, value, index) =>
            sum + Math.pow(value - idealNegative[index], 2),
          0
        )
      )
    );

    steps.push({
      title: "5. Jarak dengan Solusi Ideal",
      description: "D+ = √(Σ(yi - yi+)²)\nD- = √(Σ(yi - yi-)²)",
      data: {
        positiveDistances,
        negativeDistances,
        jurusan: jurusan,
      },
    });

    // Step 6: Calculate relative closeness
    const topsisScores = positiveDistances.map((dp, index) => {
      const dn = negativeDistances[index];
      return {
        jurusan: jurusan[index].name,
        positiveDistance: dp,
        negativeDistance: dn,
        score: dn / (dp + dn),
      };
    });

    steps.push({
      title: "6. Nilai Preferensi",
      description: "Vi = D- / (D+ + D-)",
      data: topsisScores,
    });

    setCalculationSteps(steps);
    setResults(topsisScores.sort((a, b) => b.score - a.score));
    setShowResults(true);
  };

  const resetForm = () => {
    setScores({});
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SPK - Metode TOPSIS</h1>
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
          <p>
            TOPSIS (Technique for Order of Preference by Similarity to Ideal
            Solution) menentukan alternatif terbaik berdasarkan kedekatan dengan
            solusi ideal positif dan jarak dari solusi ideal negatif.
          </p>
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
            onClick={calculateTOPSIS}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Hitung TOPSIS
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
              className="mt-8 bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {step.description}
                </pre>
              </div>
              {/* Step 1: Decision Matrix */}
              {stepIndex === 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        {step.data.criteria.map((c) => (
                          <th key={c.id} className="border p-2">
                            {c.name}
                            <br />
                            <span className="text-xs text-gray-500">
                              ({c.type})
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.matrix.map((row, i) => (
                        <tr key={i}>
                          <td className="border p-2">
                            {step.data.jurusan[i].name}
                          </td>
                          {row.map((value, j) => (
                            <td key={j} className="border p-2 text-center">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Step 2: Normalized Matrix */}
              {stepIndex === 1 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        {step.data.criteria.map((c) => (
                          <th key={c.id} className="border p-2">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.matrix.map((row, i) => (
                        <tr key={i}>
                          <td className="border p-2">
                            {step.data.jurusan[i].name}
                          </td>
                          {row.map((value, j) => (
                            <td key={j} className="border p-2 text-center">
                              <div>{value.toFixed(4)}</div>
                              <div className="text-xs text-gray-500">
                                {step.data.original[i][j]} / √Σ
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Step 3: Weighted Normalized Matrix */}
              {stepIndex === 2 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        {step.data.criteria.map((c) => (
                          <th key={c.id} className="border p-2">
                            {c.name}
                            <br />
                            <span className="text-xs text-gray-500">
                              (w = {c.weight})
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.matrix.map((row, i) => (
                        <tr key={i}>
                          <td className="border p-2">
                            {step.data.jurusan[i].name}
                          </td>
                          {row.map((value, j) => (
                            <td key={j} className="border p-2 text-center">
                              {value.toFixed(4)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Step 4: Ideal Solutions */}
              {stepIndex === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Solusi Ideal Positif (A+)
                      </h4>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            {step.data.criteria.map((c) => (
                              <th key={c.id} className="border p-2">
                                {c.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {step.data.idealPositive.map((value, i) => (
                              <td key={i} className="border p-2 text-center">
                                {value.toFixed(4)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Solusi Ideal Negatif (A-)
                      </h4>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            {step.data.criteria.map((c) => (
                              <th key={c.id} className="border p-2">
                                {c.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {step.data.idealNegative.map((value, i) => (
                              <td key={i} className="border p-2 text-center">
                                {value.toFixed(4)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {/* Step 5: Distances */}
              {stepIndex === 4 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        <th className="border p-2">
                          D+ (Jarak ke Solusi Ideal Positif)
                        </th>
                        <th className="border p-2">
                          D- (Jarak ke Solusi Ideal Negatif)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.jurusan.map((j, i) => (
                        <tr key={i}>
                          <td className="border p-2">{j.name}</td>
                          <td className="border p-2 text-center">
                            {step.data.positiveDistances[i].toFixed(4)}
                          </td>
                          <td className="border p-2 text-center">
                            {step.data.negativeDistances[i].toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Step 6: Preference Values */}
              {stepIndex === 5 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        <th className="border p-2">D+</th>
                        <th className="border p-2">D-</th>
                        <th className="border p-2">Nilai Preferensi (Vi)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.map((result, i) => (
                        <tr key={i}>
                          <td className="border p-2">{result.jurusan}</td>
                          <td className="border p-2 text-center">
                            {result.positiveDistance.toFixed(4)}
                          </td>
                          <td className="border p-2 text-center">
                            {result.negativeDistance.toFixed(4)}
                          </td>
                          <td className="border p-2 text-center font-medium bg-blue-50">
                            {result.score.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        {showResults && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Hasil Akhir TOPSIS</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Peringkat</th>
                  <th className="border p-2">Alternatif</th>
                  <th className="border p-2">Nilai Preferensi (Vi)</th>
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
                      {(result.score * 100).toFixed(2)}%
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
                  {(results[0]?.score * 100).toFixed(2)}%
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

export default TOPSISPage;
