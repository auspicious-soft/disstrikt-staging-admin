// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import userImage1 from "../../../assets/icons/dashboarduser.png";
// import userImage2 from "../../../assets/icons/dashboardNewuser.png";
// import money from "../../../assets/icons/dashboardmoney.png";
// import star from "../../../assets/icons/dashboardStar.png";
// import profit from "../../../assets/icons/profitDashboard.png";
// import { getDashboardData } from "@/services/admin-services";
// import { ADMIN_URLS } from "@/constants/apiUrls";
// import { useCountry } from "@/app/components/CountryContext";
// import Loader from "../components/ui/Loader";

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
// );

// // Chart.js options for Users Overview (Bar Graph)
// const usersOverviewChartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       position: "top" as const,
//       labels: {
//         color: "#d6d3d1",
//         font: { family: "Kodchasan", size: 12 },
//       },
//     },
//   },
//   scales: {
//     x: {
//       ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
//       grid: { display: false },
//     },
//     y: {
//       ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
//       grid: { color: "#71717a" },
//       beginAtZero: true,
//     },
//   },
// };

// // Chart.js options for Job Applications (Line Graph)
// const jobApplicationsChartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: { display: false },
//   },
//   scales: {
//     x: {
//       ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
//       grid: { display: false },
//     },
//     y: {
//       ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
//       grid: { color: "#71717a" },
//       beginAtZero: true,
//     },
//   },
// };

// export default function Dashboard() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const { country } = useCountry();
//   const [newDashboardData, setNewDashboardData] = useState<any>(null);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const response = await getDashboardData(
//         `${ADMIN_URLS.GET_DASHBOARD_DATA}?country=${country}`,
//       );

//       if (response.status === 200) {
//         console.log("response", response?.data?.data);
//         setNewDashboardData(response?.data?.data);
//       }
//     } catch (error) {
//       console.log(error, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, [country]);

//   if (loading || !newDashboardData) {
//     return <Loader />;
//   }

//   const totalTaskCount = newDashboardData.topThreeTasks.reduce(
//     (sum: number, task: any) => sum + task.count,
//     0,
//   );
//   const dropOffLevel = newDashboardData.topThreeTasks.map((task: any) => ({
//     level: `Task ${task.taskNumber}`,
//     percentage:
//       totalTaskCount > 0 ? Math.round((task.count / totalTaskCount) * 100) : 0,
//   }));

//   const usersOverviewChartData = {
//     labels: newDashboardData.userOverview.map((user: any) => user.country),
//     datasets: [
//       {
//         label: "Total Users",
//         data: newDashboardData.userOverview.map((user: any) => user.totalUsers),
//         backgroundColor: "#f43f5e",
//       },
//       {
//         label: "Users With Subscription",
//         data: newDashboardData.userOverview.map(
//           (user: any) => user.subscribedUsersCount,
//         ),
//         backgroundColor: "#fecdd3",
//       },
//     ],
//   };

//   const jobApplicationsChartData = {
//     labels: [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ],
//     datasets: [
//       {
//         data: newDashboardData.jobApplication.map((app: any) => app.count),
//         borderColor: "#86efac",
//         backgroundColor: "rgba(134, 239, 172, 0.3)",
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   };

