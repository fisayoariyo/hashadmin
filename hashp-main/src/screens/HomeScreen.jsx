import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  User,
  HelpCircle,
  Headphones,
  HandCoins,
  MessageCircleQuestion,
  Link2,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import WelcomeHeader from "../components/WelcomeHeader";
import FarmWeatherCard from "../components/FarmWeatherCard";
import AddFarmBanner from "../components/AddFarmBanner";
import ActivityItem from "../components/ActivityItem";
import FarmCard from "../components/FarmCard";
import {
  WeatherCardSkeleton,
  ActivitySkeleton,
  CardSkeleton,
} from "../components/Skeleton";
import { useFarmer } from "../hooks/useFarmer";
import { useFarms } from "../hooks/useFarms";
import { useActivities } from "../hooks/useActivities";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { ROUTES } from "../constants/routes";

const primaryCards = [
  { label: "View My ID", icon: CreditCard, path: ROUTES.ID_CARD },
  { label: "My Profile", icon: User, path: ROUTES.PROFILE },
  { label: "FAQs", icon: HelpCircle, path: ROUTES.HELP },
  { label: "Contact", icon: Headphones, path: ROUTES.HELP },
];

const benefitCards = [
  { label: "Access loans", icon: HandCoins },
  { label: "Get farm support", icon: MessageCircleQuestion },
  { label: "Connect to buyers", icon: Link2 },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  useScrollToTop();
  const { loading: farmerLoading } = useFarmer();
  const { farms, loading: farmsLoading } = useFarms();
  const { activities, loading: activitiesLoading } = useActivities();

  const weatherData =
    farms.length > 0
      ? {
          farmName: farms[0].name,
          location: farms[0].location,
          farmSize: farms[0].size,
          cropType: farms[0].crop,
          expectedYield: "60 Kg",
          temperature: "28°C",
          condition: "Sunny Day",
          conditionType: farms[0].conditionType || "sunny",
          expectedRainfall: "May 10, 2026",
        }
      : null;

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 pb-28 overflow-y-auto scrollbar-hide">
        <WelcomeHeader />

        <div className="px-4">
          {farmsLoading ? (
            <WeatherCardSkeleton />
          ) : weatherData ? (
            <FarmWeatherCard data={weatherData} />
          ) : (
            <AddFarmBanner />
          )}
        </div>

        {!farmsLoading && farms.length > 0 && (
          <div className="px-4">
            <AddFarmBanner />
          </div>
        )}

        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {primaryCards.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="card flex flex-col gap-3 items-start active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center">
                  <Icon size={22} className="text-white" strokeWidth={1.8} />
                </div>
                <span className="font-sans text-sm font-medium text-brand-text-primary">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-brand-text-primary">
              My Farms
            </h2>
            {farms.length > 0 && (
              <button
                onClick={() => navigate(ROUTES.FARMS)}
                className="text-xs text-brand-green font-semibold font-sans"
              >
                See all
              </button>
            )}
          </div>
          {farmsLoading ? (
            <div className="space-y-2.5">
              <CardSkeleton rows={2} />
              <CardSkeleton rows={2} />
            </div>
          ) : farms.length === 0 ? (
            <p className="text-sm text-brand-text-muted font-sans text-center py-3">
              No farms added yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {farms.slice(0, 2).map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  onPress={() => navigate(ROUTES.FARMS)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-brand-text-primary">
              Recent Activities
            </h2>
            {activities.length > 0 && (
              <button
                onClick={() => navigate(ROUTES.ACTIVITIES)}
                className="text-xs text-brand-green font-semibold font-sans"
              >
                See all
              </button>
            )}
          </div>
          {activitiesLoading ? (
            <ActivitySkeleton count={3} />
          ) : activities.length === 0 ? (
            <p className="text-sm text-brand-text-muted font-sans text-center py-3">
              No activities recorded yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {activities.slice(0, 4).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        <div className="px-4">
          <h2 className="font-display font-bold text-lg text-brand-text-primary mb-3">
            Your Benefits
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {benefitCards.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="card flex flex-col gap-3 items-start opacity-70"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center">
                  <Icon size={22} className="text-white" strokeWidth={1.8} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-sm font-medium text-brand-text-primary">
                    {label}
                  </span>
                  <span className="text-[10px] font-sans text-brand-text-muted bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                    Coming soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
