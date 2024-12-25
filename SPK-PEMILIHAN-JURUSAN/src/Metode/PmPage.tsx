import React, { useState } from "react";
import MethodSwitcher from "../component/PopUp";

const PMPage = () => {
  // Data jurusan
  const jurusan = [
    { id: 1, name: "TIK (Teknologi Informasi dan Komunikasi)" },
    { id: 2, name: "Teknik Sipil" },
    { id: 3, name: "Teknik Elektro" },
    { id: 4, name: "Teknik Kimia" },
    { id: 5, name: "Bisnis" },
    { id: 6, name: "Teknik Mesin" },
  ];

  // Kriteria dengan target value dan factor type
  const criteria = [
    {
      id: 1,
      name: "Nilai Akademik",
      weight: 0.3,
      targetValue: 5,
      factor: "core",
      description: "Nilai akademik yang diharapkan",
    },
    {
      id: 2,
      name: "Minat Siswa",
      weight: 0.25,
      targetValue: 5,
      factor: "core",
      description: "Tingkat minat siswa terhadap jurusan",
    },
    {
      id: 3,
      name: "Peluang Karir",
      weight: 0.2,
      targetValue: 4,
      factor: "secondary",
      description: "Prospek karir di masa depan",
    },
    {
      id: 4,
      name: "Daya Tampung",
      weight: 0.15,
      targetValue: 4,
      factor: "secondary",
      description: "Kapasitas penerimaan jurusan",
    },
    {
      id: 5,
      name: "Persyaratan",
      weight: 0.1,
      targetValue: 3,
      factor: "secondary",
      description: "Kriteria khusus yang dibutuhkan",
    },
  ];

  // States
  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState([]);

  // Konversi GAP ke bobot
  const gapToWeight = (gap) => {
    const weightTable = {
      0: { weight: 5, desc: "Tidak ada selisih (Kompetensi sesuai)" },
      1: { weight: 4.5, desc: "Kompetensi individu kelebihan 1 tingkat" },
      "-1": { weight: 4, desc: "Kompetensi individu kekurangan 1 tingkat" },
      2: { weight: 3.5, desc: "Kompetensi individu kelebihan 2 tingkat" },
      "-2": { weight: 3, desc: "Kompetensi individu kekurangan 2 tingkat" },
      3: { weight: 2.5, desc: "Kompetensi individu kelebihan 3 tingkat" },
      "-3": { weight: 2, desc: "Kompetensi individu kekurangan 3 tingkat" },
      4: { weight: 1.5, desc: "Kompetensi individu kelebihan 4 tingkat" },
      "-4": { weight: 1, desc: "Kompetensi individu kekurangan 4 tingkat" },
    };
    return weightTable[gap] || { weight: 0, desc: "Selisih terlalu besar" };
  };

  // Handle input change
  const handleScoreChange = (jurusanId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${jurusanId}-${criteriaId}`]: parseFloat(value) || 0,
    }));
  };

  // Calculate Profile Matching
  const calculatePM = () => {
    const steps = [];

    // Step 1: Calculate GAPs
    const gapAnalysis = jurusan.map((j) => {
      const gaps = criteria.map((c) => {
        const actualScore = scores[`${j.id}-${c.id}`] || 0;
        const gap = actualScore - c.targetValue;
        const weightInfo = gapToWeight(gap);
        return {
          criteriaName: c.name,
          actualScore,
          targetScore: c.targetValue,
          gap,
          weight: weightInfo.weight,
          description: weightInfo.desc,
          factor: c.factor,
        };
      });

      return {
        jurusan: j.name,
        gaps,
      };
    });

    steps.push({
      title: "1. Perhitungan GAP",
      description:
        "GAP = Nilai Aktual - Nilai Target\nMenghitung selisih antara profil jurusan dengan profil yang diharapkan",
      data: gapAnalysis,
    });

    // Step 2: Calculate Core and Secondary Factors
    const factorCalculations = gapAnalysis.map((analysis) => {
      const coreFactors = analysis.gaps.filter(
        (g) => criteria.find((c) => c.name === g.criteriaName).factor === "core"
      );
      const secondaryFactors = analysis.gaps.filter(
        (g) =>
          criteria.find((c) => c.name === g.criteriaName).factor === "secondary"
      );

      const coreAvg =
        coreFactors.reduce((sum, gap) => sum + gap.weight, 0) /
        coreFactors.length;
      const secondaryAvg =
        secondaryFactors.reduce((sum, gap) => sum + gap.weight, 0) /
        secondaryFactors.length;

      return {
        jurusan: analysis.jurusan,
        coreFactors,
        secondaryFactors,
        coreAvg,
        secondaryAvg,
      };
    });

    steps.push({
      title: "2. Pengelompokan Core dan Secondary Factor",
      description:
        "NCF = ΣNC/ΣIC\nNSF = ΣNS/ΣIS\nDimana:\nNCF = Nilai rata-rata core factor\nNSF = Nilai rata-rata secondary factor",
      data: factorCalculations,
    });

    // Step 3: Calculate Final Score
    const finalScores = factorCalculations.map((calc) => {
      const finalScore = 0.6 * calc.coreAvg + 0.4 * calc.secondaryAvg;
      return {
        jurusan: calc.jurusan,
        coreScore: calc.coreAvg,
        secondaryScore: calc.secondaryAvg,
        finalScore,
        details: {
          coreCalculation: `0.6 × ${calc.coreAvg.toFixed(2)}`,
          secondaryCalculation: `0.4 × ${calc.secondaryAvg.toFixed(2)}`,
        },
      };
    });

    steps.push({
      title: "3. Perhitungan Nilai Akhir",
      description: "Nilai Akhir = (60% × NCF) + (40% × NSF)",
      data: finalScores,
    });

    setCalculationSteps(steps);
    setResults(finalScores.sort((a, b) => b.finalScore - a.finalScore));
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SPK - Metode Profile Matching</h1>
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

        {/* Information Panel */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <h3 className="font-semibold mb-2">Bobot Faktor:</h3>
              <p>Core Factor: 60%</p>
              <p>Secondary Factor: 40%</p>
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
                      ({c.factor}) Target: {c.targetValue}
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
            onClick={calculatePM}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Hitung Profile Matching
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

              {stepIndex === 0 && (
                <div className="space-y-4">
                  {step.data.map((analysis, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{analysis.jurusan}</h4>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2">Kriteria</th>
                            <th className="border p-2">Nilai</th>
                            <th className="border p-2">Target</th>
                            <th className="border p-2">GAP</th>
                            <th className="border p-2">Bobot</th>
                            <th className="border p-2">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.gaps.map((gap, gapIndex) => (
                            <tr key={gapIndex}>
                              <td className="border p-2">{gap.criteriaName}</td>
                              <td className="border p-2 text-center">
                                {gap.actualScore}
                              </td>
                              <td className="border p-2 text-center">
                                {gap.targetScore}
                              </td>
                              <td className="border p-2 text-center">
                                {gap.gap}
                              </td>
                              <td className="border p-2 text-center">
                                {gap.weight}
                              </td>
                              <td className="border p-2">{gap.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {stepIndex === 1 && (
                <div className="space-y-4">
                  {step.data.map((calc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{calc.jurusan}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Core Factors:</h5>
                          <ul className="list-disc list-inside">
                            {calc.coreFactors.map((factor, i) => (
                              <li key={i}>
                                {factor.criteriaName}: {factor.weight}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2">
                            Rata-rata Core: {calc.coreAvg.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">
                            Secondary Factors:
                          </h5>
                          <ul className="list-disc list-inside">
                            {calc.secondaryFactors.map((factor, i) => (
                              <li key={i}>
                                {factor.criteriaName}: {factor.weight}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2">
                            Rata-rata Secondary: {calc.secondaryAvg.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-4">
                  {step.data.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{result.jurusan}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p>
                            Core Factor: {result.details.coreCalculation} ={" "}
                            {(0.6 * result.coreScore).toFixed(2)}
                          </p>
                          <p>
                            Secondary Factor:{" "}
                            {result.details.secondaryCalculation} ={" "}
                            {(0.4 * result.secondaryScore).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            Nilai Akhir: {result.finalScore.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Final Results */}
        {showResults && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">
              Hasil Akhir Profile Matching
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Peringkat</th>
                  <th className="border p-2">Jurusan</th>
                  <th className="border p-2">Core Factor</th>
                  <th className="border p-2">Secondary Factor</th>
                  <th className="border p-2">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={index === 0 ? "bg-green-50" : ""}>
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{result.jurusan}</td>
                    <td className="border p-2 text-center">
                      {result.coreScore.toFixed(2)}
                    </td>
                    <td className="border p-2 text-center">
                      {result.secondaryScore.toFixed(2)}
                    </td>
                    <td className="border p-2 text-center font-semibold">
                      {result.finalScore.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-lg">
                Rekomendasi jurusan terbaik berdasarkan Profile Matching adalah{" "}
                <strong>{results[0]?.jurusan}</strong> dengan nilai{" "}
                <strong>{results[0]?.finalScore.toFixed(2)}</strong>
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

export default PMPage;