//   return (
//     <>
//       {" "}
//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           <div className="flex flex-col justify-center items-center gap-6 w-full max-w-7xl mx-auto min-h-screen">
//             {/* Main Content */}
//             <div className="flex flex-col justify-start items-start gap-6 w-full">
//               {/* Top Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
//                 <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[80px]">
//                   <div className="flex justify-between items-center w-full">
//                     <div className="flex flex-col justify-start items-start gap-2">
//                       <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                         Active Users
//                       </div>
//                       <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                         {newDashboardData.activeUsers.toLocaleString()}
//                       </div>
//                     </div>
//                     <img
//                       className="w-8 sm:w-10 h-8 sm:h-10"
//                       src={userImage1.src}
//                       alt="Active Users Icon"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[80px]">
//                   <div className="flex justify-between items-center w-full">
//                     <div className="flex flex-col justify-start items-start gap-2">
//                       <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                         Pending Reviews
//                       </div>
//                       <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                         {newDashboardData.pendingReviews.toLocaleString()}
//                       </div>
//                     </div>
//                     <img
//                       className="w-8 sm:w-10 h-8 sm:h-10"
//                       src={star.src}
//                       alt="Pending Reviews Icon"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[80px]">
//                   <div className="flex flex-col justify-start items-start gap-2 w-full">
//                     <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                       Subscribed Users
//                     </div>
//                     <div className="flex flex-col lg:flex-row flex-wrap justify-start items-start gap-2 w-full">
//                       {/* Flex Group */}
//                       <div className="flex flex-col gap-1">
//                         <div className="text-stone-400 text-xs font-semibold  uppercase tracking-wide">
//                           Flex
//                         </div>
//                         <div className="flex flex-row flex-wrap gap-2">
//                           {newDashboardData.subscribedUsers
//                             .filter((plan: any) => !plan.isCommitment)
//                             .map((plan: any, index: number) => (
//                               <div
//                                 key={index}
//                                 className="flex flex-col justify-center items-start gap-1 min-w-[50px]"
//                               >
//                                 <div className="text-stone-200 text-xs font-semibold  truncate">
//                                   {plan.name
//                                     .split(" ")
//                                     .filter(
//                                       (word: string) =>
//                                         word.toLowerCase() !== "the",
//                                     )
//                                     .map((word: string) =>
//                                       word[0].toUpperCase(),
//                                     )
//                                     .join("")}
//                                 </div>
//                                 <div className="text-rose-500 text-sm font-extrabold font-['Minork_Sans']">
//                                   {plan.count.toLocaleString()}
//                                 </div>
//                               </div>
//                             ))}
//                         </div>
//                       </div>

//                       {/* Divider - horizontal by default, vertical on lg+ */}
//                       <div className="w-full h-px lg:w-px lg:h-auto lg:self-stretch bg-stone-700" />

//                       {/* Commitment Group */}
//                       <div className="flex flex-col gap-1">
//                         <div className="text-stone-400 text-xs font-semibold  uppercase tracking-wide">
//                           Commitment
//                         </div>
//                         <div className="flex flex-row flex-wrap gap-2">
//                           {newDashboardData.subscribedUsers
//                             .filter((plan: any) => plan.isCommitment)
//                             .map((plan: any, index: number) => (
//                               <div
//                                 key={index}
//                                 className="flex flex-col justify-center items-start gap-1 min-w-[50px]"
//                               >
//                                 <div className="text-stone-200 text-xs font-semibold  truncate">
//                                   {plan.name
//                                     .split(" ")
//                                     .filter(
//                                       (word: string) =>
//                                         word.toLowerCase() !== "the",
//                                     )
//                                     .map((word: string) =>
//                                       word[0].toUpperCase(),
//                                     )
//                                     .join("")}
//                                 </div>
//                                 <div className="text-rose-500 text-sm font-extrabold font-['Minork_Sans']">
//                                   {plan.count.toLocaleString()}
//                                 </div>
//                               </div>
//                             ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* Charts and Side Cards */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
//                 {/* Users Overview Chart */}
//                 <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-2.5 w-full">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
//                     <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                       Users Overview
//                     </div>
//                     <div className="flex flex-col sm:flex-row justify-start items-center gap-3 sm:gap-5">
//                       <div className="flex justify-start items-center gap-2">
//                         <div className="w-2 h-2 bg-rose-500" />
//                         <div className="text-neutral-300 text-xs font-normal  leading-3">
//                           Total Users
//                         </div>
//                       </div>
//                       <div className="flex justify-start items-center gap-2">
//                         <div className="w-2 h-2 bg-rose-200" />
//                         <div className="text-neutral-300 text-xs font-normal  leading-3">
//                           Users With Subscription
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="w-full h-64 sm:h-72 lg:h-80">
//                     <Bar
//                       data={usersOverviewChartData}
//                       options={usersOverviewChartOptions}
//                     />
//                   </div>
//                 </div>

