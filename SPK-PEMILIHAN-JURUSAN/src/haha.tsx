import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Laptop,
  ChevronRight,
  Filter,
  Award,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrasi Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tipe Data & Konstanta (sama seperti sebelumnya)
interface Laptop {
  id: number;
  name: string;
  price: number;
  processor: number;
  ram: number;
  gpu: number;
  weight: number;
  battery: number;
}

// Tipe Kriteria
interface Kriteria {
  name: string;
  weight: number;
  type: "benefit" | "cost";
}

// Tipe Anggota
interface Anggota {
  id: number;
  name: string;
  method: "SAW" | "WP" | "TOPSIS" | "PM";
}

// Data Awal Laptop
const INITIAL_LAPTOPS: Laptop[] = [
  {
    id: 1,
    name: "Asus ROG Zephyrus",
    price: 25000000,
    processor: 9,
    ram: 32,
    gpu: 9,
    weight: 2.1,
    battery: 6,
  },
  {
    id: 2,
    name: "MacBook Pro",
    price: 30000000,
    processor: 8,
    ram: 16,
    gpu: 8,
    weight: 1.6,
    battery: 8,
  },
  {
    id: 3,
    name: "Dell XPS",
    price: 27000000,
    processor: 8,
    ram: 16,
    gpu: 7,
    weight: 1.8,
    battery: 7,
  },
  {
    id: 4,
    name: "Lenovo ThinkPad",
    price: 22000000,
    processor: 7,
    ram: 16,
    gpu: 6,
    weight: 2.0,
    battery: 7,
  },
  {
    id: 5,
    name: "HP Spectre",
    price: 28000000,
    processor: 8,
    ram: 16,
    gpu: 7,
    weight: 1.7,
    battery: 8,
  },
];

// Kriteria Penilaian
const INITIAL_KRITERIA: Kriteria[] = [
  { name: "price", weight: 0.25, type: "cost" },
  { name: "processor", weight: 0.2, type: "benefit" },
  { name: "ram", weight: 0.15, type: "benefit" },
  { name: "gpu", weight: 0.15, type: "benefit" },
  { name: "weight", weight: 0.1, type: "cost" },
  { name: "battery", weight: 0.1, type: "benefit" },
];

// Daftar Anggota Awal
const INITIAL_ANGGOTA: Anggota[] = [
  { id: 1, name: "Anggota 1", method: "SAW" },
  { id: 2, name: "Anggota 2", method: "WP" },
  { id: 3, name: "Anggota 3", method: "TOPSIS" },
  { id: 4, name: "Anggota 4", method: "PM" },
];

