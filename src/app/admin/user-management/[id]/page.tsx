"use client";
import { ReactElement, useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import dummyImg from "../../../../assets/images/LoginImg.jpg";
import dummyImgInTable from "../../../../assets/images/dummyImageInUsers.png";
import ImagesTab from "../user-child-components/ImagesTab";
import VideosTab from "../user-child-components/VideosTab";
import { TableRow } from "../../../../types/interface-types";
import { ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../../assets/icons/Eye.png";
import TransactionTab from "../user-child-components/TransactionTable";
import TaskTab from "../user-child-components/TasksTab";
import AppliedJobTab from "../user-child-components/AppliedJobTab";
import { useParams } from "next/navigation";
import { getUserById } from "@/services/admin-services";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";

const TABS = ["Images", "Videos", "Tasks", "Applied Jobs", "Transactions"];

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  image: string;
  heightCm: string;
  bustCm: number;
  waistCm: number;
  hipsCm: number;
  weightKg: number;
  shoeSizeUK: string;
  country: string;
  phone: string;
  dob?: string | null;
  bio?: string | null;
  gender?: string | null;
  images: {
    setCards: string[];
    images: string[];
  };
  currentPlan: {
    _id: string;
    planId: string;
    status: string;
    nextBillingDate?: string | null; // <-- safer
    amount: number;
    currency: string;
    name?: string | null;
  };
  transactions: {
    _id: string;
    status: string;
    amount: number;
    currency: string;
    paidAt: string;
    planName: string;
    planKey: string;
  }[];
  appliedJobs: {
    _id: string;
    userId: string;
    jobId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    branch: string;
    description: string;
    companyName: string;
    location: string;
    city: string;
    country: string;
    gender: string;
  }[];
  tasks: {
    _id: string;
    reviewed: boolean;
    number: number;
    milestone: number;
    rating: number;
    title: string;
  }[][];
  socialLinks?: {
    platform: string;
    url: string;
    _id: string;
  }[];
  videos?: {
    title: string;
    url: string;
    thumbnail: string;
    _id: string;
  }[];
}

const UserId: React.FC = () => {
  const params = useParams();
  const userId = params?.id;
  const [activeTab, setActiveTab] = useState("Images");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState(dummyImg);

  const fetchUserById = async () => {
    setLoading(true);
    try {
      const response = await getUserById(
        `${ADMIN_URLS.GET_USER_BY_ID}/${userId}`,
      );
      if (response.status === 200) {
        const resData = response.data.data;
        setUserData(resData);
      } else {
        toast.error("Error occurred");
      }
    } catch (err) {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserById();
  }, []);

  const transactionHeaders: TableHeader[] = [
    {
      label: "Subscription Plan",
      key: "subscriptionPlan",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Purchased On",
      key: "purchasedOn",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Next Due",
      key: "nextDue",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Amount",
      key: "amount",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const transactionData: TableRow[] =
    userData?.transactions.map((transaction) => ({
      id: transaction._id,
      subscriptionPlan: transaction.planName,
      purchasedOn: new Date(transaction.paidAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      nextDue: new Date(
        new Date(transaction.paidAt).setMonth(
          new Date(transaction.paidAt).getMonth() + 1,
        ),
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      amount: `${transaction.currency.toUpperCase()} ${transaction.amount.toFixed(
        2,
      )}`,
    })) || [];

  const milestoneData =
    userData?.tasks.map((milestoneTasks, index) => ({
      id: `milestone-${index + 1}`,
      title: `Milestone ${index + 1}`,
      tasks: (milestoneTasks ?? []).map((task) => ({
        id: task._id,
        taskId: task._id,
        title: task.title,
        subtitle: task.title,
        badge: task.reviewed ? `Rating - ${task.rating}` : "Review Task",
        badgeColor: task.reviewed ? "text-rose-200" : "bg-rose-200",
        status: task.reviewed
          ? task.rating
            ? "Reviewed By App"
            : "Reviewed By Admin"
          : task.rating
            ? "Review Pending"
            : "Incomplete",
      })),
    })) || [];

  const jobData =
    userData?.appliedJobs.map((job) => ({
      id: job._id,
      appliedJobId: job.jobId,
      userId: job.userId,
      title: job.title,
      description: job.description,
      company: job.companyName,
      time: new Date(job.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
      }),
      statusColor:
        job.status === "PENDING"
          ? "bg-orange-400"
          : job.status === "APPROVED"
            ? "bg-teal-400"
            : "bg-red-400",
    })) || [];

  const imagesData: (string | StaticImageData)[] = userData?.images?.images
    ?.length
    ? (userData.images.images as string[])
    : [];
  const setCardsData: string[] = userData?.images?.setCards || [];

  const instagramUrl =
    userData?.socialLinks?.find((link) => link.platform === "Instagram")?.url ||
    "N/A";
  const youtubeUrl =
    userData?.socialLinks?.find((link) => link.platform === "Youtube")?.url ||
    "N/A";

  const renderTabContent = () => {
    switch (activeTab) {
      case "Images":
        return <ImagesTab setCards={setCardsData} images={imagesData} />;
      case "Videos":
        return <VideosTab videos={userData.videos || []} />;
      case "Tasks":
        return <TaskTab milestones={milestoneData} />;
      case "Applied Jobs":
        return <AppliedJobTab jobs={jobData} />;
      case "Transactions":
        return (
          <TransactionTab
            headers={transactionHeaders}
            data={transactionData}
            rowIcon={eyeimg.src}
          />
        );
      default:
        return null;
    }
  };

  const imageSrc = userData?.image
    ? userData.image.startsWith("https")
      ? userData.image
      : `${BASE_IMG_URL}${userData.image}`
    : dummyImg;

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-col gap-6 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-shrink-0">
                <Image
                  src={imageSrc}
                  alt="User"
                  width={307}
                  height={434}
                  className="object-cover rounded-[20px] w-full max-w-[200px] sm:max-w-[250px] md:max-w-[307px] h-auto aspect-[307/434] mx-auto md:mx-0"
                />
              </div>
              <div className="flex-1 flex flex-col gap-4 text-stone-200">
                {/* Info rows */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <UserInfo
                    label="Full Name"
                    value={userData.fullName ? userData.fullName : "N/A"}
                  />
                  <UserInfo
                    label="Email Address"
                    value={userData.email ? userData.email : "N/A"}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <UserInfo label="Phone Number" value={userData.phone} />
                  <UserInfo
                    label="Gender"
                    value={
                      userData.gender
                        ? userData.gender.charAt(0).toUpperCase() +
                          userData.gender.slice(1).toLowerCase()
                        : "N/A"
                    }
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <UserInfo
                    label="Height"
                    value={userData.heightCm ? userData.heightCm : "N/A"}
                  />
                  <UserInfo
                    label="Bust, Waist, Hips"
                    value={`${userData.bustCm ? userData.bustCm : "N/A"},${
                      userData.waistCm ? userData.waistCm : "N/A"
                    },${userData.hipsCm ? userData.hipsCm : "N/A"}`}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <UserInfo
                    label="Country"
                    value={userData.country ? userData.country : "N/A"}
                  />

                  <UserInfo
                    label="Shoe Size"
                    value={userData.shoeSizeUK ? userData.shoeSizeUK : "N/A"}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <UserInfo
                    label="Date Of Birth"
                    value={
                      userData.dob
                        ? new Date(userData.dob).toISOString().slice(0, 10)
                        : "N/A"
                    }
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <UserInfo label="Instagram" value={instagramUrl} />
                  <UserInfo label="Youtube" value={youtubeUrl} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-light  leading-tight mt-1">
                    {userData.bio ? userData.bio : "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SubscriptionCard
                    label="Subscription Plan"
                    value={
                      (userData.currentPlan.name &&
                        userData.currentPlan.name) ||
                      "N/A"
                    }
                  />
                  <SubscriptionCard
                    label="Subscription Active for"
                    value={
                      userData.currentPlan.nextBillingDate
                        ? new Date(userData.currentPlan.nextBillingDate)
                            .toISOString()
                            .slice(0, 10)
                        : "N/A"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="bg-neutral-900 p-[3px] rounded-[30px] sm:rounded-[40px] md:rounded-[50px] inline-flex flex-wrap justify-center items-center gap-2 max-w-full">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[100px] sm:min-w-[120px] p-2 sm:p-2.5 rounded-[30px] sm:rounded-[40px] md:rounded-[50px] text-xs sm:text-sm  transition-all duration-200 cursor-pointer text-center ${
                    activeTab === tab
                      ? "bg-rose-500 text-white"
                      : "outline-offset-[-1px] text-stone-200 hover:bg-neutral-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Dynamic Content Section */}
            <div className="rounded-xl w-full">{renderTabContent()}</div>
          </div>
        </>
      )}
    </>
  );
};

const UserInfo = ({ label, value }: { label: string; value: any }) => {
  const stringValue = String(value ?? ""); // always a string
  const isLink =
    stringValue.startsWith("http://") ||
    stringValue.startsWith("https://") ||
    stringValue.startsWith("Http://") ||
    stringValue.startsWith("Https://");

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="text-xs sm:text-sm font-light ">{label}</div>
      {isLink ? (
        <a
          href={stringValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm sm:text-base font-extrabold  text-blue-400 hover:underline"
        >
          Open {label}
        </a>
      ) : (
        <div className="text-sm sm:text-base font-extrabold ">
          {stringValue || "N/A"}
        </div>
      )}
    </div>
  );
};

const SubscriptionCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex-1 p-3 sm:p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col gap-2">
    <div className="text-xs sm:text-sm font-semibold ">{label}</div>
    <div className="text-base sm:text-xl font-extrabold  text-rose-500">
      {value}
    </div>
  </div>
);

export default UserId;
