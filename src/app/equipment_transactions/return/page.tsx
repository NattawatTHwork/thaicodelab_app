"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";
import Select from "react-select";
import SearchBar from "@/components/SearchBar/SearchBar";
import ItemsPerPageSelector from "@/components/ItemsPerPageSelector/ItemsPerPageSelector";
import Pagination from "@/components/Pagination/Pagination";

type Equipment = {
  equipment_id: number;
  equipment_code: string;
  equipment_unique_code: string;
  equipment: string;
  equipment_transaction_detail_id: number;
}

type User = {
  user_id: number;
  user_code: string;
  short_rank: string;
  firstname: string;
  lastname: string;
}


const EquipmentReturn = () => {
  const { data: session } = useSession(); const [filteredData, setFilteredData] = useState<Equipment[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [formData, setFormData] = useState<{
    equipment_return_details: { equipment_transaction_detail_id: number; note: string }[];
    return_user_id: string;
  }>({
    equipment_return_details: [],
    return_user_id: "",
  });
  const permissionValue = 56;

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Equipment;
    direction: "ascending" | "descending";
  } | null>(null);

  // ค้นหา
  useEffect(() => {
    let updatedData = [...equipments];

    // กรองข้อมูล
    updatedData = updatedData.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // จัดเรียงข้อมูล
    if (sortConfig) {
      updatedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(updatedData);
  }, [search, equipments, sortConfig]);

  // การแบ่งหน้า
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof Equipment) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  useEffect(() => {
    fetchSelectData("/equipmenttransaction/unreturned-equipment-by-department", setEquipments);
    fetchSelectData("/user", setUsers);
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

  const userOptions = users.map((user) => ({
    value: String(user.user_id),
    label: user.short_rank + ' ' + user.firstname + ' ' + user.lastname,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allEquipmentDetails = equipments.map(equipment => {
        const existingNote = formData.equipment_return_details.find(
          item => item.equipment_transaction_detail_id === equipment.equipment_transaction_detail_id
        )?.note || "";

        return {
          equipment_transaction_detail_id: equipment.equipment_transaction_detail_id,
          note: existingNote,
        };
      });

      setSelectedEquipments(equipments.map(equipment => String(equipment.equipment_transaction_detail_id)));
      setFormData(prevData => ({
        ...prevData,
        equipment_return_details: allEquipmentDetails
      }));
    } else {
      setSelectedEquipments([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, equipment: Equipment) => {
    const { value, checked } = e.target;
    const equipmentTransactionDetailId = Number(value);
  
    setSelectedEquipments((prevSelected) => {
      if (checked) {
        return [...prevSelected, String(equipmentTransactionDetailId)];
      } else {
        return prevSelected.filter(id => id !== String(equipmentTransactionDetailId));
      }
    });
  
    setFormData((prevData) => {
      let updatedDetails = [...prevData.equipment_return_details];
  
      if (checked) {
        if (!updatedDetails.some(item => item.equipment_transaction_detail_id === equipmentTransactionDetailId)) {
          updatedDetails.push({ equipment_transaction_detail_id: equipmentTransactionDetailId, note: "" });
        }
      } else {
        updatedDetails = updatedDetails.filter(item => item.equipment_transaction_detail_id !== equipmentTransactionDetailId);
      }
  
      return { ...prevData, equipment_return_details: updatedDetails };
    });
  };

  const handleNoteChange = (equipmentTransactionDetailId: number, note: string) => {
    setFormData((prevData) => {
      let updatedDetails = [...prevData.equipment_return_details];

      const existingIndex = updatedDetails.findIndex(
        (item) => item.equipment_transaction_detail_id === equipmentTransactionDetailId
      );

      if (existingIndex !== -1) {
        updatedDetails[existingIndex].note = note;
      } else {
        updatedDetails.push({ equipment_transaction_detail_id: equipmentTransactionDetailId, note });
      }

      return { ...prevData, equipment_return_details: updatedDetails };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const checkedEquipmentDetails = selectedEquipments.map((equipmentId) => ({
      equipment_transaction_detail_id: Number(equipmentId),
      note: formData.equipment_return_details.find(item => String(item.equipment_transaction_detail_id) === equipmentId)?.note || "",
    }));
  
    if (checkedEquipmentDetails.length === 0 || formData.return_user_id === "") {
      Swal.fire({
        icon: "error",
        title: "Incomplete Data",
        text: "Please select at least one equipment and choose a return user!",
      });
      return;
    }
  
    const dataToSend = {
      equipment_return_details: checkedEquipmentDetails,
      return_user_id: formData.return_user_id,
    };
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipmenttransaction/return`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "application/json",
          Permission: permissionValue.toString(),
        },
        body: JSON.stringify(dataToSend),
      });
  
      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "The equipment has been returned successfully!",
        });
        setFormData({ equipment_return_details: [], return_user_id: "" });
        setSelectedEquipments([]);
        fetchSelectData("/equipmenttransaction/unreturned-equipment-by-department", setEquipments);
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
      <Breadcrumb pageName={["Equipment Management", "Equipment Transactions", "Equipment Return"]} />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="return_user_id"
                    >
                      Return User
                    </label>
                    <Select
                      id="return_user_id"
                      name="return_user_id"
                      options={userOptions}
                      value={userOptions.find((option) => option.value === String(formData.return_user_id)) || null}
                      onChange={(selectedOption) => handleChange({ name: "return_user_id", value: selectedOption?.value || "" })}
                      classNamePrefix="react-select"
                      placeholder="Select Return User"
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

                  <div className="p-7">

                    {/* Input ค้นหา */}
                    <div className="mb-4 flex justify-between items-center">
                      <SearchBar search={search} setSearch={setSearch} />
                      <ItemsPerPageSelector itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto sm:overflow-visible">
                      <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                          <tr>
                            <th className="px-6 py-3 text-center">
                              <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={selectedEquipments.length === equipments.length && equipments.length > 0}
                              />
                            </th>
                            <th className="cursor-pointer px-6 py-3" onClick={() => handleSort("equipment")}>
                              Equipment {sortConfig?.key === "equipment" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th className="px-6 py-3 text-center">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.map((equipment) => (
                            <tr
                              key={equipment.equipment_id}
                              className="border-b dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <td className="px-6 py-4 text-center">
                                <input
                                  type="checkbox"
                                  value={String(equipment.equipment_transaction_detail_id)}
                                  checked={selectedEquipments.includes(String(equipment.equipment_transaction_detail_id))}
                                  onChange={(e) => handleSelectOne(e, equipment)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                {`${equipment.equipment_code} | ${equipment.equipment_unique_code} | ${equipment.equipment}`}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className="border rounded px-2 py-1 w-full"
                                  placeholder="Enter note"
                                  value={
                                    formData.equipment_return_details.find((item) => item.equipment_transaction_detail_id === equipment.equipment_transaction_detail_id)?.note ?? ""
                                  }
                                  onChange={(e) => handleNoteChange(equipment.equipment_transaction_detail_id, e.target.value)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={setCurrentPage} />

                  </div>


                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setFormData({ equipment_return_details: [], return_user_id: "" })}
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

export default EquipmentReturn;