//                 {/* Side Cards */}
//                 <div className="grid grid-cols-1 gap-4 w-full">
//                   <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[100px]">
//                     <div className="flex justify-between items-center w-full">
//                       <div className="flex flex-col justify-start items-start gap-2">
//                         <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                           Revenue this Month
//                         </div>
//                         <div className="flex flex-col sm:flex-row justify-start items-start gap-3">
//                           <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                             €
//                             {newDashboardData.revenueThisMonth.eur.toLocaleString()}
//                           </div>
//                           <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                             £
//                             {newDashboardData.revenueThisMonth.gbp.toLocaleString()}
//                           </div>
//                         </div>
//                       </div>
//                       <img
//                         className="w-10 h-10 sm:w-12 sm:h-12"
//                         src={profit.src}
//                         alt="Revenue Month Icon"
//                       />
//                     </div>
//                   </div>
//                   <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[100px]">
//                     <div className="flex justify-between items-center w-full">
//                       <div className="flex flex-col justify-start items-start gap-2">
//                         <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                           Revenue this Year
//                         </div>
//                         <div className="flex flex-col sm:flex-row justify-start items-start gap-3">
//                           <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                             €
//                             {newDashboardData.revenueThisYear.eur.toLocaleString()}
//                           </div>
//                           <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                             £
//                             {newDashboardData.revenueThisYear.gbp.toLocaleString()}
//                           </div>
//                         </div>
//                       </div>
//                       <img
//                         className="w-10 h-10 sm:w-12 sm:h-12"
//                         src={money.src}
//                         alt="Revenue Year Icon"
//                       />
//                     </div>
//                   </div>
//                   <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[100px]">
//                     <div className="flex justify-between items-center w-full">
//                       <div className="flex flex-col justify-start items-start gap-2">
//                         <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                           New Users This Month
//                         </div>
//                         <div className="text-rose-500 text-lg sm:text-2xl font-extrabold font-['Minork_Sans']">
//                           {newDashboardData.thisMonthUsers.toLocaleString()}
//                         </div>
//                       </div>
//                       <img
//                         className="w-10 h-10 sm:w-12 sm:h-12"
//                         src={userImage2.src}
//                         alt="New Users Icon"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Bottom Cards */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
//                 <div className="grid grid-cols-1 gap-4 w-full">
//                   <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[150px]">
//                     <div className="flex flex-col justify-start items-start gap-4 w-full">
//                       <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                         Jobs Overview
//                       </div>
//                       <div className="flex flex-col justify-center items-start gap-1 w-full">
//                         <div className="text-stone-200 text-xs sm:text-sm font-semibold ">
//                           Total Jobs Posted
//                         </div>
//                         <div className="text-rose-500 text-lg sm:text-2xl font-extrabold font-['Minork_Sans']">
//                           {newDashboardData.totalJobs.toLocaleString()}
//                         </div>
//                       </div>
//                       <div className="flex flex-col justify-center items-start gap-1 w-full">
//                         <div className="text-stone-200 text-xs sm:text-sm font-semibold ">
//                           Active Jobs
//                         </div>
//                         <div className="text-rose-500 text-lg sm:text-2xl font-extrabold font-['Minork_Sans']">
//                           {newDashboardData.activeJobs.toLocaleString()}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[150px]">
//                     <div className="flex flex-col justify-start items-start gap-4 w-full">
//                       <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                         Drop off level
//                       </div>
//                       {dropOffLevel.map((level: any, index: number) => (
//                         <div
//                           key={index}
//                           className="flex justify-between items-center w-full"
//                         >
//                           <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
//                             {level.level}
//                           </div>
//                           <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                             {level.percentage}%
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-2.5 w-full">
//                   <div className="flex justify-start items-center w-full">
//                     <div className="text-stone-200 text-sm sm:text-base font-semibold ">
//                       Job Applications Received
//                     </div>
//                   </div>
//                   <div className="w-full h-64 sm:h-72 lg:h-80">
//                     <Line
//                       data={jobApplicationsChartData}
//                       options={jobApplicationsChartOptions}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// }
"use client";

import React from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { BarChart3, Users } from "lucide-react";
import { Line } from "react-chartjs-2";
import Image from "next/image";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const topStats = [
  { label: "Active Users", value: "24,358" },
  { label: "Active Bookings", value: "24" },
  { label: "Upcoming Events", value: "4" },
  { label: "Active Agents", value: "12" },
];

const otherStats = [
  { label: "Booking Requests", value: "84" },
  { label: "Bookings Confirmed", value: "52" },
  { label: "Upcoming Shoots", value: "14" },
  { label: "Upcoming Training Sessions", value: "24" },
  { label: "Upcoming Events", value: "5" },
  { label: "Event Tickets Sold", value: "47" },
];

