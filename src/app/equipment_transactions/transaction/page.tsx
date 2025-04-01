"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SearchBar from "@/components/SearchBar/SearchBar";
import ItemsPerPageSelector from "@/components/ItemsPerPageSelector/ItemsPerPageSelector";
import Pagination from "@/components/Pagination/Pagination";

export type Transaction = {
    equipment_transaction_detail_id: number;
    equipment_transaction_detail_code: string;
    equipment_transaction_id: number;
    equipment_transaction_code: string;
    equipment_id: number;
    equipment_code: string;
    equipment_unique_code: string;
    equipment: string;
    return_user_id: number | null;
    return_user_name: string | null;
    operator_return_user_id: number | null;
    operator_return_user_name: string | null;
    return_timestamp: string; // หรือ Date ถ้าแปลงจาก API
    note: string;
    borrow_user_id: number;
    borrow_user_name: string;
    approve_user_id: number;
    approve_user_name: string;
    borrow_timestamp: string; // หรือ Date
    updated_at: string; // หรือ Date
    updated_by: number;
    is_deleted: boolean;
};

const EquipmentTransactionStatus = () => {
    const { data: session } = useSession();
    const [data, setData] = useState<Transaction[]>([]);
    const [filteredData, setFilteredData] = useState<Transaction[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Transaction;
        direction: "ascending" | "descending";
    } | null>(null);

    // กำหนดค่า Permission
    const permissionValue = 59;

    useEffect(() => {
        fetchData();
    }, [session]);

    const fetchData = async () => {
        if (session?.user?.token) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipmenttransaction/details-with-transaction`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                        "Content-Type": "application/json",
                        Permission: permissionValue.toString(),
                    },
                });

                if (response.status === 401) {
                    signOut({ callbackUrl: "/auth/signin" })
                } else if (response.status === 403) {
                    window.location.href = '/';
                }

                const result = await response.json();

                if (response.ok && result.status) {
                    setData(result.data);
                    setFilteredData(result.data);
                    console.log(result.data);
                } else {
                    console.error("Error fetching data:", result.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    };

    // ค้นหา
    useEffect(() => {
        let updatedData = [...data];

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
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // กำหนดค่า default ถ้า null
                if (aValue === null || aValue === undefined) aValue = "";
                if (bValue === null || bValue === undefined) bValue = "";

                // แปลง string เป็น lowercase
                if (typeof aValue === "string") aValue = aValue.toLowerCase();
                if (typeof bValue === "string") bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
                return 0;
            });
        }

        setFilteredData(updatedData);
    }, [search, data, sortConfig]);

    // การแบ่งหน้า
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: keyof Transaction) => {
        let direction: "ascending" | "descending" = "ascending";

        if (sortConfig?.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }

        setSortConfig({ key, direction });
    };

    return (
        <DefaultLayout>
            <div className="mx-auto max-w-270">
                <Breadcrumb pageName={["Equipment Management", "Equipment Transactions", "Transaction"]} />

                <div className="grid grid-cols-5 gap-8">
                    <div className="col-span-5 xl:col-span-5">
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
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
                                                {[
                                                    { key: "equipment_transaction_detail_code", label: "Txn Code" },
                                                    { key: "equipment", label: "Equipment" },
                                                    { key: "borrow_user_name", label: "Borrower" },
                                                    { key: "approve_user_name", label: "Approver" },
                                                    { key: "borrow_timestamp", label: "Borrowed" },
                                                    { key: "return_user_name", label: "Returner" },
                                                    { key: "operator_return_user_name", label: "Operator" },
                                                    { key: "return_timestamp", label: "Returned" }
                                                ].map(({ key, label }) => (
                                                    <th
                                                        key={key}
                                                        className="cursor-pointer px-6 py-3"
                                                        onClick={() => handleSort(key as keyof Transaction)}
                                                    >
                                                        {label} {sortConfig?.key === key && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentData.map((equipment) => (
                                                <tr
                                                    key={equipment.equipment_id}
                                                    className="border-b dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <td className="px-6 py-4">{equipment.equipment_transaction_detail_code}</td>
                                                    <td className="px-6 py-4">{equipment.equipment}</td>
                                                    <td className="px-6 py-4">{equipment.borrow_user_name}</td>
                                                    <td className="px-6 py-4">{equipment.approve_user_name}</td>
                                                    <td className="px-6 py-4">
                                                        {new Date(equipment.borrow_timestamp).toLocaleString("en-GB", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">{equipment.return_user_name}</td>
                                                    <td className="px-6 py-4">{equipment.operator_return_user_name}</td>
                                                    <td className="px-6 py-4">
                                                        {new Date(equipment.return_timestamp).toLocaleString("en-GB", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={setCurrentPage} />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default EquipmentTransactionStatus;
