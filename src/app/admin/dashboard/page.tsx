"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import userImage1 from "../../../assets/icons/dashboarduser.png";
import userImage2 from "../../../assets/icons/dashboardNewuser.png";
import money from "../../../assets/icons/dashboardmoney.png";
import star from "../../../assets/icons/dashboardStar.png";
import profit from "../../../assets/icons/profitDashboard.png";
import { getDashboardData } from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { useCountry } from "@/app/components/CountryContext";
import Loader from "../components/ui/Loader";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

// Chart.js options for Users Overview (Bar Graph)
const usersOverviewChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "#d6d3d1",
        font: { family: "Kodchasan", size: 12 },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
      grid: { display: false },
    },
    y: {
      ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
      grid: { color: "#71717a" },
      beginAtZero: true,
    },
  },
};

// Chart.js options for Job Applications (Line Graph)
const jobApplicationsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
      grid: { display: false },
    },
    y: {
      ticks: { color: "#d6d3d1", font: { family: "Kodchasan", size: 12 } },
      grid: { color: "#71717a" },
      beginAtZero: true,
    },
  },
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { country } = useCountry();
  const [newDashboardData, setNewDashboardData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardData(
        `${ADMIN_URLS.GET_DASHBOARD_DATA}?country=${country}`,
      );

      if (response.status === 200) {
        console.log("response", response?.data?.data);
        setNewDashboardData(response?.data?.data);
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [country]);

  if (loading || !newDashboardData) {
    return <Loader />;
  }

  const totalTaskCount = newDashboardData.topThreeTasks.reduce(
    (sum: number, task: any) => sum + task.count,
    0,
  );
  const dropOffLevel = newDashboardData.topThreeTasks.map((task: any) => ({
    level: `Task ${task.taskNumber}`,
    percentage:
      totalTaskCount > 0 ? Math.round((task.count / totalTaskCount) * 100) : 0,
  }));

  const usersOverviewChartData = {
    labels: newDashboardData.userOverview.map((user: any) => user.country),
    datasets: [
      {
        label: "Total Users",
        data: newDashboardData.userOverview.map((user: any) => user.totalUsers),
        backgroundColor: "#f43f5e",
      },
      {
        label: "Users With Subscription",
        data: newDashboardData.userOverview.map(
          (user: any) => user.subscribedUsersCount,
        ),
        backgroundColor: "#fecdd3",
      },
    ],
  };

  const jobApplicationsChartData = {
    labels: [
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
    ],
    datasets: [
      {
        data: newDashboardData.jobApplication.map((app: any) => app.count),
        borderColor: "#86efac",
        backgroundColor: "rgba(134, 239, 172, 0.3)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <>
      {" "}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-col justify-center items-center gap-6 w-full max-w-7xl mx-auto min-h-screen">
            {/* Main Content */}
            <div className="flex flex-col justify-start items-start gap-6 w-full">
              {/* Top Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[80px]">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col justify-start items-start gap-2">
                      <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                        Active Users
                      </div>
                      <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                        {newDashboardData.activeUsers.toLocaleString()}
                      </div>
                    </div>
                    <img
                      className="w-8 sm:w-10 h-8 sm:h-10"
                      src={userImage1.src}
                      alt="Active Users Icon"
                    />
                  </div>
                </div>
                <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[80px]">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col justify-start items-start gap-2">
                      <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                        Pending Reviews
                      </div>
                      <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                        {newDashboardData.pendingReviews.toLocaleString()}
                      </div>
                    </div>
                    <img
                      className="w-8 sm:w-10 h-8 sm:h-10"
                      src={star.src}
                      alt="Pending Reviews Icon"
                    />
                  </div>
                </div>
                <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[80px]">
                  <div className="flex flex-col justify-start items-start gap-2 w-full">
                    <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                      Subscribed Users
                    </div>
                    <div className="flex flex-col lg:flex-row flex-wrap justify-start items-start gap-2 w-full">
                      {/* Flex Group */}
                      <div className="flex flex-col gap-1">
                        <div className="text-stone-400 text-xs font-semibold  uppercase tracking-wide">
                          Flex
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                          {newDashboardData.subscribedUsers
                            .filter((plan: any) => !plan.isCommitment)
                            .map((plan: any, index: number) => (
                              <div
                                key={index}
                                className="flex flex-col justify-center items-start gap-1 min-w-[50px]"
                              >
                                <div className="text-stone-200 text-xs font-semibold  truncate">
                                  {plan.name
                                    .split(" ")
                                    .filter(
                                      (word: string) =>
                                        word.toLowerCase() !== "the",
                                    )
                                    .map((word: string) =>
                                      word[0].toUpperCase(),
                                    )
                                    .join("")}
                                </div>
                                <div className="text-rose-500 text-sm font-extrabold font-['Minork_Sans']">
                                  {plan.count.toLocaleString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Divider - horizontal by default, vertical on lg+ */}
                      <div className="w-full h-px lg:w-px lg:h-auto lg:self-stretch bg-stone-700" />

                      {/* Commitment Group */}
                      <div className="flex flex-col gap-1">
                        <div className="text-stone-400 text-xs font-semibold  uppercase tracking-wide">
                          Commitment
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                          {newDashboardData.subscribedUsers
                            .filter((plan: any) => plan.isCommitment)
                            .map((plan: any, index: number) => (
                              <div
                                key={index}
                                className="flex flex-col justify-center items-start gap-1 min-w-[50px]"
                              >
                                <div className="text-stone-200 text-xs font-semibold  truncate">
                                  {plan.name
                                    .split(" ")
                                    .filter(
                                      (word: string) =>
                                        word.toLowerCase() !== "the",
                                    )
                                    .map((word: string) =>
                                      word[0].toUpperCase(),
                                    )
                                    .join("")}
                                </div>
                                <div className="text-rose-500 text-sm font-extrabold font-['Minork_Sans']">
                                  {plan.count.toLocaleString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Charts and Side Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* Users Overview Chart */}
                <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                    <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                      Users Overview
                    </div>
                    <div className="flex flex-col sm:flex-row justify-start items-center gap-3 sm:gap-5">
                      <div className="flex justify-start items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500" />
                        <div className="text-neutral-300 text-xs font-normal  leading-3">
                          Total Users
                        </div>
                      </div>
                      <div className="flex justify-start items-center gap-2">
                        <div className="w-2 h-2 bg-rose-200" />
                        <div className="text-neutral-300 text-xs font-normal  leading-3">
                          Users With Subscription
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-64 sm:h-72 lg:h-80">
                    <Bar
                      data={usersOverviewChartData}
                      options={usersOverviewChartOptions}
                    />
                  </div>
                </div>

                {/* Side Cards */}
                <div className="grid grid-cols-1 gap-4 w-full">
                  <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[100px]">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col justify-start items-start gap-2">
                        <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                          Revenue this Month
                        </div>
                        <div className="flex flex-col sm:flex-row justify-start items-start gap-3">
                          <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                            €
                            {newDashboardData.revenueThisMonth.eur.toLocaleString()}
                          </div>
                          <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                            £
                            {newDashboardData.revenueThisMonth.gbp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        src={profit.src}
                        alt="Revenue Month Icon"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[100px]">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col justify-start items-start gap-2">
                        <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                          Revenue this Year
                        </div>
                        <div className="flex flex-col sm:flex-row justify-start items-start gap-3">
                          <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                            €
                            {newDashboardData.revenueThisYear.eur.toLocaleString()}
                          </div>
                          <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                            £
                            {newDashboardData.revenueThisYear.gbp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        src={money.src}
                        alt="Revenue Year Icon"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[100px]">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col justify-start items-start gap-2">
                        <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                          New Users This Month
                        </div>
                        <div className="text-rose-500 text-lg sm:text-2xl font-extrabold font-['Minork_Sans']">
                          {newDashboardData.thisMonthUsers.toLocaleString()}
                        </div>
                      </div>
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        src={userImage2.src}
                        alt="New Users Icon"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="grid grid-cols-1 gap-4 w-full">
                  <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[150px]">
                    <div className="flex flex-col justify-start items-start gap-4 w-full">
                      <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                        Jobs Overview
                      </div>
                      <div className="flex flex-col justify-center items-start gap-1 w-full">
                        <div className="text-stone-200 text-xs sm:text-sm font-semibold ">
                          Total Jobs Posted
                        </div>
                        <div className="text-rose-500 text-lg sm:text-2xl font-extrabold font-['Minork_Sans']">
                          {newDashboardData.totalJobs.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-start gap-1 w-full">
                        <div className="text-stone-200 text-xs sm:text-sm font-semibold ">
                          Active Jobs
                        </div>
                        <div className="text-rose-500 text-lg sm:text-2xl font-extrabold font-['Minork_Sans']">
                          {newDashboardData.activeJobs.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-between items-start gap-2.5 w-full min-h-[150px]">
                    <div className="flex flex-col justify-start items-start gap-4 w-full">
                      <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                        Drop off level
                      </div>
                      {dropOffLevel.map((level: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center w-full"
                        >
                          <div className="text-rose-500 text-base sm:text-xl font-extrabold font-['Minork_Sans']">
                            {level.level}
                          </div>
                          <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                            {level.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="flex justify-start items-center w-full">
                    <div className="text-stone-200 text-sm sm:text-base font-semibold ">
                      Job Applications Received
                    </div>
                  </div>
                  <div className="w-full h-64 sm:h-72 lg:h-80">
                    <Line
                      data={jobApplicationsChartData}
                      options={jobApplicationsChartOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