const newUsers = [
  { role: "Models", new: "1,854", total: "1,854" },
  { role: "Agencies", new: "587", total: "587" },
  { role: "Photographers", new: "458", total: "458" },
  { role: "Stylists", new: "587", total: "587" },
  { role: "Brands", new: "587", total: "587" },
];

const rangeFilters = ["Yesterday", "Last Week", "Last Month", "Last year"];

const cardClass =
  "rounded-md bg-[#111412]/90 shadow-[0_10px_35px_rgba(0,0,0,0.18)]";

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#1c1c1c",
      borderColor: "#44403c",
      borderWidth: 1,
      titleColor: "#e7e5e4",
      bodyColor: "#d6d3d1",
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        color: "#57534e",
      },
      ticks: {
        color: "#d6d3d1",
        font: {
          size: 10,
        },
      },
    },
    y: {
      min: 0,
      max: 350,
      grid: {
        color: "rgba(120, 113, 108, 0.18)",
      },
      border: {
        color: "#57534e",
      },
      ticks: {
        stepSize: 50,
        color: "#d6d3d1",
        font: {
          size: 10,
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
    },
    line: {
      borderWidth: 2,
      tension: 0.42,
    },
  },
};

const jobsChartData: ChartData<"line"> = {
  labels: months,
  datasets: [
    {
      label: "Photographer",
      data: [0, 100, 92, 86, 105, 108, 100, 94, 95, 120, 134, 128],
      borderColor: "#EF4444",
      backgroundColor: "rgba(239, 68, 68, 0.14)",
      fill: true,
    },
    {
      label: "Agent",
      data: [0, 52, 72, 76, 148, 143, 121, 100, 96, 178, 199, 219],
      borderColor: "#D4C500",
      backgroundColor: "rgba(212, 197, 0, 0.22)",
      fill: true,
    },
    {
      label: "Stylist",
      data: [0, 132, 135, 131, 174, 178, 181, 175, 151, 131, 164, 218],
      borderColor: "#12B538",
      backgroundColor: "rgba(18, 181, 56, 0.18)",
      fill: true,
    },
    {
      label: "Designer",
      data: [0, 68, 63, 61, 92, 105, 104, 93, 96, 119, 132, 131],
      borderColor: "#008CFF",
      backgroundColor: "rgba(245, 158, 11, 0.12)",
      fill: true,
    },
    {
      label: "Agency",
      data: [0, 35, 40, 43, 58, 60, 61, 57, 55, 70, 82, 88],
      borderColor: "#FB00FF",
      backgroundColor: "rgba(225, 29, 72, 0.08)",
      fill: true,
    },
  ],
};

const activityChartData: ChartData<"line"> = {
  labels: months,
  datasets: [
    {
      label: "Likes",
      data: [0, 102, 95, 92, 105, 108, 101, 92, 95, 121, 135, 130],
      borderColor: "#DC2626",
      backgroundColor: "rgba(220, 38, 38, 0.11)",
      fill: true,
    },
    {
      label: "Bookings",
      data: [0, 74, 82, 79, 151, 138, 113, 92, 96, 175, 199, 216],
      borderColor: "#D4C500",
      backgroundColor: "rgba(212, 197, 0, 0.22)",
      fill: true,
    },
    {
      label: "Saves",
      data: [0, 138, 132, 136, 180, 178, 181, 176, 151, 132, 164, 216],
      borderColor: "#12B538",
      backgroundColor: "rgba(18, 181, 56, 0.18)",
      fill: true,
    },
    {
      label: "Applicants",
      data: [0, 26, 29, 27, 44, 48, 49, 44, 42, 54, 61, 66],
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.08)",
      fill: true,
    },
  ],
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article
      className={`${cardClass} flex h-[78px] items-center gap-4 p-4 bg-white/5 border-none`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-stone-300">
        <Users className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-100">{label}</p>
        <p className="mt-1 text-2xl font-medium leading-none text-[#EF476F]">
          {value}
        </p>
      </div>
    </article>
  );
}