// Metode Perhitungan
const metodePerhitungan = {
  SAW: (laptops: Laptop[], kriteria: Kriteria[]) => {
    const normalisasi = laptops.map((laptop) => {
      const skorNormalisasi: any = {};
      kriteria.forEach((k) => {
        const nilaiKolom = laptops.map((l) => l[k.name as keyof Laptop]);
        const nilaiMax = Math.max(...nilaiKolom);
        const nilaiMin = Math.min(...nilaiKolom);

        skorNormalisasi[k.name] =
          k.type === "benefit"
            ? laptop[k.name as keyof Laptop] / nilaiMax
            : nilaiMin / laptop[k.name as keyof Laptop];
      });

      const skorAkhir = kriteria.reduce(
        (total, k) => total + skorNormalisasi[k.name] * k.weight,
        0
      );

      return {
        ...laptop,
        skor: skorAkhir,
      };
    });

    return normalisasi.sort((a, b) => b.skor - a.skor);
  },

  WP: (laptops: Laptop[], kriteria: Kriteria[]) => {
    const normalisasi = laptops.map((laptop) => {
      const skorWP = kriteria.reduce((total, k) => {
        const nilaiKolom = laptops.map((l) => l[k.name as keyof Laptop]);
        const nilaiMax = Math.max(...nilaiKolom);
        const nilaiMin = Math.min(...nilaiKolom);

        const normalisasiNilai =
          k.type === "benefit"
            ? laptop[k.name as keyof Laptop] / nilaiMax
            : nilaiMin / laptop[k.name as keyof Laptop];

        return total * Math.pow(normalisasiNilai, k.weight);
      }, 1);

      return {
        ...laptop,
        skor: skorWP,
      };
    });

    return normalisasi.sort((a, b) => b.skor - a.skor);
  },

  TOPSIS: (laptops: Laptop[], kriteria: Kriteria[]) => {
    // Normalisasi matriks
    const normalisasiMatriks = laptops.map((laptop) => {
      const skorNormalisasi: any = {};
      kriteria.forEach((k) => {
        const nilaiKolom = laptops.map((l) => l[k.name as keyof Laptop]);
        const normalisasi =
          laptop[k.name as keyof Laptop] /
          Math.sqrt(nilaiKolom.reduce((sum, val) => sum + val * val, 0));
        skorNormalisasi[k.name] = normalisasi * k.weight;
      });
      return { ...laptop, skorNormalisasi };
    });

    // Tentukan solusi ideal positif dan negatif
    const solusiIdeal = kriteria.reduce(
      (ideal, k) => {
        const nilaiKolom = normalisasiMatriks.map(
          (l) => l.skorNormalisasi[k.name]
        );
        ideal.positif[k.name] =
          k.type === "benefit"
            ? Math.max(...nilaiKolom)
            : Math.min(...nilaiKolom);
        ideal.negatif[k.name] =
          k.type === "benefit"
            ? Math.min(...nilaiKolom)
            : Math.max(...nilaiKolom);
        return ideal;
      },
      { positif: {}, negatif: {} }
    );

    // Hitung jarak
    const hasilAkhir = normalisasiMatriks.map((laptop) => {
      const jarakPositif = Math.sqrt(
        kriteria.reduce(
          (sum, k) =>
            sum +
            Math.pow(
              laptop.skorNormalisasi[k.name] - solusiIdeal.positif[k.name],
              2
            ),
          0
        )
      );
      const jarakNegatif = Math.sqrt(
        kriteria.reduce(
          (sum, k) =>
            sum +
            Math.pow(
              laptop.skorNormalisasi[k.name] - solusiIdeal.negatif[k.name],
              2
            ),
          0
        )
      );

      const skor = jarakNegatif / (jarakPositif + jarakNegatif);
      return { ...laptop, skor };
    });

    return hasilAkhir.sort((a, b) => b.skor - a.skor);
  },

  PM: (laptops: Laptop[], kriteria: Kriteria[]) => {
    // Profile Matching - sederhana
    const normalisasi = laptops.map((laptop) => {
      const skorNormalisasi: any = {};
      kriteria.forEach((k) => {
        const nilaiKolom = laptops.map((l) => l[k.name as keyof Laptop]);
        const target =
          k.type === "benefit"
            ? Math.max(...nilaiKolom)
            : Math.min(...nilaiKolom);

        const gap = laptop[k.name as keyof Laptop] - target;
        const skorGap = gap === 0 ? 5 : gap > 0 ? 4 : gap < 0 ? 3 : 3;

        skorNormalisasi[k.name] = skorGap * k.weight;
      });

      const skorAkhir = Object.values(skorNormalisasi).reduce(
        (a, b) => a + b,
        0
      );
      return { ...laptop, skor: skorAkhir };
    });

    return normalisasi.sort((a, b) => b.skor - a.skor);
  },
};

// Metode GDSS (Group Decision Support System)
const metodeGDSS = {
  Borda: (hasilMetode: any[][]) => {
    // Konversi peringkat ke poin
    const poinMetode = hasilMetode.map((hasil) =>
      hasil.map((laptop, index) => ({
        ...laptop,
        poin: hasilMetode[0].length - index,
      }))
    );

    // Gabungkan poin dari semua metode
    const skorAkhir: { [key: number]: number } = {};
    poinMetode.forEach((hasil) => {
      hasil.forEach((laptop) => {
        skorAkhir[laptop.id] = (skorAkhir[laptop.id] || 0) + laptop.poin;
      });
    });

    // Konversi ke array dan urutkan
    return Object.entries(skorAkhir)
      .map(([id, poin]) => ({
        id: parseInt(id),
        poin,
      }))
      .sort((a, b) => b.poin - a.poin)
      .map((item) => hasilMetode[0].find((laptop) => laptop.id === item.id));
  },

  Copeland: (hasilMetode: any[][]) => {
    // Hitung skor Copeland
    const skorCopeland: { [key: number]: number } = {};

    hasilMetode[0].forEach((laptopA) => {
      let skor = 0;
      hasilMetode[0].forEach((laptopB) => {
        if (laptopA.id !== laptopB.id) {
          // Bandingkan posisi di setiap metode
          const metodeDiManaALebihBaik = hasilMetode.filter(
            (hasil) =>
              hasil.findIndex((l) => l.id === laptopA.id) <
              hasil.findIndex((l) => l.id === laptopB.id)
          );

          skor +=
            metodeDiManaALebihBaik.length > hasilMetode.length / 2 ? 1 : -1;
        }
      });
      skorCopeland[laptopA.id] = skor;
    });

    // Urutkan berdasarkan skor Copeland
    return Object.entries(skorCopeland)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) =>
        hasilMetode[0].find((laptop) => laptop.id === parseInt(id))
      );
  },
};

