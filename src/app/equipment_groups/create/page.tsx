"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";
import Select from "react-select";

type Department = {
  department_id: number;
  department_code: string;
  department: string;
}

const EquipmentGroupCreate = () => {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    equipment_group: "",
    department_id: ""
  });

  const permissionValue = 3;

  useEffect(() => {
    fetchSelectData("/department", setDepartments);
  }, [session]);

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

  const departmentOptions = departments.map((department) => ({
    value: String(department.department_id),
    label: department.department,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    return formData.equipment_group.trim() !== "" && formData.department_id !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipmentgroup`, {
        method: "POST",
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
          text: "Equipment group has been created successfully!",
        });
        setFormData({
          equipment_group: "",
          department_id: ""
        });
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
                  Equipment Group Create
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="equipment_group"
                    >
                      Equipment Group
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="equipment_group"
                        id="equipment_group"
                        placeholder="Avionics"
                        value={formData.equipment_group}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="department_id"
                    >
                      Department
                    </label>
                    <Select
                      id="department_id"
                      name="department_id"
                      options={departmentOptions}
                      value={departmentOptions.find((option) => option.value === String(formData.department_id)) || null}
                      onChange={(selectedOption) => handleChange({ name: "department_id", value: selectedOption?.value || "" })}
                      classNamePrefix="react-select"
                      placeholder="Select Department"
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

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setFormData({
                        equipment_group: "",
                        department_id: ""
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

export default EquipmentGroupCreate;
