import React, { useState } from "react";
import MethodSwitcher from "../component/PopUp";

const MAUTPage = () => {
  // Data jurusan
  const jurusan = [
    { id: 1, name: "TIK (Teknologi Informasi dan Komunikasi)" },
    { id: 2, name: "Teknik Sipil" },
    { id: 3, name: "Teknik Elektro" },
    { id: 4, name: "Teknik Kimia" },
    { id: 5, name: "Bisnis" },
    { id: 6, name: "Teknik Mesin" },
  ];

  // Kriteria dengan type dan range
  const criteria = [
    {
      id: 1,
      name: "Nilai Akademik",
      weight: 0.3,
      type: "benefit",
      min: 1,
      max: 5,
    },
    {
      id: 2,
      name: "Minat Siswa",
      weight: 0.25,
      type: "benefit",
      min: 1,
      max: 5,
    },
    {
      id: 3,
      name: "Peluang Karir",
      weight: 0.2,
      type: "benefit",
      min: 1,
      max: 5,
    },
    {
      id: 4,
      name: "Daya Tampung",
      weight: 0.15,
      type: "benefit",
      min: 1,
      max: 5,
    },
    {
      id: 5,
      name: "Persyaratan",
      weight: 0.1,
      type: "cost",
      min: 1,
      max: 5,
    },
  ];

  // States
  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState([]);

  // Handle input change
  const handleScoreChange = (jurusanId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${jurusanId}-${criteriaId}`]: parseFloat(value) || 0,
    }));
  };

  // Calculate MAUT
const calculateMAUT = () => {
  const steps = [];

  try {
    // Step 1: Create utility matrix
    const utilityMatrix = jurusan.map((j) => {
      const utilities = criteria.map((c) => {
        const value = scores[`${j.id}-${c.id}`] || 0;
        const utility =
          c.type === "benefit"
            ? (value - c.min) / (c.max - c.min)
            : (c.max - value) / (c.max - c.min);
        return {
          criteria: c.name,
          value,
          utility,
          weight: c.weight,
          type: c.type,
        };
      });
      return {
        jurusan: j.name,
        utilities,
      };
    });

    steps.push({
      title: "1. Normalisasi Utilitas",
      description:
        "Untuk kriteria benefit: U(x) = (x - min) / (max - min)\nUntuk kriteria cost: U(x) = (max - x) / (max - min)",
      data: utilityMatrix,
    });

    // Step 2: Calculate weighted utilities
    const weightedMatrix = utilityMatrix.map((item) => {
      const weightedUtils = item.utilities.map((u) => ({
        ...u,
        weightedUtility: u.utility * u.weight,
      }));
      return {
        jurusan: item.jurusan,
        weightedUtilities: weightedUtils,
      };
    });

    steps.push({
      title: "2. Perhitungan Utilitas Terbobot",
      description: "U'(x) = U(x) × w",
      data: weightedMatrix,
    });

    // Step 3: Calculate final preference values
    const finalScores = weightedMatrix.map((item) => {
      const totalUtility = item.weightedUtilities.reduce(
        (sum, u) => sum + u.weightedUtility,
        0
      );
      return {
        jurusan: item.jurusan,
        score: totalUtility,
        details: item.weightedUtilities,
      };
    });

    steps.push({
      title: "3. Nilai Preferensi Akhir",
      description: "V(a) = Σ U'(xi)",
      data: finalScores,
    });

    setCalculationSteps(steps);
    setResults(finalScores.sort((a, b) => b.score - a.score));
    setShowResults(true);
  } catch (error) {
    console.error("Error in MAUT calculation:", error);
    alert(
      "Terjadi kesalahan dalam perhitungan. Silakan cek semua input terlebih dahulu."
    );
  }
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SPK - Metode MAUT</h1>
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

        {/* Description */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-2">
          <p>
            Multi-Attribute Utility Theory (MAUT) menggunakan fungsi utilitas
            untuk mengubah nilai kriteria menjadi nilai utilitas antara 0 dan 1.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-semibold mb-2">Panduan Penilaian:</h3>
              <div className="space-y-1">
                <p>1 = Sangat Buruk</p>
                <p>2 = Buruk</p>
                <p>3 = Cukup</p>
                <p>4 = Baik</p>
                <p>5 = Sangat Baik</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bobot Kriteria:</h3>
              {criteria.map((c) => (
                <p key={c.id}>
                  {c.name}: {(c.weight * 100).toFixed(0)}% ({c.type})
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Input Table */}
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

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={calculateMAUT}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Hitung MAUT
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Reset
          </button>
        </div>

        {/* Calculation Steps */}
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

              {/* Step 1: Utility Matrix */}
              {stepIndex === 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        {criteria.map((c) => (
                          <th key={c.id} className="border p-2">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.map((item, i) => (
                        <tr key={i}>
                          <td className="border p-2">{item.jurusan}</td>
                          {item.utilities.map((u, j) => (
                            <td key={j} className="border p-2 text-center">
                              <div>{u.utility.toFixed(4)}</div>
                              <div className="text-xs text-gray-500">
                                ({u.value})
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Step 2: Weighted Utilities */}
              {stepIndex === 1 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        {criteria.map((c) => (
                          <th key={c.id} className="border p-2">
                            {c.name}
                            <br />
                            <span className="text-xs">(w = {c.weight})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.map((item, i) => (
                        <tr key={i}>
                          <td className="border p-2">{item.jurusan}</td>
                          {item.weightedUtilities.map((u, j) => (
                            <td key={j} className="border p-2 text-center">
                              <div>{u.weightedUtility.toFixed(4)}</div>
                              <div className="text-xs text-gray-500">
                                ({u.utility.toFixed(4)} × {u.weight})
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Step 3: Final Preference Values */}
              {stepIndex === 2 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Alternatif</th>
                        <th className="border p-2">Nilai Preferensi</th>
                        <th className="border p-2">Detail Perhitungan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.data.map((item, i) => (
                        <tr key={i}>
                          <td className="border p-2">{item.jurusan}</td>
                          <td className="border p-2 text-center font-medium">
                            {item.score.toFixed(4)}
                          </td>
                          <td className="border p-2 text-sm">
                            {item.details
                              .map(
                                (d) =>
                                  `${d.criteria}: ${d.weightedUtility.toFixed(
                                    4
                                  )}`
                              )
                              .join(" + ")}
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
            <h3 className="text-xl font-semibold mb-4">Hasil Akhir MAUT</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Peringkat</th>
                  <th className="border p-2">Alternatif</th>
                  <th className="border p-2">Nilai Preferensi</th>
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
              <p className="mt-2 text-sm text-green-600">
                * Nilai preferensi menunjukkan tingkat kesesuaian alternatif
                dengan kriteria yang telah ditentukan
              </p>
            </div>
          </div>
        )}

        {/* Method Switcher Modal */}
        <MethodSwitcher
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default MAUTPage;