const PremiumLaptopSPKApp: React.FC = () => {
  const [laptops] = useState(INITIAL_LAPTOPS);
  const [kriteria] = useState(INITIAL_KRITERIA);
  const [anggota, setAnggota] = useState(INITIAL_ANGGOTA);
  const [hasilPerhitungan, setHasilPerhitungan] = useState<any[][]>([]);
  const [hasilAkhir, setHasilAkhir] = useState<any[]>([]);
  const [metodePembobotanAkhir, setMetodePembobotanAkhir] = useState<
    "Borda" | "Copeland"
  >("Borda");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);

  const backgroundControls = useAnimation();
  const containerControls = useAnimation();

  useEffect(() => {
    // Animasi background dinamis
    const backgroundAnimation = async () => {
      while (true) {
        await backgroundControls.start({
          background: [
            "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
            "linear-gradient(45deg, #2575fc 0%, #6a11cb 100%)",
          ],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          },
        });
      }
    };

    backgroundAnimation();
  }, []);

  const hitungSkor = () => {
    const hasil = anggota.map((a) =>
      metodePerhitungan[a.method](laptops, kriteria)
    );
    setHasilPerhitungan(hasil);
    const hasilAkhirGDSS = metodeGDSS[metodePembobotanAkhir](hasil);
    setHasilAkhir(hasilAkhirGDSS);
  };

  const showLaptopDetail = (laptop: Laptop) => {
    setSelectedLaptop(laptop);
    setShowDetailModal(true);
  };

  const chartData = {
    labels: hasilAkhir.map((l) => l.name),
    datasets: [
      {
        label: "Skor Laptop",
        data: hasilAkhir.map((l) => l.skor),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <motion.div
      animate={backgroundControls}
      className="min-h-screen flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold flex items-center">
              <Sparkles className="mr-4 text-yellow-300" />
              Laptop Decision Pro
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/20 hover:bg-white/40 px-6 py-3 rounded-full flex items-center"
            >
              Upgrade Premium <ArrowUpRight className="ml-2" />
            </motion.button>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Konfigurasi Anggota */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Pilih Metode Perhitungan
            </h2>
            {anggota.map((a, index) => (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    {a.name}
                  </span>
                  <select
                    value={a.method}
                    onChange={(e) => {
                      const newAnggota = [...anggota];
                      newAnggota[index].method = e.target.value as any;
                      setAnggota(newAnggota);
                    }}
                    className="bg-white/20 text-white p-2 rounded-lg"
                  >
                    {["SAW", "WP", "TOPSIS", "PM"].map((method) => (
                      <option
                        key={method}
                        value={method}
                        className="bg-gray-800"
                      >
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Hasil & Grafik */}
          <div>
            {hasilAkhir.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Laptop Terbaik
                </h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Chart
                    type="bar"
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: {
                          display: true,
                          text: "Perbandingan Skor Laptop",
                          color: "white",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { color: "white" },
                        },
                        x: {
                          ticks: { color: "white" },
                        },
                      },
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tombol Proses */}
        <div className="p-6 bg-white/5 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={hitungSkor}
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-12 py-4 rounded-full text-xl flex items-center"
          >
            Proses Perhitungan <ChevronRight className="ml-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumLaptopSPKApp;
