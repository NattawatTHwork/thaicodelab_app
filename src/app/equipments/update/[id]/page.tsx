"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";
import Select from "react-select";

type EquipmentGroup = {
  equipment_group_id: number;
  equipment_group_code: string;
  equipment_group: string;
}

type EquipmentType = {
  equipment_type_id: number;
  equipment_type_code: string;
  equipment_type: string;
}

type EquipmentStatus = {
  equipment_status_id: number;
  equipment_status_code: string;
  equipment_status: string;
}

const EquipmentUpdate = ({ params }: { params: { id: string } }) => {
  const { data: session } = useSession();
  const [equipmentGroups, setEquipmentGroups] = useState<EquipmentGroup[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [equipmentStatuses, setEquipmentStatuses] = useState<EquipmentStatus[]>([]);
  const [formData, setFormData] = useState({
    equipment_code: "",
    equipment_unique_code: "",
    equipment: "",
    description: "",
    equipment_group_id: "",
    equipment_type_id: "",
    equipment_status_id: ""
  });

  const { id } = params;

  const permissionValue = 3;

  useEffect(() => {
    fetchData();
    fetchSelectData("/equipmentgroup", setEquipmentGroups);
    fetchSelectData("/equipmenttype", setEquipmentTypes);
    fetchSelectData("/equipmentstatus", setEquipmentStatuses);
  }, [session]);

  const fetchData = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipment/${id}`, {
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
          const mappedFormData = {
            equipment_code: result.data.equipment_code,
            equipment_unique_code: result.data.equipment_unique_code,
            equipment: result.data.equipment,
            description: result.data.description,
            equipment_group_id: result.data.equipment_group_id,
            equipment_type_id: result.data.equipment_type_id,
            equipment_status_id: result.data.equipment_status_id
          };
          setFormData(mappedFormData);
        } else {
          console.error("Error fetching genders:", result.message);
        }
      } catch (error) {
        console.error("Error fetching genders:", error);
      }
    }
  };

  const fetchSelectData = async (url: string, setter: (data: any) => void) => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
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
          setter(result.data);
        } else {
          console.error(`Error fetching ${url}:`, result.message);
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    }
  };

  const equipmentGroupOptions = equipmentGroups.map((group) => ({
    value: String(group.equipment_group_id),
    label: group.equipment_group,
  }));

  const equipmentTypeOptions = equipmentTypes.map((type) => ({
    value: String(type.equipment_type_id),
    label: type.equipment_type,
  }));

  const equipmentStatusOptions = equipmentStatuses.map((status) => ({
    value: String(status.equipment_status_id),
    label: status.equipment_status,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    return formData.equipment_unique_code.trim() !== "" && formData.equipment.trim() !== "" && formData.equipment_group_id !== "" && formData.equipment_type_id !== "" && formData.equipment_status_id !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Data",
        text: "Please fill out all fields before submitting!",
      });
      return;
    }

    // ส่งข้อมูลไปยัง API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipment/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "application/json",
          Permission: permissionValue.toString(),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Equipment has been updated successfully!",
        });
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred!",
      });
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Equipment Update
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_code"
                    >
                      Equipment Code
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="equipment_code"
                        id="equipment_code"
                        value={formData.equipment_code}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_unique_code"
                    >
                      Equipment Unique Code
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="equipment_unique_code"
                        id="equipment_unique_code"
                        placeholder="ATX-0001ZA"
                        value={formData.equipment_unique_code}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment"
                    >
                      Equipment
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="equipment"
                        id="equipment"
                        placeholder="Laptop"
                        value={formData.equipment}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_group_id"
                    >
                      Equipment Group
                    </label>
                    <Select
                      id="equipment_group_id"
                      name="equipment_group_id"
                      options={equipmentGroupOptions}
                      value={equipmentGroupOptions.find((option) => option.value === String(formData.equipment_group_id)) || null}
                      onChange={(selectedOption) => handleChange({ name: "equipment_group_id", value: selectedOption?.value || "" })}
                      classNamePrefix="react-select"
                      placeholder="Select Equipment Group"
                      classNames={{
                        control: ({ isFocused }) =>
                          `w-full rounded border px-2 py-2 transition-all ${isFocused
                            ? "border-primary"
                            : "border-stroke dark:border-strokedark"
                          } text-black dark:text-white dark:bg-meta-4 dark:focus:border-primary`,
                        menu: () => "bg-white dark:bg-meta-4 rounded shadow-md border border-stroke dark:border-strokedark",
                        option: ({ isFocused, isSelected }) =>
                          `px-4.5 py-3 transition-all ${isSelected
                            ? "bg-primary text-white"
                            : isFocused
                              ? "bg-gray-100 dark:bg-gray-700"
                              : "text-black dark:text-white"
                          }`,
                        singleValue: () => "text-black dark:text-white",
                        placeholder: () => "text-gray-400 dark:text-gray-500",
                        dropdownIndicator: () => "text-primary",
                      }}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_type_id"
                    >
                      Equipment Type
                    </label>
                    <Select
                      id="equipment_type_id"
                      name="equipment_type_id"
                      options={equipmentTypeOptions}
                      value={equipmentTypeOptions.find((option) => option.value === String(formData.equipment_type_id)) || null}
                      onChange={(selectedOption) => handleChange({ name: "equipment_type_id", value: selectedOption?.value || "" })}
                      classNamePrefix="react-select"
                      placeholder="Select Equipment Type"
                      classNames={{
                        control: ({ isFocused }) =>
                          `w-full rounded border px-2 py-2 transition-all ${isFocused
                            ? "border-primary"
                            : "border-stroke dark:border-strokedark"
                          } text-black dark:text-white dark:bg-meta-4 dark:focus:border-primary`,
                        menu: () => "bg-white dark:bg-meta-4 rounded shadow-md border border-stroke dark:border-strokedark",
                        option: ({ isFocused, isSelected }) =>
                          `px-4.5 py-3 transition-all ${isSelected
                            ? "bg-primary text-white"
                            : isFocused
                              ? "bg-gray-100 dark:bg-gray-700"
                              : "text-black dark:text-white"
                          }`,
                        singleValue: () => "text-black dark:text-white",
                        placeholder: () => "text-gray-400 dark:text-gray-500",
                        dropdownIndicator: () => "text-primary",
                      }}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_status_id"
                    >
                      Equipment Status
                    </label>
                    <Select
                      id="equipment_status_id"
                      name="equipment_status_id"
                      options={equipmentStatusOptions}
                      value={equipmentStatusOptions.find((option) => option.value === String(formData.equipment_status_id)) || null}
                      onChange={(selectedOption) => handleChange({ name: "equipment_status_id", value: selectedOption?.value || "" })}
                      classNamePrefix="react-select"
                      placeholder="Select Equipment Status"
                      classNames={{
                        control: ({ isFocused }) =>
                          `w-full rounded border px-2 py-2 transition-all ${isFocused
                            ? "border-primary"
                            : "border-stroke dark:border-strokedark"
                          } text-black dark:text-white dark:bg-meta-4 dark:focus:border-primary`,
                        menu: () => "bg-white dark:bg-meta-4 rounded shadow-md border border-stroke dark:border-strokedark",
                        option: ({ isFocused, isSelected }) =>
                          `px-4.5 py-3 transition-all ${isSelected
                            ? "bg-primary text-white"
                            : isFocused
                              ? "bg-gray-100 dark:bg-gray-700"
                              : "text-black dark:text-white"
                          }`,
                        singleValue: () => "text-black dark:text-white",
                        placeholder: () => "text-gray-400 dark:text-gray-500",
                        dropdownIndicator: () => "text-primary",
                      }}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8" clipPath="url(#clip0_88_10224)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884ZM14.8271 1.49402C15.3149 1.00622 15.9765 0.732178 16.6664 0.732178C17.3562 0.732178 18.0178 1.00622 18.5056 1.49402C18.9934 1.98182 19.2675 2.64342 19.2675 3.33328C19.2675 4.02313 18.9934 4.68473 18.5056 5.17253L10.5889 13.0892C10.4821 13.196 10.3483 13.2718 10.2018 13.3084L6.86847 14.1417C6.58449 14.2127 6.28409 14.1295 6.0771 13.9225C5.87012 13.7156 5.78691 13.4151 5.85791 13.1312L6.69124 9.79783C6.72787 9.65131 6.80364 9.51749 6.91044 9.41069L14.8271 1.49402Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_88_10224">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>

                      <textarea
                        className="w-full rounded border border-stroke py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="description"
                        id="description"
                        rows={6}
                        placeholder="Write your description here"
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setFormData({
                        equipment_code: "",
                        equipment_unique_code: "",
                        equipment: "",
                        description: "",
                        equipment_group_id: "",
                        equipment_type_id: "",
                        equipment_status_id: ""
                      })}
                    >
                      Clear
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Save
                    </button>
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

export default EquipmentUpdate;
