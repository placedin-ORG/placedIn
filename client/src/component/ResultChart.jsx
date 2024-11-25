import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const ResultChart = ({ data, currentUserAccuracy }) => {
  // Prepare data points for scatter plot
  const scatterData = {
    datasets: [
      {
        label: "Other Students",
        data: data.map((student) => ({
          x: student.accuracy, // Accuracy on X-axis
          y: student.beatPercentage, // Beat percentage on Y-axis
        })),
        backgroundColor: "#2196F3", // Blue color for other students
        pointRadius: 6,
      },
      {
        label: "You",
        data: [
          {
            x: currentUserAccuracy,
            y: data.find((student) => student.accuracy === currentUserAccuracy)?.beatPercentage || 0,
          },
        ],
        backgroundColor: "#4CAF50", // Green color for current user
        pointRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `Accuracy: ${tooltipItem.raw.x}% | Beat: ${tooltipItem.raw.y}%`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Accuracy (%)",
          color: "#555",
          font: { size: 16, weight: "bold" },
        },
        ticks: { stepSize: 10, color: "#555" },
        grid: { color: "rgba(0,0,0,0.1)" },
        min: 0,
        max: 100,
      },
      y: {
        title: {
          display: true,
          text: "Beat Percentage (%)",
          color: "#555",
          font: { size: 16, weight: "bold" },
        },
        ticks: { stepSize: 10, color: "#555" },
        grid: { color: "rgba(0,0,0,0.1)" },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow rounded-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Accuracy vs Beat Percentage
      </h2>
      <Scatter data={scatterData} options={options} />
    </div>
  );
};

export default ResultChart;
