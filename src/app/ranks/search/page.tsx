"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SearchBar from "@/components/SearchBar/SearchBar";
import ItemsPerPageSelector from "@/components/ItemsPerPageSelector/ItemsPerPageSelector";
import Pagination from "@/components/Pagination/Pagination";

type Rank = {
  rank_id: number;
  rank_code: string;
  full_rank: string;
  short_rank: string;
  sequence: string;
};

const RankSearch = () => {
  const { data: session } = useSession();
  const [data, setData] = useState<Rank[]>([]);
  const [filteredData, setFilteredData] = useState<Rank[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Rank;
    direction: "ascending" | "descending";
  } | null>(null);

  // กำหนดค่า Permission
  const permissionValue = 20;

  useEffect(() => {
    fetchPermissions();
    fetchData();
  }, [session]);

  const fetchPermissions = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rolepermission/permissionbytokenuser`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json"
          },
        });
        const result = await response.json();
        if (response.ok && result.status) {
          setUserPermissions(result.data);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    }
  };

  const fetchData = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rank`, {
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

  const handleSort = (key: keyof Rank) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  const handleDelete = async (rankId: number, rankCode: string) => {
    Swal.fire({
      title: rankCode,
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rank/${rankId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session?.user?.token}`,
              "Content-Type": "application/json",
              Permission: permissionValue.toString(),
            },
          });

          const result = await response.json();

          if (response.ok && result.status) {
            Swal.fire(
              "Deleted!",
              "The rank has been deleted.",
              "success"
            );
            setData((prevData) => prevData.filter((rank) => rank.rank_id !== rankId));
            setFilteredData((prevData) => prevData.filter((rank) => rank.rank_id !== rankId));
          } else {
            Swal.fire(
              "Error!",
              result.message || "Something went wrong.",
              "error"
            );
          }
        } catch (error) {
          Swal.fire(
            "Error!",
            "Failed to delete rank.",
            "error"
          );
          console.error("Error deleting rank:", error);
        }
      }
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
      <Breadcrumb pageName={["User Management", "Ranks", "Rank Search"]} />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="px-7 py-4 dark:border-strokedark flex justify-end items-center">
                {userPermissions.includes(21) && (
                  <Link
                    href="/ranks/create"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-center font-medium text-white hover:bg-opacity-90 w-1/4"
                  >
                    Create
                  </Link>
                )}
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
                        {[
                          { key: "rank_code", label: "Rank Code" },
                          { key: "full_rank", label: "Full Rank" },
                          { key: "short_rank", label: "Short Rank" },
                          { key: "sequence", label: "Sequence" },
                        ].map(({ key, label }) => (
                          <th
                            key={key}
                            className="cursor-pointer px-6 py-3"
                            onClick={() => handleSort(key as keyof Rank)}
                          >
                            {label} {sortConfig?.key === key && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((rank) => (
                        <tr
                          key={rank.rank_id}
                          className="border-b dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4">{rank.rank_code}</td>
                          <td className="px-6 py-4">{rank.full_rank}</td>
                          <td className="px-6 py-4">{rank.short_rank}</td>
                          <td className="px-6 py-4">{rank.sequence}</td>
                          <td className="px-6 py-4 text-center relative">
                            <button onClick={() => setDropdownOpen(dropdownOpen === rank.rank_id ? null : rank.rank_id)} className="px-4 py-2 bg-gray-500 text-white rounded">
                              Options
                            </button>
                            {dropdownOpen === rank.rank_id && (
                              <div className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow-md z-10 whitespace-nowrap">
                                {userPermissions.includes(22) && <Link href={`/ranks/detail/${rank.rank_id}`}><button className="block w-full px-4 py-2 text-left hover:bg-gray-200">View</button></Link>}
                                {userPermissions.includes(23) && <Link href={`/ranks/update/${rank.rank_id}`}><button className="block w-full px-4 py-2 text-left hover:bg-gray-200">Update</button></Link>}
                                {userPermissions.includes(24) && <button onClick={() => handleDelete(rank.rank_id, rank.rank_code)} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-200">Delete</button>}
                              </div>
                            )}
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

export default RankSearch;
