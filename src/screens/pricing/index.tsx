import React, { useEffect, useState } from 'react';
import LoadingComponent from 'src/components/shared/LoadingComponent';
import PlanSingleCard from 'src/components/shared/PlanSingleCard';
import axiosInstance from 'src/helper/AxiosInstance';

export default function index() {
  let rerender: boolean = true;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (!rerender) return;

    (async () => {
      await Promise.all([GetPlans()]).finally(() => setIsLoading(false));
    })();
  }, []);

  async function GetPlans() {
    try {
      const { data } = await axiosInstance.get('plans');
      setPlans(data);
    } catch (error) {}
  }

  if (isLoading) return <LoadingComponent />;
  return (
    <div className="p-8 pt-2">
      <div className="container space-y-10 mx-auto">
        <div className="space-y-4">
          <p className="text-center text-4xl text-title font-bold">Pricing</p>
          <p className="text-center text-lg text-gray-500 max-w-screen-lg mx-auto">
            Choose one of our awesome plans when install our application in your store then we will
            create an account for your automatically then you can change default plan to one of paid
            plans.
          </p>
        </div>
        <div className="grid grid-wrapper gap-4">
          {plans.map((plan: any, index: number) => (
            <PlanSingleCard
              key={index}
              item={plan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