function ChartLegend({
  items,
  compact = false,
}: {
  items: { label: string; color: string }[];
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-2 text-stone-300 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          <span
            className="h-2 w-2"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ChartPanel({
  title,
  data,
  heightClass,
  showFilters,
  legend,
}: {
  title: string;
  data: ChartData<"line">;
  heightClass: string;
  showFilters?: boolean;
  legend: { label: string; color: string }[];
}) {
  return (
    <section className={`${cardClass} flex min-w-0 flex-col p-4 pb-0 bg-[#141615] border-r-2 border-b-2 border-[#453F3F] `}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-medium text-stone-100">{title}</h2>
        {showFilters ? (
          <div className="flex flex-wrap gap-4 text-xs font-light text-stone-500">
            {rangeFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`pb-1 ${
                  filter === "Last year"
                    ? "border-b border-[#EF476F] text-[#EF476F]"
                    : "hover:text-stone-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        ) : (
          <ChartLegend items={legend} compact />
        )}
      </div>

      <div className={heightClass}>
        <Line data={data} options={chartOptions} />
      </div>

      {showFilters ? <ChartLegend items={legend} /> : null}
    </section>
  );
}

export default function Dashboard() {
  const jobsLegend = [
    { label: "Photographer", color: "#EF4444" },
    { label: "Agent", color: "#D4C500" },
    { label: "Stylist", color: "#12B538" },
    { label: "Designer", color: "#008CFF" },
    { label: "Agency", color: "#FB00FF" },
  ];

  const activityLegend = [
    { label: "Likes", color: "#DC2626" },
    { label: "Bookings", color: "#D4C500" },
    { label: "Saves", color: "#12B538" },
    { label: "Applicants", color: "#3B82F6" },
  ];

  return (
    <main className="w-full text-stone-200">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <ChartPanel
          title="Jobs Posted"
          data={jobsChartData}
          heightClass="h-[360px]"
          showFilters
          legend={jobsLegend}
        />

        <aside className="grid gap-4">
          <section
            className={`${cardClass} flex h-[72px] items-center bg-[#141615] border-r-2 border-b-2 border-[#453F3F] justify-between p-4`}
          >
            <div>
              <p className="text-sm font-medium text-stone-100">
                Revenue This Month
              </p>
              <div className="mt-2 flex gap-4 text-xl font-medium text-[#EF476F]">
                <span>€34,258</span>
                <span>£34,258</span>
              </div>
            </div>
            <Image
              src="/assets/profit-up.png"
              alt="Revenue Graph"
              width={40}
              height={40}
            />
          </section>

          <section className={`${cardClass} grid grid-cols-2 border-r-2 border-b-2 border-[#453F3F] bg-[#141615] gap-4 p-4`}>
            <div>
              <p className="text-sm font-medium text-stone-100">
                Jobs Posted This Month
              </p>
              <p className="mt-2 flex gap-4 text-xl font-medium text-[#EF476F]">2,358</p>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-100">
                Active Jobs
              </p>
              <p className="mt-2 flex gap-4 text-xl font-medium text-[#EF476F]">58</p>
            </div>
          </section>

          <section className={`${cardClass} border-r-2 border-b-2 border-[#453F3F] p-4 bg-[#141615]`}>
            <h2 className="mb-4 text-base font-medium text-stone-100">
              New Users this month
            </h2>
            <div className="grid grid-cols-[1fr_70px_76px] gap-y-2 text-xs font-semibold">
              <span className="text-stone-300 text-xs font-semibold">Role</span>
              <span className="text-right text-stone-300 text-xs font-semibold">New</span>
              <span className="text-right text-stone-300 text-xs font-semibold">Total Active</span>
              {newUsers.map((user) => (
                <React.Fragment key={user.role}>
                  <span className="font-medium text-base text-[#EF476F]">
                    {user.role}
                  </span>
                  <span className="text-right text-sm font-medium text-stone-200">{user.new}</span>
                  <span className="text-right text-sm font-medium text-stone-200">
                    {user.total}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(260px,0.58fr)_minmax(0,1fr)]">
        <section className={`${cardClass} p-4 h-fit bg-[#141615] border-r-2 border-b-2 border-[#453F3F]`}>
          <h2 className="mb-4 text-base font-medium text-stone-100">
            Other Stats
          </h2>
          <div className="space-y-3">
            {otherStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between gap-4 text-base"
              >
                <span className="font-medium text-[#EF476F]">{stat.label}</span>
                <span className="text-stone-300">{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        <ChartPanel
          title="Activity"
          data={activityChartData}
          heightClass="h-[300px]"
          legend={activityLegend}
        />
      </section>
    </main>
  );
}
