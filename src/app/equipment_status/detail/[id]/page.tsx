"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";

const EquipmentStatusDetail = ({ params }: { params: { id: string } }) => {
  const { data: session } = useSession();
  const [EquipmentStatusData, setEquipmentStatusData] = useState({
    equipment_status_code: "",
    equipment_status: ""
  });

  const { id } = params;

  const permissionValue = 4;

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipmentstatus/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
            Permission: permissionValue.toString(),
          },
        });

        if (response.status === 401) {
          signOut({ callbackUrl: "/auth/signin" });
        } else if (response.status === 403) {
          window.location.href = "/";
        }

        const result = await response.json();
        if (response.ok && result.status) {
          setEquipmentStatusData(result.data);
        } else {
          console.error("Error fetching datas:", result.message);
        }
      } catch (error) {
        console.error("Error fetching datas:", error);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Equipment Status Detail
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_status_code"
                    >
                      Equipment Status Code
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="equipment_status_code"
                        id="equipment_status_code"
                        value={EquipmentStatusData.equipment_status_code}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_status"
                    >
                      Equipment Status
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="equipment_status"
                        id="equipment_status"
                        value={EquipmentStatusData.equipment_status}
                        readOnly
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EquipmentStatusDetail;
