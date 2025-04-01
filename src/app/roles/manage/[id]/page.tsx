"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";

type Permission = {
  permission_id: number;
  permission_code: string;
  permission: string;
  description: string;
  module: string;
};

const RolePermissionManage = ({ params }: { params: { id: string } }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolepermissions, setRolePermissions] = useState<number[]>([]);
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("");
  const [formData, setFormData] = useState({
    role_id: "",
    permission_ids: [] as number[]
  });

  const { id } = params;

  const permissionValue = 13;

  useEffect(() => {
    fetchSelectData("/permission", setPermissions);
    fetchSelectData(`/rolepermission/permissions/${id}`, setRolePermissions);
  }, [session]);

  useEffect(() => {
    if (rolepermissions.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        permission_ids: rolepermissions,
      }));
    }
  }, [rolepermissions]);

  useEffect(() => {
    if (id) {
      setFormData((prevData) => ({
        ...prevData,
        role_id: id,
      }));
    }
  }, [id]);

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
          // console.log(result.data);
        } else {
          console.error(`Error fetching ${url}:`, result.message);
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    }
  };

  const toggleCheckAll = (moduleName: string) => {
    const permissionsInModule = groupByModule(permissions)[moduleName]?.map(p => p.permission_id) || [];
    const allChecked = permissionsInModule.every(pid => formData.permission_ids.includes(pid));

    setFormData(prevData => ({
      ...prevData,
      permission_ids: allChecked
        ? prevData.permission_ids.filter(id => !permissionsInModule.includes(id)) // ✅ uncheck all
        : Array.from(new Set([...prevData.permission_ids, ...permissionsInModule])) // ✅ add all (no duplicates)
    }));
  };

  const groupByModule = (permissions: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach((p) => {
      if (!grouped[p.module]) {
        grouped[p.module] = [];
      }
      grouped[p.module].push(p);
    });
    return grouped;
  };

  const modules = Object.keys(groupByModule(permissions));
  useEffect(() => {
    if (modules.length > 0 && !activeTab) {
      setActiveTab(modules[0]); // set default tab
    }
  }, [permissions]);

  const validateForm = () => {
    return formData.role_id.trim() !== "" && formData.permission_ids.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalFormData = {
      ...formData,
      role_id: id, // ย้ำให้แน่ใจว่าใช้ id จาก params
    };

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Data",
        text: "Please fill out all fields before submitting!",
      });
      return;
    }
    console.log(finalFormData);


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rolepermission`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "application/json",
          Permission: permissionValue.toString(),
        },
        body: JSON.stringify(finalFormData),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Role has been updated successfully!",
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
      <Breadcrumb pageName={["User Management", "Roles", "Role Manage"]} />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form action="#">

                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Permissions
                    </label>

                    <div className="flex overflow-x-auto whitespace-nowrap space-x-4 mb-4 border-b border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      {modules.map((moduleName) => (
                        <button
                          key={moduleName}
                          className={`px-4 py-2 text-sm font-medium ${activeTab === moduleName
                              ? "border-b-2 border-primary text-primary"
                              : "text-gray-500"
                            }`}
                          onClick={() => setActiveTab(moduleName)}
                          type="button"
                        >
                          {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* ✅ Checkbox "เลือกทั้งหมด" ของแต่ละ tab */}
                    <div className="mb-4 flex items-center justify-start gap-2">
                      <input
                        type="checkbox"
                        id="checkAll"
                        className="accent-primary"
                        checked={
                          groupByModule(permissions)[activeTab]?.every(pid =>
                            formData.permission_ids.includes(pid.permission_id)
                          ) || false
                        }
                        onChange={() => toggleCheckAll(activeTab)}
                      />
                      <label htmlFor="checkAll" className="text-sm font-medium text-black dark:text-white">
                        Select All
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {groupByModule(permissions)[activeTab]?.map((permission) => (
                        <label
                          key={permission.permission_id}
                          className="flex items-start gap-2 text-sm text-black dark:text-white"
                        >
                          <input
                            type="checkbox"
                            value={permission.permission_id}
                            checked={formData.permission_ids.includes(permission.permission_id)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setFormData((prevData) => ({
                                ...prevData,
                                permission_ids: e.target.checked
                                  ? [...prevData.permission_ids, value]
                                  : prevData.permission_ids.filter((id) => id !== value),
                              }));
                            }}
                            className="accent-primary mt-1"
                          />
                          <div>
                            <div className="font-medium">{permission.permission}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setFormData({
                        role_id: "",
                        permission_ids: []
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

export default RolePermissionManage;