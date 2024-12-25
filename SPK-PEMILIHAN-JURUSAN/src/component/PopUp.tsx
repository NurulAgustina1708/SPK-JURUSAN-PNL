import React from "react";
import { useNavigate } from "react-router-dom";

const MethodSwitcher = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const methods = [
    {
      id: "saw",
      name: "Simple Additive Weighting (SAW)",
      description:
        "Metode penjumlahan terbobot dari rating kinerja pada setiap alternatif",
      path: "/",
      icon: "⭐",
    },
    {
      id: "topsis",
      name: "TOPSIS",
      description:
        "Technique for Order of Preference by Similarity to Ideal Solution",
      path: "/topsis",
      icon: "🎯",
    },
    {
      id: "pm",
      name: "Profile Matching",
      description: "Metode pencocokan profil berdasarkan gap kompetensi",
      path: "/pm",
      icon: "📊",
    },
    {
      id: "wp",
      name: "Weighted Product",
      description: "Metode perkalian untuk menghubungkan rating atribut",
      path: "/wp",
      icon: "🔢",
    },
    {
      id: "maut",
      name: "Multi-Attribute Utility Theory (MAUT)",
      description:
        "Metode yang menggunakan fungsi utilitas untuk mengkonversi nilai kriteria",
      path: "/maut",
      icon: "📈",
    },
  ];

  if (!isOpen) return null;

  const handleMethodSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Pilih Metode SPK</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.path)}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                      {method.name}
                    </h4>
                    <p className="text-gray-600 mt-1">{method.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodSwitcher;
